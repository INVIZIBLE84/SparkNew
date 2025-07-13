const logger = require('../utils/logger');

class AttendanceSocket {
  constructor(io) {
    this.io = io;
    this.initializeAttendanceHandlers();
  }

  initializeAttendanceHandlers() {
    this.io.of('/attendance').on('connection', (socket) => {
      logger.info(`Attendance client connected: ${socket.user.uid}`);

      // Handle session creation events
      socket.on('create_session', (sessionData) => {
        this.handleSessionCreation(socket, sessionData);
      });

      // Handle attendance code requests
      socket.on('request_code', (sessionId) => {
        this.handleCodeRequest(socket, sessionId);
      });

      // Handle proximity verification
      socket.on('verify_proximity', (data) => {
        this.handleProximityVerification(socket, data);
      });
    });
  }

  handleSessionCreation(socket, sessionData) {
    try {
      logger.info(`New session created by ${socket.user.uid}: ${sessionData.sessionId}`);

      // Broadcast to all students in the course
      this.io.of('/attendance').to(`course_${sessionData.courseId}`).emit('session_created', {
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt
      });

      socket.emit('session_created_success', sessionData);
    } catch (error) {
      logger.error('Session creation error:', error);
      socket.emit('session_error', { error: 'Failed to create session' });
    }
  }

  handleCodeRequest(socket, sessionId) {
    try {
      // In a real implementation, we'd fetch codes from the database
      const codes = [/* fetch codes for session */];
      
      socket.emit('code_response', {
        sessionId,
        codes
      });
    } catch (error) {
      logger.error('Code request error:', error);
      socket.emit('session_error', { error: 'Failed to get codes' });
    }
  }

  handleProximityVerification(socket, data) {
    try {
      const { sessionId, location } = data;
      
      // Verify location is within allowed radius
      const isWithinRadius = this.checkProximity(sessionId, location);
      
      socket.emit('proximity_verified', {
        sessionId,
        isWithinRadius,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Proximity verification error:', error);
      socket.emit('session_error', { error: 'Proximity check failed' });
    }
  }

  checkProximity(sessionId, location) {
    // In a real implementation, we'd check against the session's allowed location
    return true; // Simplified for example
  }
}

module.exports = AttendanceSocket;