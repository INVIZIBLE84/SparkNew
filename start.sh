#!/bin/bash

# Spark College Management System - Startup Script

echo "🚀 Starting Spark College Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Please free up port $1 and try again."
        exit 1
    fi
}

# Check if required ports are available
echo "🔍 Checking port availability..."
check_port 3000
check_port 5000
check_port 5432
check_port 6379

echo "✅ Ports are available"

# Create .env file for backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "✅ Backend environment file created. Please edit backend/.env with your configuration."
fi

# Create .env.local file for frontend if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating frontend environment file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "✅ Frontend environment file created."
fi

# Start the application
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "⚠️  Backend might still be starting up..."
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend might still be starting up..."
fi

# Check database
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is running"
else
    echo "⚠️  Database might still be starting up..."
fi

echo ""
echo "🎉 Spark College Management System is starting up!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "👥 Default login credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update and restart: ./update.sh"
echo ""
echo "🔧 Configuration:"
echo "   Backend config: backend/.env"
echo "   Frontend config: .env.local"
echo ""
echo "📚 Documentation: README.md" 