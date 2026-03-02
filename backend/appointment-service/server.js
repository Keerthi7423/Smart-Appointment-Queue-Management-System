const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { connectRedis, redisClient, isRedisAvailable } = require('./config/redis');
const { isProduction, getAllowedOrigins, getMorganFormat } = require('./config/env');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const { initEventBus } = require('./events/eventBus');
const { registerSagaListeners } = require('./events/eventListener');

const runtimeEnv = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, `.env.${runtimeEnv}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

connectDB();
connectRedis();

(async () => {
  try {
    await initEventBus();
    registerSagaListeners();
    console.log('[saga][appointment-service] saga listeners registered');
  } catch (error) {
    console.error('[saga][appointment-service] event bus initialization failed:', error.message);
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

const morganFormat = getMorganFormat();
if (morganFormat) {
  app.use(morgan(morganFormat));
}

app.use(express.json());

app.use('/api', appointmentRoutes);
app.use('/api', adminRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Appointment service working' });
});

app.get('/health', (req, res) => {
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return res.status(200).json({
    status: 'ok',
    service: 'appointment-service',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      mongodb: mongoStates[mongoose.connection.readyState] || 'unknown',
      redis: isRedisAvailable() ? 'connected' : (redisClient.isOpen ? 'connecting' : 'disconnected')
    }
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`);
});
