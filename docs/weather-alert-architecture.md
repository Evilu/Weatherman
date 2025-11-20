# Weather Alert System Architecture

## Executive Summary

This document outlines the architecture for a distributed weather alert system using Tomorrow.io's API. The solution emphasizes scalability, real-time processing, and clean separation of concerns while demonstrating full-stack engineering capabilities.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    Real-time WebSocket Updates                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (NestJS)                        │
│                    Authentication & Routing                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        ▼                                                   ▼
┌──────────────────┐                              ┌──────────────────┐
│  Weather Service │                              │   Alert Service  │
│     (NestJS)     │                              │     (NestJS)     │
└──────────────────┘                              └──────────────────┘
        │                                                   │
        ▼                                                   ▼
┌──────────────────┐                              ┌──────────────────┐
│   Redis Cache    │                              │    PostgreSQL    │
│  (Weather Data)  │                              │  (Alerts & Users)│
└──────────────────┘                              └──────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Alert Processing Pipeline                      │
│                         (BullMQ + Redis)                         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Webhook Listener Service                      │
│                  (Tomorrow.io Webhook Handler)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL (primary storage) + Redis (caching & queues)
- **Queue**: BullMQ for job processing
- **API Protocol**: REST + WebSocket (Socket.io)
- **ORM**: Prisma

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand + React Query
- **UI Library**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.io-client
- **Build Tool**: Vite

### Infrastructure
- **Container**: Docker + Docker Compose
- **Process Manager**: PM2 (production)
- **Monitoring**: Prometheus + Grafana (optional)

## Core Services Architecture

### 1. API Gateway Service
```typescript
// Responsibilities:
- Request routing and load balancing
- Authentication/Authorization (JWT)
- Rate limiting
- WebSocket connection management
- Request/Response transformation
```

### 2. Weather Service
```typescript
interface WeatherService {
  // Fetches current weather with intelligent caching
  getCurrentWeather(location: Location): Promise<WeatherData>
  
  // Fetches 3-day forecast
  getForecast(location: Location): Promise<ForecastData[]>
  
  // Batch fetch for alert processing
  batchFetchWeather(locations: Location[]): Promise<Map<string, WeatherData>>
}
```

**Caching Strategy:**
- Current weather: 5-minute TTL in Redis
- Forecast data: 1-hour TTL
- Use Cache-Aside pattern with automatic refresh

### 3. Alert Service
```typescript
interface AlertService {
  // CRUD operations for alerts
  createAlert(userId: string, alert: AlertConfig): Promise<Alert>
  updateAlert(alertId: string, updates: Partial<AlertConfig>): Promise<Alert>
  deleteAlert(alertId: string): Promise<void>
  getUserAlerts(userId: string): Promise<Alert[]>
  
  // Alert evaluation
  evaluateAlert(alert: Alert, weatherData: WeatherData): AlertStatus
  evaluateForecast(alert: Alert, forecast: ForecastData[]): ForecastAnalysis
}
```

### 4. Alert Processing Pipeline

```typescript
// Queue Configuration
const alertQueues = {
  'check-alerts': {
    // Runs every 5 minutes for all active alerts
    pattern: '*/5 * * * *',
    concurrency: 10
  },
  'webhook-processor': {
    // Processes incoming webhooks from Tomorrow.io
    concurrency: 20
  },
  'notification-sender': {
    // Sends notifications when alerts trigger
    concurrency: 5
  }
}
```

## Data Models

### Database Schema (PostgreSQL)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  alerts    Alert[]
}

model Alert {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  name        String
  location    Json        // { city?: string, lat?: number, lon?: number }
  parameter   String      // temperature, windSpeed, humidity, etc.
  operator    String      // gt, lt, eq, gte, lte
  threshold   Float
  isActive    Boolean     @default(true)
  lastChecked DateTime?
  status      AlertStatus @default(NOT_TRIGGERED)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([userId])
  @@index([isActive, lastChecked])
}

model AlertHistory {
  id         String   @id @default(uuid())
  alertId    String
  status     String
  weatherData Json
  triggeredAt DateTime
  resolvedAt  DateTime?
  
  @@index([alertId, triggeredAt])
}

enum AlertStatus {
  NOT_TRIGGERED
  TRIGGERED
  ERROR
}
```

## API Design

### REST Endpoints

```yaml
# Weather Endpoints
GET /api/weather/current?location={city|lat,lon}
GET /api/weather/forecast?location={city|lat,lon}&days=3

# Alert Endpoints
POST   /api/alerts
GET    /api/alerts
GET    /api/alerts/:id
PUT    /api/alerts/:id
DELETE /api/alerts/:id
GET    /api/alerts/:id/status
GET    /api/alerts/:id/forecast-analysis

# Webhook Endpoint (for Tomorrow.io)
POST   /webhooks/tomorrow-io
```

### WebSocket Events

```typescript
// Server -> Client
socket.emit('alert:triggered', { alertId, weatherData })
socket.emit('alert:resolved', { alertId })
socket.emit('weather:update', { location, data })

// Client -> Server
socket.emit('subscribe:alerts', { userId })
socket.emit('subscribe:weather', { location })
```

## Integration with Tomorrow.io

### 1. Core API Integration

```typescript
class TomorrowIoClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.tomorrow.io/v4'
  
  async getWeather(location: Location): Promise<WeatherData> {
    // Use timelines endpoint for current conditions
    const response = await fetch(
      `${this.baseUrl}/timelines?location=${location}&fields=temperature,windSpeed,humidity&timesteps=current`,
      { headers: { 'apikey': this.apiKey } }
    )
    return this.transformResponse(response)
  }
  
  async getForecast(location: Location): Promise<ForecastData[]> {
    // Use timelines endpoint with 1h timesteps
    const response = await fetch(
      `${this.baseUrl}/timelines?location=${location}&fields=temperature,windSpeed,humidity&timesteps=1h&endTime=nowPlus3d`,
      { headers: { 'apikey': this.apiKey } }
    )
    return this.transformForecast(response)
  }
}
```

### 2. Webhook Integration

```typescript
interface TomorrowIoWebhook {
  eventType: 'weather_update' | 'alert_trigger'
  location: Location
  data: WeatherData
  timestamp: string
}

@Controller('webhooks')
class WebhookController {
  @Post('tomorrow-io')
  async handleWebhook(@Body() payload: TomorrowIoWebhook) {
    // Verify webhook signature
    // Queue for processing
    await this.queue.add('webhook-processor', payload)
  }
}
```

**Webhook Configuration:**
- Subscribe to real-time updates for monitored locations
- Use webhooks for immediate alert evaluation
- Fallback to polling if webhooks fail

## Alert Processing Algorithm

```typescript
class AlertProcessor {
  async processAlert(alert: Alert): Promise<void> {
    // 1. Fetch current weather for location
    const weather = await this.weatherService.getCurrentWeather(alert.location)
    
    // 2. Evaluate condition
    const triggered = this.evaluateCondition(
      weather[alert.parameter],
      alert.operator,
      alert.threshold
    )
    
    // 3. Update alert status if changed
    if (triggered !== alert.status) {
      await this.updateAlertStatus(alert, triggered)
      
      // 4. Send notification if triggered
      if (triggered) {
        await this.notificationQueue.add('send', { alert, weather })
      }
    }
    
    // 5. Store in history
    await this.storeHistory(alert, weather, triggered)
  }
  
  async analyzeForecast(alert: Alert): Promise<ForecastAnalysis> {
    const forecast = await this.weatherService.getForecast(alert.location)
    
    return forecast.map(point => ({
      time: point.time,
      willTrigger: this.evaluateCondition(
        point[alert.parameter],
        alert.operator,
        alert.threshold
      ),
      value: point[alert.parameter]
    }))
  }
}
```

## Performance Optimizations

### 1. Caching Strategy
```typescript
// Multi-layer caching
L1: In-memory cache (Node.js process) - 30 seconds TTL
L2: Redis cache - 5 minutes TTL
L3: Database - permanent storage

// Cache key patterns
weather:current:{lat}:{lon} - TTL: 5 minutes
weather:forecast:{lat}:{lon} - TTL: 1 hour
alert:status:{alertId} - TTL: 30 seconds
```

### 2. Batch Processing
```typescript
// Group alerts by location for efficient API calls
const alertsByLocation = groupBy(alerts, alert => 
  `${alert.location.lat}:${alert.location.lon}`
)

// Fetch weather data in parallel with concurrency limit
const weatherData = await pMap(
  Object.keys(alertsByLocation),
  location => this.fetchWeather(location),
  { concurrency: 10 }
)
```

### 3. Rate Limiting
```typescript
// Implement rate limiting for Tomorrow.io API
const rateLimiter = new RateLimiter({
  tokensPerInterval: 25,  // Free tier: 25 req/hour
  interval: 'hour',
  maxRequests: 500        // Daily limit
})
```

## Scalability Considerations

### Horizontal Scaling
- Stateless services (Weather & Alert services) can be scaled horizontally
- Use Redis for distributed locking and session management
- Database read replicas for query distribution

### Queue Management
- Separate queues for different priority levels
- Dead letter queues for failed jobs
- Exponential backoff for retries

### Database Optimization
- Partition AlertHistory table by month
- Create materialized views for dashboard metrics
- Use database connection pooling

## Error Handling & Resilience

### Circuit Breaker Pattern
```typescript
const circuitBreaker = new CircuitBreaker(tomorrowIoClient.getWeather, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
})

// Fallback to cached data if API fails
circuitBreaker.fallback(() => this.getCachedWeather())
```

### Retry Strategy
- Exponential backoff for API calls
- Maximum 3 retries with jitter
- Dead letter queue after max retries

## Monitoring & Observability

### Metrics to Track
- API response times (P50, P95, P99)
- Queue depth and processing time
- Alert evaluation latency
- Cache hit/miss ratio
- Tomorrow.io API quota usage

### Logging Strategy
```typescript
// Structured logging with correlation IDs
logger.info('Alert evaluated', {
  correlationId: req.id,
  alertId: alert.id,
  result: triggered,
  duration: Date.now() - startTime,
  weather: weather
})
```

## Security Considerations

### API Security
- JWT authentication for user endpoints
- API key rotation for Tomorrow.io
- Rate limiting per user
- Input validation with Joi/class-validator

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement CORS properly
- Sanitize user inputs

## Deployment Strategy

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: weather_alerts
      POSTGRES_USER: weather
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
      
  api-gateway:
    build: ./services/gateway
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      
  weather-service:
    build: ./services/weather
    deploy:
      replicas: 2
    depends_on:
      - redis
      
  alert-service:
    build: ./services/alerts
    deploy:
      replicas: 2
    depends_on:
      - postgres
      - redis
      
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

## Development Workflow

### Local Development
```bash
# Start infrastructure
docker-compose up postgres redis

# Run services in watch mode
npm run dev:gateway
npm run dev:weather
npm run dev:alerts

# Run frontend
cd frontend && npm run dev
```

### Testing Strategy
- Unit tests for business logic (Jest)
- Integration tests for API endpoints (Supertest)
- E2E tests for critical user flows (Playwright)
- Load testing with k6

## Trade-offs & Decisions

### Chosen Trade-offs

1. **Microservices vs Monolith**
   - Chose: Modular monolith with service separation
   - Reasoning: Demonstrates distributed thinking while keeping deployment simple

2. **Real-time Updates**
   - Chose: Hybrid approach (WebSockets + Polling)
   - Reasoning: WebSockets for immediate updates, polling as fallback

3. **Database Choice**
   - Chose: PostgreSQL + Redis
   - Reasoning: PostgreSQL for ACID compliance, Redis for performance

4. **Queue System**
   - Chose: BullMQ
   - Reasoning: Robust, Redis-backed, good TypeScript support

### Shortcuts for MVP

1. **Authentication**: Simple JWT (would use Auth0/Cognito in production)
2. **Notifications**: WebSocket only (would add email/SMS in production)
3. **Monitoring**: Basic logging (would add APM tools in production)
4. **CI/CD**: Docker Compose (would use Kubernetes in production)

## Future Enhancements

### Phase 2 Features
- Machine learning for predictive alerts
- Multi-channel notifications (Email, SMS, Push)
- Historical analytics dashboard
- Alert templates and sharing
- Geographic alert zones

### Performance Improvements
- GraphQL for efficient data fetching
- Server-Sent Events for one-way updates
- Edge caching with CDN
- Database sharding for scale

## Conclusion

This architecture provides a robust, scalable foundation for a weather alert system while demonstrating:
- Full-stack engineering capabilities
- Distributed system design
- Modern TypeScript/Node.js patterns
- Production-ready considerations
- Clear separation of concerns

The modular design allows for easy testing, maintenance, and future scaling while keeping the initial implementation manageable for a homework assignment.