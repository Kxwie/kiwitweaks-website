/**
 * Password Reset Request Endpoint
 * Step 1: User requests password reset
 * Sends email with reset link using Gmail
 */

const crypto = require('crypto');
const clientPromise = require('../../lib/mongodb');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('kiwitweaks');
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });

    // Security: Always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
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

    // Send reset email using Gmail
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kiwitweaks.com'}/reset-password?token=${resetToken}`;
      
      // Create transporter with Gmail
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
          user: process.env.GMAIL_USER || 'contact.kiwitweaks@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      // Send email
      await transporter.sendMail({
        from: '"KiwiTweaks" <contact.kiwitweaks@gmail.com>',
        to: user.email,
        subject: 'Reset Your KiwiTweaks Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi ${user.username || 'there'},</p>
                <p>We received a request to reset your KiwiTweaks password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
                <p>Best regards,<br>The KiwiTweaks Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} KiwiTweaks. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log('Password reset email sent to:', user.email);

    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Still return success to prevent user enumeration
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
