# Backend Testing Guide

## How to Check if Your Backend is Working

### Method 1: Quick Health Check
Open your browser and visit:
```
http://localhost:5000/api/health
```
You should see: `{"status":"ok","message":"Property Broker API is running"}`

### Method 2: Using the Test Script
Run the automated test script:
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction
bash test-backend.sh
```

### Method 3: Manual Testing with cURL

#### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

#### 2. Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phoneNumber": "+919876543210",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

#### 3. Login (Regular User)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

#### 4. Login (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propertybroker.com",
    "password": "Admin@123"
  }'
```

#### 5. Get Profile (with token)
```bash
# First, get the token from login, then:
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Admin Credentials
- **Email**: admin@propertybroker.com
- **Password**: Admin@123
- **Phone**: +911234567890

## Default Test User Credentials
- **Email**: testuser@example.com
- **Password**: Test@123
- **Phone**: +919876543210

## Common Issues and Solutions

### Issue: Backend not responding
**Solution**: Check if backend is running
```bash
lsof -i :5000
# or
ps aux | grep "node.*server"
```

### Issue: MongoDB connection error
**Solution**: Start MongoDB
```bash
sudo systemctl start mongod
# or
sudo service mongod start
```

### Issue: "Invalid or expired token"
**Reason**: JWT secret changed or token expired
**Solution**: Re-login to get a fresh token

### Issue: Admin login fails
**Solution**: Update admin password
```bash
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-broker').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await User.updateOne(
    { email: 'admin@propertybroker.com' },
    { \$set: { password: hashedPassword } }
  );
  console.log('✅ Admin password updated');
  process.exit(0);
});
"
```

## Starting the Servers

### Backend (Port 5000)
```bash
cd server
npm run dev
```

### Frontend (Port 3000)
```bash
cd client
npm run dev
```

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (requires auth)
- `POST /refresh-token` - Refresh access token

### Subscriptions (`/api/subscriptions`)
- `GET /plans` - Get subscription plans
- `GET /status` - Get user's subscription status
- `POST /create-order` - Create payment order
- `POST /verify-payment` - Verify payment
- `POST /create-test` - Create test subscription (dev only)

### Properties (`/api/properties`)
- `GET /search` - Search properties (requires subscription)

### Admin (`/api/admin`)
- `POST /upload-pdf` - Upload PDF for processing
- `GET /users` - Get all users
- `GET /subscriptions` - Get all subscriptions
- `GET /stats` - Get system stats

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-broker
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d
ADMIN_EMAIL=admin@propertybroker.com
ADMIN_PASSWORD=Admin@123
ADMIN_PHONE=+911234567890
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

## Logs Location
- Backend: Check terminal output or `/tmp/backend.log`
- Frontend: Check terminal output
- MongoDB: `/var/log/mongodb/mongod.log`
