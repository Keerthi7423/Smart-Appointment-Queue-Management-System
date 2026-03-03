const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { isProduction, getAllowedOrigins, getMorganFormat } = require('./config/env');
const logger = require('./observability/logger');
const requestContextMiddleware = require('./middleware/requestContextMiddleware');
const { metricsMiddleware, metricsHandler } = require('./observability/metrics');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const runtimeEnv = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, `.env.${runtimeEnv}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

connectDB();

const app = express();

const allowedOrigins = getAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      return callback(isProduction ? new Error('CORS origin denied') : null, !isProduction);
    }

    const isAllowed = allowedOrigins.includes(origin);
    return callback(isAllowed ? null : new Error('CORS origin denied'), isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(requestContextMiddleware);

const morganFormat = getMorganFormat();
if (morganFormat) {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt
        },
        'http.request'
      );
    });
    next();
  });
}

app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Auth service working' });
});

app.get('/health', (req, res) => {
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const mongoStatus = mongoStates[mongoose.connection.readyState] || 'unknown';
  const status = mongoose.connection.readyState === 1 ? 'ok' : 'degraded';
  const httpStatus = status === 'ok' ? 200 : 503;

  return res.status(httpStatus).json({
    status,
    service: 'auth-service',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      mongodb: mongoStatus,
      redis: 'not_configured'
    }
  });
});

app.get('/metrics', metricsHandler);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Auth service running');
});
