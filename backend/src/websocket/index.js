const WebSocketServer = require('./websocket.server');
const AttendanceSocket = require('./attendance.socket');
const NotificationSocket = require('./notification.socket');
const logger = require('../utils/logger');

let ioInstance = null;

const initializeWebSockets = (server) => {
  if (!ioInstance) {
    // Create main WebSocket server
    const webSocketServer = new WebSocketServer(server);
    ioInstance = webSocketServer.io;

    // Initialize namespace handlers
    new AttendanceSocket(ioInstance);
    new NotificationSocket(ioInstance);

    logger.info('All WebSocket handlers initialized');
  }

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('WebSocket server not initialized');
  }
  return ioInstance;
};

module.exports = {
  initializeWebSockets,
  getIO
};