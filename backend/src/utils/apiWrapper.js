const axios = require('axios');
const logger = require('./logger');

class ApiWrapper {
  constructor(baseURL, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async get(endpoint, params = {}, headers = {}) {
    try {
      const response = await this.client.get(endpoint, { params, headers });
      return response.data;
    } catch (error) {
      logger.error(`API GET Error: ${endpoint}`, error);
      throw this._handleError(error);
    }
  }

  async post(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      logger.error(`API POST Error: ${endpoint}`, error);
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      // Server responded with non-2xx status
      return {
        status: error.response.status,
        message: error.response.data?.message || 'API request failed',
        data: error.response.data
      };
    } else if (error.request) {
      // No response received
      return {
        status: 503,
        message: 'No response from server'
      };
    } else {
      // Request setup error
      return {
        status: 500,
        message: 'API request setup failed'
      };
    }
  }
}

module.exports = ApiWrapper;