const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  creditHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'courses',
  timestamps: true,
  hooks: {
    afterCreate: (course) => {
      logger.info(`New course created: ${course.code} - ${course.name}`);
    }
  }
});

// Class methods
Course.findByCode = async function(code) {
  return this.findOne({ where: { code } });
};

Course.prototype.getEnrolledStudents = async function() {
  const enrollments = await Enrollment.findAll({ 
    where: { courseId: this.id },
    include: [{ model: User, as: 'student' }]
  });
  
  return enrollments.map(enrollment => enrollment.student);
};

module.exports = Course;