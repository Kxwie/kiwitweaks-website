/**
 * Stripe Webhook Handler - ULTRA-OPTIMIZED VERSION
 * ✅ Async email handling (non-blocking)
 * ✅ Parallel operations
 * ✅ Atomic database updates
 * ✅ Centralized product config
 * ✅ Comprehensive logging
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDb } = require('../../lib/mongodb-OPTIMIZED');
const { generateLicenseKey } = require('../../lib/licenseKey');
const emailService = require('../../services/EmailService');
const { getProduct, validatePrice } = require('../../config/products');
const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middleware/errorHandler');
const cache = require('../../utils/cache');

module.exports = asyncHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;

  try {
    // ✅ Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.logSecurity('stripe_webhook_verification_failed', 'high', {
      error: err.message
    });
    return res.status(400).send(`Webhook Error: Signature verification failed`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;

      case 'payment_intent.succeeded':
        logger.logPayment('payment_intent_succeeded', null, event.data.object.amount / 100);
        break;

      case 'payment_intent.payment_failed':
        logger.logPayment('payment_intent_failed', null, event.data.object.amount / 100, {
          error: event.data.object.last_payment_error?.message
        });
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', { 
      error: error.message,
      eventType: event.type,
      eventId: event.id
    });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle successful payment - OPTIMIZED
 */
async function handleSuccessfulPayment(session) {
  const { customer_email: email, metadata, amount_total, currency } = session;

  if (!email) {
    logger.error('No email in Stripe session', { sessionId: session.id });
    return;
  }

  const productId = metadata?.plan || 'premium';
  
  let product;
  try {
    product = getProduct(productId);
  } catch (error) {
    logger.error('Invalid product in Stripe session', { productId, sessionId: session.id });
    return;
  }

  // ✅ Validate payment amount using centralized function
  if (!validatePrice(productId, amount_total, 'stripe')) {
    logger.logSecurity('stripe_amount_mismatch', 'high', {
      expected: product.stripeConfig.priceInCents,
      received: amount_total,
      sessionId: session.id,
      email
    });
    return;
  }

  // ✅ Validate currency
  if (currency.toLowerCase() !== product.stripeConfig.currency) {
    logger.logSecurity('stripe_currency_mismatch', 'medium', {
      expected: product.stripeConfig.currency,
      received: currency,
      sessionId: session.id
    });
    return;
  }

  const db = await getDb();
  const usersCollection = db.collection('users');

  try {
    // ✅ Check for duplicate purchase
    const existingPurchase = await usersCollection.findOne({
      email: email.toLowerCase(),
      'purchases.stripeSessionId': session.id
    });

    if (existingPurchase) {
      logger.warn('Duplicate Stripe webhook received', { sessionId: session.id, email });
      return; // Already processed
    }

    // ✅ Generate license key
    const licenseKey = generateLicenseKey();

    // Create purchase record
    const purchase = {
      product: product.name,
      key: licenseKey,
      date: new Date(),
      stripeSessionId: session.id,
      amount: amount_total / 100,
      currency: currency.toUpperCase(),
      status: 'completed'
    };

    // ✅ OPTIMIZED: Single atomic operation (findOneAndUpdate)
    // No need for separate update + find
    const result = await usersCollection.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $push: { purchases: purchase },
        $setOnInsert: {
          email: email.toLowerCase(),
          username: email.split('@')[0],
          emailVerified: false,
          createdAt: new Date()
        }
      },
      { 
        upsert: true,
        returnDocument: 'after' // Return updated document
      }
    );

    const user = result.value;

    logger.logPayment('purchase_completed', user._id, purchase.amount, {
      product: product.id,
      licenseKey,
      provider: 'stripe',
      sessionId: session.id
    });

    // ✅ OPTIMIZED: Clear user cache (profile has changed)
    await cache.delete(`user:profile:${user._id}`);

    // ✅ OPTIMIZED: Send emails asynchronously (non-blocking)
    // Don't await - let them run in background
    Promise.all([
      emailService.sendLicenseKey(user, licenseKey, product),
      emailService.sendPurchaseConfirmation(user, purchase)
    ]).then(() => {
      logger.info('Purchase emails sent successfully', { email, licenseKey });
    }).catch((emailError) => {
      logger.error('Failed to send purchase emails', {
        error: emailError.message,
        email,
        licenseKey
      });
      // Don't fail the webhook - emails can be resent manually
    });

    return result;
  } catch (error) {
    logger.error('Failed to process payment', {
      error: error.message,
      stack: error.stack,
      sessionId: session.id,
      email
    });
    throw error;
  }
}
