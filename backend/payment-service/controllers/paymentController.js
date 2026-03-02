const { publishEvent } = require('../events/eventBus');

const processPayment = async ({ appointmentId, amount, triggeredBy = 'manual' }) => {
  console.log(`[saga][payment-service] step=payment.processing appointmentId=${appointmentId} source=${triggeredBy}`);

  const isSuccess = Math.random() >= 0.5;

  if (isSuccess) {
    await publishEvent('payment.success', {
      appointmentId,
      amount,
      status: 'success',
      processedAt: new Date().toISOString()
    });

    console.log(`[saga][payment-service] step=payment.success appointmentId=${appointmentId}`);
    return { event: 'payment.success', status: 'success' };
  }

  await publishEvent('payment.failed', {
    appointmentId,
    amount,
    status: 'failed',
    reason: 'mock_gateway_rejection',
    processedAt: new Date().toISOString()
  });

  console.log(`[saga][payment-service] step=payment.failed appointmentId=${appointmentId}`);
  return { event: 'payment.failed', status: 'failed' };
};

const pay = async (req, res) => {
  try {
    const { appointmentId, amount = 100 } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required' });
    }

    const result = await processPayment({ appointmentId, amount, triggeredBy: 'api:/pay' });

    return res.status(200).json({
      success: true,
      data: {
        appointmentId,
        amount,
        status: result.status,
        emittedEvent: result.event
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Payment processing failed' });
  }
};

module.exports = {
  pay,
  processPayment
};
