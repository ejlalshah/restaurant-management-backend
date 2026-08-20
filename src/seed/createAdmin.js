// Run with: npm run create-admin
// Creates (or upgrades an existing user to) an admin account.
// This exists because the public /signup endpoint never accepts a role -
// admin accounts must be provisioned outside the normal signup flow.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Restaurant Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

const createAdmin = async () => {
  await connectDB();

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`Existing user ${ADMIN_EMAIL} upgraded to admin`);
  } else {
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('Log in with these credentials, then change the password via your own flow if needed.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
