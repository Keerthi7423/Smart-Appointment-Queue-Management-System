const amqp = require('amqplib');

const createPublisher = async ({
  serviceName,
  url,
  exchange,
  logger
}) => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange, 'topic', { durable: true });

  const publish = async (routingKey, message) => {
    const content = Buffer.from(JSON.stringify(message));
    channel.publish(exchange, routingKey, content, {
      persistent: true,
      contentType: 'application/json'
    });

    logger.info(
      { routingKey, eventId: message.eventId, correlationId: message.correlationId },
      `[messaging][${serviceName}] event published`
    );
  };

  const close = async () => {
    await channel.close();
    await connection.close();
  };

  return { connection, channel, publish, close };
};

module.exports = { createPublisher };
