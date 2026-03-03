const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithExponentialBackoff = async (fn, options = {}) => {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 200;
  const onRetry = options.onRetry || (() => {});

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await fn(attempt);
      return { result, attempt };
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) {
        break;
      }

      const delayMs = baseDelayMs * (2 ** (attempt - 1));
      await onRetry({ attempt, maxAttempts, delayMs, error });
      await wait(delayMs);
    }
  }

  lastError.attempts = maxAttempts;
  throw lastError;
};

module.exports = {
  retryWithExponentialBackoff
};
