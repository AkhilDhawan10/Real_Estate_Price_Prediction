# Quick Start Guide

Get the Property Broker application up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Razorpay account (for payments - test mode works)

## Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Step 2: Configure Environment

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-broker
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Step 3: Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) - just update the `MONGODB_URI` in `.env`.

## Step 4: Start Backend

```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

## Step 5: Start Frontend

```bash
cd client
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

## Step 6: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Step 7: Create Admin User

The admin user is automatically created on server start with:
- Email: `admin@propertybroker.com`
- Password: `admin123` (change in production!)

## Step 8: Test the Application

1. **Register a new user**
   - Go to http://localhost:3000/register
   - Fill in the form and register

2. **Subscribe**
   - After registration, you'll be redirected to subscription page
   - Use Razorpay test mode for payments

3. **Search Properties**
   - After subscription, search for properties
   - Upload a PDF via admin panel to add properties

4. **Admin Dashboard**
   - Login as admin
   - Upload PDF files with property data
   - View users and subscriptions

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change `PORT` in `server/.env`
- Update `NEXT_PUBLIC_API_URL` in `client/.env.local`

### Razorpay Payment Issues
- Use test mode keys from Razorpay dashboard
- Ensure keys are correctly set in environment variables

### PDF Upload Not Working
- Check `uploads/` directory exists
- Ensure file size is under 10MB
- Check server logs for errors

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- See [SAMPLE_DATA.md](./SAMPLE_DATA.md) for test data examples

## Need Help?

- Check server logs for errors
- Verify all environment variables are set
- Ensure all dependencies are installed
- Review the API documentation in README.md

