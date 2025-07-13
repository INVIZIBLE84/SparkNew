const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { adminSchemas } = require('../validations');

// Apply authentication and admin authorization
router.use(authenticate, authorize(['admin']));

// User management
router.post('/users',
  validate(adminSchemas.createUserSchema),
  AdminController.createUser
);

router.put('/users/:userId',
  validate(adminSchemas.updateUserSchema),
  AdminController.updateUser
);

router.delete('/users/:userId',
  validate(adminSchemas.deleteUserSchema),
  AdminController.deleteUser
);

// Course management
router.post('/courses',
  validate(adminSchemas.createCourseSchema),
  AdminController.createCourse
);

router.put('/courses/:courseId',
  validate(adminSchemas.updateCourseSchema),
  AdminController.updateCourse
);

// System configuration
router.get('/config',
  AdminController.getSystemConfig
);

router.put('/config',
  validate(adminSchemas.updateSystemConfigSchema),
  AdminController.updateSystemConfig
);

// System analytics
router.get('/analytics',
  validate(adminSchemas.getAnalyticsSchema),
  AdminController.getSystemAnalytics
);

module.exports = router;