/**
 * Database Utilities
 * Helper functions for MongoDB operations
 */

const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const logger = require('./logger');

/**
 * Get database instance
 */
async function getDb() {
  const client = await clientPromise;
  return client.db('kiwitweaks');
}

/**
 * Create all required indexes
 */
async function createIndexes() {
  const db = await getDb();
  
  try {
    // Users collection indexes
    await db.collection('users').createIndexes([
      // Unique email index
      { 
        key: { email: 1 }, 
        unique: true,
        name: 'email_unique'
      },
      // Username index
      { 
        key: { username: 1 }, 
        unique: true,
        sparse: true, // Allow null values
        name: 'username_unique'
      },
      // Created at index (for sorting)
      { 
        key: { createdAt: -1 },
        name: 'created_at_desc'
      },
      // Email verified index
      { 
        key: { emailVerified: 1 },
        name: 'email_verified'
      },
      // Reset token index (for password resets)
      { 
        key: { resetToken: 1 },
        sparse: true,
        name: 'reset_token'
      },
      // Verification token index
      { 
        key: { verificationToken: 1 },
        sparse: true,
        name: 'verification_token'
      }
    ]);

    // Purchases subdocument indexes
    await db.collection('users').createIndex(
      { 'purchases.key': 1 },
      { name: 'purchase_license_key' }
    );

    await db.collection('users').createIndex(
      { 'purchases.stripeSessionId': 1 },
      { sparse: true, name: 'purchase_stripe_session' }
    );

    await db.collection('users').createIndex(
      { 'purchases.paypalOrderId': 1 },
      { sparse: true, name: 'purchase_paypal_order' }
    );

    // Auth logs collection (if used)
    await db.collection('auth_logs').createIndexes([
      { key: { userId: 1, timestamp: -1 }, name: 'user_timestamp' },
      { key: { type: 1, timestamp: -1 }, name: 'type_timestamp' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' }
    ]);

    // TTL index for auth logs (delete after 90 days)
    await db.collection('auth_logs').createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' }
    );

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create indexes', { error: error.message });
    throw error;
  }
}

/**
 * Validate ObjectId
 */
function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * Safe ObjectId conversion
 */
function toObjectId(id) {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ObjectId');
  }
  return new ObjectId(id);
}

/**
 * Transaction helper
 */
async function withTransaction(callback) {
  const client = await clientPromise;
  const session = client.startSession();
  
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Safe update - prevents overwriting entire document
 */
function safeUpdate(updates) {
  const safe = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (key.startsWith('$')) {
      safe[key] = value;
    } else {
      if (!safe.$set) safe.$set = {};
      safe.$set[key] = value;
    }
  }
  
  return safe;
}

/**
 * Pagination helper
 */
function paginate(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) }; // Max 100 per page
}

/**
 * Build query from filters
 */
function buildQuery(filters = {}) {
  const query = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') {
      // Case-insensitive regex search
      query[key] = { $regex: new RegExp(value, 'i') };
    } else if (Array.isArray(value)) {
      // In array
      query[key] = { $in: value };
    } else if (typeof value === 'object' && value.from && value.to) {
      // Date range
      query[key] = { $gte: value.from, $lte: value.to };
    } else {
      // Exact match
      query[key] = value;
    }
  }
  
  return query;
}

/**
 * Sanitize user object (remove sensitive fields)
 */
function sanitizeUser(user) {
  if (!user) return null;
  
  const { password, resetToken, resetTokenExpiry, verificationToken, ...sanitized } = user;
  return sanitized;
}

/**
 * Health check - verify database connection
 */
async function healthCheck() {
  try {
    const client = await clientPromise;
    await client.db('kiwitweaks').command({ ping: 1 });
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
}

module.exports = {
  getDb,
  createIndexes,
  isValidObjectId,
  toObjectId,
  withTransaction,
  safeUpdate,
  paginate,
  buildQuery,
  sanitizeUser,
  healthCheck
};
