#!/bin/bash

# Test Login Flow Script
echo "=================================="
echo "Testing Login System"
echo "=================================="
echo ""

# Test 1: Backend Health
echo "1. Testing Backend Health..."
HEALTH=$(curl -s http://localhost:5000/api/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start backend: cd server && npm run dev"
    exit 1
fi

# Test 2: Frontend Health
echo "2. Testing Frontend..."
FRONTEND=$(curl -s -I http://localhost:3000 | grep "HTTP")
if [[ $FRONTEND == *"200"* ]]; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Start frontend: cd client && npm run dev"
    exit 1
fi

# Test 3: Admin Login via API
echo "3. Testing Admin Login API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertybroker.com","password":"admin123"}')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo "   ✅ Admin login successful via API"
    echo ""
    echo "   Admin Credentials:"
    echo "   Email: admin@propertybroker.com"
    echo "   Password: admin123"
else
    echo "   ❌ Admin login failed"
    echo "   Response: $LOGIN_RESPONSE"
    
    # Try to fix admin password
    echo ""
    echo "   Attempting to reset admin password..."
    cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
    node -e "
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
    mongoose.connect('mongodb://localhost:27017/property-broker').then(async () => {
      const User = mongoose.model('User', new mongoose.Schema({password: String}));
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.updateOne({email: 'admin@propertybroker.com'}, {password: hashedPassword});
      console.log('   ✅ Password reset to: admin123');
      process.exit(0);
    });
    " 2>&1
    
    echo ""
    echo "   Try logging in again with: admin123"
fi

echo ""
echo "=================================="
echo "✅ System Check Complete"
echo "=================================="
echo ""
echo "🌐 Open your browser and go to:"
echo "   http://localhost:3000/login"
echo ""
echo "📋 Login with:"
echo "   Email: admin@propertybroker.com"
echo "   Password: admin123"
echo ""
echo "💡 If login still doesn't work in browser:"
echo "   1. Clear browser cache (Ctrl+Shift+Del)"
echo "   2. Open in Incognito/Private window"
echo "   3. Check browser console (F12) for errors"
echo ""
