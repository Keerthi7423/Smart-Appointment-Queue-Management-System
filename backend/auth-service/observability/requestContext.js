const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

const runWithRequestContext = (requestId, callback) => storage.run({ requestId }, callback);

const getRequestId = () => storage.getStore()?.requestId || null;

module.exports = {
  runWithRequestContext,
  getRequestId
};
