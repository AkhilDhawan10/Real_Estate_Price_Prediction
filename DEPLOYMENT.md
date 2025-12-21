# Deployment Guide

This guide covers deploying the Property Broker SaaS application to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- AWS/Render account (for backend)
- MongoDB Atlas account
- Razorpay account (production keys)

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure all environment variables are documented

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `client`
5. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-production-razorpay-key-id
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## Backend Deployment (Render)

### Step 1: Prepare Repository
1. Ensure `server/package.json` has correct scripts
2. Create `server/Procfile` (for Render):
   ```
   web: npm start
   ```

### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `property-broker-api`
   - Environment: Node
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Root Directory: `server`

### Step 3: Environment Variables
Add all variables from `server/.env`:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

## MongoDB Atlas Setup

### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Choose your preferred region

### Step 2: Database Access
1. Go to "Database Access"
2. Create a database user
3. Save username and password

### Step 3: Network Access
1. Go to "Network Access"
2. Add IP address (0.0.0.0/0 for Render/AWS)
3. Or add specific IPs for security

### Step 4: Connection String
1. Go to "Clusters"
2. Click "Connect"
3. Copy connection string
4. Replace `<password>` with your database password
5. Use this in `MONGODB_URI`

## AWS S3 Setup (Optional - for file storage)

### Step 1: Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket
3. Configure permissions

### Step 2: Update Code
Modify `server/src/services/pdf.service.ts` to use S3 instead of local storage.

## Razorpay Production Setup

### Step 1: Activate Account
1. Complete KYC in Razorpay dashboard
2. Activate your account

### Step 2: Get Keys
1. Go to Settings > API Keys
2. Generate production keys
3. Use these in environment variables

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API responding
- [ ] MongoDB connection working
- [ ] Payment integration tested
- [ ] Admin can upload PDFs
- [ ] Users can register and subscribe
- [ ] Property search working
- [ ] Environment variables secured
- [ ] SSL certificates active
- [ ] Error logging configured

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in for frontend
- **Render Logs**: For backend monitoring
- **MongoDB Atlas Monitoring**: Database metrics
- **Sentry**: Error tracking (optional)

## Backup Strategy

1. **MongoDB**: Enable automated backups in Atlas
2. **Excel Files**: Store in S3 or version control
3. **User Data**: Regular exports via admin panel

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (N/A for MongoDB)
- [ ] XSS protection
- [ ] CSRF protection (if needed)

## Troubleshooting

### Frontend Issues
- Check Vercel build logs
- Verify environment variables
- Check API URL configuration

### Backend Issues
- Check Render logs
- Verify MongoDB connection
- Check environment variables
- Test API endpoints directly

### Database Issues
- Verify MongoDB Atlas connection
- Check network access settings
- Verify database user permissions

## Scaling Considerations

1. **Database**: Use MongoDB Atlas scaling
2. **Backend**: Upgrade Render plan or use AWS
3. **CDN**: Vercel provides CDN automatically
4. **Caching**: Add Redis for session management
5. **Load Balancing**: Use multiple backend instances

