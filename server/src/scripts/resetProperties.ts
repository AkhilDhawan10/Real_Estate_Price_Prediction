import mongoose from 'mongoose';
import path from 'node:path';
import dotenv from 'dotenv';
import Property from '../models/Property.model';

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-broker';

async function main() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  console.log('⚠️  Counting existing properties...');
  const count = await Property.countDocuments();
  console.log(`Found ${count} properties in database`);

  if (count === 0) {
    console.log('No properties to delete. Exiting.');
    await mongoose.disconnect();
    return;
  }

  console.log('🗑️  Deleting all properties...');
  const result = await Property.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} properties`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
