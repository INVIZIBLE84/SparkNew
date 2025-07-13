const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    try {
      const { email, password, name, role, department, rollNumber, year } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate username from email or name
      const username = email.split('@')[0].toLowerCase();
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Check if roll number is unique (if provided)
      if (rollNumber) {
        const existingRollNumber = await User.findOne({ where: { rollNumber } });
        if (existingRollNumber) {
          throw new Error('User with this roll number already exists');
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
        name,
        role,
        department,
        rollNumber,
        year,
        lastLogin: new Date()
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Return user data without password
      const userProfile = user.getProfile();
      userProfile.isAuthenticated = true;
      userProfile.isLocked = false;

      logger.info(`New user registered: ${email} with role: ${role}`);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: userProfile
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  static async login(emailOrUsername, password) {
    try {
      // Find user by email or username
      let user = await User.findByEmail(emailOrUsername);
      if (!user) {
        // Try to find by username if not found by email
        user = await User.findOne({ where: { username: emailOrUsername } });
      }
      if (!user) {
        throw new Error('Invalid email/username or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is locked. Please contact administrator.');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email/username or password');
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Return user data without password
      const userProfile = user.getProfile();
      userProfile.isAuthenticated = true;
      userProfile.isLocked = false;

      logger.info(`User logged in: ${emailOrUsername}`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userProfile
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userProfile = user.getProfile();
      userProfile.isAuthenticated = true;
      userProfile.isLocked = false;

      return {
        success: true,
        data: userProfile
      };
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId) {
    try {
      // In a real application, you might want to add the token to a blacklist
      // For now, we'll just log the logout
      logger.info(`User logged out: ${userId}`);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;