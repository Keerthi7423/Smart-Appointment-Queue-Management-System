const ProcessedEvent = require('../models/ProcessedEvent');

const claimEvent = async ({ eventId, eventName, source }) => {
  try {
    await ProcessedEvent.create({
      eventId,
      eventName,
      source,
      status: 'processing'
    });

    return { isDuplicate: false };
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const existing = await ProcessedEvent.findOne({ eventId });
    return { isDuplicate: true, existingStatus: existing?.status || 'processed' };
  }
};

const completeEvent = async ({ eventId }) => {
  await ProcessedEvent.updateOne(
    { eventId },
    {
      $set: {
        status: 'processed',
        processedAt: new Date(),
        lastError: null
      }
    }
  );
};

const failEvent = async ({ eventId, errorMessage }) => {
  await ProcessedEvent.updateOne(
    { eventId },
    {
      $set: {
        status: 'failed',
        processedAt: new Date(),
        lastError: errorMessage
      }
    }
  );
};

module.exports = {
  claimEvent,
  completeEvent,
  failEvent
};
