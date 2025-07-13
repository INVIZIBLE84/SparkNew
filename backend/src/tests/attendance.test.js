const { AttendanceService } = require('../services');
const { User, Course, Session } = require('../models');
const { redisClient } = require('../config/redis');

describe('Attendance Service', () => {
  let faculty, student, course;

  beforeEach(async () => {
    // Create test data
    faculty = await User.create({
      email: 'faculty@vedant.edu',
      role: 'faculty',
      name: 'Faculty Member',
      department: 'Computer Science'
    });

    student = await User.create({
      email: 'student@vedant.edu',
      role: 'student',
      name: 'Test Student',
      department: 'Computer Science'
    });

    course = await Course.create({
      code: 'CS101',
      name: 'Introduction to Programming',
      department: 'Computer Science'
    });

    // Clear Redis cache
    await redisClient.flushall();
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
    await Course.destroy({ where: {} });
    await Session.destroy({ where: {} });
  });

  describe('createSession', () => {
    it('should create a new attendance session', async () => {
      const session = await AttendanceService.createSession(
        faculty.id,
        course.id,
        180000 // 3 minutes
      );
      
      expect(session.sessionId).toBeDefined();
      expect(session.codes.length).toBe(3);
      
      // Verify session exists in database
      const dbSession = await Session.findByPk(session.sessionId);
      expect(dbSession).not.toBeNull();
    });
  });

  describe('submitAttendance', () => {
    it('should record attendance with correct code', async () => {
      const session = await Session.create({
        facultyId: faculty.id,
        courseId: course.id,
        codes: [12, 34, 56],
        correctCode: 34,
        expiresAt: new Date(Date.now() + 180000),
        isActive: true
      });

      const result = await AttendanceService.submitAttendance(
        student.id,
        session.id,
        34
      );
      
      expect(result).toBe(true);
      
      // Verify attendance record
      const attendance = await Attendance.findOne({ 
        where: { studentId: student.id, sessionId: session.id } 
      });
      expect(attendance.status).toBe('present');
    });
  });
});