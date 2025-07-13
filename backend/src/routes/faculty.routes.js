const express = require('express');
const router = express.Router();
const FacultyController = require('../controllers/faculty.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { facultySchemas } = require('../validations');

// Apply authentication and faculty authorization
router.use(authenticate, authorize(['faculty']));

// Get faculty profile
router.get('/profile/:facultyId',
  validate(facultySchemas.getFacultySchema),
  FacultyController.getFacultyProfile
);

// Update faculty profile
router.put('/profile/:facultyId',
  validate(facultySchemas.updateFacultySchema),
  FacultyController.updateFacultyProfile
);

// Get faculty courses
router.get('/courses/:facultyId',
  validate(facultySchemas.getCoursesSchema),
  FacultyController.getFacultyCourses
);

// Get course attendance
router.get('/courses/:courseId/attendance',
  validate(facultySchemas.getCourseAttendanceSchema),
  FacultyController.getCourseAttendance
);

// Generate course report
router.get('/courses/:courseId/report',
  validate(facultySchemas.generateCourseReportSchema),
  FacultyController.generateCourseReport
);

module.exports = router;