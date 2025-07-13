const AttendanceService = require('../services/attendance.service');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

class AttendanceController {
  static async createSession(req, res) {
    try {
      const { courseId, duration } = req.body;
      const facultyId = req.user.uid;

      const session = await AttendanceService.createSession(facultyId, courseId, duration);

      logger.info(`Attendance session created by ${facultyId} for course ${courseId}`);

      res.status(201).json({
        success: true,
        sessionId: session.sessionId,
        codes: session.codes
      });
    } catch (error) {
      logger.error('Create session error:', error);
      res.status(400).json({ error: 'Failed to create session', details: error.message });
    }
  }

  static async submitAttendance(req, res) {
    try {
      const { sessionId, selectedCode } = req.body;
      const studentId = req.user.uid;

      const isCorrect = await AttendanceService.submitAttendance(studentId, sessionId, selectedCode);

      if (!isCorrect) {
        return res.status(400).json({ 
          success: false,
          error: 'Incorrect attendance code' 
        });
      }

      logger.info(`Attendance submitted by ${studentId} for session ${sessionId}`);

      res.json({
        success: true,
        message: 'Attendance recorded successfully'
      });
    } catch (error) {
      logger.error('Submit attendance error:', error);
      res.status(400).json({ error: 'Attendance submission failed', details: error.message });
    }
  }

  static async getActiveSessions(req, res) {
    try {
      const studentId = req.user.uid;
      const sessions = await AttendanceService.getActiveSessions(studentId);

      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      logger.error('Get active sessions error:', error);
      res.status(400).json({ error: 'Failed to fetch active sessions' });
    }
  }

  static async getStudentAttendance(req, res) {
    try {
      const studentId = req.params.studentId || req.user.uid;
      const { courseId, startDate, endDate } = req.query;

      const attendance = await AttendanceService.getStudentAttendance(
        studentId, 
        courseId, 
        startDate, 
        endDate
      );

      res.json({
        success: true,
        attendance
      });
    } catch (error) {
      logger.error('Get student attendance error:', error);
      res.status(400).json({ error: 'Failed to fetch attendance records' });
    }
  }

  static async closeSession(req, res) {
    try {
      const { sessionId } = req.body;
      const facultyId = req.user.uid;

      await AttendanceService.closeSession(sessionId, facultyId);

      logger.info(`Session ${sessionId} closed by ${facultyId}`);

      res.json({
        success: true,
        message: 'Session closed successfully'
      });
    } catch (error) {
      logger.error('Close session error:', error);
      res.status(400).json({ error: 'Failed to close session', details: error.message });
    }
  }

  static async generateReport(req, res) {
    try {
      const { courseId, startDate, endDate, reportType } = req.query;
      const facultyId = req.user.uid;

      const report = await AttendanceService.generateReport(
        facultyId,
        courseId,
        startDate,
        endDate,
        reportType
      );

      res.json({
        success: true,
        report
      });
    } catch (error) {
      logger.error('Generate report error:', error);
      res.status(400).json({ error: 'Failed to generate report' });
    }
  }
}

module.exports = AttendanceController;