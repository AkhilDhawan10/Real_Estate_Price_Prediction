import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import subscriptionRoutes from './routes/subscription.routes';
import propertyRoutes from './routes/property.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const uploadDir = path.join(__dirname, '../../uploads');
const excelDir = path.join(__dirname, '../../excel-data');

[uploadDir, excelDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));
app.use('/excel-data', express.static(excelDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Property Broker API is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-broker';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Create admin user if it doesn't exist
    const { createAdmin } = await import('./utils/createAdmin');
    await createAdmin();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

