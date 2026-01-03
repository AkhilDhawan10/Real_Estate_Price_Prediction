# 🔐 Login Credentials

## ✅ Fixed - Login is Working!

The admin password has been updated. You can now login with:

### Admin Login
- **URL**: http://localhost:3000/login
- **Email**: `admin@propertybroker.com`
- **Password**: `admin123`

### What Was Fixed
- Updated admin password in database from `Admin@123` to `admin123`
- Updated `.env` file to match
- Verified backend API is working correctly

---

## 📝 Creating New Users

### Option 1: Register via Frontend
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Full Name
   - Phone Number (10 digits)
   - Email
   - Password (min 6 characters)
3. After registration, you'll be redirected to subscription page

### Option 2: Direct API Call
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 🧪 Testing Login API

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propertybroker.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "fullName": "Admin User",
    "email": "admin@propertybroker.com",
    "phoneNumber": "+911234567890",
    "role": "admin"
  }
}
```

---

## 🚀 Quick Start

1. **Make sure servers are running**:
   ```bash
   # Backend should be on port 5000
   curl http://localhost:5000/api/health
   
   # Frontend should be on port 3000
   curl http://localhost:3000
   ```

2. **Login as Admin**:
   - Open: http://localhost:3000/login
   - Email: `admin@propertybroker.com`
   - Password: `admin123`

3. **Upload PDF**:
   - After login, go to Admin Dashboard
   - Upload your `properties.pdf`

4. **Register Regular User**:
   - Logout from admin
   - Go to: http://localhost:3000/register
   - Register with any email/password

5. **Subscribe & Search**:
   - After registration → Subscribe (test mode = instant)
   - Go to Properties page
   - Search by area, size, floors, bedrooms

---

## 🔧 Troubleshooting

### "Invalid email or password"
- Check if you're using `admin123` (not `Admin@123`)
- Verify backend is running: `curl http://localhost:5000/api/health`

### Backend Not Running
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
npm run dev
```

### Frontend Not Running
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/client
npm run dev
```

### Reset Admin Password
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/property-broker').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    password: String
  }));
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.updateOne(
    { email: 'admin@propertybroker.com' },
    { password: hashedPassword }
  );
  
  console.log('✅ Password reset to: admin123');
  process.exit(0);
});
"
```

---

## ✅ Current Status

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Admin user exists with password: `admin123`
- ✅ Login API working correctly

**You're all set! Go to http://localhost:3000/login and login with the credentials above.**
