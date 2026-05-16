'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function test() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const email = `test_${Date.now()}@example.com`;
    console.log(`Creating user: ${email}`);
    
    const user = await User.create({
      email,
      passwordHash: 'Password123!',
      name: 'Test User'
    });
    console.log('User created:', user._id);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
