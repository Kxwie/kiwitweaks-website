/**
 * PayPal Capture Order - FIXED VERSION
 * ✅ Generates license keys
 * ✅ Sends email with key
 * ✅ Validates payment amount
 * ✅ Prevents duplicate purchases
 * ✅ Proper error handling
 */

const paypal = require('@paypal/checkout-server-sdk');
const { getDb } = require('../../utils/database');
const { generateLicenseKey } = require('../../lib/licenseKey');
const emailService = require('../../services/EmailService');
const logger = require('../../utils/logger');
const { asyncHandler, ValidationError } = require('../../middleware/errorHandler');

// Product catalog (same as Stripe)
const PRODUCTS = {
  premium: {
    id: 'premium',
    name: 'KiwiTweaks Premium',
    price: '29.99', // PayPal uses string format
    currency: 'USD'
  }
};

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = asyncHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    throw new ValidationError('Order ID is required');
  }

  // Capture the order
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  let capture;
  try {
    capture = await client().execute(request);
  } catch (error) {
    logger.error('PayPal capture failed', {
      error: error.message,
      orderId
    });
    throw new Error('Failed to capture PayPal order');
  }

  const order = capture.result;

  // Check if capture was successful
  if (order.status !== 'COMPLETED') {
    logger.warn('PayPal order not completed', {
      orderId,
      status: order.status
    });
    return res.status(400).json({ 
      success: false,
      error: 'Payment not completed' 
    });
  }

  // Extract custom data
  const customData = JSON.parse(order.purchase_units[0].custom_id || '{}');
  const email = customData.email;
  const planId = customData.plan || 'premium';
  const product = PRODUCTS[planId];

  if (!product) {
    throw new ValidationError('Invalid product plan');
  }

  if (!email) {
    throw new ValidationError('No email provided in order');
  }

  // ✅ Validate payment amount
  const paidAmount = order.purchase_units[0].amount.value;
  if (parseFloat(paidAmount) !== parseFloat(product.price)) {
    logger.logSecurity('paypal_amount_mismatch', 'high', {
      expected: product.price,
      received: paidAmount,
      orderId,
      email
    });
    throw new ValidationError('Payment amount mismatch');
  }

  // ✅ Validate currency
  const paidCurrency = order.purchase_units[0].amount.currency_code;
  if (paidCurrency !== product.currency) {
    logger.logSecurity('paypal_currency_mismatch', 'medium', {
      expected: product.currency,
      received: paidCurrency,
      orderId
    });
    throw new ValidationError('Payment currency mismatch');
  }

  const db = await getDb();
  const usersCollection = db.collection('users');

  try {
    // ✅ Check for duplicate capture
    const existingPurchase = await usersCollection.findOne({
      email: email.toLowerCase(),
      'purchases.paypalOrderId': orderId
    });

    if (existingPurchase) {
      logger.warn('Duplicate PayPal capture attempt', { orderId, email });
      
      // Return the existing license key
      const purchase = existingPurchase.purchases.find(p => p.paypalOrderId === orderId);
      return res.status(200).json({
        success: true,
        orderId: order.id,
        licenseKey: purchase.key,
        message: 'Order already processed'
      });
    }

    // ✅ Check if user already owns this product
    const userWithProduct = await usersCollection.findOne({
      email: email.toLowerCase(),
      'purchases.product': product.name
    });

    if (userWithProduct) {
      logger.warn('User already owns product', { email, product: product.name });
    }

    // ✅ Generate license key
    const licenseKey = generateLicenseKey();

    // Create purchase record
    const purchase = {
      product: product.name,
      key: licenseKey, // ✅ FIXED: Actually generate key!
      date: new Date(),
      paypalOrderId: orderId,
      amount: parseFloat(paidAmount),
      currency: paidCurrency,
      status: 'completed'
    };

    // ✅ Update or create user
    await usersCollection.updateOne(
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
      provider: 'paypal',
      orderId
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

    return res.status(200).json({
      success: true,
      orderId: order.id,
      licenseKey,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    logger.error('Failed to process PayPal payment', {
      error: error.message,
      orderId,
      email
    });
    throw error;
  }
});
