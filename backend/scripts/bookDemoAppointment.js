const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
require('dotenv').config();

const bookDemoAppointment = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find Demo User (patient)
    const demoUser = await User.findOne({ email: 'demo@pulsemate.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found. Please create Demo User first.');
      process.exit(1);
    }
    console.log('✅ Found Demo User:', demoUser.firstName, demoUser.lastName);

    // Find Doctor
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('❌ Doctor not found. Please create a doctor account first.');
      process.exit(1);
    }
    console.log('✅ Found Doctor:', doctor.firstName, doctor.lastName);

    // Check if appointment already exists
    const existingAppointment = await Appointment.findOne({
      userId: demoUser._id,
      providerId: doctor._id
    });

    if (existingAppointment) {
      console.log('✅ Appointment relationship already exists');
      console.log('📅 Existing appointment:', {
        date: existingAppointment.dateTime,
        status: existingAppointment.status,
        reason: existingAppointment.reasonForVisit
      });
      console.log('🩺 Doctor can now access Demo User health data');
      process.exit(0);
    }

    // Create appointment (patient books with doctor)
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow

    const newAppointment = new Appointment({
      userId: demoUser._id,
      providerId: doctor._id,
      dateTime: appointmentDate,
      reasonForVisit: 'Health Monitoring and Consultation',
      appointmentType: 'consultation',
      status: 'confirmed', // Confirmed appointment
      notes: 'Demo appointment to establish doctor-patient relationship',
      location: 'Virtual Consultation',
      duration: 30
    });

    await newAppointment.save();
    console.log('🎉 Demo appointment created successfully!');
    console.log('📅 Appointment details:', {
      patient: `${demoUser.firstName} ${demoUser.lastName}`,
      doctor: `${doctor.firstName} ${doctor.lastName}`,
      date: appointmentDate.toLocaleDateString(),
      time: appointmentDate.toLocaleTimeString(),
      status: 'confirmed'
    });
    console.log('🩺 Doctor can now access Demo User health data');

  } catch (error) {
    console.error('❌ Error creating demo appointment:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

bookDemoAppointment();
