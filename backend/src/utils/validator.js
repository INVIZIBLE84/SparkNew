const Joi = require('joi');
const logger = require('./logger');

class Validator {
  static validateEmail(email) {
    const schema = Joi.string().email().required();
    const { error } = schema.validate(email);
    if (error) {
      logger.warn(`Invalid email: ${email}`);
      return false;
    }
    return true;
  }

  static validatePassword(password) {
    const schema = Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required();
    
    const { error } = schema.validate(password);
    if (error) {
      logger.warn('Invalid password format');
      return false;
    }
    return true;
  }

  static validateAttendanceCode(code) {
    const schema = Joi.number().integer().min(10).max(99).required();
    const { error } = schema.validate(code);
    if (error) {
      logger.warn(`Invalid attendance code: ${code}`);
      return false;
    }
    return true;
  }

  static validateUUID(uuid) {
    const schema = Joi.string().guid({
      version: ['uuidv4']
    }).required();
    const { error } = schema.validate(uuid);
    if (error) {
      logger.warn(`Invalid UUID: ${uuid}`);
      return false;
    }
    return true;
  }
}

module.exports = Validator;