const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
require('dotenv').config();

const createDemoAppointment = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find Demo User (patient)
    const demoUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (!demoUser) {
      console.log('Demo user not found. Please run createDemoUser.js first.');
      process.exit(1);
    }
    console.log('Found Demo User:', demoUser.firstName, demoUser.lastName);

    // Find Doctor
    const doctor = await User.findOne({ email: 'doctor@pulsemate.com' });
    if (!doctor) {
      console.log('Doctor not found. Please run createDemoDoctor.js first.');
      process.exit(1);
    }
    console.log('Found Doctor:', doctor.firstName, doctor.lastName);

    // Check if appointment already exists
    const existingAppointment = await Appointment.findOne({
      userId: demoUser._id,
      providerId: doctor._id
    });

    if (existingAppointment) {
      console.log('Appointment relationship already exists');
      process.exit(0);
    }

    // Create appointment to establish doctor-patient relationship
    const demoAppointment = new Appointment({
      userId: demoUser._id,
      providerId: doctor._id,
      dateTime: new Date(), // Current time
      reasonForVisit: 'Health Monitoring and Dashboard Setup',
      appointmentType: 'consultation',
      status: 'completed', // Mark as completed so it doesn't show in upcoming
      notes: 'Demo appointment to establish doctor-patient relationship for health data access',
      location: 'Virtual',
      duration: 30
    });

    await demoAppointment.save();
    console.log('Demo appointment created successfully!');
    console.log('Doctor can now access Demo User health data');

  } catch (error) {
    console.error('Error creating demo appointment:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createDemoAppointment();
