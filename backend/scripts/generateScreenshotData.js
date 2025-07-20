const mongoose = require('mongoose');
const HealthDataSimulator = require('../services/healthDataSimulator');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
require('dotenv').config();

async function generateScreenshotData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-health-dashboard');
    console.log('✅ Connected to MongoDB');

    // Find a patient user (you can replace with your actual user ID)
    const patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      console.log('❌ No patient user found. Please create a patient account first.');
      return;
    }

    console.log(`📊 Generating historical data for patient: ${patient.firstName} ${patient.lastName}`);
    console.log(`👤 User ID: ${patient._id}`);

    // Create simulator instance
    const simulator = new HealthDataSimulator(patient._id);

    // Clear existing data for this user (optional)
    const existingCount = await HealthData.countDocuments({ userId: patient._id });
    console.log(`🗑️ Found ${existingCount} existing health records`);
    
    if (existingCount > 0) {
      await HealthData.deleteMany({ userId: patient._id });
      console.log('🗑️ Cleared existing health data');
    }

    // Generate 30 days of rich historical data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    console.log(`📅 Generating data from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    // Create varied scenarios for interesting data
    const scenarios = [];
    for (let i = 0; i < 30; i++) {
      if (i % 10 === 0) scenarios.push('stressful_day');
      else if (i % 8 === 0) scenarios.push('sick_day');
      else if (i % 5 === 0) scenarios.push('active_day');
      else scenarios.push('normal');
    }

    // Generate the data
    const healthDataArray = await simulator.generateMultipleDays(startDate, 30, scenarios);
    console.log(`📊 Generated ${healthDataArray.length} health data entries`);

    // Save to database
    const savedData = await simulator.saveToDatabase(healthDataArray);
    console.log(`💾 Saved ${savedData.length} entries to database`);

    // Show summary by data type
    const summary = {};
    savedData.forEach(entry => {
      summary[entry.dataType] = (summary[entry.dataType] || 0) + 1;
    });

    console.log('\n📈 Data Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} readings`);
    });

    console.log('\n🎯 Perfect! Your dashboard should now have rich data for screenshots.');
    console.log('📸 You can now take screenshots of:');
    console.log('  1. Dashboard Overview - Rich health metrics');
    console.log('  2. Health Metrics - Charts with 30 days of data');
    console.log('  3. Alerts - Various health alerts generated');
    console.log('  4. Any other dashboard pages');

  } catch (error) {
    console.error('❌ Error generating screenshot data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
generateScreenshotData();
