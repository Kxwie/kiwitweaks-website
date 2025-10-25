/**
 * Login API Endpoint
 * Authenticates user and returns JWT token
 */

const clientPromise = require('../../lib/mongodb');
const { comparePassword, generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login time
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { lastLogin: new Date() }
      }
    );

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Return success with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        purchases: user.purchases || []
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
