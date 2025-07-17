const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const createPastAppointments = async () => {
  try {
    // Load environment variables
    require('dotenv').config();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find any patient user
    const demoUser = await User.findOne({ role: 'patient' });
    if (!demoUser) {
      console.log('No patient found. Please create a patient first.');
      return;
    }

    // Find a doctor
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('No doctor found. Please create a doctor first.');
      return;
    }

    console.log(`Creating past appointments for user: ${demoUser.firstName} ${demoUser.lastName}`);
    console.log(`Doctor: ${doctor.firstName} ${doctor.lastName}`);

    // Create past appointments with different dates
    const now = new Date();
    const pastAppointments = [
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        reason: 'General Health Checkup',
        type: 'Chat',
        status: 'Completed',
        notes: 'Patient health metrics reviewed. All vitals normal.',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        reason: 'Blood Pressure Follow-up',
        type: 'Chat',
        status: 'Completed',
        notes: 'Blood pressure medication adjusted. Patient responding well.',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        reason: 'Diabetes Management',
        type: 'Chat',
        status: 'Completed',
        notes: 'Glucose levels stable. Continue current medication regimen.',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        reason: 'Routine Consultation',
        type: 'Chat',
        status: 'Cancelled',
        notes: 'Patient cancelled due to scheduling conflict.',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 1.5 months ago
        reason: 'Heart Rate Monitoring Review',
        type: 'Chat',
        status: 'Completed',
        notes: 'Heart rate patterns reviewed. Recommended increased physical activity.',
        sessionDuration: 30
      }
    ];

    // Save appointments
    for (const appointmentData of pastAppointments) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      console.log(`✅ Created past appointment: ${appointment.reason} (${appointment.status}) - ${appointment.dateTime.toLocaleDateString()}`);
    }

    console.log(`\n🎉 Successfully created ${pastAppointments.length} past appointments!`);
    console.log('📋 Past appointments section should now show real data');

  } catch (error) {
    console.error('❌ Error creating past appointments:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the script
createPastAppointments();
