const Appointment = require('../models/Appointment');
const { invalidateAppointmentCache } = require('../services/cacheService');
const { subscribeEvent } = require('./eventBus');
const logger = require('../observability/logger');
const { incrementCancelledAppointments } = require('../observability/metrics');

const handlePaymentFailed = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  const reason = message?.payload?.reason || 'payment_failed';

  if (!appointmentId) {
    return;
  }

  logger.info({ appointmentId }, '[saga][appointment-service] received payment.failed');

  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: 'cancelled' },
    { new: true }
  );

  if (!updated) {
    logger.warn({ appointmentId }, '[saga][appointment-service] compensation skipped, appointment not found');
    return;
  }

  await invalidateAppointmentCache();
  incrementCancelledAppointments();
  logger.info(
    { appointmentId, reason },
    '[saga][appointment-service] compensation triggered and completed (appointment cancelled)'
  );
};

const handlePaymentSuccess = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  if (!appointmentId) {
    return;
  }

  logger.info({ appointmentId }, '[saga][appointment-service] received payment.success');
};

const registerSagaListeners = () => {
  subscribeEvent('payment.failed', handlePaymentFailed);
  subscribeEvent('payment.success', handlePaymentSuccess);
};

module.exports = { registerSagaListeners };
