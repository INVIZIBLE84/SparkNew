const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false
    });

    if (!error) {
      return next();
    }

    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]/g, '')
    }));

    logger.debug('Validation failed:', {
      path: req.path,
      errors
    });

    res.status(422).json({
      error: 'Validation failed',
      details: errors
    });
  };
};

// Common validation schemas
const schemas = {
  auth: {
    login: Joi.object({
      emailOrUsername: Joi.string().required(),
      password: Joi.string().required()
    }),
    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().required(),
      role: Joi.string().valid('student', 'faculty', 'admin', 'print_cell', 'clearance_officer').required(),
      department: Joi.string().required(),
      rollNumber: Joi.string().optional(),
      year: Joi.number().min(1).max(5).optional()
    })
  },
  attendance: {
    createSession: Joi.object({
      courseId: Joi.string().required(),
      duration: Joi.number().min(60000).max(3600000) // 1 min to 1 hour
    }),
    submitAttendance: Joi.object({
      sessionId: Joi.string().required(),
      selectedCode: Joi.number().min(10).max(99).required()
    })
  }
};

module.exports = {
  validate,
  schemas
};