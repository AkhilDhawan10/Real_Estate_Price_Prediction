# Payment Gateway Setup Guide

## Overview
This application uses **Razorpay** as the payment gateway for handling subscription payments. The system supports both test mode (for development) and production mode.

## Admin Users
**Important:** Admin users do NOT require a subscription to access the system. The admin bypass is already implemented in:
- Backend: `subscription.middleware.ts` - Admins skip subscription checks
- Frontend: `subscription/page.tsx` - Shows "Admin Access" instead of subscription plans

### Default Admin Credentials
- Email: `admin@propertybroker.com`
- Password: `Admin@123`

## Development Mode (Test Subscriptions)

### Quick Start - No Payment Gateway Required
For local development and testing, the system automatically uses **test mode** when Razorpay keys are not configured.

**What happens in test mode:**
- Subscribe button creates a subscription instantly
- No actual payment is required
- No Razorpay account needed
- Perfect for testing the application flow

**The system is already configured for test mode!** Just click the Subscribe button and it will work.

## Production Mode (Real Payments with Razorpay)

### Step 1: Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a free account (no charges for test mode)
3. Complete KYC verification (required for live mode)

### Step 2: Get API Keys

#### For Testing (Test Mode Keys)
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Under **Test Mode**, click **Generate Test Key**
4. Copy the **Key ID** (starts with `rzp_test_`)
5. Copy the **Key Secret** (keep this secure!)

#### For Production (Live Mode Keys)
1. Complete KYC verification on Razorpay
2. Navigate to **Settings** → **API Keys**
3. Switch to **Live Mode**
4. Click **Generate Live Key**
5. Copy the **Key ID** (starts with `rzp_live_`)
6. Copy the **Key Secret** (keep this secure!)

### Step 3: Update Environment Variables

#### Server (.env file in `/server` directory)
```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

#### Client (.env.local file in `/client` directory)
```bash
# Razorpay Public Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
```

**Important:** 
- Never commit the `.env` files to version control
- Never share your Key Secret publicly
- Use test keys for development, live keys only in production

### Step 4: Restart Both Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Testing Payment Flow

### Test Mode Payment (Using Razorpay Test Keys)
1. Click on any subscription plan
2. Razorpay checkout will open
3. Use test card details:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits (e.g., 123)
   - **Expiry:** Any future date (e.g., 12/25)
   - **Name:** Any name

4. Click Pay
5. Payment will be processed instantly
6. You'll be redirected to the properties page

### Test Card Numbers
Razorpay provides various test cards:
- **Success:** 4111 1111 1111 1111
- **Card declined:** 4000 0000 0000 0002
- **Insufficient funds:** 4000 0000 0000 9995
- **Invalid CVV:** Use any card with CVV 111

[Full list of test cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

## Payment Plans

### Monthly Plan
- **Price:** ₹999/month
- **Features:** 
  - Access to all properties
  - Monthly updates
  - Email support

### Quarterly Plan
- **Price:** ₹2,499/3 months
- **Savings:** ₹498 (compared to 3 monthly plans)
- **Features:**
  - Access to all properties
  - Monthly updates
  - Priority support
  - Best value

## Troubleshooting

### Subscribe Button Not Working
1. **Check console for errors** (F12 in browser)
2. **Verify environment variables** are set correctly
3. **In test mode:** Subscription should be created instantly without Razorpay
4. **In production mode:** Razorpay modal should appear

### Payment Gateway Not Loading
- Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in client `.env.local`
- Verify the key starts with `rzp_test_` or `rzp_live_`
- Check browser console for script loading errors
- Ensure internet connection is active

### Payment Verification Failed
- Check if `RAZORPAY_KEY_SECRET` matches the Key ID in server `.env`
- Verify both keys are from the same mode (test or live)
- Check server logs for detailed error messages

### Admin Can't Access Without Subscription
- This is now fixed! Admins bypass subscription checks
- Login with admin credentials to verify
- Check the user role in the database is set to 'admin'

## Security Best Practices

1. **Never expose Key Secret** - It should only be in server .env file
2. **Use test keys for development** - Switch to live keys only in production
3. **Enable webhook signatures** - For production, set up Razorpay webhooks
4. **Monitor transactions** - Regularly check Razorpay dashboard for suspicious activity
5. **Keep dependencies updated** - Regularly update the Razorpay SDK

## Webhook Setup (Optional - For Production)

Webhooks notify your server about payment events (success, failure, refund, etc.)

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`, `subscription.charged`
4. Save the webhook secret
5. Implement webhook handler in your backend (not included in current version)

## Support

### Razorpay Support
- [Documentation](https://razorpay.com/docs/)
- [Support Portal](https://razorpay.com/support/)
- Email: support@razorpay.com

### Application Support
- Check server logs: `cd server && npm run dev`
- Check browser console: F12 → Console tab
- Review environment variables setup
- Ensure MongoDB is running

## Current Implementation Status

✅ **Completed:**
- Admin bypass for subscription requirements
- Test mode for development (no Razorpay needed)
- Razorpay payment gateway integration
- Payment verification
- Subscription activation
- Auto-deactivation of expired subscriptions

🔄 **Optional Enhancements:**
- Webhook integration for automatic payment updates
- Subscription renewal reminders
- Payment history page
- Invoice generation
- Refund handling
