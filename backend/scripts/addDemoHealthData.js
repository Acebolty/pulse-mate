const mongoose = require('mongoose');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
require('dotenv').config();

const addDemoHealthData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find Demo User
    const demoUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found');
      process.exit(1);
    }

    console.log('✅ Found Demo User:', demoUser.firstName, demoUser.lastName);

    // Create recent health data entries
    const now = new Date();
    const healthEntries = [
      // High blood pressure (critical)
      {
        userId: demoUser._id,
        dataType: 'bloodPressure',
        value: { systolic: 180, diastolic: 110 },
        unit: 'mmHg',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        source: 'Manual Entry',
        notes: 'Feeling dizzy and headache'
      },
      // Elevated heart rate
      {
        userId: demoUser._id,
        dataType: 'heartRate',
        value: 115,
        unit: 'bpm',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        source: 'Manual Entry',
        notes: 'After light exercise'
      },
      // Normal temperature
      {
        userId: demoUser._id,
        dataType: 'bodyTemperature',
        value: 98.6,
        unit: '°F',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        source: 'Manual Entry',
        notes: 'Morning reading'
      },
      // Elevated glucose
      {
        userId: demoUser._id,
        dataType: 'glucoseLevel',
        value: 160,
        unit: 'mg/dL',
        timestamp: new Date(now.getTime() - 90 * 60 * 1000), // 1.5 hours ago
        source: 'Manual Entry',
        notes: 'Post-meal reading'
      },
      // Normal heart rate (earlier)
      {
        userId: demoUser._id,
        dataType: 'heartRate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        source: 'Manual Entry',
        notes: 'Resting heart rate'
      }
    ];

    // Delete existing health data to avoid duplicates
    await HealthData.deleteMany({ userId: demoUser._id });
    console.log('🗑️ Cleared existing health data');

    // Insert new health data
    await HealthData.insertMany(healthEntries);
    console.log('✅ Added demo health data:', healthEntries.length, 'entries');

    healthEntries.forEach((entry, index) => {
      const timeAgo = Math.round((now - entry.timestamp) / (1000 * 60));
      console.log(`${index + 1}. ${entry.dataType}: ${
        entry.dataType === 'bloodPressure' 
          ? `${entry.value.systolic}/${entry.value.diastolic} mmHg` 
          : entry.value + (entry.dataType === 'heartRate' ? ' bpm' : 
                          entry.dataType === 'bodyTemperature' ? '°F' : 
                          entry.dataType === 'glucoseLevel' ? ' mg/dL' : '')
      } (${timeAgo} min ago)`);
    });

    console.log('\n🩺 Demo health data created successfully!');
    console.log('📊 Check the doctor dashboard Patient Activity Feed for updates');
    console.log('📋 Check the Patient Snapshot for latest readings');

  } catch (error) {
    console.error('❌ Error creating demo health data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

addDemoHealthData();
