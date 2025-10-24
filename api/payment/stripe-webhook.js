/**
 * Stripe Webhook API Endpoint
 * Handles Stripe payment events and updates user purchases
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const clientPromise = require('../../lib/mongodb');

// Disable body parsing for webhook verification
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;

      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(session) {
  const { customer_email: email, metadata } = session;

  if (!email) {
    console.error('No email in session');
    return;
  }

  // Connect to database
  const client = await clientPromise;
  const db = client.db('kiwitweaks');
  const usersCollection = db.collection('users');

  // Create purchase record
  const purchase = {
    product: metadata.product || 'Premium License',
    key: '',
    date: new Date(),
    stripeSessionId: session.id,
    amount: session.amount_total / 100,
    currency: session.currency
  };

  // Update user with purchase
  const result = await usersCollection.updateOne(
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

  console.log('Purchase added for user:', email);

  // TODO: Send email with license key
  // You can integrate an email service here (SendGrid, AWS SES, etc.)
  
  return result;
}
