# 🚀 Production Deployment Quick Guide

## ⏱️ 5-Minute Security Setup

### Step 1: Generate Secrets (2 minutes)
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 2: Update server/.env (2 minutes)
```env
NODE_ENV=production
JWT_SECRET=<paste-first-secret-here>
JWT_REFRESH_SECRET=<paste-second-secret-here>
MONGODB_URI=<your-mongodb-atlas-uri>
ALLOWED_ORIGINS=https://yourdomain.com
ADMIN_PASSWORD=<strong-password-12+chars>
RAZORPAY_KEY_ID=rzp_live_<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
```

### Step 3: Update client/.env.local (1 minute)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_<your-key>
```

### Step 4: Deploy
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Build
cd server && npm run build
cd ../client && npm run build

# Start
cd server && npm start
cd ../client && npm start
```

---

## ✅ Security Checklist

Before going live, verify:

- [x] Strong JWT secrets generated and set
- [x] ADMIN_PASSWORD changed from default
- [x] CORS limited to your domain(s) only
- [x] NODE_ENV=production
- [x] MongoDB uses authentication
- [x] Razorpay LIVE keys (not test)
- [x] HTTPS/SSL enabled
- [x] .env files NOT in git

---

## 🆘 Quick Troubleshooting

### "Too many requests" error
- Normal! Rate limiting is working
- Wait 15 minutes or whitelist IP if needed

### CORS errors in production
- Check `ALLOWED_ORIGINS` includes your frontend domain
- Ensure protocol matches (http vs https)

### "Authentication required"
- Check JWT_SECRET matches between deployments
- Verify tokens aren't expired (7 days default)

### Admin can't login
- Verify ADMIN_PASSWORD in .env
- Check MongoDB connection
- Run: `cd server && ts-node src/utils/createAdmin.ts`

---

## 📞 Help

See [SECURITY.md](SECURITY.md) for full documentation.
