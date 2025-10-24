# KiwiTweaks Website - Backend Integration Guide

## 🚀 Complete MongoDB + Vercel Setup

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm install -g vercel`
- MongoDB Atlas account
- Stripe account (for payments)
- PayPal developer account (for payments)

---

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `mongodb` - Database driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `crypto` - License key generation
- `stripe` - Stripe payment processing
- `@paypal/checkout-server-sdk` - PayPal integration

---

## 🔐 Environment Variables

### Create `.env` file in root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://uprisekxwie_db_user:qmevMgf3T9NZJRkR@kiwitweaksdb.4jh9nv1.mongodb.net

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-secret-jwt-key-change-this-in-production

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key-from-dashboard
STRIPE_PUBLISHABLE_KEY=pk_live_51SL85DPAav93iDQPS9DGfN3QTFjSdqPlAWUy567Z4jUXuxLO0OybGBS4LkckPb2lqk3O73vLODM1Xk08vulNkoTJ00YKMGzP3x
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=AfHir0qS1C-PrKUV2D1VcqAZ-JDTIA4KRpd40cdJkTojucgv40k-sfpnrpxJfoKKE9b5uszwJOk5qVfR
PAYPAL_CLIENT_SECRET=your-paypal-secret-from-dashboard

# Site URL
SITE_URL=https://your-domain.vercel.app
```

---

## 🗄️ Database Structure

### MongoDB Collections

#### **users** collection:
```json
{
  "_id": ObjectId("650e1a5d4c1f9b2d3f9a1234"),
  "email": "user@example.com",
  "password": "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36OYyQw6c0t8Uy2I8nF5/ea",
  "username": "username",
  "createdAt": "2025-10-22T15:42:00.000Z",
  "purchases": [
    {
      "product": "Premium License",
      "key": "A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6",
      "date": "2025-10-22T15:42:00.000Z",
      "amount": 29.99,
      "currency": "USD",
      "stripeSessionId": "cs_test_123...",
      "paypalOrderId": "ORDER_123..."
    }
  ]
}
```

---

## 🚀 Deployment to Vercel

### 1. Login to Vercel
```bash
vercel login
```

### 2. Link Project
```bash
vercel link
```

### 3. Set Environment Variables in Vercel Dashboard
Go to: Project Settings → Environment Variables

Add all variables from `.env` file:
- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `SITE_URL`

### 4. Deploy
```bash
vercel --prod
```

---

## 📡 API Endpoints

### Authentication

#### **POST** `/api/auth/register`
Create new user account
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "650e1a5d4c1f9b2d3f9a1234",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### **POST** `/api/auth/login`
Login existing user
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "650e1a5d4c1f9b2d3f9a1234",
    "email": "user@example.com",
    "username": "username",
    "purchases": []
  }
}
```

### User Profile

#### **GET** `/api/user/profile`
Get user profile (requires authentication)
```
Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "650e1a5d4c1f9b2d3f9a1234",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2025-10-22T15:42:00.000Z",
    "purchases": [...]
  }
}
```

### Payments

#### **POST** `/api/payment/stripe-checkout`
Create Stripe checkout session
```json
Request:
{
  "email": "user@example.com",
  "plan": "premium"
}

Response:
{
  "success": true,
  "sessionId": "cs_test_123...",
  "url": "https://checkout.stripe.com/pay/cs_test_123..."
}
```

#### **POST** `/api/payment/stripe-webhook`
Stripe webhook endpoint (configured in Stripe dashboard)

#### **POST** `/api/payment/paypal-create`
Create PayPal order
```json
Request:
{
  "email": "user@example.com",
  "plan": "premium"
}

Response:
{
  "success": true,
  "orderId": "ORDER_123..."
}
```

#### **POST** `/api/payment/paypal-capture`
Capture PayPal payment
```json
Request:
{
  "orderId": "ORDER_123..."
}

Response:
{
  "success": true,
  "orderId": "ORDER_123...",
  "licenseKey": "A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6",
  "message": "Payment completed successfully"
}
```

---

## 🔧 Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/payment/stripe-webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy webhook signing secret to environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Local Development

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Run Development Server
```bash
vercel dev
```

This will:
- Start local server on `http://localhost:3000`
- Load environment variables
- Enable API routes locally

### 3. Test API Endpoints
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔐 Security Features

✅ **Password Hashing** - bcryptjs with 10 rounds
✅ **JWT Authentication** - 7-day expiration
✅ **Input Validation** - Email format, password strength
✅ **Secure License Keys** - Crypto-generated 32-character keys
✅ **Protected Routes** - Authentication middleware
✅ **HTTPS Only** - Enforced in production
✅ **Environment Variables** - Sensitive data not in code

---

## 📊 Database Indexes (Recommended)

Create these indexes in MongoDB for better performance:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "purchases.key": 1 })
```

---

## 🎯 Frontend Integration

### Authentication
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('authToken', data.token);
```

### Protected Requests
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Purchase Flow
```javascript
// Stripe
const response = await fetch('/api/payment/stripe-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: user.email, plan: 'premium' })
});

const data = await response.json();
window.location.href = data.url; // Redirect to Stripe checkout
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0 for Vercel)
- Ensure database user has read/write permissions

### Vercel Deployment Issues
- Check environment variables are set in Vercel dashboard
- Verify API routes are in `/api` directory
- Check Vercel function logs for errors

### Payment Issues
- Test with Stripe test mode first
- Use PayPal sandbox for testing
- Check webhook endpoints are configured correctly
- Verify API keys are for correct environment (test/live)

---

## 📧 Email Integration (Optional)

To send license keys via email, integrate an email service:

### SendGrid Example:
```bash
npm install @sendgrid/mail
```

```javascript
// In api/payment/stripe-webhook.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@kiwitweaks.com',
  subject: 'Your KiwiTweaks License Key',
  html: `Your license key: ${licenseKey}`
});
```

---

## 📝 License Key Format

Format: `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`

Example: `A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6`

- 32 hexadecimal characters
- 8 groups of 4 characters
- Separated by hyphens
- Uppercase

---

## 🎉 You're Ready!

Your KiwiTweaks website now has:
- ✅ User registration and authentication
- ✅ Secure password storage
- ✅ JWT token-based sessions
- ✅ Stripe payment integration
- ✅ PayPal payment integration
- ✅ Automatic license key generation
- ✅ MongoDB database storage
- ✅ Deployed on Vercel

For support, check the API logs in Vercel dashboard or MongoDB Atlas.
