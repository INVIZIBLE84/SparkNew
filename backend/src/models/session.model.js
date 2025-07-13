const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  codes: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    validate: {
      isValidCodes(value) {
        if (!Array.isArray(value) || value.length !== 3) {
          throw new Error('Session must have exactly 3 codes');
        }
        value.forEach(code => {
          if (code < 10 || code > 99) {
            throw new Error('Codes must be between 10 and 99');
          }
        });
      }
    }
  },
  correctCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 10,
      max: 99
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  hooks: {
    beforeCreate: (session) => {
      if (!session.codes.includes(session.correctCode)) {
        throw new Error('Correct code must be one of the session codes');
      }
    },
    afterUpdate: (session) => {
      if (session.changed('isActive') && !session.isActive) {
        logger.info(`Session ${session.id} closed by faculty`);
      }
    }
  }
});

// Class methods
Session.getActiveSessions = async function(courseId) {
  return this.findAll({
    where: {
      isActive: true,
      expiresAt: {
        [sequelize.Op.gt]: new Date()
      },
      ...(courseId && { courseId })
    }
  });
};

Session.prototype.closeSession = async function() {
  this.isActive = false;
  return this.save();
};

module.exports = Session;