const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false,
    defaultValue: 'present'
  },
  method: {
    type: DataTypes.ENUM('code', 'geo', 'wifi', 'bluetooth'),
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    }
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId']
    },
    {
      fields: ['sessionId']
    },
    {
      fields: ['courseId']
    }
  ],
  hooks: {
    afterCreate: (attendance) => {
      logger.info(`Attendance recorded for student ${attendance.studentId}`);
    }
  }
});

// Class methods
Attendance.getStudentAttendance = async function(studentId, courseId, startDate, endDate) {
  const where = { studentId };
  
  if (courseId) {
    where.courseId = courseId;
  }
  
  if (startDate && endDate) {
    where.createdAt = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  }

  return this.findAll({ 
    where,
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Attendance;