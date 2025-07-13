const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'password', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'temp_password_change_me' // Temporary default for existing users
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'password');
  }
}; 