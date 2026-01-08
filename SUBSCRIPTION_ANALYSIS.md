# Subscription System Analysis & Security Report

## Current Subscription Management Overview

### Architecture
Your project uses **Razorpay** payment gateway with a dual-mode system:
1. **Test Mode**: For development - creates subscriptions without payment
2. **Production Mode**: Real payment processing via Razorpay

---

## 🔍 Current Implementation Analysis

### 1. **Payment Flow**

#### Test Mode (Development)
```
User clicks Subscribe → Frontend detects no Razorpay keys →
Calls /subscriptions/create-test → Backend creates subscription →
Redirects to properties page
```

**Current State**: ✅ Working
- Blocked in production via `NODE_ENV` check
- Route: `POST /subscriptions/create-test`
- Creates subscription instantly without payment

#### Production Mode (Real Payments)
```
User clicks Subscribe → Frontend calls /subscriptions/create-order →
Backend creates Razorpay order → Opens Razorpay checkout modal →
User completes payment → Razorpay calls handler →
Frontend calls /subscriptions/verify-payment →
Backend verifies signature → Creates subscription →
User gets access
```

**Current State**: ⚠️ **REQUIRES CONFIGURATION**

---

## 🔐 Security Analysis

### ✅ **Secure Aspects**

1. **Signature Verification** (Line 117-124 in subscription.controller.ts)
   ```typescript
   const text = `${orderId}|${paymentId}`;
   const generatedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
     .update(text)
     .digest('hex');
   
   if (generatedSignature !== signature) {
     res.status(400).json({ message: 'Invalid payment signature' });
     return;
   }
   ```
   - ✅ Uses HMAC SHA256 with secret key
   - ✅ Prevents payment tampering
   - ✅ Follows Razorpay security standards

2. **Payment ID Uniqueness**
   ```typescript
   paymentId: {
     type: String,
     required: true,
     unique: true, // ✅ Prevents duplicate payments
   }
   ```

3. **Server-Side Validation**
   - ✅ All payment verification happens on backend
   - ✅ Frontend cannot bypass payment checks
   - ✅ Secrets stored in environment variables only

4. **Test Mode Protection**
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     res.status(403).json({ message: 'Not allowed in production' });
     return;
   }
   ```
   - ✅ Test subscription route blocked in production

---

### ⚠️ **Security Concerns & Issues**

#### 1. **TIME MANAGEMENT - CRITICAL ISSUE** 🚨

**Problem**: Client-side time used for expiry calculation
```typescript
// Line 136-141 in subscription.controller.ts
const startDate = new Date(); // ❌ Uses server's current time
const expiryDate = new Date();
if (planType === 'monthly') {
  expiryDate.setMonth(expiryDate.getMonth() + 1); // ❌ JavaScript date manipulation
}
```

**Why This Is Dangerous**:
- ❌ JavaScript `setMonth()` has inconsistent behavior with month boundaries
- ❌ Doesn't account for timezone differences
- ❌ Server time could be misconfigured
- ❌ Leap years/daylight saving not properly handled
- ❌ Vulnerable if server time is manipulated

**Example Bug**:
```javascript
// If user subscribes on Jan 31st
const date = new Date('2026-01-31');
date.setMonth(date.getMonth() + 1); // Results in March 3rd, not Feb 28th!
```

**Impact**: 
- Users could get incorrect subscription periods
- Monthly subscriptions might give 28-31 days instead of exactly 30 days
- Timezone issues could cause premature expiry

#### 2. **Expiry Check Timing Issue** ⚠️

**Problem**: Reactive expiry checking only
```typescript
// In getSubscription (Line 217-224)
const isExpired = new Date() > subscription.expiryDate;
if (isExpired) {
  await Subscription.updateOne(
    { _id: subscription._id },
    { isActive: false }
  );
}
```

**Issues**:
- ❌ Subscriptions only marked inactive when user tries to access
- ❌ No proactive expiry management
- ❌ User could theoretically use expired subscription if they don't trigger the check

#### 3. **Missing Payment Webhook Verification** ⚠️

**Problem**: No webhook endpoint to receive Razorpay payment events
- If user closes browser after payment but before verification
- Payment succeeds but subscription not created
- Requires manual intervention

#### 4. **No Refund Handling** ⚠️

**Problem**: No logic for handling payment failures or refunds
- If payment succeeds but subscription creation fails
- User charged but no subscription
- Manual database fixes required

---

## 🛠️ Required Fixes for Production

### Fix 1: Safe Time Management

Replace JavaScript date manipulation with proper libraries:

```typescript
// Install: npm install date-fns

import { addMonths, addDays, startOfDay } from 'date-fns';

// SAFE approach
const startDate = startOfDay(new Date()); // Normalize to midnight UTC
const expiryDate = planType === 'monthly' 
  ? addMonths(startDate, 1)
  : addMonths(startDate, 3);

// Or use fixed days for consistency
const expiryDate = planType === 'monthly'
  ? addDays(startDate, 30)
  : addDays(startDate, 90);
```

### Fix 2: Add Cron Job for Expiry Management

```typescript
// Install: npm install node-cron

import cron from 'node-cron';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  await Subscription.updateMany(
    {
      isActive: true,
      expiryDate: { $lt: new Date() }
    },
    { isActive: false }
  );
});
```

### Fix 3: Add Razorpay Webhook Handler

```typescript
// New route: POST /webhooks/razorpay
export const handleWebhook = async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  // Verify webhook signature
  const generated = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  if (signature !== generated) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const event = req.body.event;
  
  if (event === 'payment.captured') {
    // Create subscription if not exists
  } else if (event === 'payment.failed') {
    // Send failure notification
  }
  
  res.json({ status: 'ok' });
};
```

---

## 🚀 Production Setup Steps

### Step 1: Get Razorpay Production Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC verification (mandatory for live mode)
3. Go to **Settings** → **API Keys**
4. Switch to **Live Mode**
5. Generate Live Keys (starts with `rzp_live_`)
6. Copy Key ID and Key Secret

### Step 2: Configure Environment Variables

**Server (.env)**:
```bash
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Client (.env.local)**:
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
```

### Step 3: Enable Webhooks in Razorpay

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`, `payment.refunded`
4. Copy webhook secret and add to server .env

### Step 4: Test in Production

1. Use small test amount (₹1-10) first
2. Complete payment with real card
3. Verify subscription created in database
4. Check email notifications sent
5. Verify access granted immediately

---

## 📊 Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Payment Integration** | ✅ Implemented | Using Razorpay SDK |
| **Signature Verification** | ✅ Secure | HMAC SHA256 validation |
| **Test Mode** | ✅ Working | Auto-detects missing keys |
| **Production Protection** | ✅ Safe | Test route blocked in production |
| **Time Management** | ⚠️ **UNSAFE** | Uses JavaScript date math (buggy) |
| **Expiry Checking** | ⚠️ Reactive Only | No proactive cron job |
| **Webhook Handling** | ❌ **MISSING** | No payment event handling |
| **Refund Logic** | ❌ **MISSING** | No failure recovery |
| **Production Keys** | ❌ **NOT CONFIGURED** | Still using test/empty keys |

---

## 🔧 Recommended Code Changes

### Priority 1: Fix Time Management (CRITICAL)

**File**: `server/src/controllers/subscription.controller.ts`

```typescript
import { addMonths, startOfDay } from 'date-fns';

// Replace lines 136-141 with:
const startDate = startOfDay(new Date());
const expiryDate = planType === 'monthly' 
  ? addMonths(startDate, 1)
  : addMonths(startDate, 3);
```

### Priority 2: Add Expiry Cron Job

**File**: `server/src/server.ts`

```typescript
import cron from 'node-cron';
import Subscription from './models/Subscription.model';

// Add after database connection
cron.schedule('0 0 * * *', async () => {
  console.log('Running subscription expiry check...');
  const result = await Subscription.updateMany(
    { isActive: true, expiryDate: { $lt: new Date() } },
    { isActive: false }
  );
  console.log(`Deactivated ${result.modifiedCount} expired subscriptions`);
});
```

### Priority 3: Add Webhook Handler

Create new file: `server/src/controllers/webhook.controller.ts`

```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';
import Subscription from '../models/Subscription.model';

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    
    const generated = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
      
    if (signature !== generated) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    
    if (event === 'payment.captured') {
      console.log('Payment captured via webhook:', payload.id);
      // Additional logic if needed
    } else if (event === 'payment.failed') {
      console.log('Payment failed:', payload.id);
      // Send notification to user
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
```

---

## 💡 Additional Security Recommendations

1. **Add Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   Prevent brute force payment attempts

2. **Log All Payment Events**
   Store payment logs for audit trail

3. **Add Email Notifications**
   - Payment success
   - Subscription expiry reminder (7 days before)
   - Subscription expired

4. **Implement Retry Logic**
   If subscription creation fails after successful payment

5. **Add Payment Reconciliation**
   Daily cron job to match Razorpay payments with database subscriptions

---

## 🎯 Final Recommendation

**For Production Launch**:

1. ✅ **DO THIS FIRST**: Fix time management (use date-fns)
2. ✅ Add expiry cron job
3. ✅ Configure Razorpay live keys
4. ✅ Set up webhook endpoint
5. ✅ Test with small amount (₹1)
6. ⚠️ Monitor first 10 real transactions closely
7. ✅ Set up error alerting (email/Slack)

**Current System Safety**: 6/10
**With Recommended Fixes**: 9.5/10

---

## 📚 Documentation References

- [Razorpay Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [date-fns Documentation](https://date-fns.org/)
- [Node Cron](https://www.npmjs.com/package/node-cron)

---

**Generated**: January 7, 2026  
**Project**: Real Estate Price Prediction - Subscription System  
**Status**: Ready for fixes before production deployment
