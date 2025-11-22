# Docker Setup for Weatherman

This guide explains how to run the Weatherman application using Docker containers.

## 🏗️ Architecture

The Dockerized Weatherman consists of the following services:

- **Frontend** (Next.js) - Port 3000
- **Backend** (NestJS) - Port 3535  
- **Database** (PostgreSQL) - Port 5433
- **Redis** (Cache/Queue) - Port 6379
- **PgAdmin** (DB Management) - Port 5050

All services communicate internally through a Docker network called `app-network`.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- ngrok installed (for webhook testing)

### 1. Start the Application

```bash
# Option 1: Use the helper script (recommended)
./docker-manager.sh start

# Option 2: Use docker-compose directly
docker-compose up -d
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3535/api
- **API Documentation**: http://localhost:3535/api/docs
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)

### 3. Setup Webhooks (Optional)

```bash
# Start ngrok tunnel for webhooks
./docker-manager.sh ngrok

# Or manually:
ngrok http 3535
```

Update the webhook URL in your Tomorrow.io dashboard to:
`https://your-ngrok-url.ngrok-free.dev/api/webhooks/tomorrow-io`

## 📝 Management Commands

Use the provided script for easy management:

```bash
# Build all images
./docker-manager.sh build

# Start services
./docker-manager.sh start

# Stop services  
./docker-manager.sh stop

# Restart services
./docker-manager.sh restart

# View logs
./docker-manager.sh logs

# Check status
./docker-manager.sh status

# Clean up everything
./docker-manager.sh clean

# Reset database
./docker-manager.sh db-reset
```

## 🔧 Development

### Environment Variables

#### Backend (.env.docker)
```env
NODE_ENV=production
PORT=3535
DATABASE_URL=postgres://postgres:changeme@db:5432/weatherman?schema=public
REDIS_URL=redis://redis:6379
TOMORROW_IO_API_KEY=your_api_key
TOMORROW_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://frontend:3000
```

#### Frontend (.env.docker)
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://backend:3535/api
NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:3535/api
```

### Building Images

```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Seed database (if you have a seed script)
docker-compose exec backend npx prisma db seed
```

### Debugging

```bash
# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend /bin/sh
docker-compose exec frontend /bin/sh

# Check service health
docker-compose ps
```

## 🌐 Networking

### Internal Communication
- Services communicate using container names as hostnames
- Backend: `http://backend:3535`
- Frontend: `http://frontend:3000`
- Database: `postgres://postgres:changeme@db:5432/weatherman`
- Redis: `redis://redis:6379`

### External Access
- All services are accessible via localhost
- Use ngrok to expose backend for webhooks
- Frontend makes API calls to localhost:3535 for client-side requests

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using a port
   lsof -i :3000
   lsof -i :3535
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker-compose logs service_name
   
   # Check container status
   docker-compose ps
   ```

3. **Database Connection Issues**
   ```bash
   # Ensure database is healthy
   docker-compose exec db pg_isready -U postgres
   
   # Check database logs
   docker-compose logs db
   ```

4. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

### Performance Issues

1. **Slow Builds**
   - Use `.dockerignore` files (already included)
   - Consider multi-stage builds (already implemented)

2. **Memory Issues**
   - Adjust memory limits in docker-compose.yml
   - Monitor with `docker stats`

## 📊 Monitoring

### Health Checks
All services include health checks that run automatically:

- **Backend**: GET /api/health
- **Frontend**: GET /
- **Database**: pg_isready
- **Redis**: redis-cli ping

### Logs
```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f -t backend

# Tail last 100 lines
docker-compose logs --tail=100 frontend
```

## 🔒 Security Notes

- Change default passwords in production
- Use environment variables for secrets
- Enable SSL/TLS for production deployments
- Regularly update base images

## 📦 Production Deployment

For production deployment:

1. Update environment variables
2. Use proper secrets management
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure logging and monitoring
6. Implement backup strategies

## 🤝 Contributing

When making changes:

1. Update Dockerfiles if dependencies change
2. Test builds with `./docker-manager.sh build`
3. Update this documentation
4. Test all services work together
