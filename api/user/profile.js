/**
 * User Profile Endpoint - OPTIMIZED VERSION
 * ✅ Caching implemented
 * ✅ Efficient database queries
 * ✅ Proper error handling
 * ✅ Request tracking
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../lib/mongodb-OPTIMIZED');
const { requireAuth } = require('../../middleware/authenticate');
const { asyncHandler } = require('../../middleware/errorHandler');
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.userId;
  const cacheKey = `user:profile:${userId}`;

  try {
    // Try cache first (1ms vs 50ms database query)
    const profile = await cache.getOrSet(
      cacheKey,
      async () => {
        // Cache miss - fetch from database
        logger.logDatabase('findOne', 'users', { userId });
        
        const db = await getDb();
        const user = await db.collection('users').findOne(
          { _id: new ObjectId(userId) },
          { 
            projection: { 
              password: 0,        // Never return password
              resetToken: 0,      // Don't return sensitive tokens
              verificationToken: 0 
            } 
          }
        );

        if (!user) {
          return null;
        }

        // Transform for response
        return {
          id: user._id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt,
          purchases: user.purchases || [],
          stats: {
            purchaseCount: (user.purchases || []).length,
            accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          }
        };
      },
      3600 // Cache for 1 hour
    );

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    logger.logRequest(req.method, req.url, 200, Date.now() - req.startTime);

    return res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    logger.error('Profile fetch error', { 
      error: error.message,
      userId,
      requestId: req.id
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
}

// Wrap with authentication middleware
module.exports = requireAuth(asyncHandler(handler));
