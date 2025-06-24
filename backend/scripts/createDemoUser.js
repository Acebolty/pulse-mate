const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (existingUser) {
      console.log('Demo user already exists');
      process.exit(0);
    }

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    const demoUser = new User({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@pulsemate.com',
      passwordHash,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Other',
      address: {
        street: '123 Demo Street',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '12345',
        country: 'Demo Country'
      },
      emergencyContact: {
        name: 'Demo Emergency Contact',
        relationship: 'Friend',
        phone: '+1-555-0123'
      }
    });

    await demoUser.save();
    console.log('Demo user created successfully!');
    console.log('Email: demo@pulsemate.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createDemoUser();
