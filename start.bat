@echo off
echo 🚀 Starting Spark College Management System...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are available

REM Create .env file for backend if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy "backend\env.example" "backend\.env"
    echo ✅ Backend environment file created. Please edit backend\.env with your configuration.
)

REM Create .env.local file for frontend if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating frontend environment file...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
    echo ✅ Frontend environment file created.
)

REM Start the application
echo 🐳 Starting Docker containers...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service status...

REM Check backend
curl -f http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend might still be starting up...
) else (
    echo ✅ Backend is running on http://localhost:5000
)

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Frontend might still be starting up...
) else (
    echo ✅ Frontend is running on http://localhost:3000
)

echo.
echo 🎉 Spark College Management System is starting up!
echo.
echo 📱 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Health Check: http://localhost:5000/health
echo.
echo 👥 Default login credentials:
echo    Username: admin
echo    Password: admin
echo.
echo 📋 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
echo 🔧 Configuration:
echo    Backend config: backend\.env
echo    Frontend config: .env.local
echo.
echo 📚 Documentation: README.md
echo.
pause 