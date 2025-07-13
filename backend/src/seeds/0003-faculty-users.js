const { hashPassword } = require('../../utils/encryption');
const { v4: uuidv4 } = require('uuid');
const faker = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface) => {
    const faculties = [];
    const departments = await queryInterface.sequelize.query(
      'SELECT id FROM Departments;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (let i = 0; i < 10; i++) {
      const hashedPassword = await hashPassword('Faculty@123');
      faculties.push({
        id: uuidv4(),
        uid: `faculty-${100 + i}`,
        email: `faculty${i}@vedant.edu`,
        role: 'faculty',
        name: faker.faker.person.fullName(),
        department: departments[i % departments.length].name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Users', faculties);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { role: 'faculty' });
  }
};