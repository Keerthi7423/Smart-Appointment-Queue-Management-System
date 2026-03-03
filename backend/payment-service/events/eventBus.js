const { createClient } = require('redis');
const { randomUUID } = require('crypto');
const logger = require('../observability/logger');
const { runWithRequestContext, getRequestId } = require('../observability/requestContext');

const CHANNEL = process.env.EVENT_BUS_CHANNEL || 'smart-queue-events';
const SERVICE_NAME = process.env.SERVICE_NAME || 'payment-service';

const handlers = new Map();
let publisher;
let subscriber;
let initialized = false;

const initEventBus = async () => {
  if (initialized) {
    return;
  }

  publisher = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
  subscriber = publisher.duplicate();

  publisher.on('error', (error) => {
    logger.error({ error: error.message }, `[event-bus][${SERVICE_NAME}] publisher error`);
  });

  subscriber.on('error', (error) => {
    logger.error({ error: error.message }, `[event-bus][${SERVICE_NAME}] subscriber error`);
  });

  await publisher.connect();
  await subscriber.connect();

  await subscriber.subscribe(CHANNEL, async (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      const eventHandlers = handlers.get(message.event) || [];
      const correlationId = message.correlationId || message?.headers?.['x-request-id'] || message.eventId;

      await runWithRequestContext(correlationId, async () => {
        for (const handler of eventHandlers) {
          await handler(message);
        }
      });
    } catch (error) {
      logger.error({ error: error.message }, `[event-bus][${SERVICE_NAME}] message handling failed`);
    }
  });

  initialized = true;
  logger.info(`[event-bus][${SERVICE_NAME}] listening on channel "${CHANNEL}"`);
};

const subscribeEvent = (eventName, handler) => {
  const eventHandlers = handlers.get(eventName) || [];
  handlers.set(eventName, [...eventHandlers, handler]);
};

const publishEvent = async (eventName, payload) => {
  if (!initialized) {
    throw new Error('Event bus is not initialized');
  }

  const message = {
    eventId: randomUUID(),
    correlationId: getRequestId() || null,
    headers: {
      'x-request-id': getRequestId() || null
    },
    event: eventName,
    source: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    payload
  };

  await publisher.publish(CHANNEL, JSON.stringify(message));
  logger.info({ eventName, eventId: message.eventId, correlationId: message.correlationId }, `[saga][${SERVICE_NAME}] published ${eventName}`);
};

const getEventBusHealth = () => ({
  initialized,
  publisherConnected: Boolean(publisher?.isOpen),
  subscriberConnected: Boolean(subscriber?.isOpen)
});

module.exports = {
  initEventBus,
  subscribeEvent,
  publishEvent,
  getEventBusHealth
};
