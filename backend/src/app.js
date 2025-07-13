require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const { connectDB } = require('./config/database');
const { initializeWebSockets } = require('./websocket');
const routes = require('./routes');
const { requestLogger, errorLogger, validationErrorLogger } = require('./middlewares/logging.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 5000;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeWebSockets();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      await connectDB();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection error:', error);
      process.exit(1);
    }
  }

  initializeMiddlewares() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    }));
    
    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Logging
    this.app.use(morgan('combined', { stream: logger.stream }));
    this.app.use(requestLogger);
  }

  initializeRoutes() {
    // API routes
    this.app.use('/api', routes);
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
    
    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static(path.join(__dirname, '../client/build')));
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
      });
    }
  }

  initializeWebSockets() {
    try {
      this.io = initializeWebSockets(this.server);
      logger.info('WebSocket server initialized');
    } catch (error) {
      logger.error('WebSocket initialization error:', error);
    }
  }

  initializeErrorHandling() {
    // Logging middlewares
    this.app.use(validationErrorLogger);
    this.app.use(errorLogger);
    
    // Error handling middleware
    this.app.use(errorHandler);
    
    // Unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
    });
    
    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  start() {
    this.server.listen(this.port, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${this.port}`);
      logger.info(`API Documentation: http://localhost:${this.port}/api-docs`);
    });
  }
}

// Create and start the application
const application = new App();
application.start();

module.exports = application;