const socketIo = require('socket.io');
const { authenticateSocket } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');
const NotificationService = require('../services/notification.service');

class WebSocketServer {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
      },
      path: '/ws'
    });

    this.initializeMiddlewares();
    this.initializeEventHandlers();
    this.initializeErrorHandling();

    logger.info('WebSocket server initialized');
  }

  initializeMiddlewares() {
    this.io.use(authenticateSocket);
  }

  initializeEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.user.uid}`);

      // Join user's personal room
      socket.join(`user_${socket.user.uid}`);

      // Join course rooms if user is student/faculty
      if (socket.user.role === 'student' || socket.user.role === 'faculty') {
        this.joinCourseRooms(socket);
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.user.uid}`);
      });

      // Handle custom events
      this.setupCustomEventHandlers(socket);
    });
  }

  joinCourseRooms(socket) {
    // In a real implementation, we'd fetch the user's courses from the database
    // For demo purposes, we'll assume the client sends the course IDs
    socket.on('join_courses', (courseIds) => {
      courseIds.forEach(courseId => {
        socket.join(`course_${courseId}`);
        logger.debug(`User ${socket.user.uid} joined course room ${courseId}`);
      });
    });
  }

  setupCustomEventHandlers(socket) {
    // Attendance submission event
    socket.on('attendance_submission', async (data) => {
      try {
        logger.info(`Attendance submission from ${socket.user.uid} for session ${data.sessionId}`);
        
        // Broadcast to faculty who created the session
        socket.to(`session_${data.sessionId}`).emit('attendance_update', {
          studentId: socket.user.uid,
          sessionId: data.sessionId,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Attendance submission error:', error);
      }
    });

    // Real-time location update
    socket.on('location_update', (location) => {
      if (this.validateLocation(location)) {
        // Store or process location data
        socket.to(`user_${socket.user.uid}`).emit('location_verified', {
          status: 'success',
          timestamp: new Date()
        });
      }
    });
  }

  validateLocation(location) {
    return (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
    );
  }

  initializeErrorHandling() {
    this.io.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });
  }

  // Notification methods
  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
    logger.debug(`Sent ${event} to user ${userId}`);
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
    logger.debug(`Broadcast ${event} to room ${room}`);
  }
}

module.exports = WebSocketServer;