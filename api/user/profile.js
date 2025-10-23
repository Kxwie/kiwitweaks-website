/**
 * User Profile API Endpoint
 * Returns user profile with purchases (requires authentication)
 */

const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const { requireAuth } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.userId;

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from result
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        purchases: user.purchases || []
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap with authentication middleware
module.exports = requireAuth(handler);
