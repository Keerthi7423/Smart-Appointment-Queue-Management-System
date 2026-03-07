const amqp = require('amqplib');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withHandlerRetries = async (handler, message, options, logger, serviceName) => {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 250;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await handler(message, attempt);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delayMs = baseDelayMs * (2 ** (attempt - 1));
        logger.warn(
          {
            event: message?.event,
            eventId: message?.eventId,
            attempt,
            maxAttempts,
            delayMs,
            reason: error.message
          },
          `[messaging][${serviceName}] handler failed, retrying`
        );
        await wait(delayMs);
      }
    }
  }

  throw lastError;
};

const createConsumer = async ({
  serviceName,
  url,
  exchange,
  queueName,
  logger,
  routingPatterns = ['#'],
  maxHandlerAttempts = 3,
  retryBaseDelayMs = 250
}) => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const deadLetterExchange = `${exchange}.dlx`;
  const deadLetterQueue = `${queueName}.dlq`;

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertExchange(deadLetterExchange, 'topic', { durable: true });
  await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': deadLetterExchange
    }
  });
  await channel.assertQueue(deadLetterQueue, { durable: true });
  await channel.bindQueue(deadLetterQueue, deadLetterExchange, '#');

  for (const pattern of routingPatterns) {
    await channel.bindQueue(queueName, exchange, pattern);
  }

  const start = async (handler) => {
    await channel.consume(queueName, async (rawMessage) => {
      if (!rawMessage) {
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(rawMessage.content.toString());
      } catch (error) {
        logger.error(
          { reason: error.message },
          `[messaging][${serviceName}] invalid JSON message dropped`
        );
        channel.ack(rawMessage);
        return;
      }

      try {
        await withHandlerRetries(
          handler,
          parsed,
          { maxAttempts: maxHandlerAttempts, baseDelayMs: retryBaseDelayMs },
          logger,
          serviceName
        );
        channel.ack(rawMessage);
      } catch (error) {
        logger.error(
          {
            event: parsed?.event,
            eventId: parsed?.eventId,
            reason: error.message
          },
          `[messaging][${serviceName}] retries exhausted, sent to DLQ`
        );
        channel.nack(rawMessage, false, false);
      }
    }, { noAck: false });

    logger.info(
      { queueName, routingPatterns, deadLetterQueue },
      `[messaging][${serviceName}] consumer started`
    );
  };

  const close = async () => {
    await channel.close();
    await connection.close();
  };

  return { connection, channel, start, close, queueName, deadLetterQueue };
};

module.exports = { createConsumer };
