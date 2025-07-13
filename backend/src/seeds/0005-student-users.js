const { hashPassword } = require('../../utils/encryption');
const { v4: uuidv4 } = require('uuid');
const faker = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface) => {
    const students = [];
    const departments = await queryInterface.sequelize.query(
      'SELECT id, name FROM Departments;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (let i = 0; i < 100; i++) {
      const deptIndex = i % departments.length;
      const hashedPassword = await hashPassword('Student@123');
      const year = (i % 4) + 1; // Distribute across 4 years
      
      students.push({
        id: uuidv4(),
        uid: `student-${2000 + i}`,
        email: `student${i}@vedant.edu`,
        role: 'student',
        name: faker.faker.person.fullName(),
        rollNumber: `${departments[deptIndex].name.substring(0,2).toUpperCase()}${year}${(i+1).toString().padStart(3,'0')}`,
        department: departments[deptIndex].name,
        year: year,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Users', students);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { role: 'student' });
  }
};