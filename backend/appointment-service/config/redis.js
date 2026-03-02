const { createClient } = require('redis');

const DEFAULT_REDIS_URL = 'redis://redis:6379';
const redisUrl = process.env.REDIS_URL || DEFAULT_REDIS_URL;

const redisClient = createClient({
  url: redisUrl
});

let redisAvailable = false;

redisClient.on('ready', () => {
  redisAvailable = true;
  console.log('Redis connected (appointment-service)');
});

redisClient.on('error', (error) => {
  redisAvailable = false;
  console.error('Redis error (appointment-service):', error.message);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    redisAvailable = false;
    console.error('Redis connection failed. Falling back to MongoDB:', error.message);
  }
};

const isRedisAvailable = () => redisAvailable && redisClient.isOpen;

module.exports = {
  redisClient,
  connectRedis,
  isRedisAvailable
};
