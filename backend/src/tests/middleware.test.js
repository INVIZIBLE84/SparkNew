const { authenticate } = require('../middlewares/auth.middleware');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  let user, token;

  beforeAll(async () => {
    user = await User.create({
      email: 'middleware@vedant.edu',
      password: 'hashedpassword',
      role: 'student',
      name: 'Middleware Test',
      department: 'Computer Science'
    });
    
    token = jwt.sign(
      { uid: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  it('should authenticate user with valid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = mockResponse();
    const next = jest.fn();
    
    await authenticate(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(user.id);
  });

  it('should reject request without token', async () => {
    const req = {
      headers: {}
    };
    const res = mockResponse();
    const next = jest.fn();
    
    await authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access token required'
    });
  });
});