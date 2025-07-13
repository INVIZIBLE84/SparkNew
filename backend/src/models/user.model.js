const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'faculty', 'admin', 'print_cell', 'clearance_officer'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rollNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  fcmToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  hooks: {
    afterCreate: (user) => {
      logger.info(`New user created: ${user.email}`);
    },
    beforeUpdate: (user) => {
      logger.debug(`Updating user: ${user.id}`);
    }
  }
});

// Class methods
User.findByEmail = async function(email) {
  return this.findOne({ where: { email } });
};

// Instance methods
User.prototype.getProfile = function() {
  return {
    id: this.id,
    email: this.email,
    username: this.username,
    role: this.role,
    name: this.name,
    rollNumber: this.rollNumber,
    department: this.department,
    year: this.year
  };
};

module.exports = User;