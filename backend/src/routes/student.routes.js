const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { studentSchemas } = require('../validations');

// Apply authentication middleware
router.use(authenticate);

// Get student profile
router.get('/profile/:studentId',
  authorize(['student', 'faculty', 'admin']),
  validate(studentSchemas.getStudentSchema),
  StudentController.getStudentProfile
);

// Update student profile
router.put('/profile/:studentId',
  authorize(['student', 'admin']),
  validate(studentSchemas.updateStudentSchema),
  StudentController.updateStudentProfile
);

// Get student courses
router.get('/courses/:studentId',
  authorize(['student', 'faculty', 'admin']),
  validate(studentSchemas.getCoursesSchema),
  StudentController.getStudentCourses
);

// Get student attendance summary
router.get('/attendance-summary/:studentId',
  authorize(['student', 'faculty', 'admin']),
  validate(studentSchemas.getAttendanceSummarySchema),
  StudentController.getAttendanceSummary
);

// Get student performance analytics
router.get('/performance/:studentId',
  authorize(['student', 'faculty', 'admin']),
  validate(studentSchemas.getPerformanceSchema),
  StudentController.getPerformanceAnalytics
);

module.exports = router;