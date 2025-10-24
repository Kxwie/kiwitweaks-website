/**
 * Resend Email Verification Endpoint
 * Allows users to request a new verification email
 */

const crypto = require('crypto');
const { getDb } = require('../../utils/database');
const emailService = require('../../services/EmailService');
const logger = require('../../utils/logger');
const { asyncHandler, ValidationError } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validate');
const { emailVerifyLimiter } = require('../../middleware/rateLimiter');
const { passwordResetRequestSchema } = require('../../schemas/auth.schema'); // Reuse email-only schema

module.exports = emailVerifyLimiter(validate(passwordResetRequestSchema)(asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;

  const db = await getDb();
  const usersCollection = db.collection('users');

  // Find user
  const user = await usersCollection.findOne({ 
    email: email.toLowerCase() 
  });

  if (!user) {
    // Return success to prevent email enumeration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a verification link has been sent'
    });
  }

  // Check if already verified
  if (user.emailVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Update token in database
  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        verificationToken: verificationTokenHash,
        verificationTokenSentAt: new Date()
      }
    }
  );

  logger.logAuth('verification_resend_requested', user._id, user.email);

  // Send verification email
  try {
    await emailService.sendEmailVerification(user, verificationToken);
    
    logger.info('Verification email resent', { 
      userId: user._id, 
      email: user.email 
    });
  } catch (error) {
    logger.error('Failed to send verification email', {
      error: error.message,
      userId: user._id,
      email: user.email
    });
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a verification link has been sent'
  });
})));
