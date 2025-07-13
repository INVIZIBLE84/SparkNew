const logger = require('../utils/logger');

const rateLimit = ({ windowMs = 60 * 1000, max = 100 }) => {
  return async (req, res, next) => {
    next(); // No rate limiting
  };
};

const sensitiveEndpointRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // Limit each IP to 10 requests per windowMs
  });
};

const publicEndpointRateLimit = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // Limit each IP to 100 requests per windowMs
  });
};

module.exports = {
  rateLimit,
  sensitiveEndpointRateLimit,
  publicEndpointRateLimit
};