const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.uid
    };

    if (res.statusCode >= 500) {
      logger.error('Server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  logger.debug('Request started', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    query: req.query,
    params: req.params
  });

  next();
};

const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.uid
  });

  next(err);
};

const validationErrorLogger = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    logger.warn('Validation error', {
      errors: err.errors,
      path: req.path,
      method: req.method
    });
  }
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
  validationErrorLogger
};