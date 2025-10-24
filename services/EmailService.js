/**
 * Email Service
 * Handles all email delivery using Nodemailer
 */

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    // Check if email is configured
    if (!process.env.SMTP_HOST) {
      logger.warn('SMTP not configured - emails will not be sent');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        logger.error('SMTP connection failed', { error: error.message });
      } else {
        logger.info('SMTP connection established');
      }
    });
  }

  /**
   * Load and compile email template
   */
  async getTemplate(templateName) {
    // Check cache
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName);
    }

    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
      const source = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(source);
      
      // Cache compiled template
      this.templates.set(templateName, template);
      
      return template;
    } catch (error) {
      logger.error(`Failed to load template: ${templateName}`, { error: error.message });
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Send email
   */
  async send(to, subject, html, text = null) {
    if (!this.transporter) {
      logger.warn('Email not sent - SMTP not configured', { to, subject });
      return { messageId: 'not-configured' };
    }

    try {
      const mailOptions = {
        from: `${process.env.APP_NAME || 'KiwiTweaks'} <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent', { 
        to, 
        subject, 
        messageId: info.messageId 
      });

      return info;
    } catch (error) {
      logger.error('Failed to send email', { 
        to, 
        subject, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Send license key email
   */
  async sendLicenseKey(user, licenseKey, product) {
    const template = await this.getTemplate('license-key');
    const html = template({
      username: user.username || user.email.split('@')[0],
      email: user.email,
      licenseKey,
      product: product.name,
      downloadUrl: process.env.DOWNLOAD_URL || 'https://kiwitweaks.com/download',
      supportUrl: process.env.SUPPORT_URL || 'https://kiwitweaks.com/support',
      year: new Date().getFullYear()
    });

    await this.send(
      user.email,
      '🎉 Your KiwiTweaks License Key',
      html
    );

    logger.logPayment('license_email_sent', user._id, product.priceUSD / 100, {
      product: product.id,
      licenseKey
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user, verificationToken) {
    const template = await this.getTemplate('email-verification');
    const verificationUrl = `${process.env.APP_URL || 'https://kiwitweaks.com'}/verify-email?token=${verificationToken}`;
    
    const html = template({
      username: user.username || user.email.split('@')[0],
      verificationUrl,
      year: new Date().getFullYear()
    });

    await this.send(
      user.email,
      'Verify Your Email Address',
      html
    );

    logger.logAuth('verification_email_sent', user._id, user.email);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetToken) {
    const template = await this.getTemplate('password-reset');
    const resetUrl = `${process.env.APP_URL || 'https://kiwitweaks.com'}/reset-password?token=${resetToken}`;
    
    const html = template({
      username: user.username || user.email.split('@')[0],
      resetUrl,
      expiryHours: 1,
      year: new Date().getFullYear()
    });

    await this.send(
      user.email,
      'Reset Your Password',
      html
    );

    logger.logAuth('password_reset_email_sent', user._id, user.email);
  }

  /**
   * Send welcome email
   */
  async sendWelcome(user) {
    const template = await this.getTemplate('welcome');
    const html = template({
      username: user.username || user.email.split('@')[0],
      email: user.email,
      loginUrl: `${process.env.APP_URL || 'https://kiwitweaks.com'}/auth.html`,
      year: new Date().getFullYear()
    });

    await this.send(
      user.email,
      'Welcome to KiwiTweaks! 🎉',
      html
    );

    logger.logAuth('welcome_email_sent', user._id, user.email);
  }

  /**
   * Send purchase confirmation
   */
  async sendPurchaseConfirmation(user, purchase) {
    const template = await this.getTemplate('purchase-confirmation');
    const html = template({
      username: user.username || user.email.split('@')[0],
      product: purchase.product,
      amount: (purchase.amount).toFixed(2),
      currency: purchase.currency,
      transactionId: purchase.stripeSessionId || purchase.paypalOrderId,
      date: new Date(purchase.date).toLocaleDateString(),
      year: new Date().getFullYear()
    });

    await this.send(
      user.email,
      'Purchase Confirmation - KiwiTweaks',
      html
    );
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
