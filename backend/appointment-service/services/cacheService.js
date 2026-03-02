const { redisClient, isRedisAvailable } = require('../config/redis');

const CACHE_TTL_SECONDS = 60;

const CACHE_KEYS = {
  ADMIN_DASHBOARD_TODAY: 'admin:dashboard:today',
  APPOINTMENTS_TODAY: 'appointments:today'
};

const getCache = async (key) => {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    console.error(`Cache read failed for key "${key}":`, error.message);
    return null;
  }
};

const setCache = async (key, data, ttlInSeconds = CACHE_TTL_SECONDS) => {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    await redisClient.setEx(key, ttlInSeconds, JSON.stringify(data));
  } catch (error) {
    console.error(`Cache write failed for key "${key}":`, error.message);
  }
};

const deleteCacheKeys = async (keys) => {
  if (!isRedisAvailable()) {
    return;
  }

  const validKeys = Array.isArray(keys) ? keys.filter(Boolean) : [];
  if (!validKeys.length) {
    return;
  }

  try {
    await redisClient.del(validKeys);
  } catch (error) {
    console.error('Cache invalidation failed:', error.message);
  }
};

const invalidateAppointmentCache = async () => {
  await deleteCacheKeys([CACHE_KEYS.ADMIN_DASHBOARD_TODAY, CACHE_KEYS.APPOINTMENTS_TODAY]);
};

module.exports = {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
  getCache,
  setCache,
  deleteCacheKeys,
  invalidateAppointmentCache
};
