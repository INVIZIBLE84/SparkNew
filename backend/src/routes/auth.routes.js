const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { rateLimit } = require('../middlewares/rate-limit.middleware');

// User registration
router.post('/register', 
  rateLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  validate(schemas.auth.register),
  AuthController.register
);

// User login
router.post('/login',
  rateLimit(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  validate(schemas.auth.login),
  AuthController.login
);

// Refresh token
router.post('/refresh-token',
  rateLimit(20, 60 * 60 * 1000), // 20 requests per hour
  validate(authSchemas.refreshTokenSchema),
  AuthController.refreshToken
);

// Password reset request
router.post('/forgot-password',
  rateLimit(3, 60 * 60 * 1000), // 3 requests per hour
  validate(authSchemas.forgotPasswordSchema),
  AuthController.forgotPassword
);

// Password reset confirmation
router.post('/reset-password',
  rateLimit(5, 60 * 60 * 1000), // 5 requests per hour
  validate(authSchemas.resetPasswordSchema),
  AuthController.resetPassword
);

// Email verification
router.post('/verify-email',
  rateLimit(5, 60 * 60 * 1000), // 5 requests per hour
  validate(authSchemas.verifyEmailSchema),
  AuthController.verifyEmail
);

module.exports = router;