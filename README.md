# Spark - College Management System

A comprehensive college management system built with Next.js frontend and Node.js backend, featuring attendance tracking, fee management, clearance processing, and more.

## 🚀 Features

- **User Authentication & Authorization** - Role-based access control (Admin, Faculty, Student, etc.)
- **Attendance Management** - Real-time attendance tracking with proximity detection
- **Fee Management** - Online fee payment and tracking
- **Clearance Processing** - Digital clearance workflow
- **Document Management** - File upload and management
- **Notifications** - Real-time notifications via WebSocket
- **Analytics Dashboard** - Comprehensive reporting and analytics
- **Responsive Design** - Modern UI with dark/light theme support

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js with Express, Sequelize ORM, PostgreSQL
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with Redis for caching
- **File Storage**: Local file system with multer
- **Email**: Nodemailer for notifications

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SparkNew
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SparkNew
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy backend environment file
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   ```

4. **Set up database**
   ```bash
   # Start PostgreSQL and Redis
   # Create database: spark_db
   
   # Run migrations
   cd backend
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on port 3000
   npm run dev:backend   # Backend on port 5000
   ```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=spark_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 👥 Default Users

The system comes with pre-configured test users:

| Email/Username | Password | Role | Description |
|---------------|----------|------|-------------|
| admin@example.edu / admin | admin | Admin | System Administrator |
| student@example.edu / student | password | Student | Test Student |
| faculty@example.edu / faculty | password | Faculty | Test Faculty |
| print@example.edu / print | password | Print Cell | Print Services |
| clearance@example.edu / clearance | password | Clearance Officer | Library Clearance |

## 🆕 User Registration

New users can create accounts through the registration page:

1. **Access Registration**: Click "Create New Account" on the login page
2. **Fill Details**: Provide email, name, role, department, and password
3. **Student Fields**: Students can optionally add roll number and year
4. **Auto Login**: Successful registration automatically logs you in
5. **Role-based Access**: Users are redirected to appropriate dashboards based on their role

## 📁 Project Structure

```
SparkNew/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── backend/               # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Express middlewares
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migrations
│   └── seeds/             # Database seeds
├── docker-compose.yml     # Docker services
└── README.md             # This file
```

## 🚀 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both frontend and backend
- `npm run start` - Start both in production mode
- `npm run install:all` - Install all dependencies

### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run start:frontend` - Start frontend production server

### Backend
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend
- `npm run start:backend` - Start backend production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/report` - Get attendance report

### Fees
- `GET /api/fees` - Get fee information
- `POST /api/fees/pay` - Pay fees
- `GET /api/fees/history` - Get payment history

### Clearance
- `GET /api/clearance` - Get clearance status
- `POST /api/clearance/request` - Request clearance
- `PUT /api/clearance/:id/approve` - Approve clearance

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/send` - Send notification

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
npm test
```

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `attendance_sessions` - Attendance sessions
- `attendance_records` - Individual attendance records
- `fees` - Fee structures and payments
- `clearances` - Clearance requests and status
- `notifications` - System notifications
- `documents` - File uploads and documents

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   ```

3. **Start production servers**
   ```bash
   npm run start
   ```

### Docker Production

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs` folder
- Review the API documentation at `/api-docs` when running

## 🔄 Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install:all

# Run migrations if needed
cd backend && npm run migrate

# Restart services
npm run dev
```
