module.exports = {
  up: async (queryInterface) => {
    const sessions = [];
    
    // Get all faculty and courses
    const [faculty, courses] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE role = "faculty";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT id FROM Courses;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    // Create 2-3 sessions per course
    for (const course of courses) {
      const sessionCount = 2 + Math.floor(Math.random() * 2); // 2-3 sessions
      const facultyMember = faculty[Math.floor(Math.random() * faculty.length)];
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - Math.floor(Math.random() * 30));
        
        sessions.push({
          id: require('uuid').v4(),
          facultyId: facultyMember.id,
          courseId: course.id,
          codes: [10 + Math.floor(Math.random() * 90), 10 + Math.floor(Math.random() * 90), 10 + Math.floor(Math.random() * 90)],
          correctCode: 10 + Math.floor(Math.random() * 90),
          isActive: i === sessionCount - 1, // Only last session is active
          expiresAt: new Date(sessionDate.getTime() + (30 * 60 * 1000)), // 30 minutes duration
          createdAt: sessionDate,
          updatedAt: sessionDate
        });
      }
    }

    await queryInterface.bulkInsert('Sessions', sessions);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Sessions', null, {});
  }
};