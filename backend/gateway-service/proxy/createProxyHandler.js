const http = require('node:http');
const https = require('node:https');

function getForwardedForHeader(req) {
  const existing = req.headers['x-forwarded-for'];
  const sourceIp = req.ip || req.socket.remoteAddress;

  if (!existing) {
    return sourceIp;
  }

  return `${existing}, ${sourceIp}`;
}

function splitUrl(url) {
  const queryStart = url.indexOf('?');

  if (queryStart === -1) {
    return { pathname: url, search: '' };
  }

  return {
    pathname: url.slice(0, queryStart),
    search: url.slice(queryStart)
  };
}

function createProxyHandler(routeDefinition) {
  const targetBaseUrl = new URL(routeDefinition.target);
  const transport = targetBaseUrl.protocol === 'https:' ? https : http;

  return (req, res) => {
    const { pathname, search } = splitUrl(req.originalUrl);
    const rewrittenPath = routeDefinition.rewritePath
      ? routeDefinition.rewritePath(pathname)
      : pathname;
    const upstreamUrl = new URL(`${rewrittenPath}${search}`, targetBaseUrl);

    const headers = {
      ...req.headers,
      host: targetBaseUrl.host,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': req.protocol,
      'x-forwarded-for': getForwardedForHeader(req)
    };

    const proxyRequest = transport.request(
      upstreamUrl,
      {
        method: req.method,
        headers
      },
      (proxyResponse) => {
        res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
        proxyResponse.pipe(res);
      }
    );

    proxyRequest.on('error', (error) => {
      if (res.headersSent) {
        return res.end();
      }

      return res.status(502).json({
        message: 'Upstream service unavailable',
        details: error.message,
        target: targetBaseUrl.origin
      });
    });

    req.on('aborted', () => {
      proxyRequest.destroy();
    });

    req.pipe(proxyRequest);
  };
}

module.exports = {
  createProxyHandler
};
