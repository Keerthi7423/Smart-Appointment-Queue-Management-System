const serviceRouteDefinitions = [
  {
    mountPath: '/api/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001'
  },
  {
    mountPath: '/api/profile',
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001'
  },
  {
    mountPath: '/api/appointments',
    target: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5002'
  },
  {
    mountPath: '/api/admin',
    target: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5002'
  },
  {
    mountPath: '/api/payments',
    target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5003',
    rewritePath: (pathname) => pathname.replace(/^\/api\/payments/, '/api/pay')
  },
  {
    mountPath: '/api/pay',
    target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5003'
  }
];

module.exports = {
  serviceRouteDefinitions
};
