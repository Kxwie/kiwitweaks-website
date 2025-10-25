/**
 * Password Reset Confirmation Endpoint
 * Step 2: User sets new password with reset token
 */

const crypto = require('crypto');
const clientPromise = require('../../lib/mongodb');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash the token to match database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    const usersCollection = db.collection('users');

    // Find user with valid reset token
    const user = await usersCollection.findOne({
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date()
        },
        $unset: {
          resetToken: '',
          resetTokenExpiry: '',
          resetRequestedAt: ''
        }
      }
    );

    console.log('Password reset completed for:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Password reset confirm error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
