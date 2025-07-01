require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const createTestAppointment = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find demo patient and doctor
    const patient = await User.findOne({ email: 'demo@pulsemate.com' });
    const doctor = await User.findOne({ email: 'doctor@pulsemate.com' });

    if (!patient) {
      console.log('❌ Demo patient not found. Please run createDemoUser.js first');
      return;
    }

    if (!doctor) {
      console.log('❌ Demo doctor not found. Please run createDemoDoctor.js first');
      return;
    }

    // Check if test appointment already exists
    const existingAppointment = await Appointment.findOne({
      userId: patient._id,
      status: 'Pending'
    });

    if (existingAppointment) {
      console.log('✅ Test appointment already exists!');
      console.log(`   - Patient: ${patient.firstName} ${patient.lastName}`);
      console.log(`   - Doctor: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   - Status: ${existingAppointment.status}`);
      console.log(`   - Reason: ${existingAppointment.reason}`);
      return;
    }

    // Create test appointment
    const testAppointment = new Appointment({
      userId: patient._id,
      reason: 'General Health Consultation',
      notes: 'Patient requesting a general health check-up and consultation about recent symptoms.',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      providerName: `${doctor.firstName} ${doctor.lastName}`,
      type: 'Chat',
      status: 'Pending',
      sessionDuration: 30,
      location: 'Online Chat Session',
      priority: 'Medium'
    });

    await testAppointment.save();

    console.log('✅ Test appointment created successfully!');
    console.log(`   - Patient: ${patient.firstName} ${patient.lastName} (${patient.email})`);
    console.log(`   - Doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
    console.log(`   - Date: ${testAppointment.dateTime.toLocaleDateString()}`);
    console.log(`   - Time: ${testAppointment.dateTime.toLocaleTimeString()}`);
    console.log(`   - Status: ${testAppointment.status}`);
    console.log(`   - Session Duration: ${testAppointment.sessionDuration} minutes`);
    console.log(`   - Reason: ${testAppointment.reason}`);
    console.log(`   - Appointment ID: ${testAppointment._id}`);

    console.log('\n🎯 Next steps:');
    console.log('1. Login to admin dashboard: http://localhost:3002/login');
    console.log('2. Go to Appointments page');
    console.log('3. Approve the pending appointment');
    console.log('4. Test the chat session functionality');

  } catch (error) {
    console.error('❌ Error creating test appointment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createTestAppointment();
