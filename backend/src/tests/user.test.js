const { User } = require('../models');
const { hashPassword } = require('../utils/encryption');

describe('User Model', () => {
  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  it('should create a user with valid attributes', async () => {
    const user = await User.create({
      email: 'test@vedant.edu',
      password: await hashPassword('Test@123'),
      role: 'student',
      name: 'Test User',
      department: 'Computer Science'
    });
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@vedant.edu');
    expect(user.role).toBe('student');
  });

  it('should not create user with invalid email', async () => {
    await expect(
      User.create({
        email: 'invalid-email',
        password: await hashPassword('Test@123'),
        role: 'student',
        name: 'Test User',
        department: 'Computer Science'
      })
    ).rejects.toThrow();
  });

  it('should enforce unique email constraint', async () => {
    await User.create({
      email: 'test@vedant.edu',
      password: await hashPassword('Test@123'),
      role: 'student',
      name: 'Test User',
      department: 'Computer Science'
    });
    
    await expect(
      User.create({
        email: 'test@vedant.edu',
        password: await hashPassword('Test@123'),
        role: 'student',
        name: 'Test User',
        department: 'Computer Science'
      })
    ).rejects.toThrow();
  });
});