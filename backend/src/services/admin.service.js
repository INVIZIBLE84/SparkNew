const { User, Course, Department } = require('../models');
const logger = require('../utils/logger');

class AdminService {
  static async createUser(userData) {
    try {
      // Additional validation can be added here
      return await User.create(userData);
    } catch (error) {
      logger.error('Create user error:', error);
      throw new Error('Failed to create user');
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      return await user.update(updateData);
    } catch (error) {
      logger.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  }

  static async createCourse(courseData) {
    try {
      return await Course.create(courseData);
    } catch (error) {
      logger.error('Create course error:', error);
      throw new Error('Failed to create course');
    }
  }

  static async getSystemAnalytics() {
    try {
      const [userCount, courseCount, activeSessions] = await Promise.all([
        User.count(),
        Course.count(),
        Session.count({ where: { isActive: true } })
      ]);

      return {
        userCount,
        courseCount,
        activeSessions,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Get system analytics error:', error);
      throw new Error('Failed to fetch system analytics');
    }
  }
}

module.exports = AdminService;