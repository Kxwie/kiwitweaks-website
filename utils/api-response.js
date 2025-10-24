/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all endpoints
 * 
 * @module utils/api-response
 */

const logger = require('./logger');
const crypto = require('crypto');

/**
 * Standard success response structure
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success
 * @property {string} [message] - User-friendly success message
 * @property {*} data - Response-specific data
 * @property {Object} [meta] - Optional metadata (pagination, timestamps, etc.)
 */

/**
 * Standard error response structure
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {Object} error - Error details
 * @property {string} error.code - Machine-readable error code
 * @property {string} error.message - User-friendly error message
 * @property {Array} [error.details] - Validation error details
 * @property {string} ref - Error reference ID for support
 */

/**
 * Generate unique error reference ID
 * @returns {string} Error reference (e.g., ERR_20250124_183000_A1B2)
 */
function generateErrorRef() {
    const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .slice(0, 15);
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `ERR_${timestamp}_${random}`;
}

/**
 * Send standardized success response
 * 
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} [options.statusCode=200] - HTTP status code
 * @param {string} [options.message] - Success message
 * @param {*} options.data - Response data
 * @param {Object} [options.meta] - Optional metadata
 * @returns {Object} Express response
 * 
 * @example
 * sendSuccess(res, {
 *   message: 'User created successfully',
 *   data: { id: '123', email: 'user@example.com' }
 * });
 */
function sendSuccess(res, { statusCode = 200, message, data, meta } = {}) {
    const response = {
        success: true
    };
    
    if (message) {
        response.message = message;
    }
    
    response.data = data;
    
    if (meta) {
        response.meta = meta;
    }
    
    return res.status(statusCode).json(response);
}

/**
 * Send standardized error response
 * 
 * @param {Object} res - Express response object
 * @param {Object} options - Error options
 * @param {number} [options.statusCode=500] - HTTP status code
 * @param {string} options.code - Error code
 * @param {string} options.message - Error message
 * @param {Array} [options.details] - Validation details
 * @param {string} [options.ref] - Custom error reference
 * @returns {Object} Express response
 * 
 * @example
 * sendError(res, {
 *   statusCode: 400,
 *   code: 'VALIDATION_ERROR',
 *   message: 'Invalid input',
 *   details: [{ field: 'email', message: 'Invalid format' }]
 * });
 */
function sendError(res, { statusCode = 500, code, message, details, ref } = {}) {
    const errorRef = ref || generateErrorRef();
    
    const response = {
        success: false,
        error: {
            code: code || 'INTERNAL_ERROR',
            message: message || 'An error occurred',
            ...(details && { details })
        },
        ref: errorRef
    };
    
    // Log error with reference
    logger.error('API Error', {
        ref: errorRef,
        code,
        message,
        statusCode,
        details
    });
    
    return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * 
 * @param {Object} res - Express response object
 * @param {Array} details - Validation error details
 * @returns {Object} Express response
 * 
 * @example
 * sendValidationError(res, [
 *   { field: 'email', message: 'Email is required' },
 *   { field: 'password', message: 'Password too short' }
 * ]);
 */
function sendValidationError(res, details) {
    return sendError(res, {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details
    });
}

/**
 * Send authentication error
 * 
 * @param {Object} res - Express response object
 * @param {string} [message='Authentication required'] - Error message
 * @returns {Object} Express response
 */
function sendAuthError(res, message = 'Authentication required') {
    return sendError(res, {
        statusCode: 401,
        code: 'AUTH_REQUIRED',
        message
    });
}

/**
 * Send forbidden error
 * 
 * @param {Object} res - Express response object
 * @param {string} [message='Access forbidden'] - Error message
 * @returns {Object} Express response
 */
function sendForbiddenError(res, message = 'Access forbidden') {
    return sendError(res, {
        statusCode: 403,
        code: 'FORBIDDEN',
        message
    });
}

/**
 * Send not found error
 * 
 * @param {Object} res - Express response object
 * @param {string} [message='Resource not found'] - Error message
 * @returns {Object} Express response
 */
function sendNotFoundError(res, message = 'Resource not found') {
    return sendError(res, {
        statusCode: 404,
        code: 'NOT_FOUND',
        message
    });
}

/**
 * Send rate limit error
 * 
 * @param {Object} res - Express response object
 * @param {number} [retryAfter] - Seconds until retry allowed
 * @returns {Object} Express response
 */
function sendRateLimitError(res, retryAfter) {
    if (retryAfter) {
        res.setHeader('Retry-After', retryAfter);
    }
    
    return sendError(res, {
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: retryAfter ? [{ retryAfter }] : undefined
    });
}

/**
 * Error codes enumeration
 */
const ERROR_CODES = {
    // Authentication errors (1000-1099)
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    
    // Authorization errors (1100-1199)
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    
    // Validation errors (1200-1299)
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    
    // Resource errors (1300-1399)
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',
    
    // Rate limiting (1400-1499)
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    
    // Payment errors (1500-1599)
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_AMOUNT_MISMATCH: 'PAYMENT_AMOUNT_MISMATCH',
    PAYMENT_DUPLICATE: 'PAYMENT_DUPLICATE',
    
    // Server errors (9000-9999)
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR: 'DATABASE_ERROR'
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendAuthError,
    sendForbiddenError,
    sendNotFoundError,
    sendRateLimitError,
    generateErrorRef,
    ERROR_CODES
};
