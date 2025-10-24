/**
 * Email Verification Endpoint
 * Confirms user's email address
 */

const crypto = require('crypto');
const { getDb } = require('../../utils/database');
const logger = require('../../utils/logger');
const { asyncHandler, ValidationError } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validate');
const { emailVerifySchema } = require('../../schemas/auth.schema');

module.exports = validate(emailVerifySchema)(asyncHandler(async (req, res) => {
  const { token } = req.validatedBody;

  // Hash the token to match database
  const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const db = await getDb();
  const usersCollection = db.collection('users');

  // Find user with verification token
  const user = await usersCollection.findOne({
    verificationToken: verificationTokenHash,
    emailVerified: false
  });

  if (!user) {
    logger.logSecurity('email_verification_invalid_token', 'low', { 
      token: token.substring(0, 10) 
    });
    throw new ValidationError('Invalid or already used verification token');
  }

  // Check if token expired (24 hours)
  const tokenAge = Date.now() - user.createdAt.getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (tokenAge > maxAge) {
    logger.warn('Email verification token expired', { 
      userId: user._id, 
      email: user.email 
    });
    throw new ValidationError('Verification token has expired. Please request a new one.');
  }

  // Mark email as verified
  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
      $unset: {
        verificationToken: ''
      }
    }
  );

  logger.logAuth('email_verified', user._id, user.email);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now use all features.'
  });
}));
