const { getRequestId } = require('./requestContext');

const service = process.env.SERVICE_NAME || 'auth-service';

let pinoLogger = null;
try {
  const pino = require('pino');
  pinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service },
    mixin() {
      const requestId = getRequestId();
      return requestId ? { requestId } : {};
    }
  });
} catch (error) {
  pinoLogger = null;
}

const fallbackWrite = (level, arg1, arg2) => {
  try {
    const entry = {
      service,
      timestamp: new Date().toISOString(),
      level,
      requestId: getRequestId() || undefined
    };

    if (typeof arg1 === 'string') {
      entry.message = arg1;
      if (arg2 && typeof arg2 === 'object') {
        Object.assign(entry, arg2);
      }
    } else if (arg1 && typeof arg1 === 'object') {
      Object.assign(entry, arg1);
      if (typeof arg2 === 'string') {
        entry.message = arg2;
      }
    }

    process.stdout.write(`${JSON.stringify(entry)}\n`);
  } catch (_) {
    // Never crash the app for logging errors.
  }
};

const logWithLevel = (level, arg1, arg2) => {
  try {
    if (pinoLogger && typeof pinoLogger[level] === 'function') {
      if (arg2 !== undefined) {
        pinoLogger[level](arg1, arg2);
      } else {
        pinoLogger[level](arg1);
      }
      return;
    }
  } catch (_) {
    // Fall through to safe fallback.
  }

  fallbackWrite(level, arg1, arg2);
};

module.exports = {
  info: (arg1, arg2) => logWithLevel('info', arg1, arg2),
  warn: (arg1, arg2) => logWithLevel('warn', arg1, arg2),
  error: (arg1, arg2) => logWithLevel('error', arg1, arg2),
  debug: (arg1, arg2) => logWithLevel('debug', arg1, arg2)
};
