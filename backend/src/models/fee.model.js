const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  feeType: {
    type: DataTypes.ENUM('tuition', 'hostel', 'library', 'other'),
    allowNull: false,
    defaultValue: 'tuition'
  }
}, {
  tableName: 'fees',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['dueDate']
    }
  ],
  hooks: {
    beforeUpdate: (fee) => {
      if (fee.changed('status') && fee.status === 'paid' && !fee.paymentDate) {
        fee.paymentDate = new Date();
      }
    },
    afterUpdate: (fee) => {
      if (fee.changed('status') && fee.status === 'paid') {
        logger.info(`Fee payment recorded for student ${fee.studentId}`);
      }
    }
  }
});

// Class methods
Fee.getStudentFees = async function(studentId, status) {
  const where = { studentId };
  if (status) where.status = status;
  
  return this.findAll({ 
    where,
    order: [['dueDate', 'ASC']]
  });
};

Fee.getPendingFees = async function() {
  return this.findAll({
    where: {
      status: 'pending',
      dueDate: {
        [sequelize.Op.lt]: new Date()
      }
    },
    include: [{ model: User, as: 'student' }]
  });
};

module.exports = Fee;