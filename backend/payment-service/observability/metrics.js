const logger = require('./logger');

const service = process.env.SERVICE_NAME || 'payment-service';

let client = null;
let register = null;
let httpRequestsTotal = null;
let failedPaymentsTotal = null;
let retryAttemptsTotal = null;

try {
  client = require('prom-client');
  register = new client.Registry();
  client.collectDefaultMetrics({ register });

  httpRequestsTotal = new client.Counter({
    name: 'smart_queue_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['service', 'method', 'route', 'status'],
    registers: [register]
  });

  failedPaymentsTotal = new client.Counter({
    name: 'smart_queue_failed_payments_total',
    help: 'Total failed payments',
    labelNames: ['service'],
    registers: [register]
  });

  retryAttemptsTotal = new client.Counter({
    name: 'smart_queue_payment_retry_attempts_total',
    help: 'Total retry attempts in payment processing',
    labelNames: ['service'],
    registers: [register]
  });
} catch (error) {
  logger.warn({ error: error.message }, 'metrics initialization failed; running with no-op metrics');
}

const safeIncrement = (counter, labels) => {
  if (!counter) {
    return;
  }

  try {
    counter.inc(labels);
  } catch (error) {
    logger.warn({ error: error.message }, 'metrics increment failed');
  }
};

const metricsMiddleware = (req, res, next) => {
  res.on('finish', () => {
    safeIncrement(httpRequestsTotal, {
      service,
      method: req.method,
      route: req.route?.path || req.path || 'unknown',
      status: String(res.statusCode)
    });
  });

  next();
};

const incrementFailedPayments = () => {
  safeIncrement(failedPaymentsTotal, { service });
};

const incrementRetryAttempts = () => {
  safeIncrement(retryAttemptsTotal, { service });
};

const metricsHandler = async (req, res) => {
  if (!register) {
    return res.status(200).type('text/plain').send('# metrics disabled\n');
  }

  try {
    res.set('Content-Type', register.contentType);
    return res.status(200).send(await register.metrics());
  } catch (error) {
    logger.error({ error: error.message }, 'metrics endpoint failed');
    return res.status(503).type('text/plain').send('# metrics unavailable\n');
  }
};

module.exports = {
  metricsMiddleware,
  metricsHandler,
  incrementFailedPayments,
  incrementRetryAttempts
};
