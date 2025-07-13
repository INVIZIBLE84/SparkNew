const request = require('supertest');
const app = require('../app');
const { User, Course } = require('../models');
const { hashPassword } = require('../utils/encryption');

describe('API Integration Tests', () => {
  let adminToken, facultyToken, studentToken;
  
  beforeAll(async () => {
    // Create test users
    await User.bulkCreate([
      {
        email: 'admin@vedant.edu',
        password: await hashPassword('Admin@123'),
        role: 'admin',
        name: 'Admin User',
        department: 'Administration'
      },
      {
        email: 'faculty@vedant.edu',
        password: await hashPassword('Faculty@123'),
        role: 'faculty',
        name: 'Faculty User',
        department: 'Computer Science'
      },
      {
        email: 'student@vedant.edu',
        password: await hashPassword('Student@123'),
        role: 'student',
        name: 'Student User',
        department: 'Computer Science'
      }
    ]);
    
    // Create test course
    await Course.create({
      code: 'CS101',
      name: 'Introduction to Programming',
      department: 'Computer Science'
    });
    
    // Login to get tokens
    const responses = await Promise.all([
      request(app).post('/api/auth/login').send({
        email: 'admin@vedant.edu',
        password: 'Admin@123'
      }),
      request(app).post('/api/auth/login').send({
        email: 'faculty@vedant.edu',
        password: 'Faculty@123'
      }),
      request(app).post('/api/auth/login').send({
        email: 'student@vedant.edu',
        password: 'Student@123'
      })
    ]);
    
    adminToken = responses[0].body.token;
    facultyToken = responses[1].body.token;
    studentToken = responses[2].body.token;
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
    await Course.destroy({ where: {} });
  });

  describe('Course Management', () => {
    it('should allow admin to create courses', async () => {
      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS201',
          name: 'Data Structures',
          department: 'Computer Science'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe('CS201');
    });

    it('should prevent students from creating courses', async () => {
      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          code: 'CS202',
          name: 'Algorithms',
          department: 'Computer Science'
        });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Attendance System', () => {
    it('should allow faculty to create attendance sessions', async () => {
      const response = await request(app)
        .post('/api/attendance/sessions')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          courseId: 1,
          duration: 180000
        });
      
      expect(response.status).toBe(201);
      expect(response.body.sessionId).toBeDefined();
    });
  });
});