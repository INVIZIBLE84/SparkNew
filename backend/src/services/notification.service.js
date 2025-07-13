const { firebase } = require('../config');
const { User } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  static async sendToUser(userId, { title, body, data }) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.fcmToken) return;

      const message = {
        notification: { title, body },
        data,
        token: user.fcmToken
      };

      await firebase.messaging.send(message);
      logger.info(`Notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Send notification error:', error);
      throw new Error('Failed to send notification');
    }
  }

  static async notifyCourseStudents(courseId, title, body, data) {
    try {
      // Get all students enrolled in the course
      const students = await this.getCourseStudents(courseId);
      const tokens = students.map(s => s.fcmToken).filter(Boolean);

      if (tokens.length === 0) return;

      const message = {
        notification: { title, body },
        data,
        tokens
      };

      await firebase.messaging.sendMulticast(message);
      logger.info(`Notification sent to ${tokens.length} students`);
    } catch (error) {
      logger.error('Course notification error:', error);
      throw new Error('Failed to send course notifications');
    }
  }

  static async broadcastToRoles(roles, { title, body, data }) {
    try {
      const users = await User.findAll({
        where: { role: roles },
        attributes: ['fcmToken']
      });

      const tokens = users.map(u => u.fcmToken).filter(Boolean);
      if (tokens.length === 0) return;

      const message = {
        notification: { title, body },
        data,
        tokens
      };

      await firebase.messaging.sendMulticast(message);
      logger.info(`Broadcast sent to ${tokens.length} users`);
    } catch (error) {
      logger.error('Broadcast error:', error);
      throw new Error('Failed to send broadcast');
    }
  }
}

module.exports = NotificationService;