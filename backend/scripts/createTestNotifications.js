const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const User = require('../models/User');
require('dotenv').config();

const createTestNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find Demo User
    const demoUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found');
      process.exit(1);
    }

    // Create test health alerts
    const testAlerts = [
      {
        userId: demoUser._id,
        type: 'critical',
        title: 'High Blood Pressure Alert',
        message: 'Blood pressure reading of 180/110 mmHg requires immediate attention',
        description: 'Critical hypertension detected',
        source: 'Blood Pressure Monitor',
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      },
      {
        userId: demoUser._id,
        type: 'warning',
        title: 'Elevated Heart Rate',
        message: 'Heart rate of 115 bpm is above normal range',
        description: 'Tachycardia detected during routine monitoring',
        source: 'Heart Rate Monitor',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        userId: demoUser._id,
        type: 'info',
        title: 'Daily Health Summary',
        message: 'Your daily health metrics have been recorded',
        description: 'All vital signs within normal range',
        source: 'Health Dashboard',
        priority: 'low',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];

    // Delete existing test alerts to avoid duplicates
    await Alert.deleteMany({ userId: demoUser._id });
    console.log('🗑️ Cleared existing alerts');

    // Insert new test alerts
    await Alert.insertMany(testAlerts);
    console.log('✅ Created test notifications:', testAlerts.length);

    testAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.type.toUpperCase()}: ${alert.title}`);
    });

    console.log('\n🔔 Test notifications created successfully!');
    console.log('📱 Check the doctor dashboard navbar and sidebar for notification badges');
    console.log('🔔 Click the notification bell to see the dropdown');

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestNotifications();
