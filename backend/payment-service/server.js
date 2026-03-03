const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { isProduction, getAllowedOrigins, getMorganFormat } = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./observability/logger');
const requestContextMiddleware = require('./middleware/requestContextMiddleware');
const { metricsMiddleware, metricsHandler } = require('./observability/metrics');
const paymentRoutes = require('./routes/paymentRoutes');
const { initEventBus, getEventBusHealth } = require('./events/eventBus');
const { registerSagaListeners } = require('./events/sagaListener');

const runtimeEnv = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, `.env.${runtimeEnv}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

(async () => {
  try {
    await connectDB();
    await initEventBus();
    registerSagaListeners();
    logger.info('[saga][payment-service] saga listeners registered');
  } catch (error) {
    logger.error({ error: error.message }, '[saga][payment-service] event bus initialization failed');
  }
})();

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

app.use('/api', paymentRoutes);
app.use('/', paymentRoutes);

app.get('/health', (req, res) => {
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const mongoStatus = mongoStates[mongoose.connection.readyState] || 'unknown';
  const eventBus = getEventBusHealth();
  const redisConnected = eventBus.publisherConnected && eventBus.subscriberConnected;
  const isOk = mongoose.connection.readyState === 1 && redisConnected;

  return res.status(isOk ? 200 : 503).json({
    status: isOk ? 'ok' : 'degraded',
    service: 'payment-service',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      mongodb: mongoStatus,
      redis: redisConnected ? 'connected' : 'disconnected',
      eventBus
    }
  });
});

app.get('/metrics', metricsHandler);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Payment service running');
});
