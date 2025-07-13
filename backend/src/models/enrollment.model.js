const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'courseId']
    }
  ],
  hooks: {
    afterCreate: (enrollment) => {
      logger.info(`Student ${enrollment.studentId} enrolled in course ${enrollment.courseId}`);
    },
    afterUpdate: (enrollment) => {
      if (enrollment.changed('status')) {
        logger.info(`Enrollment status changed to ${enrollment.status} for student ${enrollment.studentId}`);
      }
    }
  }
});

// Class methods
Enrollment.getStudentCourses = async function(studentId) {
  return this.findAll({ 
    where: { studentId, status: 'active' },
    include: [{ model: Course, as: 'course' }]
  });
};

module.exports = Enrollment;