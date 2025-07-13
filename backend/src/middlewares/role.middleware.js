const logger = require('../utils/logger');

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check without authentication');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.role} to ${req.path}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    logger.debug(`Role ${req.user.role} authorized for ${req.path}`);
    next();
  };
};

const selfOrAdmin = (field = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[field];
    
    if (req.user.role !== 'admin' && req.user.uid !== resourceId) {
      logger.warn(`User ${req.user.uid} attempted to access ${resourceId}'s resources`);
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  authorize,
  selfOrAdmin
};