#!/bin/bash

# Weatherman Docker Startup Script
# This script helps you manage the Dockerized Weatherman application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌤️  Weatherman Docker Manager${NC}"
echo "========================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build all Docker images"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show logs from all services"
    echo "  status    - Show status of all services"
    echo "  clean     - Clean up containers, networks, and volumes"
    echo "  db-reset  - Reset the database (WARNING: destroys all data)"
    echo "  ngrok     - Start ngrok tunnel for webhooks"
    echo ""
}

# Function to build images
build_images() {
    echo -e "${YELLOW}📦 Building Docker images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Services started${NC}"
    echo ""
    echo "📍 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3535/api"
    echo "   Backend Docs: http://localhost:3535/api/docs"
    echo "   PgAdmin: http://localhost:5050"
    echo "   Redis: localhost:6379"
    echo ""
    echo "🔧 To view logs: docker-compose logs -f"
    echo "🔧 To check status: docker-compose ps"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Services restarted${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing logs...${NC}"
    docker-compose logs -f
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Service Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${YELLOW}🔍 Health Checks:${NC}"
    docker-compose exec backend wget -qO- http://localhost:3535/api/health 2>/dev/null || echo "Backend: Not ready"
    docker-compose exec frontend wget -qO- http://localhost:3000 2>/dev/null >/dev/null && echo "Frontend: Ready" || echo "Frontend: Not ready"
}

# Function to clean up
clean_up() {
    echo -e "${RED}🧹 Cleaning up Docker resources...${NC}"
    read -p "This will remove all containers, networks, and volumes. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    else
        echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    fi
}

# Function to reset database
reset_database() {
    echo -e "${RED}🗃️  Resetting database...${NC}"
    read -p "This will destroy ALL database data. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down db
        docker volume rm weatherman_db_data 2>/dev/null || true
        docker-compose up -d db
        echo -e "${GREEN}✅ Database reset completed${NC}"
        echo "🔧 Run migrations: docker-compose exec backend npx prisma migrate deploy"
    else
        echo -e "${YELLOW}❌ Database reset cancelled${NC}"
    fi
}

# Function to start ngrok
start_ngrok() {
    echo -e "${YELLOW}🌐 Starting ngrok tunnel...${NC}"
    echo "This will expose your backend on port 3535 to the internet"
    echo "Make sure your backend is running first!"
    echo ""
    if command -v ngrok &> /dev/null; then
        ngrok http 3535
    else
        echo -e "${RED}❌ ngrok not found. Install it first:${NC}"
        echo "brew install ngrok"
        echo "ngrok config add-authtoken YOUR_AUTH_TOKEN"
    fi
}

# Main script logic
case "${1:-}" in
    build)
        build_images
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_up
        ;;
    db-reset)
        reset_database
        ;;
    ngrok)
        start_ngrok
        ;;
    *)
        show_usage
        ;;
esac
