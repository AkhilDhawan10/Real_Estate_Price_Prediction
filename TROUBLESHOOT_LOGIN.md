# 🔧 Login Troubleshooting Guide

## ✅ System Status
- **Backend**: Running on http://localhost:5000 ✅
- **Frontend**: Running on http://localhost:3000 ✅  
- **Admin Login API**: Working correctly ✅

---

## 🔐 Working Credentials

```
Email: admin@propertybroker.com
Password: admin123
```

---

## 🚨 If Login Still Doesn't Work in Browser

### Step 1: Clear Browser Cache
The browser might be caching old code or cookies.

**Chrome/Edge:**
1. Press `Ctrl + Shift + Del`
2. Select "Cookies and other site data" and "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Del`
2. Select "Cookies" and "Cache"
3. Click "Clear Now"

**Or simply:**
- Open an **Incognito/Private Window** (Ctrl + Shift + N)
- Go to http://localhost:3000/login

---

### Step 2: Check Browser Console for Errors

1. Open browser Developer Tools: Press `F12` or `Right-click` → `Inspect`
2. Go to the **Console** tab
3. Try logging in again
4. Look for errors (red text)

**Common Errors & Solutions:**

#### Error: "Failed to fetch" or "Network Error"
**Cause**: Frontend can't reach backend

**Solution**:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not running, start it:
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
npm run dev
```

#### Error: "Invalid email or password"  
**Cause**: Wrong credentials or password mismatch

**Solution**: Reset admin password
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction
./test-login.sh
```

#### Error: "CORS policy"
**Cause**: CORS not configured

**Solution**: Already fixed - CORS is enabled with `app.use(cors())`

---

### Step 3: Verify Frontend Environment

Check `.env.local` file:
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/client
cat .env.local
```

Should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

If wrong, fix it:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

Then restart frontend:
```bash
# Kill frontend
lsof -ti:3000 | xargs kill -9

# Start again
npm run dev
```

---

### Step 4: Manual Test via curl

Test if backend accepts your credentials:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertybroker.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "email": "admin@propertybroker.com",
    "role": "admin"
  }
}
```

If this works but browser doesn't, it's a frontend/browser issue.

---

### Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for the request to `/api/auth/login`

**Check:**
- **Status**: Should be `200 OK`
- **Request URL**: Should be `http://localhost:5000/api/auth/login`
- **Request Payload**: Should contain your email/password
- **Response**: Should contain token and user data

**If URL is wrong** (e.g., pointing to wrong server):
- Check `.env.local` file
- Restart frontend

---

## 🔄 Complete Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction

# Stop all servers
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Reset admin password
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/property-broker').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({password: String}));
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.updateOne({email: 'admin@propertybroker.com'}, {password: hashedPassword});
  console.log('✅ Password reset');
  process.exit(0);
});
"

# Start backend
npm run dev &

# Start frontend
cd ../client
npm run dev &

# Wait for servers to start
sleep 5

# Open browser in incognito
echo "Now open: http://localhost:3000/login in Incognito mode"
```

---

## 🎯 Quick Test Script

Run this to verify everything:
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction
./test-login.sh
```

---

## 📱 Alternative: Use REST Client

If browser still doesn't work, you can test with a REST client:

**Postman / Insomnia / Thunder Client:**
1. POST request to `http://localhost:5000/api/auth/login`
2. Headers: `Content-Type: application/json`
3. Body:
   ```json
   {
     "email": "admin@propertybroker.com",
     "password": "admin123"
   }
   ```

---

## ✅ Expected Behavior After Login

1. Login form submits
2. Loading indicator shows briefly
3. Success toast notification appears: "Login successful!"
4. **Admin**: Redirected to `/admin/dashboard`
5. **Regular User**: Redirected to `/subscription`

---

## 🐛 Debug Mode

To see detailed logs, check:

**Backend logs:**
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
# Backend shows logs in terminal where you ran npm run dev
```

**Frontend logs:**
- Open browser console (F12)
- Look for console.log messages like:
  - "Attempting login for: admin@propertybroker.com"
  - "Login successful, user: ..."
  - "Redirecting user with role: admin"

---

## 📞 Still Not Working?

The backend API is confirmed working. The issue is likely:
1. **Browser cache** - Clear it or use Incognito
2. **Wrong URL** - Check .env.local has correct API URL
3. **Frontend not restarted** - Kill and restart frontend
4. **JavaScript errors** - Check browser console

**Most Common Fix:** 
```bash
# Clear everything and restart
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/client
lsof -ti:3000 | xargs kill -9
rm -rf .next
npm run dev
```

Then open in **Incognito window**: http://localhost:3000/login
