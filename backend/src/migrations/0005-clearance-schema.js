module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Clearances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      clearanceType: {
        type: Sequelize.ENUM('graduation', 'semester', 'hostel', 'library'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('ClearanceApprovals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      clearanceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Clearances',
          key: 'id'
        }
      },
      approverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      approverRole: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('approved', 'rejected', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('Clearances', ['studentId']);
    await queryInterface.addIndex('Clearances', ['status']);
    await queryInterface.addIndex('ClearanceApprovals', ['clearanceId']);
    await queryInterface.addIndex('ClearanceApprovals', ['approverId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ClearanceApprovals');
    await queryInterface.dropTable('Clearances');
  }
};