module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Departments', [
      { id: 1, name: 'Computer Science', code: 'CS', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Electrical Engineering', code: 'EE', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Mechanical Engineering', code: 'ME', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Civil Engineering', code: 'CE', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Mathematics', code: 'MATH', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Departments', null, {});
  }
};