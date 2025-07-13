const { hashPassword } = require('../utils/encryption');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await hashPassword('Admin@123');
    
    await queryInterface.bulkInsert('Users', [{
      id: uuidv4(),
      uid: 'admin-001',
      email: 'admin@vedant.edu',
      role: 'admin',
      name: 'System Administrator',
      department: 'Administration',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@vedant.edu' });
  }
};