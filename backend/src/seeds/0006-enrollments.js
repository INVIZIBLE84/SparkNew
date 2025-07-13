module.exports = {
  up: async (queryInterface) => {
    const enrollments = [];
    
    // Get all students and courses
    const [students, courses] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE role = "student";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT id FROM Courses;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    // Enroll each student in 4-6 random courses
    students.forEach(student => {
      const coursesToEnroll = [...courses]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 + Math.floor(Math.random() * 3)); // 4-6 courses
      
      coursesToEnroll.forEach(course => {
        enrollments.push({
          id: require('uuid').v4(),
          studentId: student.id,
          courseId: course.id,
          enrollmentDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    await queryInterface.bulkInsert('Enrollments', enrollments);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Enrollments', null, {});
  }
};