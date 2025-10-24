# 🚀 KiwiTweaks Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Setup ✅
- [ ] MongoDB Atlas cluster is running
- [ ] Database user created with correct permissions
- [ ] IP whitelist configured (0.0.0.0/0 for Vercel)
- [ ] Stripe account created and verified
- [ ] PayPal developer account set up
- [ ] All environment variables documented

### 2. Code Preparation ✅
- [ ] All dependencies installed (`npm install`)
- [ ] Code tested locally with `vercel dev`
- [ ] No console errors in browser
- [ ] All API endpoints working
- [ ] Payment flows tested

### 3. Vercel Setup ✅
- [ ] Vercel account created
- [ ] Project linked to Git repository (optional)
- [ ] Domain configured (if custom domain)

---

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

Add these variables:

```
MONGODB_URI = mongodb+srv://uprisekxwie_db_user:qmevMgf3T9NZJRkR@kiwitweaksdb.4jh9nv1.mongodb.net

JWT_SECRET = [Generate a random 64-character string]

STRIPE_SECRET_KEY = [From Stripe Dashboard]
STRIPE_PUBLISHABLE_KEY = pk_live_51SL85DPAav93iDQPS9DGfN3QTFjSdqPlAWUy567Z4jUXuxLO0OybGBS4LkckPb2lqk3O73vLODM1Xk08vulNkoTJ00YKMGzP3x
STRIPE_WEBHOOK_SECRET = [From Stripe Webhook Settings]

PAYPAL_CLIENT_ID = AfHir0qS1C-PrKUV2D1VcqAZ-JDTIA4KRpd40cdJkTojucgv40k-sfpnrpxJfoKKE9b5uszwJOk5qVfR
PAYPAL_CLIENT_SECRET = [From PayPal Developer Dashboard]

SITE_URL = https://your-domain.vercel.app
```

### Step 2: Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
vercel --prod

# Option 2: Push to Git (if connected)
git push origin main
```

### Step 3: Configure Stripe Webhook

1. Go to: **Stripe Dashboard → Developers → Webhooks**
2. Click "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/payment/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy "Signing secret"
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy: `vercel --prod`

### Step 4: Create MongoDB Indexes

Connect to MongoDB Atlas and run:

```javascript
use kiwitweaks

// Create unique index on email
db.users.createIndex({ "email": 1 }, { unique: true })

// Create index on license keys for faster lookups
db.users.createIndex({ "purchases.key": 1 })
```

---

## Post-Deployment Testing

### 1. Test Registration
- [ ] Go to `/auth.html`
- [ ] Create a new account
- [ ] Verify account created in MongoDB
- [ ] Verify JWT token stored in localStorage
- [ ] Verify redirect to home page works

### 2. Test Login
- [ ] Go to `/auth.html`
- [ ] Login with test account
- [ ] Verify JWT token stored
- [ ] Check browser console for errors

### 3. Test Stripe Payment
- [ ] Click "Purchase" button
- [ ] Select Stripe payment method
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify purchase added to MongoDB
- [ ] Verify license key generated
- [ ] Check webhook logs in Stripe

### 4. Test PayPal Payment
- [ ] Click "Purchase" button
- [ ] Select PayPal payment method
- [ ] Use PayPal sandbox account
- [ ] Complete payment
- [ ] Verify purchase added to MongoDB
- [ ] Verify license key generated

### 5. Test API Endpoints

```bash
# Test registration
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","username":"testuser"}'

# Test login
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Test profile (replace TOKEN with actual JWT)
curl https://your-domain.vercel.app/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Monitoring & Maintenance

### Check Vercel Logs
```bash
vercel logs [deployment-url]
```

### Monitor MongoDB
- Check MongoDB Atlas → Metrics
- Monitor connection count
- Check query performance
- Review slow queries

### Monitor Stripe
- Stripe Dashboard → Developers → Events
- Check webhook delivery status
- Review failed payments

### Monitor PayPal
- PayPal Developer Dashboard → Live
- Check transaction history
- Review disputes/chargebacks

---

## Troubleshooting

### Issue: API returns 500 errors
**Solution:**
- Check Vercel function logs
- Verify environment variables are set
- Check MongoDB connection string
- Verify database user permissions

### Issue: Stripe webhook not working
**Solution:**
- Verify webhook URL is correct
- Check STRIPE_WEBHOOK_SECRET is set
- Review Stripe webhook logs
- Test webhook with Stripe CLI

### Issue: MongoDB connection fails
**Solution:**
- Check IP whitelist (should be 0.0.0.0/0)
- Verify connection string is correct
- Check database user password
- Ensure cluster is running

### Issue: JWT token invalid
**Solution:**
- Check JWT_SECRET is set in Vercel
- Verify token is being sent in headers
- Check token expiration (7 days)
- Clear localStorage and login again

---

## Security Checklist

- [ ] All environment variables in Vercel (not in code)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Strong JWT secret (64+ characters)
- [ ] Password minimum 8 characters enforced
- [ ] MongoDB IP whitelist configured
- [ ] Stripe webhook signature verified
- [ ] PayPal orders validated before capture
- [ ] No API keys in client-side code
- [ ] CORS properly configured
- [ ] Rate limiting considered (optional)

---

## Backup & Recovery

### Database Backup
1. MongoDB Atlas → Clusters → Backup
2. Enable automated backups
3. Set backup frequency (daily recommended)

### Code Backup
1. Ensure code is in Git repository
2. Tag releases: `git tag v1.0.0`
3. Keep production branch separate

---

## Performance Optimization

### MongoDB
- [ ] Indexes created on frequently queried fields
- [ ] Connection pooling enabled (default in lib/mongodb.js)
- [ ] Query optimization reviewed

### Vercel
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Caching headers configured
- [ ] CDN enabled (automatic with Vercel)

---

## Support & Documentation

### User Documentation
- Create user guide for license activation
- FAQ page updated
- Support email configured

### Developer Documentation
- API documentation complete
- Code comments added
- README updated

---

## Launch Checklist

- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Stripe in live mode
- [ ] PayPal in live mode
- [ ] MongoDB indexes created
- [ ] Webhook configured and tested
- [ ] Domain SSL certificate active
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Support channels ready
- [ ] Launch announcement prepared

---

## 🎉 Ready to Launch!

Once all items are checked, your KiwiTweaks platform is production-ready!

### Quick Commands

```bash
# Deploy to production
vercel --prod

# Check logs
vercel logs

# List deployments
vercel list

# Roll back (if needed)
vercel rollback [deployment-id]
```

Good luck with your launch! 🚀
