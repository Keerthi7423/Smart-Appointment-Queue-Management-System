const { createClient } = require('redis');
const logger = require('../observability/logger');

const DEFAULT_REDIS_URL = 'redis://redis:6379';
const redisUrl = process.env.REDIS_URL || DEFAULT_REDIS_URL;

const redisClient = createClient({
  url: redisUrl
});

let redisAvailable = false;

redisClient.on('ready', () => {
  redisAvailable = true;
  logger.info('Redis connected (appointment-service)');
});

redisClient.on('error', (error) => {
  redisAvailable = false;
  logger.error({ error: error.message }, 'Redis error (appointment-service)');
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    redisAvailable = false;
    logger.error({ error: error.message }, 'Redis connection failed. Falling back to MongoDB');
  }
};

const isRedisAvailable = () => redisAvailable && redisClient.isOpen;

module.exports = {
  redisClient,
  connectRedis,
  isRedisAvailable
};
