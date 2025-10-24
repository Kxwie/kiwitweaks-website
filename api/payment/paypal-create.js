/**
 * PayPal Create Order API Endpoint
 * Creates PayPal order for payment
 */

const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Use sandbox for testing, live for production
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
    const { plan = 'premium', email } = req.body;

    // Define product details
    const products = {
      premium: {
        name: 'KiwiTweaks Premium',
        description: 'Lifetime access to all premium features',
        price: '29.99',
        currency: 'USD'
      }
    };

    const product = products[plan];
    if (!product) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        description: product.description,
        amount: {
          currency_code: product.currency,
          value: product.price
        },
        custom_id: JSON.stringify({ email, plan })
      }],
      application_context: {
        brand_name: 'KiwiTweaks',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.SITE_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/cancel`
      }
    });

    // Execute request
    const order = await client().execute(request);

    return res.status(200).json({
      success: true,
      orderId: order.result.id
    });

  } catch (error) {
    console.error('PayPal create order error:', error);
    return res.status(500).json({ error: 'Failed to create PayPal order' });
  }
};
