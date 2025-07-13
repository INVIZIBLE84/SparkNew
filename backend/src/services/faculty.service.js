const { Course, Session, Attendance } = require('../models');
const logger = require('../utils/logger');

class FacultyService {
  static async getProfile(facultyId) {
    try {
      return await User.findByPk(facultyId, {
        attributes: { exclude: ['password'] },
        include: ['department', 'courses']
      });
    } catch (error) {
      logger.error('Get faculty profile error:', error);
      throw new Error('Failed to fetch faculty profile');
    }
  }

  static async getCourses(facultyId) {
    try {
      return await Course.findAll({
        where: { facultyId },
        include: ['department']
      });
    } catch (error) {
      logger.error('Get faculty courses error:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  static async getCourseAttendance(courseId) {
    try {
      return await Attendance.findAll({
        where: { courseId },
        include: ['student'],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error('Get course attendance error:', error);
      throw new Error('Failed to fetch attendance records');
    }
  }

  static async generateCourseReport(courseId) {
    try {
      const attendances = await Attendance.findAll({
        where: { courseId },
        include: ['student']
      });

      // Process data into report format
      const report = {
        totalStudents: await this.countCourseStudents(courseId),
        attendanceStats: this.calculateAttendanceStats(attendances),
        dateRange: this.getDateRange(attendances)
      };

      return report;
    } catch (error) {
      logger.error('Generate course report error:', error);
      throw new Error('Failed to generate report');
    }
  }
}

module.exports = FacultyService;