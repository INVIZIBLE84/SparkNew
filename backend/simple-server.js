const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Simple backend server is running!'
  });
});

// Test registration endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  
  // Basic validation
  const { email, password, name, role, department } = req.body;
  
  if (!email || !password || !name || !role || !department) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  // Simulate successful registration
  res.json({
    success: true,
    message: 'Registration successful!',
    data: {
      token: 'test-jwt-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: email,
        name: name,
        role: role,
        department: department,
        rollNumber: req.body.rollNumber || null,
        year: req.body.year || null,
        isAuthenticated: true,
        isLocked: false
      }
    }
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { emailOrUsername, password } = req.body;
  
  if (!emailOrUsername || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email/Username and password are required'
    });
  }
  
  // Simulate successful login
  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      token: 'test-jwt-token-' + Date.now(),
      user: {
        id: 'user-123',
        email: emailOrUsername.includes('@') ? emailOrUsername : emailOrUsername + '@example.edu',
        name: 'Test User',
        role: 'student',
        department: 'Computer Science',
        isAuthenticated: true,
        isLocked: false
      }
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Registration: POST http://localhost:${port}/api/auth/register`);
  console.log(`🔑 Login: POST http://localhost:${port}/api/auth/login`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
}); 