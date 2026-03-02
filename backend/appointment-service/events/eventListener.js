const Appointment = require('../models/Appointment');
const { invalidateAppointmentCache } = require('../services/cacheService');
const { subscribeEvent } = require('./eventBus');

const handlePaymentFailed = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  const reason = message?.payload?.reason || 'payment_failed';

  if (!appointmentId) {
    return;
  }

  console.log(`[saga][appointment-service] received payment.failed for appointment ${appointmentId}`);

  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: 'cancelled' },
    { new: true }
  );

  if (!updated) {
    console.warn(`[saga][appointment-service] compensation skipped, appointment not found: ${appointmentId}`);
    return;
  }

  await invalidateAppointmentCache();
  console.log(`[saga][appointment-service] compensation completed, marked cancelled: ${appointmentId} reason=${reason}`);
};

const handlePaymentSuccess = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  if (!appointmentId) {
    return;
  }

  console.log(`[saga][appointment-service] received payment.success for appointment ${appointmentId}`);
};

const registerSagaListeners = () => {
  subscribeEvent('payment.failed', handlePaymentFailed);
  subscribeEvent('payment.success', handlePaymentSuccess);
};

module.exports = { registerSagaListeners };
