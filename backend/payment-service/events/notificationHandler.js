const { subscribeEvent } = require('./eventBus');
const logger = require('../observability/logger');

const handleAppointmentCreatedNotification = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  const userId = message?.payload?.userId;

  logger.info(
    { appointmentId, userId, eventId: message?.eventId },
    '[notification][payment-service] appointment.created received -> notification simulated'
  );
};

const handlePaymentResultNotification = async (message) => {
  const appointmentId = message?.payload?.appointmentId;
  logger.info(
    { appointmentId, status: message?.event, eventId: message?.eventId },
    '[notification][payment-service] payment event received -> notification simulated'
  );
};

const registerNotificationListeners = () => {
  subscribeEvent('appointment.created', handleAppointmentCreatedNotification);
  subscribeEvent('payment.success', handlePaymentResultNotification);
  subscribeEvent('payment.failed', handlePaymentResultNotification);
};

module.exports = { registerNotificationListeners };
