/**
 * Stripe Checkout API Endpoint
 * Creates Stripe checkout session
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, plan = 'premium' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Define product details
    const products = {
      premium: {
        name: 'KiwiTweaks Premium',
        description: 'Lifetime access to all premium features',
        price: 2999, // $29.99 in cents
        currency: 'usd'
      }
    };

    const product = products[plan];
    if (!product) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
              images: ['https://your-domain.com/logo.png'] // Update with your logo
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.SITE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/cancel`,
      metadata: {
        email,
        plan,
        product: product.name
      }
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
