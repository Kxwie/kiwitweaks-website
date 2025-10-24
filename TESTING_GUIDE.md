# 🧪 KiwiTweaks Complete Testing Guide

## ✅ Pre-Deployment Checklist

### Environment Variables in Vercel:
- [x] JWT_SECRET
- [x] MONGODB_URI
- [x] STRIPE_PUBLISHABLE_KEY
- [x] STRIPE_WEBHOOK_SECRET
- [x] STRIPE_SECRET_KEY (verify this exists!)
- [x] PAYPAL_CLIENT_ID
- [x] PAYPAL_CLIENT_SECRET

---

## 🚀 Deployment

Run this command:
```bash
vercel --prod
```

Wait for deployment to complete. You'll get a URL like:
```
https://kiwi-tweaks.vercel.app
```

---

## 🧪 Test Plan

### Test 1: Website Loads ✅
1. Open: `https://kiwi-tweaks.vercel.app`
2. Check that homepage loads without errors
3. Open browser console (F12) - should be no red errors
4. Navigation should work (all links clickable)

**Expected:** Homepage loads, no console errors

---

### Test 2: Registration ✅
1. Go to: `https://kiwi-tweaks.vercel.app/auth.html`
2. Click "Sign up" tab
3. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
   - ✅ Accept Terms
4. Click "Create Account"

**Expected:**
- ✅ Green success message: "Account created successfully!"
- ✅ Redirects to homepage
- ✅ Check MongoDB Atlas - new user should appear

**MongoDB Check:**
```javascript
// In MongoDB Atlas → Browse Collections → kiwitweaks → users
{
  "_id": ObjectId("..."),
  "email": "test@example.com",
  "password": "$2a$10$...",  // Hashed
  "username": "testuser",
  "createdAt": ISODate("..."),
  "purchases": []
}
```

---

### Test 3: Login ✅
1. Go to: `https://kiwi-tweaks.vercel.app/auth.html`
2. Enter:
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. Click "Login"

**Expected:**
- ✅ Green success message: "Login successful!"
- ✅ Redirects to homepage
- ✅ Check localStorage (F12 → Application → Local Storage):
  - `authToken` should be present (JWT token)
  - `user` should be present (user data)

---

### Test 4: Stripe Payment (Test Mode) ✅

1. Go to: `https://kiwi-tweaks.vercel.app`
2. Click "Purchase" button
3. In payment modal, click "Purchase Now" for Premium
4. Select payment method: **Stripe**
5. Should redirect to Stripe Checkout
6. Use test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
7. Complete payment

**Expected:**
- ✅ Stripe checkout page loads
- ✅ Payment processes successfully
- ✅ Redirects to success page
- ✅ Check MongoDB - purchase added:
  ```javascript
  {
    "purchases": [{
      "product": "Premium License",
      "key": "",
      "date": ISODate("..."),
      "stripeSessionId": "cs_test_...",
      "amount": 29.99,
      "currency": "USD"
    }]
  }
  ```

**Verify Webhook:**
- Go to Stripe Dashboard → Developers → Webhooks
- Click your webhook endpoint
- Check "Events" tab - should show `checkout.session.completed`
- Status should be "Succeeded"

---

### Test 5: PayPal Payment (Sandbox) ✅

1. Go to: `https://kiwi-tweaks.vercel.app`
2. Click "Purchase" button
3. Click "Purchase Now" for Premium
4. Select payment method: **PayPal**
5. PayPal button should appear
6. Use PayPal sandbox credentials
7. Complete payment

**Expected:**
- ✅ PayPal buttons render
- ✅ Payment processes
- ✅ Success message appears
- ✅ Check MongoDB - purchase added:
  ```javascript
  {
    "purchases": [{
      "product": "Premium License",
      "key": "",
      "date": ISODate("..."),
      "paypalOrderId": "ORDER_...",
      "amount": 29.99,
      "currency": "USD"
    }]
  }
  ```

---

### Test 6: API Endpoints ✅

#### Test Registration API:
```bash
curl -X POST https://kiwi-tweaks.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"apitest@test.com","password":"Test123!","username":"apitest"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "apitest@test.com",
    "username": "apitest"
  }
}
```

#### Test Login API:
```bash
curl -X POST https://kiwi-tweaks.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"apitest@test.com","password":"Test123!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "apitest@test.com",
    "username": "apitest",
    "purchases": []
  }
}
```

#### Test Profile API:
```bash
# Replace YOUR_TOKEN with actual JWT token from login
curl https://kiwi-tweaks.vercel.app/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "apitest@test.com",
    "username": "apitest",
    "createdAt": "...",
    "purchases": []
  }
}
```

---

## 🔍 Vercel Logs Check

1. Go to Vercel Dashboard
2. Click your project
3. Go to "Logs" tab
4. Filter by "Errors" - should be minimal/none
5. Check for any 500 errors in Functions

---

## 🗄️ MongoDB Check

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Select database: `kiwitweaks`
4. Collection: `users`
5. Verify test users exist
6. Verify purchases are recorded

---

## 🎯 Success Criteria

All tests should pass:
- ✅ Website loads without errors
- ✅ Registration creates user in MongoDB
- ✅ Login returns JWT token
- ✅ Stripe payment adds purchase to database
- ✅ PayPal payment adds purchase to database
- ✅ Stripe webhook receives events
- ✅ API endpoints return correct responses
- ✅ No critical errors in Vercel logs

---

## 🐛 Troubleshooting

### Problem: "Authentication required" error
**Solution:** Check JWT_SECRET is set in Vercel environment variables

### Problem: Stripe webhook fails
**Solution:** 
1. Verify STRIPE_WEBHOOK_SECRET is set
2. Check webhook URL is correct in Stripe Dashboard
3. Review Stripe webhook logs for details

### Problem: MongoDB connection fails
**Solution:**
1. Check MONGODB_URI is correct
2. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)
3. Check database user permissions

### Problem: Payment doesn't record in database
**Solution:**
1. Check Vercel function logs
2. Verify STRIPE_SECRET_KEY exists
3. Test webhook manually from Stripe Dashboard

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

[ ] Test 1: Website Loads
[ ] Test 2: Registration
[ ] Test 3: Login
[ ] Test 4: Stripe Payment
[ ] Test 5: PayPal Payment
[ ] Test 6: API Endpoints

Notes:
_______________________________
_______________________________
_______________________________

Status: ⭐ PASSED / ❌ FAILED
```

---

## 🎉 Ready for Production!

Once all tests pass, you're ready to:
1. ✅ Switch Stripe to live mode
2. ✅ Switch PayPal to live mode
3. ✅ Update webhook URLs
4. ✅ Announce launch!

**Your live site:** https://kiwi-tweaks.vercel.app
