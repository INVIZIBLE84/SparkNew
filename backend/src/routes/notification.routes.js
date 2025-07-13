const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { notificationSchemas } = require('../validations');

// Apply authentication middleware
router.use(authenticate);

// Get user notifications
router.get('/',
  validate(notificationSchemas.getNotificationsSchema),
  NotificationController.getUserNotifications
);

// Mark notification as read
router.put('/:notificationId/read',
  validate(notificationSchemas.markAsReadSchema),
  NotificationController.markAsRead
);

// Delete notification
router.delete('/:notificationId',
  validate(notificationSchemas.deleteNotificationSchema),
  NotificationController.deleteNotification
);

// Send notification (Admin/Faculty only)
router.post('/send',
  authorize(['admin', 'faculty']),
  validate(notificationSchemas.sendNotificationSchema),
  NotificationController.sendNotification
);

module.exports = router;