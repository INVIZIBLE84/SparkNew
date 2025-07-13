const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth.routes');
const attendanceRoutes = require('./attendance.routes');
const studentRoutes = require('./student.routes');
const facultyRoutes = require('./faculty.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');

// API routes
router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

module.exports = router;