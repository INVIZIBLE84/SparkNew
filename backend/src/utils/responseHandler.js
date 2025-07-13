const logger = require('./logger');

class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = 200) {
    logger.debug(`API Success: ${message}`);
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 400, error = null) {
    if (error) {
      logger.error(`API Error: ${message}`, error);
    } else {
      logger.warn(`API Warning: ${message}`);
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || null
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    logger.debug(`Paginated API Success: ${message}`);
    res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }

  static validationError(res, errors, message = 'Validation failed') {
    logger.warn(`Validation Error: ${message}`, errors);
    res.status(422).json({
      success: false,
      message,
      errors
    });
  }
}

module.exports = ResponseHandler;