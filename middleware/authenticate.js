/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken } = require('../lib/auth');
const { AuthenticationError } = require('./errorHandler');

/**
 * Require authentication middleware
 * Verifies JWT token and attaches user to request
 */
function requireAuth(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
}

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        req.user = {
          id: decoded.userId,
          email: decoded.email
        };
      }
    }
    
    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
}

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  if (req.user.role !== 'admin') {
    return next(new AuthorizationError('Admin access required'));
  }

  next();
}

/**
 * Require email verification
 */
function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  if (!req.user.emailVerified) {
    return next(new AuthorizationError('Email verification required'));
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireVerifiedEmail
};
