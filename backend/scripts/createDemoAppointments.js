const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
require('dotenv').config();

const createDemoAppointments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pulse-mate');
    console.log('Connected to MongoDB');

    // Find the demo doctor
    const doctor = await User.findOne({ email: 'doctor@pulsemate.com' });
    if (!doctor) {
      console.log('Demo doctor not found! Please run createDemoDoctor.js first.');
      process.exit(1);
    }

    // Find some patients (we'll use existing users as patients)
    let patients = await User.find({ email: { $ne: 'doctor@pulsemate.com' } }).limit(3);

    if (patients.length === 0) {
      console.log('No patients found in database. Creating demo patients...');

      // Create a few demo patients
      const demoPatients = [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          passwordHash: 'dummy_hash',
          patientId: 'PM-20241226-0002',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'Female'
        },
        {
          firstName: 'Robert',
          lastName: 'Smith',
          email: 'robert.smith@example.com',
          passwordHash: 'dummy_hash',
          patientId: 'PM-20241226-0003',
          dateOfBirth: new Date('1970-08-22'),
          gender: 'Male'
        },
        {
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@example.com',
          passwordHash: 'dummy_hash',
          patientId: 'PM-20241226-0004',
          dateOfBirth: new Date('1992-11-08'),
          gender: 'Female'
        }
      ];

      patients = []; // Reset the array
      for (const patientData of demoPatients) {
        const patient = new User(patientData);
        await patient.save();
        patients.push(patient);
      }
      console.log('Created demo patients');
    }

    console.log(`Found ${patients.length} patients for appointments`);
    if (patients.length === 0) {
      console.log('No patients available to create appointments');
      process.exit(1);
    }

    // Check if demo appointments already exist
    const existingAppointments = await Appointment.find({
      providerName: { $regex: 'Dr.*Smith', $options: 'i' }
    });
    
    if (existingAppointments.length > 0) {
      console.log('Demo appointments already exist!');
      console.log(`Found ${existingAppointments.length} existing appointments for Dr. Smith`);
      process.exit(0);
    }

    // Create demo appointments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const demoAppointments = [
      {
        userId: patients[0]?._id,
        providerName: 'Dr. John Smith',
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        reason: 'Follow-up: Diabetes Management',
        type: 'Virtual',
        status: 'Confirmed',
        notes: '',
        virtualLink: 'https://meet.example.com/diabetes-followup'
      },
      {
        userId: patients[1]?._id || patients[0]._id,
        providerName: 'Dr. John Smith',
        providerId: doctor._id.toString(),
        dateTime: tomorrow,
        reason: 'Cardiac Evaluation',
        type: 'In-Person',
        status: 'Confirmed',
        notes: 'Patient reports palpitations'
      },
      {
        userId: patients[2]?._id || patients[0]._id,
        providerName: 'Dr. John Smith',
        providerId: doctor._id.toString(),
        dateTime: nextWeek,
        reason: 'Annual Physical Examination',
        type: 'In-Person',
        status: 'Scheduled',
        notes: ''
      },
      {
        userId: patients[0]._id,
        providerName: 'Dr. John Smith',
        providerId: doctor._id.toString(),
        dateTime: lastWeek,
        reason: 'Medication Review',
        type: 'Virtual',
        status: 'Completed',
        notes: 'Adjusted medication dosage. Patient responding well.'
      }
    ].filter(apt => apt.userId); // Filter out any appointments without valid userId

    // Save appointments
    for (const appointmentData of demoAppointments) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
    }

    console.log('Demo appointments created successfully!');
    console.log(`Created ${demoAppointments.length} appointments for Dr. John Smith`);
    console.log('Appointments:');
    demoAppointments.forEach((apt, index) => {
      console.log(`  ${index + 1}. ${apt.reason} - ${apt.dateTime.toLocaleString()} (${apt.status})`);
    });

  } catch (error) {
    console.error('Error creating demo appointments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDemoAppointments();
