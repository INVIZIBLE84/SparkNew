module.exports = {
  up: async (queryInterface) => {
    const attendanceRecords = [];
    
    // Get all sessions and enrollments
    const [sessions, enrollments] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id, courseId, codes, correctCode FROM Sessions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT studentId, courseId FROM Enrollments;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    // Create attendance records for each session
    for (const session of sessions) {
      const courseEnrollments = enrollments.filter(e => e.courseId === session.courseId);
      
      for (const enrollment of courseEnrollments) {
        // 70% chance of attendance
        if (Math.random() < 0.7) {
          const isPresent = Math.random() < 0.8; // 80% present if attending
          const status = isPresent ? 'present' : (Math.random() < 0.5 ? 'late' : 'absent');
          
          attendanceRecords.push({
            id: require('uuid').v4(),
            studentId: enrollment.studentId,
            sessionId: session.id,
            courseId: session.courseId,
            status,
            method: 'code',
            createdAt: session.createdAt,
            updatedAt: session.createdAt
          });
        }
      }
    }

    await queryInterface.bulkInsert('Attendances', attendanceRecords);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Attendances', null, {});
  }
};