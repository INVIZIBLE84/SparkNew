const { User, Enrollment, Course, Attendance } = require('../models');
const logger = require('../utils/logger');

class StudentService {
  static async getProfile(studentId) {
    try {
      return await User.findByPk(studentId, {
        attributes: { exclude: ['password'] },
        include: ['department']
      });
    } catch (error) {
      logger.error('Get student profile error:', error);
      throw new Error('Failed to fetch student profile');
    }
  }

  static async updateProfile(studentId, updateData) {
    try {
      const student = await User.findByPk(studentId);
      if (!student) throw new Error('Student not found');

      return await student.update(updateData);
    } catch (error) {
      logger.error('Update student profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  static async getCourses(studentId) {
    try {
      return await Enrollment.findAll({
        where: { studentId },
        include: ['course']
      });
    } catch (error) {
      logger.error('Get student courses error:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  static async getAttendanceSummary(studentId) {
    try {
      const attendances = await Attendance.findAll({
        where: { studentId },
        attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']],
        group: ['status']
      });

      return attendances.reduce((summary, item) => {
        summary[item.status] = item.count;
        return summary;
      }, { present: 0, absent: 0, late: 0 });
    } catch (error) {
      logger.error('Get attendance summary error:', error);
      throw new Error('Failed to fetch attendance summary');
    }
  }
}

module.exports = StudentService;