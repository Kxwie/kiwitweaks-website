/**
 * Password Reset Confirmation Endpoint
 * Step 2: User sets new password with reset token
 */

const crypto = require('crypto');
const { getDb } = require('../../utils/database');
const { hashPassword } = require('../../lib/auth');
const logger = require('../../utils/logger');
const { asyncHandler, ValidationError, AuthenticationError } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { passwordResetConfirmSchema } = require('../../schemas/auth.schema');

module.exports = authLimiter(validate(passwordResetConfirmSchema)(asyncHandler(async (req, res) => {
  const { token, password } = req.validatedBody;

  // Hash the token to match database
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const db = await getDb();
  const usersCollection = db.collection('users');

  // Find user with valid reset token
  const user = await usersCollection.findOne({
    resetToken: resetTokenHash,
    resetTokenExpiry: { $gt: new Date() } // Token not expired
  });

  if (!user) {
    logger.logSecurity('password_reset_invalid_token', 'medium', { token: token.substring(0, 10) });
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

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

  logger.logAuth('password_reset_completed', user._id, user.email);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.'
  });
})));
