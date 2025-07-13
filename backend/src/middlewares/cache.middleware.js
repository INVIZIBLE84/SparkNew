const logger = require('../utils/logger');

const cache = (keyPrefix, ttl = 60) => {
  return async (req, res, next) => {
    next(); // No caching
  };
};

const clearCache = (keyPattern) => {
  return async (req, res, next) => {
    next(); // No cache clearing
  };
};

module.exports = { cache, clearCache };