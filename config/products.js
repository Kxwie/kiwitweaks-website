/**
 * Product Configuration - SINGLE SOURCE OF TRUTH
 * All payment endpoints should reference this file
 */

const PRODUCTS = {
  premium: {
    id: 'premium',
    name: 'KiwiTweaks Premium',
    description: 'Lifetime access to all premium features',
    
    // Price in cents (USD)
    priceUSD: 2999, // $29.99
    
    // Currency code
    currency: 'USD',
    
    // Features included
    features: [
      'Lifetime updates',
      'All premium features',
      'Priority support',
      'Advanced optimization tools',
      'Performance monitoring'
    ],
    
    // Stripe-specific
    stripeConfig: {
      priceInCents: 2999,
      currency: 'usd' // Stripe uses lowercase
    },
    
    // PayPal-specific
    paypalConfig: {
      priceInDollars: '29.99', // PayPal uses string format
      currency: 'USD' // PayPal uses uppercase
    },
    
    // Display info
    display: {
      badge: 'Most Popular',
      highlight: true,
      originalPrice: null, // For showing discounts
      savingsPercentage: null
    }
  },
  
  // Future products can be added here
  pro: {
    id: 'pro',
    name: 'KiwiTweaks Pro',
    description: 'For professional users',
    priceUSD: 4999, // $49.99
    currency: 'USD',
    features: [
      'Everything in Premium',
      'Team collaboration',
      'Custom configurations',
      'White-label options'
    ],
    stripeConfig: {
      priceInCents: 4999,
      currency: 'usd'
    },
    paypalConfig: {
      priceInDollars: '49.99',
      currency: 'USD'
    },
    display: {
      badge: 'For Teams',
      highlight: false,
      originalPrice: null,
      savingsPercentage: null
    }
  }
};

/**
 * Get product by ID
 */
function getProduct(productId) {
  const product = PRODUCTS[productId];
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }
  return product;
}

/**
 * Get all products
 */
function getAllProducts() {
  return Object.values(PRODUCTS);
}

/**
 * Get products for display (sorted by price)
 */
function getProductsForDisplay() {
  return getAllProducts()
    .sort((a, b) => a.priceUSD - b.priceUSD);
}

/**
 * Validate product price (for webhook verification)
 */
function validatePrice(productId, receivedAmount, provider = 'stripe') {
  const product = getProduct(productId);
  
  let expectedAmount;
  if (provider === 'stripe') {
    expectedAmount = product.stripeConfig.priceInCents;
  } else if (provider === 'paypal') {
    expectedAmount = parseFloat(product.paypalConfig.priceInDollars);
  } else {
    throw new Error(`Unknown payment provider: ${provider}`);
  }
  
  return receivedAmount === expectedAmount;
}

module.exports = {
  PRODUCTS,
  getProduct,
  getAllProducts,
  getProductsForDisplay,
  validatePrice
};
