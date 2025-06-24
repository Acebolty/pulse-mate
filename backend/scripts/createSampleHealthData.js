const mongoose = require('mongoose');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
require('dotenv').config();

const createSampleHealthData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the demo user
    const demoUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (!demoUser) {
      console.log('Demo user not found. Please create demo user first.');
      process.exit(1);
    }

    console.log('Found demo user:', demoUser.firstName, demoUser.lastName);

    // Clear existing health data for demo user
    await HealthData.deleteMany({ userId: demoUser._id });
    console.log('Cleared existing health data for demo user');

    // Create sample health data for the last 7 days
    const healthDataEntries = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Morning readings
      const morningTime = new Date(date);
      morningTime.setHours(8, 0, 0, 0);
      
      // Heart Rate
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'heartRate',
        value: 68 + Math.floor(Math.random() * 10), // 68-77 bpm
        unit: 'bpm',
        timestamp: morningTime,
        source: 'Apple Watch'
      });

      // Blood Pressure
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'bloodPressure',
        value: {
          systolic: 115 + Math.floor(Math.random() * 10), // 115-124
          diastolic: 75 + Math.floor(Math.random() * 8)   // 75-82
        },
        unit: 'mmHg',
        timestamp: new Date(morningTime.getTime() + 5 * 60000), // 5 min later
        source: 'BP Monitor'
      });

      // Weight (morning)
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'weight',
        value: 173.5 + (Math.random() - 0.5) * 2, // 172.5-174.5 lbs
        unit: 'lbs',
        timestamp: new Date(morningTime.getTime() + 10 * 60000),
        source: 'Smart Scale'
      });

      // Body Temperature (morning)
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'bodyTemperature',
        value: 98.6 + (Math.random() - 0.5) * 1, // 98.1-99.1°F
        unit: '°F',
        timestamp: new Date(morningTime.getTime() + 15 * 60000),
        source: 'Smart Thermometer'
      });

      // Glucose (fasting)
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'glucoseLevel',
        value: 85 + Math.floor(Math.random() * 15), // 85-99 mg/dL
        unit: 'mg/dL',
        timestamp: new Date(morningTime.getTime() + 20 * 60000),
        source: 'Glucose Monitor',
        notes: 'Fasting'
      });

      // Evening readings
      const eveningTime = new Date(date);
      eveningTime.setHours(20, 0, 0, 0);

      // Steps
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'stepsTaken',
        value: 8000 + Math.floor(Math.random() * 4000), // 8000-12000 steps
        unit: 'steps',
        timestamp: eveningTime,
        source: 'iPhone'
      });

      // Calories Burned
      healthDataEntries.push({
        userId: demoUser._id,
        dataType: 'caloriesBurned',
        value: 1800 + Math.floor(Math.random() * 400), // 1800-2200 calories
        unit: 'kcal',
        timestamp: new Date(eveningTime.getTime() + 30 * 60000),
        source: 'Fitness Tracker'
      });

      // Sleep Duration (previous night)
      if (i > 0) {
        const sleepTime = new Date(date);
        sleepTime.setHours(7, 30, 0, 0); // 7:30 AM
        
        healthDataEntries.push({
          userId: demoUser._id,
          dataType: 'sleepDuration',
          value: 7.5 + (Math.random() - 0.5) * 2, // 6.5-8.5 hours
          unit: 'hours',
          timestamp: sleepTime,
          source: 'Sleep Tracker'
        });
      }
    }

    // Insert all health data
    await HealthData.insertMany(healthDataEntries);
    console.log(`Created ${healthDataEntries.length} sample health data entries`);
    console.log('Sample data includes:');
    console.log('- Heart Rate readings');
    console.log('- Blood Pressure readings');
    console.log('- Weight measurements');
    console.log('- Body Temperature measurements');
    console.log('- Glucose levels');
    console.log('- Daily steps');
    console.log('- Calories burned');
    console.log('- Sleep duration');

  } catch (error) {
    console.error('Error creating sample health data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSampleHealthData();
