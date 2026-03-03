const { subscribeEvent } = require('./eventBus');
const { processPayment } = require('../controllers/paymentController');
const { claimEvent, completeEvent, failEvent } = require('../services/eventDeduplicationService');
const logger = require('../observability/logger');

const registerSagaListeners = () => {
  subscribeEvent('appointment.created', async (message) => {
    const eventId = message?.eventId || message?.payload?.eventId || `appointment.created:${message?.payload?.appointmentId || 'unknown'}`;
    const appointmentId = message?.payload?.appointmentId;

    if (!appointmentId) {
      return;
    }

    const claim = await claimEvent({
      eventId,
      eventName: 'appointment.created',
      source: message?.source || null
    });

    if (claim.isDuplicate) {
      logger.info(
        { eventId, eventName: 'appointment.created', existingStatus: claim.existingStatus },
        '[dedupe][payment-service] duplicate event ignored'
      );
      return;
    }

    logger.info({ appointmentId, eventId }, '[saga][payment-service] received appointment.created');

    try {
      await processPayment({
        appointmentId,
        amount: 100,
        triggeredBy: 'event:appointment.created',
        sourceEvent: {
          eventId,
          eventName: 'appointment.created',
          source: message?.source || null,
          payload: message?.payload || {}
        }
      });

      await completeEvent({ eventId });
    } catch (error) {
      await failEvent({
        eventId,
        errorMessage: error.message || 'event processing failed'
      });
      logger.error({ eventId, error: error.message }, '[saga][payment-service] appointment.created handling failed');
      throw error;
    }
  });
};

module.exports = { registerSagaListeners };
