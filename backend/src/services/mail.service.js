const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, verificationLink) {
    try {
      await this.transporter.sendMail({
        from: `"VEDANT System" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Please click <a href="${verificationLink}">here</a> to verify your email.</p>`
      });
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Send verification email error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email, resetLink) {
    try {
      await this.transporter.sendMail({
        from: `"VEDANT System" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
      });
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Send password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new MailService();