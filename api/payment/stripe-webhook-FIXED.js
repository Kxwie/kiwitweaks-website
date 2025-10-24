/**
 * Stripe Webhook Handler - FIXED VERSION
 * ✅ Generates license keys
 * ✅ Sends email with key
 * ✅ Validates payment amount
 * ✅ Prevents duplicate purchases
 * ✅ Proper error handling
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDb, toObjectId } = require('../../utils/database');
const { generateLicenseKey } = require('../../lib/licenseKey');
const emailService = require('../../services/EmailService');
const logger = require('../../utils/logger');
const { asyncHandler } = require('../../middleware/errorHandler');

// Product catalog (single source of truth)
const PRODUCTS = {
  premium: {
    id: 'premium',
    name: 'KiwiTweaks Premium',
    priceUSD: 2999, // $29.99 in cents
    currency: 'usd'
  }
};

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
 * Handle successful payment
 */
async function handleSuccessfulPayment(session) {
  const { customer_email: email, metadata, amount_total, currency } = session;

  if (!email) {
    logger.error('No email in Stripe session', { sessionId: session.id });
    return;
  }

  const productId = metadata?.plan || 'premium';
  const product = PRODUCTS[productId];

  if (!product) {
    logger.error('Invalid product in Stripe session', { productId, sessionId: session.id });
    return;
  }

  // ✅ Validate payment amount
  if (amount_total !== product.priceUSD) {
    logger.logSecurity('stripe_amount_mismatch', 'high', {
      expected: product.priceUSD,
      received: amount_total,
      sessionId: session.id,
      email
    });
    return;
  }

  // ✅ Validate currency
  if (currency.toLowerCase() !== product.currency) {
    logger.logSecurity('stripe_currency_mismatch', 'medium', {
      expected: product.currency,
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

    // ✅ Check if user already has this product
    const userWithProduct = await usersCollection.findOne({
      email: email.toLowerCase(),
      'purchases.product': product.name
    });

    if (userWithProduct) {
      logger.warn('User already owns product', { email, product: product.name });
      // Still process to avoid failed payment, but log it
    }

    // ✅ Generate license key
    const licenseKey = generateLicenseKey();

    // Create purchase record
    const purchase = {
      product: product.name,
      key: licenseKey, // ✅ FIXED: Actually generate key!
      date: new Date(),
      stripeSessionId: session.id,
      amount: amount_total / 100,
      currency: currency.toUpperCase(),
      status: 'completed'
    };

    // ✅ Update or create user with purchase
    const result = await usersCollection.updateOne(
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
      { upsert: true }
    );

    // Get user data for email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    logger.logPayment('purchase_completed', user._id, purchase.amount, {
      product: product.id,
      licenseKey,
      provider: 'stripe',
      sessionId: session.id
    });

    // ✅ Send email with license key
    try {
      await emailService.sendLicenseKey(user, licenseKey, product);
      logger.info('License key email sent', { email, licenseKey });
    } catch (emailError) {
      logger.error('Failed to send license key email', {
        error: emailError.message,
        email,
        licenseKey
      });
      // Don't fail the whole process if email fails
      // License is saved in database, user can retrieve it
    }

    // ✅ Send purchase confirmation
    try {
      await emailService.sendPurchaseConfirmation(user, purchase);
    } catch (emailError) {
      logger.error('Failed to send purchase confirmation', {
        error: emailError.message,
        email
      });
    }

    return result;
  } catch (error) {
    logger.error('Failed to process payment', {
      error: error.message,
      sessionId: session.id,
      email
    });
    throw error;
  }
}
