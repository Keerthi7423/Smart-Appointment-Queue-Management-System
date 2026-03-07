const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { serviceRouteDefinitions } = require('./config/routes');
const { createRateLimiter, MAX_REQUESTS, WINDOW_MS } = require('./middleware/rateLimit');
const { createProxyHandler } = require('./proxy/createProxyHandler');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.set('trust proxy', true);

app.use(morgan('combined'));
app.use(createRateLimiter({
  maxRequests: MAX_REQUESTS,
  windowMs: WINDOW_MS
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway-service',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    downstreamServices: {
      auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
      appointments: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5002',
      payments: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5003'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Gateway service running',
    routes: serviceRouteDefinitions.map(({ mountPath, target }) => ({
      mountPath,
      target
    }))
  });
});

for (const routeDefinition of serviceRouteDefinitions) {
  app.use(routeDefinition.mountPath, createProxyHandler(routeDefinition));
}

app.use((req, res) => {
  res.status(404).json({
    message: 'Gateway route not found'
  });
});

app.listen(port, () => {
  console.log(`gateway-service listening on port ${port}`);
});
