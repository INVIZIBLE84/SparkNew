const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const Clearance = sequelize.define('Clearance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  clearanceType: {
    type: DataTypes.ENUM('graduation', 'semester', 'hostel', 'library'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'clearances',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['clearanceType']
    }
  ],
  hooks: {
    afterUpdate: (clearance) => {
      if (clearance.changed('status')) {
        logger.info(`Clearance ${clearance.id} status changed to ${clearance.status}`);
      }
    }
  }
});

// Class methods
Clearance.getStudentClearances = async function(studentId) {
  return this.findAll({ 
    where: { studentId },
    order: [['createdAt', 'DESC']]
  });
};

Clearance.getPendingClearances = async function() {
  return this.findAll({
    where: { status: 'pending' },
    include: [{ model: User, as: 'student' }]
  });
};

module.exports = Clearance;