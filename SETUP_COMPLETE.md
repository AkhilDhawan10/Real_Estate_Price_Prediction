# 🚀 COMPLETE SETUP GUIDE - Delhi Real Estate PDF Parser

## ✅ What I've Updated

I've modified your codebase to extract property data from your **unstructured Delhi PDF** with:
- **Location**: Area names (AARADHNA ENCLAVE, ANAND LOK, etc.)
- **Property ID**: Plot/Flat numbers (C-8, 40/8, FLAT NO-605, etc.)
- **Size**: In Yards (YD) or Square Feet (FT)
- **Floors**: BMT (basement), GF (ground), FF (first), SF (second), TF (third), TERR (terrace), STILT
- **Bedrooms**: 2BR, 3BR, 4BR, etc.
- **Status**: READY, U/C (under construction), BOOKING
- **Contact**: Phone numbers from listings

## 📋 Changes Made

### Backend:
1. ✅ Updated Property Model with floor, bedrooms, status, contact fields
2. ✅ Created Delhi PDF parser (`server/src/services/delhi-pdf.parser.ts`)
3. ✅ Updated PDF service to use new parser
4. ✅ Added floor, bedroom, status filtering to search API

### Frontend:
1. ✅ Added floor selection dropdown
2. ✅ Added bedroom (BHK) selection
3. ✅ Added property status filter
4. ✅ Updated property cards to show all new fields

---

## 🛠️ Setup Instructions

### Step 1: Install Dependencies

```bash
# Backend
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
npm install

# Frontend
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/client
npm install
```

### Step 2: Configure Environment

Make sure you have these files:

**`server/.env`** (should already exist):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-broker
JWT_SECRET=property-broker-secret-key
JWT_REFRESH_SECRET=property-broker-refresh-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret
ADMIN_EMAIL=admin@propertybroker.com
ADMIN_PASSWORD=admin123
```

**`client/.env.local`** (should already exist):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Step 3: Start MongoDB

```bash
sudo systemctl start mongod
# OR if using docker:
# docker run -d -p 27017:27017 mongo
```

### Step 4: Start Backend

```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/server
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
✅ Admin user created/verified
🚀 Server running on port 5000
```

### Step 5: Start Frontend

Open a new terminal:
```bash
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction/client
npm run dev
```

Expected output:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## 📄 How to Use with Your PDF

### Option 1: Use Your Existing properties.pdf

1. **Login as Admin**:
   - Go to: http://localhost:3000/login
   - Email: `admin@propertybroker.com`
   - Password: `admin123`

2. **Upload PDF**:
   - Go to Admin Dashboard
   - Click "Choose File" and select your `properties.pdf`
   - The system will automatically extract:
     - Area names (AARADHNA ENCLAVE, ANAND LOK, etc.)
     - Property IDs (C-8, 40/8, etc.)
     - Sizes in YD or FT
     - Floor details (BMT, GF, FF, SF, TF, TERR)
     - Bedrooms (2BR, 3BR, 4BR)
     - Status (READY, U/C, BOOKING)
     - Contact numbers

3. **Search Properties as User**:
   - Register a new user or login
   - Subscribe (test mode will auto-create subscription)
   - Go to Properties page
   - Use filters:
     - **Location**: Search by area (e.g., "anand lok", "chirag enclave")
     - **Size**: Enter min/max in Yards or Sqft
     - **Bedrooms**: Select 2 BHK, 3 BHK, 4 BHK, etc.
     - **Floors**: Select ground, first, second, third, basement, terrace
     - **Status**: Ready, Under Construction, or Booking

---

## 🎯 Example Search Scenarios

### Scenario 1: Find 3 BHK Flat in Anand Niketan on Ground Floor
```
Area: anand niketan
Bedrooms: 3 BHK
Floors: Ground Floor
```

### Scenario 2: Find Properties in Alaknanda, Size 150-250 YD
```
Area: alaknanda
Size Unit: Yards
Min Size: 150
Max Size: 250
```

### Scenario 3: Ready Properties in Chitranjan Park
```
Area: chitranjan park
Status: Ready to Move
```

---

## 📊 Your PDF Format Detected

Your PDF has listings like:
```
AARADHNA ENCLAVE
14 370YD TF+TERR GARDEN 4BR U/C (RV HOMES 9953101010)
29 190YD GF+FF 3BR EACH BOOKING (LOVELY CHANDA 9811207718)

ANAND NIKETAN
C-8 425YD BMT+GF+FF+SF+TF+TERR 4BR EACH BOOKING
C-16 375YD FF 4BR PRIVATE LIFT READY
```

The parser extracts:
- **Area**: AARADHNA ENCLAVE, ANAND NIKETAN
- **Property ID**: 14, 29, C-8, C-16
- **Size**: 370YD, 190YD, 425YD, 375YD
- **Floors**: TF+TERR, GF+FF, BMT+GF+FF+SF+TF+TERR, FF
- **Bedrooms**: 4BR, 3BR
- **Status**: U/C, BOOKING, READY
- **Contact**: 9953101010, 9811207718

---

## ✅ Verification Steps

After setup:

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Login as admin works
4. ✅ Upload properties.pdf
5. ✅ Check console for: "Extracted X properties from PDF"
6. ✅ Register as regular user
7. ✅ Subscribe (test mode)
8. ✅ Search properties with filters
9. ✅ See property details with floors, bedrooms, contact info

---

## 🐛 Troubleshooting

**No properties extracted?**
```bash
# Check the PDF text extraction
cd /home/akhil.dhawan/Desktop/Real_Estate_Price_Prediction
pdftotext properties.pdf - | head -50
```

**MongoDB error?**
```bash
sudo systemctl status mongod
# If not running:
sudo systemctl start mongod
```

**Port already in use?**
```bash
# Kill processes on ports
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

---

## 🎉 Ready to Go!

Your system is now set up to:
1. ✅ Extract data from your unstructured Delhi PDF
2. ✅ Store properties with location, size, floors, bedrooms
3. ✅ Allow users to search by multiple criteria
4. ✅ Display complete property details including contact info

Start the servers and upload your PDF to see it in action!
