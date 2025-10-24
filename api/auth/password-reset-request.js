/**
 * Password Reset Request Endpoint
 * Step 1: User requests password reset
 */

const crypto = require('crypto');
const { getDb } = require('../../utils/database');
const emailService = require('../../services/EmailService');
const logger = require('../../utils/logger');
const { asyncHandler, NotFoundError } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validate');
const { passwordResetLimiter } = require('../../middleware/rateLimiter');
const { passwordResetRequestSchema } = require('../../schemas/auth.schema');

module.exports = passwordResetLimiter(validate(passwordResetRequestSchema)(asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;

  const db = await getDb();
  const usersCollection = db.collection('users');

  // Find user
  const user = await usersCollection.findOne({ 
    email: email.toLowerCase() 
  });

  // ✅ Security: Always return success even if user not found
  // This prevents email enumeration attacks
  if (!user) {
    logger.logSecurity('password_reset_nonexistent_email', 'low', { email });
    
    // Fake delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent'
    });
  }

  // Generate reset token (cryptographically secure)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry (1 hour)
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  // Save hashed token to database
  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
        resetRequestedAt: new Date()
      }
    }
  );

  logger.logAuth('password_reset_requested', user._id, user.email);

  // Send reset email
  try {
    await emailService.sendPasswordReset(user, resetToken);
    
    logger.info('Password reset email sent', { 
      userId: user._id, 
      email: user.email 
    });
  } catch (error) {
    logger.error('Failed to send password reset email', {
      error: error.message,
      userId: user._id,
      email: user.email
    });
    
    // Still return success to prevent user enumeration
    // But log the error for investigation
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent'
  });
})));
