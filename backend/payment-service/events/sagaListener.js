const { subscribeEvent } = require('./eventBus');
const { processPayment } = require('../controllers/paymentController');

const registerSagaListeners = () => {
  subscribeEvent('appointment.created', async (message) => {
    const appointmentId = message?.payload?.appointmentId;

    if (!appointmentId) {
      return;
    }

    console.log(`[saga][payment-service] received appointment.created for appointment ${appointmentId}`);

    await processPayment({
      appointmentId,
      amount: 100,
      triggeredBy: 'event:appointment.created'
    });
  });
};

module.exports = { registerSagaListeners };
