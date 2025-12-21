const mongoose = require('mongoose');
const path = require('path');

const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-broker';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for inspection');

    const email = process.argv[2] || 'admin@propertybroker.com';
    // Use raw collections to avoid requiring TS model files
    const usersColl = mongoose.connection.collection('users');
    const subsColl = mongoose.connection.collection('subscriptions');

    const user = await usersColl.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found for', email);
      process.exit(0);
    }

    console.log('User:', { id: user._id.toString(), email: user.email });
    const subs = await subsColl.find({ user: user._id }).toArray();
    console.log('Subscriptions found:', subs.length);
    subs.forEach((s) => {
      console.log('---');
      console.log('id:', s._id.toString());
      console.log('planType:', s.planType);
      console.log('isActive:', s.isActive);
      console.log('startDate:', s.startDate);
      console.log('expiryDate:', s.expiryDate);
      console.log('amount:', s.amount);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error inspecting subscriptions:', err);
    process.exit(1);
  }
}

run();
