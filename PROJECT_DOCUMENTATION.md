# Property Broker SaaS - Complete Documentation

**Last Updated**: January 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [Security](#security)
8. [Deployment](#deployment)
9. [Admin Features](#admin-features)
10. [User Features](#user-features)
11. [API Documentation](#api-documentation)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Feature Details](#feature-details)

---

## Project Overview

A production-ready SaaS application for property brokers to manage and search property listings with subscription-based access control. Properties are extracted from PDF files and stored in MongoDB with advanced search capabilities.

### Key Highlights
- **Role-Based Access**: Admin and Broker roles with different permissions
- **Subscription System**: Monthly (₹999) and Quarterly (₹2499) plans via Razorpay
- **Advanced Search**: Multi-location search, size filters, bedrooms, floors
- **PDF Processing**: Automated property extraction from unstructured PDF files
- **Security**: JWT auth, rate limiting, CORS protection, input sanitization
- **Admin Controls**: Full property details with contact numbers (hidden from normal users)

---

## Quick Start Guide

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account (for payments)

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd Real_Estate_Price_Prediction

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure environment variables
# Create server/.env (see Environment Variables section)
# Create client/.env.local (see Environment Variables section)

# 4. Start MongoDB
mongod

# 5. Start backend (terminal 1)
cd server
npm run dev

# 6. Start frontend (terminal 2)
cd client
npm run dev

# 7. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Default Admin Credentials
```
Email: admin@propertybroker.com
Password: admin123
```

---

## Features

### For Property Brokers (Users)
✅ **Registration & Login**: Secure authentication with JWT tokens  
✅ **Subscription Plans**: Monthly/Quarterly with Razorpay payment integration  
✅ **Property Search**: Filter by location, size, bedrooms, floors  
✅ **Multi-Location Search**: Search up to 3 areas at once (e.g., "Anand Lok, Vasant Vihar")  
✅ **Filtered Data**: Contact numbers and builder names hidden for privacy  
✅ **Search History**: Track your property requirements  

### For Admins
✅ **PDF Upload**: Extract properties from unstructured PDF files  
✅ **User Management**: View all users and subscriptions  
✅ **Dashboard Stats**: Total users, properties, revenue, active subscriptions  
✅ **Full Property Details**: Access all data including contact numbers  
✅ **Admin Property Search**: Separate search interface with unfiltered data  
✅ **Search Analytics**: View user search patterns and statistics  
✅ **Excel Reports**: Download users, subscriptions, and search data  
✅ **Property Management**: Delete all properties if needed  

### Technical Features
✅ **JWT Authentication**: Access + Refresh tokens  
✅ **Role-Based Access Control**: Admin vs Broker permissions  
✅ **Subscription Middleware**: Automatic access control  
✅ **Rate Limiting**: 100 requests/15min, 5 login attempts/15min  
✅ **Security Headers**: Helmet.js with CSP, HSTS, etc.  
✅ **Input Sanitization**: NoSQL injection prevention  
✅ **CORS Protection**: Whitelist-based origins  
✅ **Excel Backup**: Auto-save user data to Excel files  

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **State Management**: React hooks
- **Routing**: Next.js file-based routing

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs (10 rounds)
- **Payments**: Razorpay SDK
- **PDF Processing**: pdf-parse library
- **Excel Handling**: xlsx library
- **File Uploads**: Multer (10MB limit)
- **Validation**: express-validator
- **Security**: Helmet.js, express-rate-limit, CORS

### DevOps
- **Build Tool**: TypeScript compiler (tsc)
- **Process Manager**: Nodemon (dev), PM2 (production recommended)
- **Version Control**: Git
- **Package Manager**: npm

---

## Project Structure

```
Real_Estate_Price_Prediction/
├── client/                          # Next.js Frontend
│   ├── app/
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── login/                  # Login page
│   │   ├── register/               # Registration page
│   │   ├── profile/                # User profile
│   │   ├── subscription/           # Subscription plans
│   │   ├── properties/             # Property search (users)
│   │   └── admin/
│   │       ├── dashboard/          # Admin dashboard
│   │       └── properties/         # Admin property search
│   ├── components/
│   │   └── ProtectedRoute.tsx     # Route protection HOC
│   ├── lib/
│   │   ├── api.ts                  # Axios instance with interceptors
│   │   └── auth.ts                 # Auth utilities
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── server.ts               # Main server file
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Subscription.model.ts
│   │   │   ├── Property.model.ts
│   │   │   ├── PropertyRequirement.model.ts
│   │   │   └── SearchLog.model.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── subscription.controller.ts
│   │   │   ├── property.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── subscription.routes.ts
│   │   │   ├── property.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts           # JWT verification
│   │   │   └── subscription.middleware.ts   # Subscription check
│   │   ├── services/
│   │   │   ├── pdf.service.ts              # PDF processing
│   │   │   └── delhi-pdf.parser.ts         # PDF parsing logic
│   │   └── utils/
│   │       ├── jwt.util.ts
│   │       ├── excel.util.ts
│   │       └── createAdmin.ts
│   ├── uploads/                    # Uploaded PDF files
│   ├── excel-data/                 # Excel exports
│   └── package.json
│
├── uploads/                        # Global uploads directory
├── excel-data/                     # Global excel data
└── PROJECT_DOCUMENTATION.md        # This file
```

---

## Setup Instructions

### 1. Environment Variables

#### Backend (`server/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/property-broker
# Production: mongodb+srv://username:password@cluster.mongodb.net/property-broker

# JWT Configuration - GENERATE NEW SECRETS FOR PRODUCTION
# Use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Razorpay Configuration
# Test mode keys for development
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Admin Configuration
ADMIN_EMAIL=admin@propertybroker.com
ADMIN_PASSWORD=admin123
ADMIN_PHONE=+911234567890

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
# Production: https://yourdomain.com
```

#### Frontend (`client/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Production: https://api.yourdomain.com/api

# Razorpay Key (same as backend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Razorpay Setup

1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test Mode keys
4. Copy `Key ID` and `Key Secret` to `.env` files
5. For production: Generate Live Mode keys

### 4. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Build & Run

**Development Mode**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Production Mode**
```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
npm start
```

---

## Security

### Implemented Security Features

#### 1. Authentication & Authorization ✅
- **JWT Tokens**: Access token (7 days) + Refresh token (30 days)
- **Password Hashing**: bcrypt with 10 rounds
- **Role-Based Access**: Admin vs Broker roles
- **Subscription Validation**: Middleware checks active subscriptions
- **Token Storage**: HTTP-only cookies (recommended for production)

#### 2. Rate Limiting ✅
```typescript
// General API: 100 requests per 15 minutes per IP
// Auth endpoints: 5 login/register attempts per 15 minutes per IP
```

#### 3. Security Headers (Helmet.js) ✅
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- And 10+ other headers

#### 4. CORS Protection ✅
```typescript
// Whitelist-based origins (not * for all)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 5. Input Sanitization ✅
- NoSQL injection prevention in search queries
- Special character filtering
- Regex pattern validation
- Query parameter type checking

#### 6. Password Requirements
- Minimum 6 characters (increase for production)
- Stored as bcrypt hash (never plain text)
- Not returned in API responses (select: false)

### Security Checklist for Production

**🔴 CRITICAL - Must Do Before Deployment**

- [ ] Generate strong JWT secrets (64-char random strings)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Change admin password to strong password (12+ characters)
- [ ] Update CORS to production domains only
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB with authentication enabled
- [ ] Use Razorpay LIVE keys (not test)
- [ ] Enable HTTPS/SSL on hosting
- [ ] Remove .env files from git history

**🟡 IMPORTANT - Recommended**

- [ ] Run `npm audit fix` for vulnerabilities
- [ ] Setup automated MongoDB backups
- [ ] Configure firewall rules for database
- [ ] Add error monitoring (Sentry, LogRocket)
- [ ] Setup logging service (CloudWatch, Datadog)
- [ ] Increase password minimum to 8-12 characters

**🟢 NICE TO HAVE**

- [ ] Add API documentation (Swagger)
- [ ] Implement 2FA for admin accounts
- [ ] Add dependency scanning (Snyk)
- [ ] Setup CI/CD with security checks
- [ ] Add performance monitoring

---

## Deployment

### Option 1: Traditional Server (VPS/Dedicated)

**Backend Deployment**
```bash
# 1. Install dependencies
npm install --production

# 2. Build TypeScript
npm run build

# 3. Install PM2
npm install -g pm2

# 4. Start with PM2
pm2 start dist/server.js --name property-broker-api

# 5. Setup auto-restart on reboot
pm2 startup
pm2 save
```

**Frontend Deployment**
```bash
# 1. Install dependencies
npm install --production

# 2. Build Next.js
npm run build

# 3. Start with PM2
pm2 start npm --name property-broker-web -- start
```

### Option 2: Cloud Platforms

**Backend on Render/Heroku**
1. Connect GitHub repository
2. Set build command: `cd server && npm install && npm run build`
3. Set start command: `cd server && npm start`
4. Add environment variables in dashboard
5. Deploy

**Frontend on Vercel/Netlify**
1. Connect GitHub repository
2. Set root directory: `client`
3. Build command: `npm run build`
4. Add environment variables
5. Deploy

### Option 3: Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build separately
docker build -t property-broker-backend ./server
docker build -t property-broker-frontend ./client

docker run -p 5000:5000 property-broker-backend
docker run -p 3000:3000 property-broker-frontend
```

### Post-Deployment Checklist

- [ ] Test all endpoints (login, register, search, payment)
- [ ] Verify CORS working with production domain
- [ ] Test file upload (PDF processing)
- [ ] Verify payments work with live keys
- [ ] Check rate limiting is active
- [ ] Monitor error logs
- [ ] Setup health check monitoring
- [ ] Configure SSL certificate
- [ ] Setup domain DNS records

---

## Admin Features

### 1. Admin Dashboard (`/admin/dashboard`)

**Statistics Displayed:**
- Total Users (brokers only)
- Total Properties
- Active Subscriptions
- Expired Subscriptions
- Total Revenue
- Recent Users (last 5)

**Actions Available:**
- Upload PDF to extract properties
- Delete all properties
- View users list
- View subscriptions list
- Download reports (Excel)
- Navigate to admin property search

### 2. PDF Upload & Processing

**How to Upload:**
1. Login as admin
2. Go to Admin Dashboard
3. Click "Upload PDF" button
4. Select PDF file (max 10MB)
5. Wait for processing (shows progress)

**What Happens:**
- PDF text is extracted
- Properties are parsed (address, size, bedrooms, floors, etc.)
- Data is cleaned and filtered
- Properties saved to MongoDB
- Excel backup created
- **Dual Details**: 
  - `detail` (filtered - no phone numbers)
  - `rawDetail` (unfiltered - includes phone numbers for admin)

**Supported Format:**
- Unstructured text PDF with property listings
- Format: City > Area > Property entries
- Example: "DELHI > Anand Lok > L-22 400YD FF 4BR (BUILDER 9810123456)"

### 3. Admin Property Search (`/admin/properties`)

**Special Features:**
- See ALL property details including contact numbers
- Search works same as user search but returns unfiltered data
- Yellow badges indicate admin-only data
- Highlighted section shows full details with phone numbers

### 4. User Management

**View Users:**
- List all registered brokers
- See registration date, email, phone, subscription status
- Download users report (Excel)

**View Subscriptions:**
- List all subscriptions (active + expired)
- See plan type, amount, start/end dates
- Download subscriptions report (Excel)

### 5. Search Analytics

**Features:**
- View all user searches with timestamps
- See what users are searching for
- Analyze popular locations and requirements
- Download search analytics (Excel)
- Useful for understanding user needs

---

## User Features

### 1. Registration (`/register`)

**Required Fields:**
- Full Name
- Email (must be unique)
- Phone Number (must be unique)
- Password (min 6 characters)

**After Registration:**
- JWT tokens issued automatically
- Redirected to subscription page
- Must subscribe to search properties

### 2. Login (`/login`)

**Credentials:**
- Email + Password
- JWT access token (7 days)
- JWT refresh token (30 days)

**Auto-Redirect:**
- Admin → `/admin/dashboard`
- Broker without subscription → `/subscription`
- Broker with subscription → `/properties`

### 3. Subscription Plans (`/subscription`)

**Monthly Plan: ₹999**
- Valid for 30 days
- Access to property search
- Filtered data (no contact numbers)

**Quarterly Plan: ₹2499**
- Valid for 90 days  
- Discounted (save ₹498)
- Access to property search
- Filtered data (no contact numbers)

**Payment Flow:**
1. Select plan
2. Click "Subscribe Now"
3. Razorpay popup opens
4. Complete payment
5. Subscription activated instantly
6. Redirected to properties page

### 4. Property Search (`/properties`)

**Search Filters:**

**Location (Required):**
- City: e.g., Delhi, Mumbai
- Area: **Multi-location support** - enter up to 3 areas separated by commas
  - Single: `Anand Lok`
  - Multiple: `Anand Lok, Vasant Vihar, Defence Colony`

**Property Details (Optional):**
- Bedrooms: 1+ to 6+ BHK
- Floor Preference: Basement, Ground, First, Second, Third, Terrace, Stilt

**Size (Optional):**
- Unit: Square Feet, Gaj, Yard
- Min Size: e.g., 100
- Max Size: e.g., 500

**Search Results:**
- Main results matching your criteria
- Properties show filtered details (no contact numbers)

### 5. Profile (`/profile`)

View your account details:
- Full Name
- Email
- Phone Number
- Registration Date
- Subscription Status
- Subscription Expiry Date

---

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.yourdomain.com/api`

### Authentication Endpoints

#### POST `/auth/register`
Register new user (broker)

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "role": "broker"
  }
}
```

#### POST `/auth/login`
Login user

**Request:**
```json
{
  "email": "admin@propertybroker.com",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "fullName": "Admin User",
    "email": "admin@propertybroker.com",
    "role": "admin"
  }
}
```

#### GET `/auth/profile`
Get current user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "role": "broker",
    "createdAt": "2026-01-17T..."
  }
}
```

### Subscription Endpoints

#### GET `/subscriptions/plans`
Get available subscription plans (requires authentication)

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "name": "Monthly Plan",
      "duration": 30,
      "price": 999,
      "currency": "INR"
    },
    {
      "name": "Quarterly Plan",
      "duration": 90,
      "price": 2499,
      "currency": "INR"
    }
  ]
}
```

#### POST `/subscriptions/create-order`
Create Razorpay order

**Request:**
```json
{
  "planType": "monthly"
}
```

**Response:** `200 OK`
```json
{
  "orderId": "order_...",
  "amount": 99900,
  "currency": "INR",
  "planType": "monthly"
}
```

#### POST `/subscriptions/verify-payment`
Verify Razorpay payment and activate subscription

**Request:**
```json
{
  "orderId": "order_...",
  "paymentId": "pay_...",
  "signature": "abc123...",
  "planType": "monthly"
}
```

**Response:** `200 OK`
```json
{
  "message": "Payment verified and subscription activated",
  "subscription": {
    "plan": "monthly",
    "isActive": true,
    "expiryDate": "2026-02-17T..."
  }
}
```

#### GET `/subscriptions/status`
Get current subscription status

**Response:** `200 OK`
```json
{
  "hasSubscription": true,
  "subscription": {
    "plan": "monthly",
    "isActive": true,
    "startDate": "2026-01-17T...",
    "expiryDate": "2026-02-17T..."
  }
}
```

### Property Endpoints

#### GET `/properties/search`
Search properties (requires authentication + active subscription)

**Query Parameters:**
- `city` (optional): City name
- `area` (optional): Area name(s) - comma-separated for multiple (max 3)
- `sizeMin` (optional): Minimum size
- `sizeMax` (optional): Maximum size
- `sizeUnit` (optional): `gaj`, `sqft`, or `yd`
- `bedrooms` (optional): Minimum bedrooms
- `floors` (optional): Floor type (basement, ground, first, etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 100)

**Example:**
```
GET /properties/search?city=Delhi&area=Anand Lok,Vasant Vihar&bedrooms=3&sizeUnit=sqft
```

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "_id": "...",
      "location": {
        "city": "South Delhi",
        "area": "Anand Lok"
      },
      "size": {
        "value": 400,
        "unit": "yd"
      },
      "bedrooms": 4,
      "floors": ["first", "second"],
      "detail": "L-22 400YD FF+SF 4BR NEW PROPERTY",
      "createdAt": "2026-01-17T..."
    }
  ],
  "total": 1,
  "page": 1
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin-token>`

#### POST `/admin/upload-pdf`
Upload PDF file to extract properties

**Request:** `multipart/form-data`
- `pdf`: PDF file (max 10MB)

**Response:** `200 OK`
```json
{
  "message": "PDF processed successfully",
  "propertiesAdded": 150,
  "excelFile": "properties_2026-01-17.xlsx"
}
```

#### GET `/admin/properties/search`
Admin property search (returns unfiltered data with contact numbers)

Same query parameters as user search, but returns `rawDetail` field

#### DELETE `/admin/properties`
Delete all properties from database

**Response:** `200 OK`
```json
{
  "message": "All properties deleted successfully",
  "deletedCount": 150
}
```

#### GET `/admin/users`
Get all users

**Response:** `200 OK`
```json
{
  "users": [
    {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210",
      "role": "broker",
      "isActive": true,
      "createdAt": "2026-01-17T..."
    }
  ],
  "total": 10
}
```

#### GET `/admin/subscriptions`
Get all subscriptions

#### GET `/admin/dashboard/stats`
Get dashboard statistics

#### GET `/admin/search-statistics`
Get search analytics

#### GET `/admin/reports/users`
Download users Excel report

#### GET `/admin/reports/subscriptions`
Download subscriptions Excel report

#### GET `/admin/reports/search-statistics`
Download search statistics Excel report

---

## Testing

### Manual Testing

**1. Test Registration**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+919876543210",
    "password": "test123"
  }'
```

**2. Test Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propertybroker.com",
    "password": "admin123"
  }'
```

**3. Test Property Search** (with token)
```bash
curl -X GET "http://localhost:5000/api/properties/search?area=Anand%20Lok" \
  -H "Authorization: Bearer <your-token>"
```

**4. Test Rate Limiting**
```bash
# Should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"wrong"}'
  echo ""
done
```

**5. Test CORS**
```bash
# Should reject with wrong origin
curl -X GET http://localhost:5000/api/health \
  -H "Origin: https://malicious-site.com"
```

### Testing Checklist

**Authentication**
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Invalid credentials rejected
- [ ] JWT token generation
- [ ] Token refresh works
- [ ] Protected routes require auth

**Subscriptions**
- [ ] Plans list loads
- [ ] Order creation works
- [ ] Payment verification works
- [ ] Subscription activates after payment
- [ ] Expired subscriptions block access
- [ ] Admin has unlimited access

**Property Search**
- [ ] Single location search works
- [ ] Multi-location search works (2-3 areas)
- [ ] Size filters work
- [ ] Bedroom filters work
- [ ] Floor filters work
- [ ] Results are paginated
- [ ] No contact numbers in user results
- [ ] Contact numbers visible in admin results

**Admin Features**
- [ ] PDF upload works
- [ ] Properties extracted correctly
- [ ] Excel backup created
- [ ] Dashboard stats accurate
- [ ] User list loads
- [ ] Subscription list loads
- [ ] Reports download successfully
- [ ] Delete all properties works

**Security**
- [ ] Rate limiting blocks excessive requests
- [ ] CORS blocks unauthorized origins
- [ ] Input sanitization prevents injection
- [ ] Passwords are hashed
- [ ] Tokens expire correctly
- [ ] Admin-only routes protected

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error:** `Cannot find module` or `TS2307`

**Solution:**
```bash
cd server
npm install
npm run build
```

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use different port in .env
PORT=5001
```

#### 2. Frontend Won't Start

**Error:** `Module not found` or build errors

**Solution:**
```bash
cd client
rm -rf .next node_modules
npm install
npm run dev
```

#### 3. MongoDB Connection Failed

**Error:** `MongoNetworkError` or `ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb
# Or
mongod --version

# Start MongoDB
sudo systemctl start mongodb
# Or
mongod
```

**Error:** `Authentication failed`

**Solution:** Update `MONGODB_URI` in `.env` with correct credentials

#### 4. Login Issues

**Problem:** "Invalid credentials" for correct password

**Solution:**
```bash
# Reset admin password
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.updateOne(
    { email: 'admin@propertybroker.com' },
    { \$set: { password: hashedPassword } }
  );
  console.log('✅ Admin password reset to: admin123');
  process.exit(0);
});
"
```

#### 5. Payment Fails

**Problem:** Razorpay payment doesn't work

**Solution:**
1. Check Razorpay keys in `.env` files (both backend and frontend)
2. Verify keys are for correct mode (test/live)
3. Check browser console for errors
4. Ensure RAZORPAY_KEY_SECRET is set in backend

#### 6. Rate Limiting Blocking Legitimate Requests

**Problem:** "Too many requests" error

**Solution:**
- Wait 15 minutes for rate limit to reset
- Or temporarily increase limits in `server.ts`:
```typescript
// Increase limits (not recommended for production)
max: 500, // was 100
```

#### 7. CORS Errors in Production

**Problem:** "CORS policy" error in browser console

**Solution:**
```bash
# Update ALLOWED_ORIGINS in server/.env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Restart backend
```

#### 8. Properties Not Appearing

**Problem:** Search returns no results

**Solution:**
1. Check if properties are in database:
```bash
mongosh
use property-broker
db.properties.count()
db.properties.find().limit(5)
```

2. Upload PDF again as admin
3. Check MongoDB connection
4. Verify search filters aren't too restrictive

#### 9. PDF Upload Fails

**Problem:** "Error processing PDF"

**Solution:**
- Check file size (max 10MB)
- Ensure file is PDF format
- Check PDF has extractable text (not image-based)
- Check server logs for detailed error
- Verify uploads directory exists and is writable

#### 10. Subscription Not Activating

**Problem:** Paid but still shows "No subscription"

**Solution:**
```bash
# Check subscription in database
mongosh
use property-broker
db.subscriptions.find({ user: ObjectId("user-id") })

# If missing, check payment verification logs
# Payment may have succeeded but verification failed
```

---

## Feature Details

### 1. Multi-Location Search

**Implementation:** January 17, 2026

Users can search properties in multiple locations simultaneously by separating area names with commas.

**Usage:**
```
Single: Anand Lok
Multiple: Anand Lok, Vasant Vihar
Maximum: Anand Lok, Vasant Vihar, Defence Colony
```

**Backend Logic:**
- Input sanitization removes special characters except commas
- Split by comma and trim whitespace
- Limit to 3 areas maximum
- MongoDB `$or` query with regex for each area
- Case-insensitive matching

**Files Modified:**
- `server/src/controllers/property.controller.ts`
- `server/src/controllers/admin.controller.ts`
- `client/app/properties/page.tsx`
- `client/app/admin/properties/page.tsx`

### 2. Admin Raw Details Feature

**Implementation:** Previous update

Admins can see unfiltered property details including contact numbers while normal users see filtered data.

**How It Works:**
- PDF parser stores two versions:
  - `detail`: Filtered (removes phone, email, builder names)
  - `rawDetail`: Unfiltered (original text with all info)
- User search endpoint: Returns `detail` field
- Admin search endpoint: Returns `rawDetail` field
- Admin UI shows yellow badges for admin-only data

**Filter Function:**
Removes from `detail` field:
- Phone numbers (10-digit patterns)
- Email addresses
- Keywords: "BUILDER", "OWNER", "CONTACT"
- Builder/owner names

### 3. Search Analytics

**Purpose:** Track what users are searching for

**Data Collected:**
- User ID
- Search timestamp
- City searched
- Area(s) searched
- Size filters used
- Bedroom requirement
- Floor preference

**Admin View:**
- `/admin/dashboard` → Search Statistics section
- Shows all user searches
- Download as Excel report
- Useful for understanding user needs

### 4. Excel Backups

**Automatic Backups Created For:**
1. **Users**: Every new registration
   - File: `excel-data/users.xlsx`
   - Columns: Name, Email, Phone, Registration Date

2. **Properties**: After PDF upload
   - File: `excel-data/properties_<date>.xlsx`
   - Columns: City, Area, Size, Bedrooms, Floors, Details (both filtered and raw)

3. **Subscriptions**: After payment verification
   - File: `excel-data/subscriptions.xlsx`
   - Columns: User, Plan, Amount, Start Date, End Date, Active Status

**Admin Reports:**
- Download users: GET `/admin/reports/users`
- Download subscriptions: GET `/admin/reports/subscriptions`
- Download search analytics: GET `/admin/reports/search-statistics`

### 5. Subscription System

**Plans:**
- **Monthly**: ₹999 for 30 days
- **Quarterly**: ₹2499 for 90 days (₹833/month - Save ₹498)

**Payment Flow:**
1. User selects plan
2. Backend creates Razorpay order
3. Frontend opens Razorpay popup
4. User completes payment
5. Razorpay redirects with payment details
6. Backend verifies signature
7. Subscription created/updated in database
8. User redirected to properties page

**Test Mode:**
- Use test keys for development
- Payment succeeds instantly
- No real money charged

**Live Mode:**
- Use live keys for production
- Real payments processed
- Bank verification required

### 6. PDF Processing Pipeline

**Steps:**
1. Admin uploads PDF file
2. Multer saves file to `uploads/` directory
3. `pdf-parse` extracts text from PDF
4. `delhi-pdf.parser.ts` processes text:
   - Identifies city and area sections
   - Extracts property details line by line
   - Parses size, bedrooms, floors from text
   - Creates two versions (filtered and raw)
5. Properties saved to MongoDB
6. Excel backup created
7. Upload file deleted (optional)

**Supported Format:**
```
SOUTH DELHI

Anand Lok
L-22 400YD FF+SF 4BR NEW (BUILDER NAME 9810123456)
M-15 500YD GF+FF 3BR READY (OWNER 9876543210)

Vasant Vihar
A-52 600YD SF 4BR CORNER (BUILDER 9999888777)
```

---

## Maintenance & Monitoring

### Regular Tasks

**Daily:**
- [ ] Check server logs for errors
- [ ] Monitor API response times
- [ ] Verify payment processing
- [ ] Check subscription expirations

**Weekly:**
- [ ] Review search analytics
- [ ] Check database size
- [ ] Backup MongoDB data
- [ ] Review user feedback

**Monthly:**
- [ ] Update dependencies (`npm outdated`)
- [ ] Security audit (`npm audit`)
- [ ] Review and optimize MongoDB indexes
- [ ] Analyze subscription conversion rates
- [ ] Check server resource usage

### Monitoring Recommendations

**Application Monitoring:**
- Sentry: Error tracking and performance
- LogRocket: Session replay and debugging
- New Relic: APM and infrastructure monitoring

**Server Monitoring:**
- UptimeRobot: Uptime monitoring
- Pingdom: Performance monitoring
- CloudWatch: AWS infrastructure (if using AWS)

**Database Monitoring:**
- MongoDB Atlas: Built-in monitoring (if using Atlas)
- Datadog: Database performance
- Prometheus + Grafana: Custom dashboards

### Backup Strategy

**MongoDB Backups:**
```bash
# Daily backup script
mongodump --uri="mongodb://localhost:27017/property-broker" --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/property-broker" /backups/20260117
```

**File Backups:**
- Upload directory: `uploads/`
- Excel exports: `excel-data/`
- Environment files: `.env` (encrypted)

**Backup Frequency:**
- Database: Daily (automated)
- Files: Weekly (automated)
- Configuration: After each change

---

## Support & Contact

### Getting Help

**Documentation:**
- This file: Complete reference
- Code comments: Inline documentation
- README.md: Quick overview

**Resources:**
- Next.js Docs: https://nextjs.org/docs
- Express.js Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Razorpay Docs: https://razorpay.com/docs

**Common Commands:**
```bash
# View logs
cd server && npm run dev  # Shows all logs
tail -f logs/app.log      # If using file logging

# Database check
mongosh
use property-broker
db.users.count()
db.properties.count()
db.subscriptions.find({ isActive: true }).count()

# Clear cache
cd client && rm -rf .next
cd server && rm -rf dist

# Rebuild
cd server && npm run build
cd client && npm run build
```

---

## Changelog

### Version 1.0.0 (January 17, 2026)

**✨ New Features:**
- Multi-location search (up to 3 areas comma-separated)
- Admin raw details view with contact numbers
- Search analytics tracking
- Security improvements (Helmet, rate limiting, CORS)
- Excel backup for all data
- Dual-detail system (filtered vs unfiltered)

**🔒 Security Updates:**
- Added Helmet.js for security headers
- Implemented rate limiting (100/15min general, 5/15min auth)
- CORS whitelist configuration
- Input sanitization for NoSQL injection prevention
- Production-ready logging (no sensitive data)

**🐛 Bug Fixes:**
- Fixed login authentication issues
- Resolved JWT token validation
- Fixed subscription middleware
- Corrected admin route protection

**📚 Documentation:**
- Consolidated all documentation into single file
- Added comprehensive security guide
- Included deployment instructions
- Created troubleshooting section

---

## License

ISC License - See LICENSE file for details

---

**End of Documentation**

*For questions or issues, contact the development team or create an issue in the repository.*
