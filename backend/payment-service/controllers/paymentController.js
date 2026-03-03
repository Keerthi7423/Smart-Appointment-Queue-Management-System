const { publishEvent } = require('../events/eventBus');
const { executeWithIdempotency } = require('../services/idempotencyService');
const { retryWithExponentialBackoff } = require('../services/retryService');
const { simulatePaymentGateway } = require('../services/paymentSimulationService');
const { recordFailedEvent } = require('../services/failedEventService');
const logger = require('../observability/logger');
const { incrementFailedPayments, incrementRetryAttempts } = require('../observability/metrics');

const processPayment = async ({
  appointmentId,
  amount,
  triggeredBy = 'manual',
  sourceEvent = null
}) => {
  logger.info({ appointmentId, source: triggeredBy }, '[saga][payment-service] step=payment.processing');

  try {
    await retryWithExponentialBackoff(
      async (attempt) => {
        const isSuccess = await simulatePaymentGateway();
        if (!isSuccess) {
          const failure = new Error('mock_gateway_rejection');
          failure.attempt = attempt;
          throw failure;
        }
      },
      {
        maxAttempts: 3,
        baseDelayMs: 200,
        onRetry: async ({ attempt, maxAttempts, delayMs, error }) => {
          incrementRetryAttempts();
          logger.warn(
            { appointmentId, source: triggeredBy, attempt, maxAttempts, reason: error.message, nextDelayMs: delayMs },
            '[retry][payment-service] payment simulation retry'
          );
        }
      }
    );

    await publishEvent('payment.success', {
      appointmentId,
      amount,
      status: 'success',
      processedAt: new Date().toISOString()
    });

    logger.info({ appointmentId }, '[saga][payment-service] step=payment.success');
    return { event: 'payment.success', status: 'success' };
  } catch (error) {
    incrementFailedPayments();
    await publishEvent('payment.failed', {
      appointmentId,
      amount,
      status: 'failed',
      reason: error.message || 'mock_gateway_rejection',
      processedAt: new Date().toISOString()
    });

    if (sourceEvent?.eventId && sourceEvent?.eventName) {
      await recordFailedEvent({
        eventId: sourceEvent.eventId,
        eventName: sourceEvent.eventName,
        source: sourceEvent.source,
        payload: sourceEvent.payload || {},
        errorMessage: error.message || 'payment processing failed',
        attempts: error.attempts || 3
      });
      logger.error(
        { eventId: sourceEvent.eventId, eventName: sourceEvent.eventName, attempts: error.attempts || 3 },
        '[dead-letter][payment-service] stored failed event'
      );
    }

    logger.warn({ appointmentId, reason: error.message }, '[saga][payment-service] step=payment.failed');
    return { event: 'payment.failed', status: 'failed' };
  }
};

const pay = async (req, res) => {
  try {
    const { appointmentId, amount = 100 } = req.body;
    const idempotencyKey = req.get('Idempotency-Key');

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required' });
    }

    if (idempotencyKey) {
      logger.info({ idempotencyKey, appointmentId }, '[idempotency][payment-service] key.received');
    } else {
      logger.info({ appointmentId }, '[idempotency][payment-service] key.missing');
    }

    const result = await executeWithIdempotency({
      key: idempotencyKey,
      requestPayload: { appointmentId, amount },
      action: async () => {
        const processed = await processPayment({ appointmentId, amount, triggeredBy: 'api:/pay' });
        return {
          statusCode: 200,
          body: {
            success: true,
            data: {
              appointmentId,
              amount,
              status: processed.status,
              emittedEvent: processed.event
            }
          }
        };
      }
    });

    if (result.replayed) {
      logger.info({ idempotencyKey, appointmentId }, '[idempotency][payment-service] replay.hit');
    } else if (idempotencyKey) {
      logger.info({ idempotencyKey, appointmentId }, '[idempotency][payment-service] key.stored');
    }

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error({ error: error.message, statusCode }, 'payment API request failed');
    return res.status(statusCode).json({ message: error.message || 'Payment processing failed' });
  }
};

module.exports = {
  pay,
  processPayment
};
