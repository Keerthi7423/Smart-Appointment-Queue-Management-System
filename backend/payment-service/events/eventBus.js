const { createClient } = require('redis');

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
    console.error(`[event-bus][${SERVICE_NAME}] publisher error:`, error.message);
  });

  subscriber.on('error', (error) => {
    console.error(`[event-bus][${SERVICE_NAME}] subscriber error:`, error.message);
  });

  await publisher.connect();
  await subscriber.connect();

  await subscriber.subscribe(CHANNEL, async (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      const eventHandlers = handlers.get(message.event) || [];

      for (const handler of eventHandlers) {
        await handler(message);
      }
    } catch (error) {
      console.error(`[event-bus][${SERVICE_NAME}] message handling failed:`, error.message);
    }
  });

  initialized = true;
  console.log(`[event-bus][${SERVICE_NAME}] listening on channel "${CHANNEL}"`);
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
    event: eventName,
    source: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    payload
  };

  await publisher.publish(CHANNEL, JSON.stringify(message));
  console.log(`[saga][${SERVICE_NAME}] published ${eventName}`, JSON.stringify(payload));
};

module.exports = {
  initEventBus,
  subscribeEvent,
  publishEvent
};
