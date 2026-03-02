const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const parseCsv = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getAllowedOrigins = () => parseCsv(process.env.CORS_ALLOWED_ORIGINS);

const getMorganFormat = () => {
  const level = (process.env.LOG_LEVEL || '').toLowerCase();

  if (isDevelopment || level === 'debug') {
    return 'dev';
  }

  if (level === 'off' || level === 'error' || level === 'warn') {
    return null;
  }

  return 'tiny';
};

module.exports = {
  isProduction,
  getAllowedOrigins,
  getMorganFormat
};
