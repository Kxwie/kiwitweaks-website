# Reduce Serverless Functions to 12

## Current Status: 13 Functions (1 over limit)

---

## ✅ **Solution: Delete NextAuth Endpoint**

You're using **custom JWT authentication** (login.js, register.js), so NextAuth is **not needed**.

### **File to Delete:**

```
api/auth/[...nextauth].js
```

**Why you can delete it:**
- ✅ You have custom `/api/auth/login`
- ✅ You have custom `/api/auth/register`
- ✅ Using JWT tokens directly
- ✅ NextAuth is unused dependency

---

## **How to Delete (Windows):**

### **Option 1: File Explorer**
1. Navigate to: `api\auth\`
2. Find file: `[...nextauth].js`
3. Right-click → Delete

### **Option 2: PowerShell**
```powershell
cd "c:\Users\babad\Downloads\kiwitweaks-website-v2 newer1"
Remove-Item "api\auth\``[...nextauth``].js"
```

### **Option 3: Git Bash**
```bash
cd "c:/Users/babad/Downloads/kiwitweaks-website-v2 newer1"
rm "api/auth/[...nextauth].js"
```

---

## **After Deletion - You'll Have 12 Functions:**

### **Authentication (4):**
1. ✅ `/api/auth/login.js` - Login endpoint
2. ✅ `/api/auth/register.js` - Registration
3. ✅ `/api/auth/verify-email.js` - Email verification
4. ✅ `/api/auth/resend-verification.js` - Resend verification

### **Password Reset (2):**
5. ✅ `/api/auth/password-reset-request.js` - Request reset
6. ✅ `/api/auth/password-reset-confirm.js` - Confirm reset

### **User (1):**
7. ✅ `/api/user/profile.js` - Get user profile

### **KeyAuth (1):**
8. ✅ `/api/keyauth/generate-license.js` - Generate licenses

### **Payments (4):**
9. ✅ `/api/payment/stripe-checkout.js` - Stripe checkout
10. ✅ `/api/payment/stripe-webhook.js` - Stripe webhooks
11. ✅ `/api/payment/paypal-create.js` - PayPal create order
12. ✅ `/api/payment/paypal-capture.js` - PayPal capture payment

**Total: 12 functions** ✅

---

## **Alternative: Consolidate Password Reset (If Needed)**

If you want even more room, you could combine the two password reset endpoints:

### **Create: `/api/auth/password-reset.js`**

```javascript
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    // Check if it's a request or confirmation
    if (req.body.token) {
      // Handle password-reset-confirm logic
      return handleConfirm(req, res);
    } else {
      // Handle password-reset-request logic
      return handleRequest(req, res);
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
```

**Then delete:**
- `api/auth/password-reset-request.js`
- `api/auth/password-reset-confirm.js`

This would give you **11 functions** with 1 slot free for future use.

---

## **Recommended: Just Delete NextAuth**

The simplest solution is to **delete `[...nextauth].js`** since it's completely unused.

**After deletion:**
- ✅ Exactly 12 functions
- ✅ All essential endpoints remain
- ✅ No functionality lost
- ✅ Deploys successfully to Vercel

---

## **Verify After Deletion:**

```powershell
# Count API files
(Get-ChildItem -Path "api" -Recurse -Filter "*.js").Count
```

Should return: **12**

---

## ✅ **Summary**

**Action Required:**
1. Delete `api/auth/[...nextauth].js`
2. Verify you have 12 functions
3. Push to Vercel
4. Deploy successfully

**No code changes needed** - just delete the unused file!
