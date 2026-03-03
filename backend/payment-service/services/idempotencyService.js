const crypto = require('crypto');
const IdempotencyKey = require('../models/IdempotencyKey');

const getRequestHash = (payload) => crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
const PROCESSING_STATUS_CODE = 102;

const executeWithIdempotency = async ({ key, requestPayload, action }) => {
  if (!key) {
    return action();
  }

  const requestHash = getRequestHash(requestPayload);
  let isOwner = false;

  try {
    await IdempotencyKey.create({
      key,
      requestHash,
      statusCode: PROCESSING_STATUS_CODE,
      responseBody: { state: 'processing' }
    });
    isOwner = true;
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }

  if (!isOwner) {
    const existing = await IdempotencyKey.findOne({ key });

    if (!existing) {
      const retryError = new Error('Idempotency state unavailable, retry request');
      retryError.statusCode = 409;
      throw retryError;
    }

    if (existing.requestHash !== requestHash) {
      const conflictError = new Error('Idempotency key reused with different payload');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    if (existing.statusCode === PROCESSING_STATUS_CODE) {
      const inProgressError = new Error('Request with this idempotency key is already processing');
      inProgressError.statusCode = 409;
      throw inProgressError;
    }

    return {
      statusCode: existing.statusCode,
      body: existing.responseBody,
      replayed: true
    };
  }

  let result;
  try {
    result = await action();
  } catch (error) {
    await IdempotencyKey.deleteOne({ key });
    throw error;
  }

  try {
    await IdempotencyKey.updateOne(
      { key },
      {
        $set: {
          statusCode: result.statusCode,
          responseBody: result.body
        }
      }
    );
  } catch (updateError) {
    await IdempotencyKey.deleteOne({ key });
    throw updateError;
  }

  return {
    ...result,
    replayed: false
  };
};

module.exports = {
  executeWithIdempotency
};
