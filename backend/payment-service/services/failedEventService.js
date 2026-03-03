const FailedEvent = require('../models/FailedEvent');

const recordFailedEvent = async ({ eventId, eventName, source, payload, errorMessage, attempts }) => {
  await FailedEvent.create({
    eventId,
    eventName,
    source,
    payload,
    errorMessage,
    attempts,
    failedAt: new Date()
  });
};

module.exports = {
  recordFailedEvent
};
