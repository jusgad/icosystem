const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'icosystem_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? 
    (msg) => logger.debug(msg) : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  retry: {
    max: 3
  }
});

const connectDB = async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');
      
      await sequelize.sync({ force: false });
      logger.info('Database synchronized successfully.');
      return;
      
    } catch (error) {
      retries--;
      logger.error(`Database connection failed. Retries left: ${retries}`, error);
      
      if (retries === 0) {
        logger.error('Unable to connect to the database after multiple attempts');
        process.exit(1);
      }
      
      // Wait 5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = { sequelize, connectDB };