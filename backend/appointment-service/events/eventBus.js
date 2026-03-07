const { randomUUID } = require('crypto');
const logger = require('../observability/logger');
const { runWithRequestContext, getRequestId } = require('../observability/requestContext');
const { createPublisher } = require('./messaging/publisher');
const { createConsumer } = require('./messaging/consumer');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const EXCHANGE = process.env.EVENT_BUS_EXCHANGE || 'smart.queue.events';
const SERVICE_NAME = process.env.SERVICE_NAME || 'appointment-service';
const QUEUE_NAME = process.env.EVENT_BUS_QUEUE || `${SERVICE_NAME}.events`;

const handlers = new Map();
let publisher;
let consumer;
let initialized = false;

const initEventBus = async () => {
  if (initialized) {
    return;
  }

  publisher = await createPublisher({
    serviceName: SERVICE_NAME,
    url: RABBITMQ_URL,
    exchange: EXCHANGE,
    logger
  });
  consumer = await createConsumer({
    serviceName: SERVICE_NAME,
    url: RABBITMQ_URL,
    exchange: EXCHANGE,
    queueName: QUEUE_NAME,
    logger
  });

  await consumer.start(async (message) => {
    const eventHandlers = handlers.get(message.event) || [];
    if (eventHandlers.length === 0) {
      return;
    }

    const correlationId = message.correlationId || message?.headers?.['x-request-id'] || message.eventId;

    await runWithRequestContext(correlationId, async () => {
      for (const handler of eventHandlers) {
        await handler(message);
      }
    });
  });

  initialized = true;
  logger.info(
    { exchange: EXCHANGE, queue: QUEUE_NAME },
    `[event-bus][${SERVICE_NAME}] initialized with RabbitMQ`
  );
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

  await publisher.publish(eventName, message);
  logger.info({ eventName, eventId: message.eventId, correlationId: message.correlationId }, `[saga][${SERVICE_NAME}] published ${eventName}`);
};

const getEventBusHealth = () => ({
  initialized,
  transport: 'rabbitmq',
  exchange: EXCHANGE,
  queue: QUEUE_NAME,
  publisherConnected: Boolean(publisher?.connection),
  consumerConnected: Boolean(consumer?.connection)
});

module.exports = {
  initEventBus,
  subscribeEvent,
  publishEvent,
  getEventBusHealth
};
