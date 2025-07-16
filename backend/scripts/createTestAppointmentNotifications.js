require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const createTestAppointmentNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a doctor and patient
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });

    if (!doctor || !patient) {
      console.log('❌ Need at least one doctor and one patient in the database');
      return;
    }

    console.log(`👨‍⚕️ Found doctor: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`👤 Found patient: ${patient.firstName} ${patient.lastName}`);

    // Create a test appointment
    const testAppointment = new Appointment({
      userId: patient._id,
      providerId: doctor._id,
      providerName: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reason: 'Routine checkup and health consultation',
      type: 'Chat',
      status: 'Pending'
    });

    await testAppointment.save();
    console.log('📅 Created test appointment');

    // Create appointment notification for the doctor
    const appointmentData = {
      ...testAppointment.toObject(),
      patientName: `${patient.firstName} ${patient.lastName}`
    };

    const notification = await Notification.createAppointmentNotification(
      appointmentData,
      doctor._id,
      'appointment_request'
    );

    console.log('📧 Created appointment notification:', notification.title);

    // Create a few more test notifications
    const notifications = [
      {
        recipientId: doctor._id,
        senderId: patient._id,
        type: 'appointment_request',
        title: 'New Appointment Request',
        message: `${patient.firstName} ${patient.lastName} has requested an appointment for Blood pressure check`,
        priority: 'normal',
        relatedId: testAppointment._id,
        relatedType: 'appointment',
        data: {
          appointmentId: testAppointment._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          reason: 'Blood pressure check'
        },
        source: 'Appointment System'
      },
      {
        recipientId: doctor._id,
        senderId: patient._id,
        type: 'appointment_request',
        title: 'Urgent Appointment Request',
        message: `${patient.firstName} ${patient.lastName} has requested an urgent appointment for Chest pain evaluation`,
        priority: 'high',
        relatedId: testAppointment._id,
        relatedType: 'appointment',
        data: {
          appointmentId: testAppointment._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          reason: 'Chest pain evaluation'
        },
        source: 'Appointment System'
      }
    ];

    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`📧 Created notification: ${notification.title}`);
    }

    console.log('✅ Test appointment notifications created successfully!');

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
};

// Run the script
createTestAppointmentNotifications();
