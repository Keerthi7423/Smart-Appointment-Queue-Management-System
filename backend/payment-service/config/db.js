const mongoose = require('mongoose');
const { getMongoUri, isProduction } = require('./env');
const logger = require('../observability/logger');

const DEFAULT_MONGO_URI = 'mongodb://mongo:27017/smartQueueDB';

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri() || DEFAULT_MONGO_URI;

    if (isProduction && !process.env.PAYMENT_MONGO_URI_PROD && !process.env.MONGO_URI_PROD && !process.env.MONGO_URI) {
      logger.warn('PAYMENT_MONGO_URI_PROD is not set. Falling back to local/default Mongo URI.');
    }

    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected (payment-service)');
  } catch (error) {
    logger.error({ error: error.message }, 'MongoDB connection failed (payment-service)');
    process.exit(1);
  }
};

module.exports = connectDB;
