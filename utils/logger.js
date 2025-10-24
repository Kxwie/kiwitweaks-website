/**
 * Structured Logging Utility
 * Provides consistent logging across the application
 */

const winston = require('winston');

/**
 * Custom log levels
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

/**
 * Log colors for console output
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

/**
 * Log format
 */
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format (for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * Create transports
 */
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: consoleFormat
  })
);

// File transports (production only)
if (process.env.NODE_ENV === 'production') {
  // Error log
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format
    })
  );

  // Combined log
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format
    })
  );
}

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  defaultMeta: {
    service: 'kiwitweaks-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

/**
 * Helper methods for common log scenarios
 */

/**
 * Log user authentication events
 */
logger.logAuth = (event, userId, email, metadata = {}) => {
  logger.info(`Auth: ${event}`, {
    event,
    userId,
    email,
    ...metadata,
    category: 'auth'
  });
};

/**
 * Log payment events
 */
logger.logPayment = (event, userId, amount, metadata = {}) => {
  logger.info(`Payment: ${event}`, {
    event,
    userId,
    amount,
    ...metadata,
    category: 'payment'
  });
};

/**
 * Log security events
 */
logger.logSecurity = (event, severity, metadata = {}) => {
  const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  logger[logLevel](`Security: ${event}`, {
    event,
    severity,
    ...metadata,
    category: 'security'
  });
};

/**
 * Log database operations
 */
logger.logDatabase = (operation, collection, metadata = {}) => {
  logger.debug(`DB: ${operation} on ${collection}`, {
    operation,
    collection,
    ...metadata,
    category: 'database'
  });
};

/**
 * Log API requests
 */
logger.logRequest = (method, path, statusCode, duration, metadata = {}) => {
  logger.http(`${method} ${path} ${statusCode} - ${duration}ms`, {
    method,
    path,
    statusCode,
    duration,
    ...metadata,
    category: 'request'
  });
};

module.exports = logger;
