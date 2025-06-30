require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@pulsemate.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@pulsemate.com');
      console.log('Use existing password or delete the user first');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@pulsemate.com',
      passwordHash,
      phone: '+1-555-ADMIN',
      patientId: 'ADMIN-20241226-0001', // Override the auto-generated patient ID
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Other',
      role: 'admin', // Add this field to User model if not exists
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'AC',
        zipCode: '00000',
        country: 'USA'
      },
      // Admin-specific settings
      settings: {
        privacy: {
          profileVisibility: 'private',
          dataSharing: false,
          researchParticipation: false,
          marketingEmails: false,
          anonymousAnalytics: false
        },
        notifications: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: false,
          medicationReminders: false,
          healthAlerts: true,
          labResults: false,
          messageNotifications: true,
          weeklyHealthSummary: false,
          emailAlertTypes: {
            critical: true,
            warning: true,
            info: true,
            success: false
          },
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00'
        },
        health: {
          units: 'imperial',
          glucoseUnit: 'mg/dL',
          temperatureUnit: 'fahrenheit',
          autoSync: false,
          dataRetention: 'forever'
        },
        appearance: {
          theme: 'system',
          fontSize: 'medium',
          colorScheme: 'green'
        },
        security: {
          twoFactorEnabled: true,
          sessionTimeout: '8-hours',
          loginAlerts: true
        }
      },
      timezone: 'America/New_York',
      language: 'English'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@pulsemate.com');
    console.log('Password: admin123');
    console.log('Patient ID (acting as Admin ID):', adminUser.patientId);
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
