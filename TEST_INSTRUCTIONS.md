# Testing Instructions

## Quick Test - Subscription & Admin Features

### 1. Test Admin Access (No Subscription Required)
**Admin Credentials:**
- Email: `admin@propertybroker.com`
- Password: `Admin@123`

**Steps:**
1. Open http://localhost:3000/login
2. Login with admin credentials
3. Navigate to http://localhost:3000/subscription
4. You should see "Admin Access - unlimited access" message
5. Click "Go to Properties" - should work without subscription!

### 2. Test Regular User Subscription (Test Mode)
**Steps:**
1. Logout from admin account
2. Register a new user at http://localhost:3000/register
3. After registration, go to http://localhost:3000/subscription
4. You should see a yellow banner: "🧪 Test Mode: Subscriptions will be created instantly"
5. Click "Subscribe" on any plan
6. Subscription should be created instantly (no payment required)
7. You should be redirected to properties page

### 3. Test Razorpay Integration (Production Mode)
**Prerequisites:**
- Get Razorpay test keys from https://dashboard.razorpay.com/
- Update environment variables (see below)

**Update Environment Variables:**

Server (.env):
```
RAZORPAY_KEY_ID=rzp_test_your_actual_key
RAZORPAY_KEY_SECRET=your_actual_secret
```

Client (.env.local):
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key
```

**Restart servers:**
```bash
# Stop current servers (Ctrl+C in both terminals)

# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

**Test Payment:**
1. Register a new user or login
2. Go to subscription page
3. Yellow test mode banner should NOT appear
4. Click "Subscribe" on any plan
5. Razorpay payment modal should open
6. Use test card: 4111 1111 1111 1111, CVV: 123, Expiry: 12/25
7. Complete payment
8. Should see success message and redirect to properties

## What Was Fixed

### 1. Admin Subscription Bypass ✅
- Admins no longer need subscriptions
- Automatically detected by role
- Works on both frontend and backend

### 2. Payment Gateway Integration ✅
- Razorpay fully integrated
- Test mode for development (no keys needed)
- Production mode with real payments
- Proper error handling

### 3. Subscribe Button Fixed ✅
- Now creates subscriptions correctly
- Shows loading states
- Handles payment modal properly
- Better error messages

### 4. Environment Configuration ✅
- Created .env files with examples
- Automatic test mode when keys not configured
- Clear separation of test/production modes

## Current Status

**Running Servers:**
- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:3000 (needs restart)
- MongoDB: Connected ✅

**Next Steps:**
1. Restart frontend server to load new .env.local file
2. Test admin login and access
3. Test user subscription in test mode
4. (Optional) Get Razorpay keys for real payment testing

## Troubleshooting

### Frontend not picking up .env.local changes
```bash
cd client
# Stop the server (Ctrl+C)
rm -rf .next
npm run dev
```

### Backend environment issues
```bash
cd server
# Stop the server (Ctrl+C)
npm run dev
```

### Check if environment variables are loaded
**Backend:**
```bash
cd server
node -e "require('dotenv').config(); console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);"
```

**Frontend:**
Open browser console and type:
```javascript
console.log('Razorpay Key:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
```
