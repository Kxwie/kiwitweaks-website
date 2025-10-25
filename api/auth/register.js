/**
 * Register API Endpoint
 * Creates new user account
 */

const clientPromise = require('../../lib/mongodb');
const { hashPassword, generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user document with all fields
    const createdAt = new Date();
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username || email.split('@')[0],
      createdAt: createdAt,
      lastLogin: createdAt, // First login is creation time
      accountDays: 0, // Will be calculated dynamically
      hwid: null, // For KeyAuth HWID tracking
      licenseKey: null, // Will be set when user purchases
      isPremium: false,
      purchases: [],
      emailVerified: false
    };

    // Insert user
    const result = await usersCollection.insertOne(newUser);

    // Generate JWT token
    const token = generateToken(result.insertedId.toString(), newUser.email);

    // Return success with token
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: newUser.email,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
