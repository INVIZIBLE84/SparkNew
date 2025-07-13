const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { attendanceSchemas } = require('../validations');

// Apply authentication middleware to all attendance routes
router.use(authenticate);

// Create attendance session (Faculty only)
router.post('/sessions',
  authorize(['faculty']),
  validate(attendanceSchemas.createSessionSchema),
  AttendanceController.createSession
);

// Get active attendance sessions
router.get('/sessions/active',
  AttendanceController.getActiveSessions
);

// Submit attendance 
router.post('/submit',
  validate(attendanceSchemas.submitAttendanceSchema),
  AttendanceController.submitAttendance
);

// Get attendance records for student
router.get('/records/:studentId',
  authorize(['student', 'faculty', 'admin']),
  validate(attendanceSchemas.getAttendanceSchema),
  AttendanceController.getStudentAttendance
);

// Close attendance session (Faculty only)
router.put('/sessions/:sessionId/close',
  authorize(['faculty']),
  validate(attendanceSchemas.closeSessionSchema),
  AttendanceController.closeSession
);

// Generate attendance reports
router.get('/reports',
  authorize(['faculty', 'admin']),
  validate(attendanceSchemas.generateReportSchema),
  AttendanceController.generateReport
);

module.exports = router;