import bcrypt from 'bcryptjs';
import User from '../models/User.model';

/**
 * Create admin user if it doesn't exist
 * Run this script to create the initial admin user
 */
export const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@propertybroker.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      fullName: 'Admin User',
      email: adminEmail,
      phoneNumber: '0000000000',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run if called directly
// Note: This check works when running with ts-node or node
if (typeof require !== 'undefined' && require.main === module) {
  import('mongoose').then(async (mongoose) => {
    await mongoose.default.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/property-broker'
    );
    await createAdmin();
    process.exit(0);
  });
}

