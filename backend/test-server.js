require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running!'
  });
});

// Test registration endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  res.json({
    success: true,
    message: 'Registration endpoint is working',
    data: {
      token: 'test-token',
      user: {
        id: 'test-id',
        email: req.body.email,
        name: req.body.name,
        role: req.body.role,
        department: req.body.department,
        isAuthenticated: true,
        isLocked: false
      }
    }
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({
    success: true,
    message: 'Login endpoint is working',
    data: {
      token: 'test-token',
      user: {
        id: 'test-id',
        email: req.body.email,
        name: 'Test User',
        role: 'student',
        department: 'Computer Science',
        isAuthenticated: true,
        isLocked: false
      }
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Test registration: POST http://localhost:${port}/api/auth/register`);
  console.log(`🔑 Test login: POST http://localhost:${port}/api/auth/login`);
}); 