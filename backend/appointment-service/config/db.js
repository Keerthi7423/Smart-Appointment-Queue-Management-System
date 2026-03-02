const mongoose = require('mongoose');
const { getMongoUri, isProduction } = require('./env');

const DEFAULT_MONGO_URI = 'mongodb://mongo:27017/smartQueueDB';

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri() || DEFAULT_MONGO_URI;

    if (isProduction && !process.env.APPOINTMENT_MONGO_URI_PROD && !process.env.MONGO_URI_PROD && !process.env.MONGO_URI) {
      console.warn('APPOINTMENT_MONGO_URI_PROD is not set. Falling back to local/default Mongo URI.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected (appointment-service)');
  } catch (error) {
    console.error('MongoDB connection failed (appointment-service)');
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
