/**
 * Rate Limiting Middleware
 * Protects against brute force and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { RateLimitError } = require('./errorHandler');

/**
 * Strict limiter for authentication endpoints
 * 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.' 
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false, // Count successful requests
  handler: (req, res) => {
    throw new RateLimitError('Too many authentication attempts');
  }
});

/**
 * Medium limiter for payment endpoints
 * 10 attempts per hour
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { 
    success: false,
    error: 'Too many payment attempts. Please try again later.' 
  },
  handler: (req, res) => {
    throw new RateLimitError('Too many payment attempts');
  }
});

/**
 * API limiter with gradual slowdown
 * Starts slowing down after 30 requests, hard limit at 100
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Hard limit
  message: { 
    success: false,
    error: 'API rate limit exceeded. Please slow down.' 
  }
});

const apiSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 30, // Allow 30 requests at full speed
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000 // Maximum delay of 20 seconds
});

/**
 * Strict limiter for registration
 * Prevent mass account creation
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 registrations per hour per IP
  message: { 
    success: false,
    error: 'Too many accounts created. Please try again later.' 
  }
});

/**
 * Password reset limiter
 * Prevent email spam
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reset requests per hour
  message: { 
    success: false,
    error: 'Too many password reset requests. Please check your email or try again later.' 
  }
});

/**
 * Email verification limiter
 * Prevent email spam
 */
const emailVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 verification emails per hour
  message: { 
    success: false,
    error: 'Too many verification emails requested. Please check your inbox.' 
  }
});

module.exports = {
  authLimiter,
  paymentLimiter,
  apiLimiter,
  apiSlowDown,
  registerLimiter,
  passwordResetLimiter,
  emailVerifyLimiter
};
