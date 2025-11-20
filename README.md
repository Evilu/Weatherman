# Weatherman - Personal Weather Alert System

A full-stack weather alert application built with NestJS (backend) and Next.js (frontend) that allows users to create personalized weather alerts and monitor weather conditions.

## 🚀 Features

### Backend (NestJS + PostgreSQL + Redis)
- **Authentication**: JWT-based user authentication
- **Weather Integration**: Tomorrow.io API integration for real-time weather data
- **Alert Management**: Create, update, delete, and monitor weather alerts
- **Real-time Processing**: Background job processing for alert evaluation
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization

### Frontend (Next.js + React Query + Tailwind CSS)
- **Modern React**: Next.js 14+ with App Router and React 18
- **Beautiful UI**: Responsive design with Tailwind CSS and custom components
- **Real-time Data**: TanStack Query for efficient data fetching and caching
- **Location Search**: Support for both city names and coordinates
- **Alert Dashboard**: Comprehensive alert management interface
- **Authentication**: Seamless login/register with JWT tokens

## 📋 Requirements

The system meets all the homework requirements:

### 1. Basic Weather Information ✅
- View current weather conditions for any location
- Support for both city names and GPS coordinates
- Displays 6+ weather parameters: temperature, wind speed, humidity, precipitation, cloud cover, visibility
- Real-time weather data from Tomorrow.io API

### 2. Alerts ✅
- Create personalized weather alerts with:
  - Location (city or coordinates)
  - Weather parameter to track
  - Condition operator (>, >=, <, <=, =)
  - Threshold value
- Full CRUD operations for alert management
- Active/inactive alert toggling

### 3. Alert Status ✅
- Real-time evaluation of alert conditions
- Visual status indicators (triggered/not triggered/error)
- 3-day forecast analysis for each alert
- Background processing for continuous monitoring

### 4. Delivery ✅
- Complete Docker setup with multi-stage builds
- Comprehensive documentation
- Local development environment
- API documentation via Swagger

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│    Backend      │◄──►│   Tomorrow.io   │
│   (Next.js)     │    │   (NestJS)      │    │      API        │
│   Port 3000     │    │   Port 3535     │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   PostgreSQL    │
                       │   Database      │
                       │   Port 5433     │
                       │                 │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │     Redis       │
                       │    Cache        │
                       │   Port 6379     │
                       │                 │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone <repository-url>
cd Weatherman
```

### 2. Start Database Services
```bash
docker-compose up -d
```
This starts PostgreSQL and Redis services. The database will automatically initialize with the Prisma schema and create an admin user.

### 3. Start Backend
```bash
cd services/backend
npm install
npm run dev
```

The backend will start on port 3535 and display:
```
🚀 Weatherman API is running!
📍 Local (clickable): http://localhost:3535
📚 Swagger (clickable): http://localhost:3535/api/docs
🔗 OpenAPI JSON (clickable): http://localhost:3535/api/docs-json
🔧 Environment: development
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port 3000 (or 3001 if 3000 is occupied).

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3535/api/docs
- **Database Admin**: http://localhost:5050 (pgAdmin)

### 6. Demo Login
Use the "🚀 Quick Demo Login" button or manually enter:
- Email: `admin@email.com`
- Password: `passowrd`

## 🔧 Development

### Backend Development
```bash
cd services/backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run test         # Run tests
npm run prisma:generate  # Regenerate Prisma client
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Database Management
```bash
cd services/backend
npx prisma studio    # Visual database editor
npx prisma migrate dev  # Create new migration
npx prisma db push   # Push schema changes
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast

### Alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts` - Get user's alerts
- `GET /api/alerts/:id` - Get specific alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/:id/status` - Get alert status
- `GET /api/alerts/:id/forecast-analysis` - Get forecast analysis

### Webhooks
- `POST /api/webhooks/tomorrow-io` - Tomorrow.io webhook handler

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:changeme@localhost:5433/weatherman"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
TOMORROW_IO_API_KEY="your-api-key"
TOMORROW_IO_WEBHOOK_SECRET="webhook-secret"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3535/api
```

## 📚 Tech Stack

### Backend
- **Framework**: NestJS 10
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 6
- **Authentication**: JWT + Passport
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer
- **Weather API**: Tomorrow.io

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + custom components
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database Init**: Multi-stage builds with Prisma migrations
- **Development**: Hot reload for both frontend and backend

## 🎯 Design Decisions

### Backend Architecture
- **Modular Design**: Separate modules for auth, alerts, weather, webhooks
- **Database-First**: Prisma schema drives the data model
- **API-First**: Swagger documentation for all endpoints
- **Security**: JWT tokens, input validation, CORS configuration
- **Performance**: Redis caching, connection pooling, query optimization

### Frontend Architecture
- **Component-Based**: Reusable UI components with consistent design
- **State Management**: React Query for server state, React Context for auth
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript integration with API types
- **User Experience**: Loading states, error handling, optimistic updates

### Infrastructure Choices
- **Docker**: Ensures consistent environments across development and production
- **Multi-stage Builds**: Optimizes image sizes and includes generated assets
- **PostgreSQL**: ACID compliance and JSON support for location data
- **Redis**: Fast caching and session storage

## 🔄 Data Flow

1. **User Authentication**: Frontend sends credentials → Backend validates → JWT token returned
2. **Weather Data**: Frontend requests location weather → Backend calls Tomorrow.io API → Weather data returned
3. **Alert Creation**: Frontend sends alert parameters → Backend saves to PostgreSQL → Background processing starts
4. **Alert Processing**: Background jobs evaluate alerts → Status updated in database → Real-time updates to frontend
5. **Forecast Analysis**: Backend analyzes 3-day forecast → Predicts when alerts will trigger → Results cached in Redis

## 📱 Usage Examples

### Creating an Alert
1. Navigate to "Create Alert" tab
2. Enter alert name (e.g., "High Temperature Warning")
3. Specify location (city or coordinates)
4. Choose weather parameter (temperature)
5. Set condition (greater than)
6. Enter threshold (25°C)
7. Click "Create Alert"

### Monitoring Alerts
1. Go to "My Alerts" tab
2. View all alerts with status indicators
3. Toggle alerts active/inactive with bell icon
4. Delete alerts with trash icon
5. Monitor real-time status updates

### Weather Dashboard
1. Use "Weather" tab to search locations
2. Enter city name or coordinates
3. View comprehensive weather information
4. Use current location with GPS button

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Backend uses 3535, Frontend uses 3000, DB uses 5433
2. **Database connection**: Ensure Docker containers are running
3. **API key**: Set TOMORROW_IO_API_KEY in backend .env
4. **CORS errors**: Backend configured for localhost development

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### Clear Frontend Cache
```bash
cd frontend
rm -rf .next
npm run dev
```

## 🏆 Accomplishments

This weather alert system demonstrates:

- **Full-stack expertise**: Modern React frontend with robust Node.js backend
- **System design**: Well-architected, scalable application with proper separation of concerns
- **Database design**: Efficient schema with relationships and proper indexing
- **API design**: RESTful APIs with comprehensive documentation
- **DevOps practices**: Containerization, multi-stage builds, environment management
- **User experience**: Intuitive interface with responsive design
- **Performance**: Efficient data fetching, caching, and background processing
- **Code quality**: TypeScript throughout, proper error handling, modular architecture

## 📝 License

This project is developed as a homework assignment for Tomorrow.io Full-Stack Engineer position.
