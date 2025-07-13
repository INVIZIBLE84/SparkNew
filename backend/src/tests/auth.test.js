const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { hashPassword } = require('../utils/encryption');

describe('Authentication System', () => {
  beforeEach(async () => {
    // Create test user
    await User.create({
      email: 'test@vedant.edu',
      password: await hashPassword('Test@123'),
      role: 'student',
      name: 'Test User',
      department: 'Computer Science'
    });
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@vedant.edu',
          password: 'Test@123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@vedant.edu');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@vedant.edu',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@vedant.edu',
          password: 'New@123',
          role: 'student',
          profile: {
            name: 'New User',
            department: 'Computer Science'
          }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('new@vedant.edu');
      
      // Verify user exists in database
      const user = await User.findOne({ where: { email: 'new@vedant.edu' } });
      expect(user).not.toBeNull();
    });
  });
});