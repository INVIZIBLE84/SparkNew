const logger = require('../utils/logger');

class NotificationSocket {
  constructor(io) {
    this.io = io;
    this.initializeNotificationHandlers();
  }

  initializeNotificationHandlers() {
    this.io.of('/notifications').on('connection', (socket) => {
      logger.info(`Notification client connected: ${socket.user.uid}`);

      // Handle notification subscription
      socket.on('subscribe', (topics) => {
        this.handleSubscription(socket, topics);
      });

      // Handle notification read events
      socket.on('mark_read', (notificationId) => {
        this.handleMarkRead(socket, notificationId);
      });
    });
  }

  handleSubscription(socket, topics) {
    try {
      topics.forEach(topic => {
        socket.join(`topic_${topic}`);
        logger.debug(`User ${socket.user.uid} subscribed to ${topic}`);
      });
      
      socket.emit('subscription_success', { topics });
    } catch (error) {
      logger.error('Subscription error:', error);
      socket.emit('subscription_error', { error: 'Failed to subscribe' });
    }
  }

  handleMarkRead(socket, notificationId) {
    try {
      // In a real implementation, we'd update the database
      logger.info(`Notification ${notificationId} marked as read by ${socket.user.uid}`);
      socket.emit('read_success', { notificationId });
    } catch (error) {
      logger.error('Mark read error:', error);
      socket.emit('read_error', { error: 'Failed to mark as read' });
    }
  }

  // Method to send real-time notifications
  sendNotification(userId, notification) {
    this.io.of('/notifications').to(`user_${userId}`).emit('new_notification', notification);
    logger.info(`Sent real-time notification to ${userId}`);
  }

  // Method to broadcast to topics
  broadcastToTopic(topic, message) {
    this.io.of('/notifications').to(`topic_${topic}`).emit('topic_message', message);
    logger.info(`Broadcast message to topic ${topic}`);
  }
}

module.exports = NotificationSocket;