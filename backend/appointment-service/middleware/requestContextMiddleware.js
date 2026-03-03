const { randomUUID } = require('crypto');
const { runWithRequestContext } = require('../observability/requestContext');

const requestContextMiddleware = (req, res, next) => {
  const headerRequestId = req.get('x-request-id');
  const requestId = headerRequestId && headerRequestId.trim() ? headerRequestId.trim() : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  runWithRequestContext(requestId, () => next());
};

module.exports = requestContextMiddleware;
