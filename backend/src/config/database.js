const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.NODE_ENV === 'production' ? process.env.POSTGRES_DB : 'spark_dev.db',
  process.env.NODE_ENV === 'production' ? process.env.POSTGRES_USER : '',
  process.env.NODE_ENV === 'production' ? process.env.POSTGRES_PASSWORD : '',
  {
    host: process.env.NODE_ENV === 'production' ? process.env.POSTGRES_HOST : '',
    port: process.env.NODE_ENV === 'production' ? process.env.POSTGRES_PORT : '',
    dialect: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
    storage: process.env.NODE_ENV === 'production' ? undefined : './database.sqlite',
    logging: msg => logger.debug(msg),
    pool: process.env.NODE_ENV === 'production' ? {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    } : undefined,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'} connection established successfully`);
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true }); // This will recreate tables
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error(`Unable to connect to ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'}:`, error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };