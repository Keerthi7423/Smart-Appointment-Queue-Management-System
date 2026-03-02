const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { isProduction, getAllowedOrigins, getMorganFormat } = require('./config/env');
const paymentRoutes = require('./routes/paymentRoutes');
const { initEventBus } = require('./events/eventBus');
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
    await initEventBus();
    registerSagaListeners();
    console.log('[saga][payment-service] saga listeners registered');
  } catch (error) {
    console.error('[saga][payment-service] event bus initialization failed:', error.message);
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

app.use('/api', paymentRoutes);
app.use('/', paymentRoutes);

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'payment-service',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
