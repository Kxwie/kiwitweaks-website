/**
 * PayPal Capture Order API Endpoint
 * Captures PayPal payment and updates user purchases
 */

const paypal = require('@paypal/checkout-server-sdk');
const clientPromise = require('../../lib/mongodb');

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Capture the order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);
    const order = capture.result;

    // Check if capture was successful
    if (order.status === 'COMPLETED') {
      // Extract custom data
      const customData = JSON.parse(order.purchase_units[0].custom_id || '{}');
      const email = customData.email;
      const plan = customData.plan || 'premium';

      if (!email) {
        return res.status(400).json({ error: 'No email provided in order' });
      }

      // Connect to database
      const dbClient = await clientPromise;
      const db = dbClient.db('kiwitweaks');
      const usersCollection = db.collection('users');

      // Create purchase record
      const purchase = {
        product: 'Premium License',
        key: '',
        date: new Date(),
        paypalOrderId: orderId,
        amount: parseFloat(order.purchase_units[0].amount.value),
        currency: order.purchase_units[0].amount.currency_code
      };

      // Update user with purchase
      await usersCollection.updateOne(
        { email: email.toLowerCase() },
        {
          $push: { purchases: purchase },
          $setOnInsert: {
            email: email.toLowerCase(),
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        orderId: order.id,
        message: 'Payment completed successfully'
      });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }

  } catch (error) {
    console.error('PayPal capture error:', error);
    return res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
};
