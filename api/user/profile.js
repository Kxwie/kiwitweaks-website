/**
 * User Profile Endpoint
 * Returns user data from database
 * Fixed for Vercel serverless functions
 */

const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    const userId = decoded.userId;

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    
    // Fetch user profile
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { 
        projection: { 
          password: 0,
          resetToken: 0,
          verificationToken: 0
        } 
      }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Calculate account days (days since creation)
    const accountDays = user.createdAt 
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Return profile data with all fields
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        name: user.name || user.username,
        avatar: user.avatar,
        isPremium: user.isPremium || false,
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        accountDays: accountDays,
        hwid: user.hwid || null,
        licenseKey: user.licenseKey || null,
        purchases: user.purchases || []
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
};
