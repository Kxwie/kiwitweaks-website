# 🔧 Fix Vercel Environment Variables Being Deleted

## 🚨 Problem
Environment variables (except PAYPAL_CLIENT_SECRET) are being deleted from Vercel.

---

## ✅ Solution: Re-add All Variables

### **Step 1: Go to Vercel Dashboard**
1. Open https://vercel.com/dashboard
2. Select your **kiwitweaks-website** project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar

---

### **Step 2: Add Each Variable**

Click **"Add New"** for EACH variable below:

#### **1. Database:**
```
Name: MONGODB_URI
Value: mongodb+srv://uprisekxwie_db_user:qmevMgf3T9NZJRkR@kiwitweaksdb.4jh9nv1.mongodb.net
Environment: Production, Preview, Development
```

#### **2. NextAuth:**
```
Name: NEXTAUTH_URL
Value: https://kiwitweaks-website.vercel.app (your actual domain)
Environment: Production

Name: NEXTAUTH_URL  
Value: http://localhost:3000
Environment: Development
```

```
Name: NEXTAUTH_SECRET
Value: (generate using: openssl rand -base64 32)
Environment: Production, Preview, Development
```

#### **3. JWT:**
```
Name: JWT_SECRET
Value: (generate using: openssl rand -base64 32)
Environment: Production, Preview, Development
```

#### **4. Stripe:**
```
Name: STRIPE_SECRET_KEY
Value: sk_live_xxxxx (your actual secret key)
Environment: Production

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_51SL85DPAav93iDQPS9DGfN3QTFjSdqPlAWUy567Z4jUXuxLO0OybGBS4LkckPb2lqk3O73vLODM1Xk08vulNkoTJ00YKMGzP3x
Environment: Production, Preview, Development
```

#### **5. PayPal:**
```
Name: PAYPAL_CLIENT_ID
Value: AfHir0qS1C-PrKUV2D1VcqAZ-JDTIA4KRpd40cdJkTojucgv40k-sfpnrpxJfoKKE9b5uszwJOk5qVfR
Environment: Production, Preview, Development

Name: PAYPAL_CLIENT_SECRET
Value: (your actual PayPal secret)
Environment: Production, Preview, Development
```

#### **6. OAuth Providers (Optional - for NextAuth):**
```
Name: GOOGLE_CLIENT_ID
Value: (from Google Cloud Console)
Environment: Production, Preview, Development

Name: GOOGLE_CLIENT_SECRET
Value: (from Google Cloud Console)
Environment: Production, Preview, Development

Name: DISCORD_CLIENT_ID
Value: (from Discord Developer Portal)
Environment: Production, Preview, Development

Name: DISCORD_CLIENT_SECRET
Value: (from Discord Developer Portal)
Environment: Production, Preview, Development
```

---

### **Step 3: Why Are They Being Deleted?**

Possible reasons:
1. **Accidental deletion** - Someone clicked delete
2. **Project recreation** - If you deleted/recreated the project
3. **Team permissions** - Someone with access removed them
4. **Vercel glitch** - Rare but possible

---

### **Step 4: Prevent Future Deletion**

#### **Option A: Use Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Add variables via CLI (they're saved)
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
# ... etc for all variables
```

#### **Option B: Environment Variable Templates**
1. In Vercel Dashboard → Settings → Environment Variables
2. Click **"Add from .env.example"**
3. Vercel will read your `.env.example` file
4. Fill in the actual values

#### **Option C: Store Backup**
Save all your environment variables in a **password manager**:
- 1Password
- LastPass
- Bitwarden

---

### **Step 5: Test After Re-adding**

After adding all variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Check if build succeeds
4. Test authentication
5. Test payment processing

---

## 🔒 Security Best Practices

### **DO:**
- ✅ Use different secrets for Production/Development
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use strong random strings (32+ characters)
- ✅ Store backup in password manager
- ✅ Use environment-specific values

### **DON'T:**
- ❌ Commit secrets to git
- ❌ Share secrets in Slack/Discord
- ❌ Use same secret for multiple projects
- ❌ Use predictable secrets like "password123"
- ❌ Store secrets in code comments

---

## 🎯 Quick Copy-Paste Commands

### Generate Strong Secrets:
```bash
# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -base64 32
```

### Verify Variables Are Set:
```bash
vercel env ls
```

---

## 📞 If Variables Keep Getting Deleted

Contact Vercel Support:
1. Go to https://vercel.com/support
2. Describe the issue
3. Mention which variables are affected
4. Ask them to check audit logs

---

## ✅ Checklist

After fixing, verify:
- [ ] All environment variables show in Vercel dashboard
- [ ] Variables are set for correct environments
- [ ] Redeploy succeeded
- [ ] Authentication works
- [ ] Payments work
- [ ] No console errors
- [ ] Database connection works

---

**Your variables are now secure and properly configured!** 🎉
