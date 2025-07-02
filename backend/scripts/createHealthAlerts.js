const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const User = require('../models/User');
require('dotenv').config();

async function createHealthAlerts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const demoUser = await User.findOne({ firstName: 'Demo', lastName: 'User' });
    
    if (!demoUser) {
      console.log('Demo User not found');
      return;
    }
    
    console.log('Found demo user:', demoUser.firstName, demoUser.lastName);
    
    // Delete existing alerts to avoid duplicates
    await Alert.deleteMany({ userId: demoUser._id });
    
    // Create health alerts
    const alerts = [
      {
        userId: demoUser._id,
        type: 'critical',
        priority: 'high',
        title: 'High Blood Pressure Alert',
        message: 'Blood pressure reading of 180/110 mmHg detected. Immediate medical attention recommended.',
        isRead: false,
        category: 'health',
        source: 'Health Monitoring System',
        metadata: {
          healthDataType: 'bloodPressure',
          value: { systolic: 180, diastolic: 110 },
          threshold: { systolic: 140, diastolic: 90 }
        }
      },
      {
        userId: demoUser._id,
        type: 'warning',
        priority: 'high',
        title: 'Elevated Heart Rate',
        message: 'Heart rate of 115 bpm detected during rest. Please monitor closely.',
        isRead: false,
        category: 'health',
        source: 'Health Monitoring System',
        metadata: {
          healthDataType: 'heartRate',
          value: 115,
          threshold: 100
        }
      },
      {
        userId: demoUser._id,
        type: 'critical',
        priority: 'high',
        title: 'High Glucose Level',
        message: 'Glucose level of 160 mg/dL detected. Please review medication and diet.',
        isRead: false,
        category: 'health',
        source: 'Health Monitoring System',
        metadata: {
          healthDataType: 'glucoseLevel',
          value: 160,
          threshold: 140
        }
      }
    ];
    
    for (const alert of alerts) {
      const created = await Alert.create(alert);
      console.log('Created alert:', {
        type: created.type,
        priority: created.priority,
        title: created.title
      });
    }
    
    console.log('✅ Created health alerts successfully!');
    console.log('📊 Dashboard should now show pending reviews');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createHealthAlerts();
