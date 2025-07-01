const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
require('dotenv').config();

const setupDoctorAndAppointment = async () => {
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

    // Check if doctor already exists
    let doctor = await User.findOne({ email: 'doctor@pulsemate.com' });

    if (!doctor) {
      console.log('👨‍⚕️ Creating doctor account...');

      // Create doctor account
      const hashedPassword = await bcrypt.hash('doctor123', 10);

      doctor = new User({
        patientId: 'DOC001', // Required field for doctor
        firstName: 'John',
        lastName: 'Smith',
        email: 'doctor@pulsemate.com',
        passwordHash: hashedPassword, // Use passwordHash instead of password
        role: 'doctor',
        doctorInfo: {
          specialty: 'Cardiology',
          licenseNumber: 'MD12345',
          experience: 10,
          department: 'Cardiology',
          approvalStatus: 'approved'
        }
      });

      await doctor.save();
      console.log('✅ Doctor account created:', doctor.firstName, doctor.lastName);
    } else {
      console.log('✅ Found existing doctor:', doctor.firstName, doctor.lastName);
    }

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
    } else {
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
    }

    console.log('\n🩺 SETUP COMPLETE!');
    console.log('📋 Next steps:');
    console.log('1. Login to doctor dashboard: doctor@pulsemate.com / doctor123');
    console.log('2. Demo User health data should now be visible in Patient Snapshot');
    console.log('3. Doctor can access Demo User health readings through appointment relationship');

  } catch (error) {
    console.error('❌ Error in setup:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

setupDoctorAndAppointment();
