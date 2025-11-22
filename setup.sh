#!/bin/bash

# Quick setup script for Weatherman Docker environment
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🌤️  Weatherman Quick Setup${NC}"
echo "=============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Wait for backend to be ready
echo "Waiting for backend..."
until curl -s http://localhost:3535/api/health > /dev/null 2>&1; do
    echo "  Backend not ready yet, waiting..."
    sleep 5
done

# Wait for frontend to be ready
echo "Waiting for frontend..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    echo "  Frontend not ready yet, waiting..."
    sleep 5
done

echo ""
echo -e "${GREEN}🎉 Weatherman is ready!${NC}"
echo ""
echo "📍 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3535/api"
echo "   API Docs: http://localhost:3535/api/docs"
echo "   PgAdmin: http://localhost:5050"
echo ""
echo "🔧 Management commands:"
echo "   ./docker-manager.sh status   - Check service status"
echo "   ./docker-manager.sh logs     - View logs"
echo "   ./docker-manager.sh stop     - Stop all services"
echo ""
echo "🌐 For webhook testing:"
echo "   ./docker-manager.sh ngrok    - Start ngrok tunnel"
echo ""
echo -e "${YELLOW}💡 Check DOCKER_GUIDE.md for detailed instructions${NC}"
