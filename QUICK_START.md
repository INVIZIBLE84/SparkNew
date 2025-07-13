# 🚀 Quick Start Guide

Get Spark College Management System running in 5 minutes!

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (optional, for cloning)

## Option 1: One-Click Start (Windows)

1. **Double-click** `start.bat` file
2. **Wait** for services to start (about 2-3 minutes)
3. **Open** http://localhost:3000 in your browser
4. **Login** with:
   - Username: `admin`
   - Password: `admin`

## Option 2: Command Line

### Windows (PowerShell/CMD)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### macOS/Linux
```bash
# Make script executable
chmod +x start.sh

# Start all services
./start.sh
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.edu | admin | Administrator |
| student@example.edu | password | Student |
| faculty@example.edu | password | Faculty |
| print@example.edu | password | Print Services |
| clearance@example.edu | password | Clearance Officer |

## New User Registration

Don't have an account? Click "Create New Account" on the login page to register!

## Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Stop all containers
docker-compose down

# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up --build
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## Development Mode

To run without Docker:

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment**:
   ```bash
   cp backend/env.example backend/.env
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   ```

3. **Start services**:
   ```bash
   npm run dev
   ```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check the [API Documentation](http://localhost:5000/api-docs) when running
- Explore the codebase structure in the README

## Support

- Create an issue in the repository
- Check the logs: `docker-compose logs -f`
- Review the configuration files

---

**Happy coding! 🎉** 