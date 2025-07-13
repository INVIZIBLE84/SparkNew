module.exports = {
  up: async (queryInterface) => {
    const departments = await queryInterface.sequelize.query(
      'SELECT id, code FROM Departments;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const courses = [];
    const courseTemplates = [
      { name: 'Introduction to Programming', code: '101', credits: 4 },
      { name: 'Data Structures', code: '201', credits: 4 },
      { name: 'Algorithms', code: '301', credits: 3 },
      { name: 'Database Systems', code: '302', credits: 3 },
      { name: 'Operating Systems', code: '401', credits: 3 }
    ];

    departments.forEach(dept => {
      courseTemplates.forEach((template, index) => {
        courses.push({
          id: require('uuid').v4(),
          code: `${dept.code}${template.code}`,
          name: `${template.name} (${dept.code})`,
          description: `Fundamentals of ${template.name.toLowerCase()} for ${dept.code} students`,
          creditHours: template.credits,
          department: dept.name,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    await queryInterface.bulkInsert('Courses', courses);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Courses', null, {});
  }
};