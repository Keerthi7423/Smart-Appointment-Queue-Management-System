const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function createRateLimiter({
  windowMs = WINDOW_MS,
  maxRequests = MAX_REQUESTS
} = {}) {
  const requestCounts = new Map();

  setInterval(() => {
    const now = Date.now();

    for (const [key, value] of requestCounts.entries()) {
      if (value.resetAt <= now) {
        requestCounts.delete(key);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || entry.resetAt <= now) {
      requestCounts.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    entry.count += 1;
    const remaining = Math.max(maxRequests - entry.count, 0);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        message: 'Rate limit exceeded. Try again later.'
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
  WINDOW_MS,
  MAX_REQUESTS
};
