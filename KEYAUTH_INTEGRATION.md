# KeyAuth Integration Guide for KiwiTweaks

## Overview
This document explains how to integrate KeyAuth with the KiwiTweaks purchasing system to generate and manage license keys.

## KeyAuth Setup

### 1. Create KeyAuth Account
- Go to https://keyauth.cc
- Create an application
- Get your API credentials:
  - `appName`
  - `ownerID` 
  - `appSecret`

### 2. Environment Variables (Already Configured in Vercel)
```
App_name=Kiwi
ownerID=2B.585G@Ao
```

## Implementation Flow

### Purchase Flow with KeyAuth
1. User clicks "Purchase" → Opens purchase modal
2. User enters payment details (Stripe/PayPal)
3. Payment processed
4. On successful payment:
   - Generate license key via KeyAuth API
   - Create order in database with license key
   - Send email with license key
   - Display license key in profile orders

### API Endpoints Needed

#### `/api/keyauth/generate-license`
```javascript
POST /api/keyauth/generate-license
Headers: {
  Authorization: Bearer <token>
}
Body: {
  duration: 99999999, // lifetime in seconds
  username: user.email,
  productId: "premium"
}

Response: {
  success: true,
  licenseKey: "XXXX-XXXX-XXXX-XXXX"
}
```

#### `/api/orders/create`
```javascript
POST /api/orders/create
Headers: {
  Authorization: Bearer <token>
}
Body: {
  productName: "KiwiTweaks Premium",
  amount: 29.99,
  paymentMethod: "stripe",
  paymentId: "pi_xxx",
  licenseKey: "XXXX-XXXX-XXXX-XXXX"
}

Response: {
  success: true,
  order: { orderId, licenseKey, ... }
}
```

#### `/api/orders`
```javascript
GET /api/orders
Headers: {
  Authorization: Bearer <token>
}

Response: {
  success: true,
  orders: [
    {
      orderId: "KWT-2024-001",
      productName: "KiwiTweaks Premium",
      amount: 29.99,
      status: "completed",
      licenseKey: "XXXX-XXXX-XXXX-XXXX",
      createdAt: "2024-01-01T00:00:00Z"
    }
  ]
}
```

## KeyAuth API Integration

### Generate License Key
```javascript
async function generateKeyAuthLicense(userEmail, duration = 99999999) {
  const response = await fetch('https://keyauth.win/api/seller/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      sellerkey: process.env.Seller_Key,
      type: 'add',
      format: 'JSON',
      expiry: duration,
      mask: 'XXXX-XXXX-XXXX-XXXX',
      level: '1',
      amount: '1',
      owner: process.env.ownerID,
      character: '2',
      note: `Generated for ${userEmail}`
    })
  });
  
  const data = await response.json();
  return data.key || data.keys[0];
}
```

### Verify License Key
```javascript
async function verifyKeyAuthLicense(licenseKey) {
  const response = await fetch('https://keyauth.win/api/1.2/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      type: 'license',
      key: licenseKey,
      name: process.env.App_name,
      ownerid: process.env.ownerID
    })
  });
  
  const data = await response.json();
  return data.success;
}
```

## Frontend Integration

### Purchase Modal Updates
After successful payment in `purchase-modal.js`:

```javascript
// After payment succeeds
const orderData = {
  productName: "KiwiTweaks Premium",
  productDescription: "Lifetime License",
  amount: 29.99,
  paymentMethod: paymentMethod,
  paymentId: paymentIntent.id,
  status: 'completed'
};

// Create order with KeyAuth license
const order = await createOrderWithLicense(orderData);

// Show success with license key
showPurchaseSuccess(order.licenseKey);

// Save to localStorage
const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
userOrders.unshift(order);
localStorage.setItem('userOrders', JSON.stringify(userOrders));

// Update user premium status
const user = JSON.parse(localStorage.getItem('user'));
user.isPremium = true;
localStorage.setItem('user', JSON.stringify(user));
```

### Profile Page Display
The license key will be displayed in the orders tab:

```html
<div class="order-license">
  <div class="license-header">
    <i class="fas fa-key"></i>
    <span>Your License Key</span>
  </div>
  <div class="license-key-box">
    <code>XXXX-XXXX-XXXX-XXXX</code>
    <button class="btn-copy">
      <i class="fas fa-copy"></i>
    </button>
  </div>
  <p class="license-note">
    Keep this key safe. You'll need it to activate KiwiTweaks.
  </p>
</div>
```

## Database Schema

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  orderId: "KWT-2024-001",
  productName: "KiwiTweaks Premium",
  productDescription: "Lifetime License",
  productId: "premium",
  amount: 29.99,
  currency: "USD",
  paymentMethod: "stripe",
  paymentId: "pi_xxx",
  licenseKey: "XXXX-XXXX-XXXX-XXXX",
  status: "completed", // pending, completed, refunded
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. Create KeyAuth seller account
2. Implement `/api/keyauth/generate-license` endpoint
3. Update purchase modal to call license generation
4. Implement `/api/orders` endpoints
5. Test end-to-end purchase flow
6. Deploy to Vercel

## Security Notes
- Never expose KeyAuth seller key in frontend
- Always verify licenses server-side
- Store license keys encrypted in database
- Rate limit license generation to prevent abuse
