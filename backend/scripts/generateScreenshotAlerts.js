const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const User = require('../models/User');
require('dotenv').config();

async function generateScreenshotAlerts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-health-dashboard');
    console.log('✅ Connected to MongoDB');

    // Find a patient user
    const patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      console.log('❌ No patient user found. Please create a patient account first.');
      return;
    }

    console.log(`🚨 Generating alerts for patient: ${patient.firstName} ${patient.lastName}`);

    // Clear existing alerts for this user
    await Alert.deleteMany({ userId: patient._id });
    console.log('🗑️ Cleared existing alerts');

    // Generate sample alerts for screenshots
    const sampleAlerts = [
      {
        userId: patient._id,
        type: 'critical',
        title: 'High Blood Pressure Alert',
        message: 'Your blood pressure reading of 145/95 mmHg is above normal range. Please consult your doctor.',
        relatedDataType: 'bloodPressure',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false
      },
      {
        userId: patient._id,
        type: 'warning',
        title: 'Elevated Heart Rate',
        message: 'Your heart rate of 105 bpm is slightly elevated. Consider taking a rest.',
        relatedDataType: 'heartRate',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: false
      },
      {
        userId: patient._id,
        type: 'info',
        title: 'Daily Health Goal Achieved',
        message: 'Congratulations! You have recorded all your health metrics for today.',
        relatedDataType: 'general',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: true
      },
      {
        userId: patient._id,
        type: 'warning',
        title: 'Low Blood Glucose',
        message: 'Your glucose level of 65 mg/dL is below normal. Consider having a snack.',
        relatedDataType: 'glucoseLevel',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        isRead: false
      },
      {
        userId: patient._id,
        type: 'critical',
        title: 'High Body Temperature',
        message: 'Your body temperature of 101.2°F indicates fever. Please monitor closely.',
        relatedDataType: 'bodyTemperature',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isRead: true
      },
      {
        userId: patient._id,
        type: 'info',
        title: 'Weekly Health Summary',
        message: 'Your average heart rate this week was 72 bpm - within healthy range.',
        relatedDataType: 'heartRate',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true
      },
      {
        userId: patient._id,
        type: 'warning',
        title: 'Irregular Blood Pressure Pattern',
        message: 'We noticed fluctuating blood pressure readings. Consider lifestyle adjustments.',
        relatedDataType: 'bloodPressure',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
        isRead: false
      },
      {
        userId: patient._id,
        type: 'info',
        title: 'Health Data Sync Complete',
        message: 'Successfully synced 15 new health readings from your devices.',
        relatedDataType: 'general',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        isRead: true
      }
    ];

    // Save alerts to database
    const savedAlerts = await Alert.insertMany(sampleAlerts);
    console.log(`💾 Generated ${savedAlerts.length} sample alerts`);

    // Show summary by type
    const summary = {};
    savedAlerts.forEach(alert => {
      summary[alert.type] = (summary[alert.type] || 0) + 1;
    });

    console.log('\n🚨 Alerts Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} alerts`);
    });

    const unreadCount = savedAlerts.filter(alert => !alert.isRead).length;
    console.log(`\n📬 Unread alerts: ${unreadCount}`);

    console.log('\n🎯 Perfect! Your alerts page should now have rich content for screenshots.');

  } catch (error) {
    console.error('❌ Error generating screenshot alerts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
generateScreenshotAlerts();
