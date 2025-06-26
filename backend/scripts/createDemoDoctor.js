const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createDemoDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pulse-mate');
    console.log('Connected to MongoDB');

    // Check if demo doctor already exists
    const existingDoctor = await User.findOne({ email: 'doctor@pulsemate.com' });
    if (existingDoctor) {
      console.log('Demo doctor already exists!');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('doctor123', salt);

    // Create demo doctor account
    const demoDoctor = new User({
      firstName: 'John',
      lastName: 'Smith',
      email: 'doctor@pulsemate.com',
      passwordHash,
      phone: '+1-555-0123',
      // We'll use the existing User model but adapt it for a doctor
      // In a real system, you'd want a separate Doctor model
      patientId: 'DR-20241226-0001', // Override the auto-generated patient ID
      dateOfBirth: new Date('1980-05-15'),
      gender: 'Male',
      address: {
        street: '123 Medical Center Dr',
        city: 'Healthcare City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      // Adapt medical info for doctor
      medicalInfo: {
        bloodType: 'O+',
        height: '6\'0"',
        weight: '180 lbs',
        allergies: [],
        chronicConditions: [],
        medications: [],
        primaryDoctor: {
          name: 'Self',
          specialty: 'Cardiology',
          phone: '+1-555-0123',
          email: 'doctor@pulsemate.com'
        }
      },
      // Doctor-specific info stored in existing fields
      timezone: 'America/Los_Angeles',
      language: 'English'
    });

    await demoDoctor.save();
    console.log('Demo doctor created successfully!');
    console.log('Email: doctor@pulsemate.com');
    console.log('Password: doctor123');
    console.log('Patient ID (acting as Doctor ID):', demoDoctor.patientId);

  } catch (error) {
    console.error('Error creating demo doctor:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDemoDoctor();
