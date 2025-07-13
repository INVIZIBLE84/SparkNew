const logger = require('../utils/logger');
const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res) {
    try {
      const { emailOrUsername, password } = req.body;

      const result = await AuthService.login(emailOrUsername, password);

      res.json(result);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ 
        success: false,
        error: error.message || 'Invalid credentials' 
      });
    }
  }

  static async register(req, res) {
    try {
      const { email, password, name, role, department, rollNumber, year } = req.body;

      const result = await AuthService.register({
        email,
        password,
        name,
        role,
        department,
        rollNumber,
        year
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({ 
        success: false,
        error: error.message || 'Registration failed' 
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyAuthToken(refreshToken, true);

      if (!decoded || !decoded.uid) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const newToken = generateAuthToken(decoded.uid);

      res.json({
        success: true,
        token: newToken
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ error: 'Token refresh failed' });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = verifyAuthToken(token);

      // Add token to blacklist
      await redisClient.setAsync(`blacklist:${token}`, 'true', 'EX', 86400);

      logger.info(`User ${decoded.uid} logged out`);

      res.json({ success: true });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(400).json({ error: 'Logout failed' });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const link = await firebase.auth.generatePasswordResetLink(email);

      // TODO: Send email with password reset link
      logger.info(`Password reset link generated for ${email}`);

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(400).json({ error: 'Password reset failed' });
    }
  }
}

module.exports = AuthController;