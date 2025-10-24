/**
 * Centralized Error Handling Middleware
 * Catches all errors and formats consistent responses
 */

const logger = require('../utils/logger');

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.id = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  // Default to 500 server error
  let error = err;
  
  if (!(err instanceof AppError)) {
    error = new AppError(
      err.message || 'Internal server error',
      err.statusCode || 500,
      false
    );
  }

  // Log error
  const errorLog = {
    id: error.id,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
    body: req.body,
    query: req.query
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  }

  // Send error response
  const response = {
    success: false,
    error: error.message,
    ref: error.id // For support tickets
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = errorLog;
  }

  res.status(error.statusCode).json(response);
}

/**
 * Async error wrapper - catches async errors automatically
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found Handler (404)
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.url} not found`));
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  
  // Middleware
  errorHandler,
  asyncHandler,
  notFoundHandler
};
