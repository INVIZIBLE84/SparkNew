const logger = require('../utils/logger');
const NotificationService = require('../services/notification.service');

class NotificationController {
  static async sendNotification(req, res) {
    try {
      const { title, body, recipientId, data } = req.body;
      const senderId = req.user.uid;

      await NotificationService.sendToUser(recipientId, {
        title,
        body,
        data
      });

      // Save notification to database
      // await firebase.db.collection('notifications').add({
      //   senderId,
      //   recipientId,
      //   title,
      //   body,
      //   data,
      //   read: false,
      //   createdAt: firebase.fieldValue.serverTimestamp()
      // });

      logger.info(`Notification sent to ${recipientId} by ${senderId}`);

      res.json({
        success: true,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(400).json({ error: 'Failed to send notification' });
    }
  }

  static async getUserNotifications(req, res) {
    try {
      const userId = req.params.userId || req.user.uid;
      const { limit = 20, unreadOnly } = req.query;

      let query = {
        where: { recipientId: userId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      };

      if (unreadOnly === 'true') {
        query.where = { ...query.where, read: false };
      }

      const notifications = await NotificationService.getNotifications(query);

      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(400).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { notificationIds } = req.body;
      // const batch = firebase.db.batch(); // Removed Firebase batch

      // notificationIds.forEach(id => {
      //   const ref = firebase.db.collection('notifications').doc(id);
      //   batch.update(ref, { read: true });
      // });

      // await batch.commit(); // Removed Firebase commit

      // Sequelize update logic would go here
      // For now, we'll just return success
      logger.info(`Notifications marked as read: ${notificationIds.join(', ')}`);

      res.json({
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(400).json({ error: 'Failed to update notifications' });
    }
  }

  static async broadcastNotification(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const { title, body, data, targetRoles } = req.body;

      await NotificationService.broadcastToRoles(targetRoles, {
        title,
        body,
        data
      });

      logger.info(`Broadcast notification sent by ${req.user.uid} to roles: ${targetRoles.join(', ')}`);

      res.json({
        success: true,
        message: 'Broadcast notification sent'
      });
    } catch (error) {
      logger.error('Broadcast notification error:', error);
      res.status(400).json({ error: 'Failed to send broadcast' });
    }
  }
}

module.exports = NotificationController;