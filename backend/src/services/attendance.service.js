const { firebase } = require('../config');
const { Session, Attendance } = require('../models');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');
const CodeGenerator = require('../utils/codeGenerator');

class AttendanceService {
  static async createSession(facultyId, courseId, duration = 180000) {
    try {
      // Generate session codes
      const codes = CodeGenerator.generateSessionCodes();
      const correctCode = CodeGenerator.selectCorrectCode(codes);

      // Create session in database
      const session = await Session.create({
        facultyId,
        courseId,
        codes,
        correctCode,
        expiresAt: new Date(Date.now() + duration),
        isActive: true
      });

      // Notify enrolled students
      await notificationService.notifyCourseStudents(
        courseId,
        'New Attendance Session',
        `Attendance session started with codes: ${codes.join(', ')}`,
        { sessionId: session.id, codes }
      );

      logger.info(`Attendance session created: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Create session error:', error);
      throw new Error('Failed to create attendance session');
    }
  }

  static async submitAttendance(studentId, sessionId, selectedCode) {
    try {
      const session = await Session.findByPk(sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or expired session');
      }

      // Verify code
      const isCorrect = session.codes.includes(parseInt(selectedCode));
      const status = isCorrect ? 'present' : 'absent';

      // Record attendance
      const attendance = await Attendance.create({
        studentId,
        sessionId,
        courseId: session.courseId,
        status,
        method: 'code'
      });

      logger.info(`Attendance recorded for student ${studentId}`);
      return attendance;
    } catch (error) {
      logger.error('Submit attendance error:', error);
      throw new Error('Failed to submit attendance');
    }
  }

  static async getActiveSessions(studentId) {
    try {
      // Get student's enrolled courses
      const courses = await this.getStudentCourses(studentId);
      const courseIds = courses.map(c => c.id);

      return await Session.findAll({
        where: {
          courseId: courseIds,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        },
        include: ['course']
      });
    } catch (error) {
      logger.error('Get active sessions error:', error);
      throw new Error('Failed to fetch active sessions');
    }
  }

  static async getStudentAttendance(studentId, courseId, startDate, endDate) {
    try {
      const where = { studentId };
      if (courseId) where.courseId = courseId;
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }

      return await Attendance.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: ['course', 'session']
      });
    } catch (error) {
      logger.error('Get student attendance error:', error);
      throw new Error('Failed to fetch attendance records');
    }
  }

  static async generateReport(facultyId, courseId, startDate, endDate) {
    try {
      // Verify faculty teaches this course
      const isFacultyCourse = await this.verifyFacultyCourse(facultyId, courseId);
      if (!isFacultyCourse) {
        throw new Error('Not authorized for this course');
      }

      const where = { courseId };
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }

      const attendances = await Attendance.findAll({
        where,
        include: ['student']
      });

      // Process data for report
      return this.processAttendanceData(attendances);
    } catch (error) {
      logger.error('Generate report error:', error);
      throw new Error('Failed to generate report');
    }
  }
}

module.exports = AttendanceService;