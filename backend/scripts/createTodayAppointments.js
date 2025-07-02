const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
require('dotenv').config();

async function createTodayAppointments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const doctor = await User.findOne({ email: 'doctor@pulsemate.com' });
    const demoUser = await User.findOne({ firstName: 'Demo', lastName: 'User' });
    
    if (!doctor || !demoUser) {
      console.log('Doctor or Demo User not found');
      return;
    }
    
    console.log('Found doctor:', doctor.firstName, doctor.lastName);
    console.log('Found demo user:', demoUser.firstName, demoUser.lastName);
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Delete existing appointments for today to avoid duplicates
    await Appointment.deleteMany({
      providerId: doctor._id,
      dateTime: {
        $gte: todayStart,
        $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Create appointments for today
    const appointments = [
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(todayStart.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        reason: 'Morning Health Check',
        type: 'Chat',
        status: 'Approved',
        notes: 'Regular morning consultation',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(todayStart.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
        reason: 'Follow-up Consultation',
        type: 'Chat',
        status: 'Approved',
        notes: 'Follow-up on health metrics',
        sessionDuration: 30
      },
      {
        userId: demoUser._id,
        providerName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        providerId: doctor._id.toString(),
        dateTime: new Date(todayStart.getTime() + 10 * 60 * 60 * 1000), // 10 AM today
        reason: 'Blood Pressure Review',
        type: 'Chat',
        status: 'Completed',
        notes: 'Completed blood pressure consultation',
        sessionDuration: 30
      }
    ];
    
    for (const apt of appointments) {
      const created = await Appointment.create(apt);
      console.log('Created appointment:', {
        time: created.dateTime.toLocaleTimeString(),
        reason: created.reason,
        status: created.status
      });
    }
    
    console.log('✅ Created today appointments successfully!');
    console.log('📊 Dashboard should now show real data');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTodayAppointments();
