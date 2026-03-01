const mongoose = require("mongoose");
const { getMongoUri, isProduction } = require("./env");

const DEFAULT_MONGO_URI = "mongodb://mongo:27017/smartQueueDB";

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri() || DEFAULT_MONGO_URI;

    if (isProduction && !process.env.MONGO_URI_PROD && !process.env.MONGO_URI) {
      console.warn("MONGO_URI_PROD is not set. Falling back to local/default Mongo URI.");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
