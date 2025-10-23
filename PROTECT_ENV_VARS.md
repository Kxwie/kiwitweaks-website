# 🔒 PROTECT VERCEL ENVIRONMENT VARIABLES FROM DELETION

## ⚠️ CRITICAL: Follow These Steps NOW!

Your environment variables keep getting deleted. Here's how to **permanently protect** them:

---

## **Step 1: Lock Environment Variables with Vercel CLI**

### **Install Vercel CLI:**
```bash
npm install -g vercel
```

### **Link Your Project:**
```bash
cd kiwitweaks-website-main
vercel link
```

### **Add Variables via CLI (They're More Permanent):**
```bash
# Production environment
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
vercel env add PAYPAL_CLIENT_SECRET production

# Preview environment
vercel env add MONGODB_URI preview
vercel env add JWT_SECRET preview
vercel env add NEXTAUTH_SECRET preview

# Development environment  
vercel env add MONGODB_URI development
vercel env add JWT_SECRET development
vercel env add NEXTAUTH_SECRET development
```

---

## **Step 2: Create .env.local (Local Backup)**

```bash
# Copy example
cp .env.example .env.local

# Edit with your REAL values
nano .env.local
```

**Add to .gitignore:**
```
.env.local
.env*.local
```

---

## **Step 3: Enable Vercel Project Protection**

### **In Vercel Dashboard:**

1. Go to **Project Settings** → **General**
2. Scroll to **Protection**
3. Enable these:
   - ✅ **Deployment Protection** → Require approval for deploys
   - ✅ **Production Branch Protection** → Prevent accidental changes
   - ✅ **Environment Variables Lock** (if available)

4. Go to **Settings** → **Environment Variables**
5. For EACH variable, click the **⋮** menu
6. Select **"Lock Variable"** or **"Protect"**
7. This prevents accidental deletion

---

## **Step 4: Use Vercel Project Tokens (Most Secure)**

### **Create a Project Token:**

1. Dashboard → Settings → **Tokens**
2. Click **"Create Token"**
3. Name: `kiwitweaks-env-protection`
4. Scope: **Project-specific**
5. Permissions: **Read-only** or **Read-write**
6. Copy the token immediately (you won't see it again)

### **Add Token to GitHub Secrets:**

1. GitHub repo → Settings → Secrets → Actions
2. New repository secret
3. Name: `VERCEL_TOKEN`
4. Value: (paste your token)

---

## **Step 5: Create Automated Backup Script**

Save this as `backup-env.js`:

```javascript
const { exec } = require('child_process');
const fs = require('fs');

// Fetch all environment variables
exec('vercel env ls --json', (error, stdout) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const envVars = JSON.parse(stdout);
  const backup = {
    timestamp: new Date().toISOString(),
    variables: envVars
  };
  
  // Save backup
  fs.writeFileSync(
    `env-backup-${Date.now()}.json`,
    JSON.stringify(backup, null, 2)
  );
  
  console.log('✅ Environment variables backed up!');
});
```

**Run weekly:**
```bash
node backup-env.js
```

---

## **Step 6: Add to package.json Scripts**

```json
{
  "scripts": {
    "env:pull": "vercel env pull .env.local",
    "env:backup": "node backup-env.js",
    "env:verify": "vercel env ls"
  }
}
```

**Run after any changes:**
```bash
npm run env:verify
```

---

## **Step 7: Team Access Control**

If you have team members:

1. Dashboard → Settings → **Team**
2. Set permissions to **"Member"** (not Owner)
3. Only YOU should be **"Owner"**
4. Members can't delete environment variables

---

## **Step 8: Enable Vercel Audit Log**

1. Dashboard → Settings → **Audit Log**
2. Enable logging
3. You'll get notified of ANY changes
4. Including environment variable deletions

---

## **Step 9: Monitor with GitHub Actions**

Create `.github/workflows/check-env.yml`:

```yaml
name: Check Environment Variables

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  check-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm i -g vercel
      
      - name: Check Variables
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel env ls | tee env-check.txt
          
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: env-check-report
          path: env-check.txt
```

---

## **Step 10: Create Restoration Script**

Save as `restore-env.js`:

```javascript
const { execSync } = require('child_process');

const vars = {
  MONGODB_URI: 'your-mongodb-uri',
  JWT_SECRET: 'your-jwt-secret',
  NEXTAUTH_SECRET: 'your-nextauth-secret',
  STRIPE_SECRET_KEY: 'your-stripe-key',
  PAYPAL_CLIENT_SECRET: 'your-paypal-secret',
  // Add all your variables
};

Object.entries(vars).forEach(([key, value]) => {
  try {
    execSync(`vercel env add ${key} production`, {
      input: value,
      stdio: 'inherit'
    });
    console.log(`✅ Added ${key}`);
  } catch (error) {
    console.error(`❌ Failed to add ${key}`);
  }
});
```

---

## **🚨 EMERGENCY: If Variables Are Deleted**

### **Quick Restore:**

```bash
# 1. Pull from backup
npm run env:pull

# 2. Or restore from script
node restore-env.js

# 3. Or manually re-add
vercel env add MONGODB_URI production
# (paste your value)

# 4. Redeploy
vercel --prod
```

---

## **✅ Verification Checklist**

After setup, verify:

- [ ] Can list all env vars: `vercel env ls`
- [ ] Variables show in Vercel dashboard
- [ ] Backup file exists: `env-backup-*.json`
- [ ] GitHub Actions workflow exists
- [ ] Team permissions set correctly
- [ ] Audit log enabled
- [ ] Local .env.local has all values
- [ ] .gitignore includes .env.local

---

## **📊 Your Current Required Variables**

```bash
# Core
MONGODB_URI=mongodb+srv://...
JWT_SECRET=(32+ chars)
NEXTAUTH_SECRET=(32+ chars)
NEXTAUTH_URL=https://your-domain.vercel.app

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Site
SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

---

## **🔐 Security Best Practices**

1. **Never** commit .env.local
2. **Always** use Vercel CLI for production
3. **Rotate** secrets every 90 days
4. **Backup** before making changes
5. **Monitor** audit logs weekly
6. **Restrict** team access
7. **Use** different secrets for dev/prod

---

## **💡 Pro Tips**

### **Use 1Password/LastPass:**
Store all env vars in a secure note as backup

### **Use Environment Variable Templates:**
Vercel can read from .env.example automatically

### **Enable Vercel Notifications:**
Get emailed when variables change

### **Use Vercel API:**
Automate backups with Vercel REST API

---

## **📞 If Nothing Works**

Contact Vercel Support:
```
https://vercel.com/support
Subject: "Environment variables keep getting deleted"
Include: Project name, timestamps, affected variables
```

---

**🎯 Once you complete these steps, your environment variables will be PROTECTED!**

Run this NOW:
```bash
vercel env ls > env-backup-$(date +%Y%m%d).txt
```

This creates a timestamped backup you can restore from!
