const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment,
    getDoctorAppointments,
    getActiveSessions,
    getAvailableDoctors
} = require('../controllers/appointmentController');

// @route   POST api/appointments
// @desc    Create a new appointment for the logged-in user
// @access  Private
router.post('/', authMiddleware, createAppointment);

// @route   GET api/appointments
// @desc    Get appointments for the logged-in user
// @access  Private
router.get('/', authMiddleware, getAppointments);

// @route   GET api/appointments/doctor
// @desc    Get appointments where the logged-in user is the doctor/provider
// @access  Private
router.get('/doctor', authMiddleware, getDoctorAppointments);

// @route   GET api/appointments/active-sessions
// @desc    Get active appointment sessions for the logged-in user
// @access  Private
router.get('/active-sessions', authMiddleware, getActiveSessions);

// @route   GET api/appointments/available-doctors
// @desc    Get available doctors for appointment booking
// @access  Private
router.get('/available-doctors', authMiddleware, getAvailableDoctors);

// @route   POST api/appointments/reactivate-latest
// @desc    Reactivate the latest approved appointment for the user
// @access  Private
router.post('/reactivate-latest', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Reactivating latest appointment for user:', req.user.id);

    const Appointment = require('../models/Appointment');
    const Chat = require('../models/Chat');

    // Find the most recent approved appointment for this user
    const latestAppointment = await Appointment.findOne({
      userId: req.user.id,
      status: 'Approved'
    }).sort({ createdAt: -1 });

    if (!latestAppointment) {
      return res.status(404).json({ message: 'No approved appointments found' });
    }

    console.log('📅 Found latest appointment:', latestAppointment._id);

    // Enable chat and set session times
    latestAppointment.chatEnabled = true;
    latestAppointment.sessionStartTime = new Date();
    latestAppointment.sessionEndTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await latestAppointment.save();

    // Find and reactivate chat
    const existingChat = await Chat.findOne({
      participants: { $all: [latestAppointment.userId, latestAppointment.providerId] }
    });

    if (existingChat) {
      existingChat.appointmentId = latestAppointment._id;
      existingChat.isActive = true;
      existingChat.sessionEndTime = null;
      existingChat.renewedAt = new Date();
      existingChat.lastMessageTimestamp = new Date();
      await existingChat.save();

      latestAppointment.chatRoomId = existingChat._id;
      await latestAppointment.save();

      console.log('✅ Chat reactivated successfully');
    }

    res.json({
      success: true,
      message: 'Session reactivated successfully',
      appointment: latestAppointment
    });

  } catch (error) {
    console.error('❌ Error reactivating session:', error);
    res.status(500).json({ message: 'Server error reactivating session' });
  }
});

// @route   POST api/appointments/:appointmentId/approve
// @desc    Approve an appointment (temporary route for testing)
// @access  Private
router.post('/:appointmentId/approve', authMiddleware, async (req, res) => {
  try {
    const fs = require('fs');
    const logMessage = `\n${new Date().toISOString()} - 🚀 APPOINTMENT APPROVAL ROUTE CALLED!\nAppointment ID: ${req.params.appointmentId}\nUser ID: ${req.user.id}\nUser Email: ${req.user.email || 'unknown'}\n`;
    fs.appendFileSync('approval.log', logMessage);
    console.log('🚀 ===== APPOINTMENT APPROVAL ROUTE CALLED =====');
    console.log('📋 Appointment ID:', req.params.appointmentId);
    console.log('👤 User:', req.user);

    console.log('🚀 ===== APPOINTMENT APPROVAL STARTED =====');
    console.log('🎯 Appointment approval called via appointment routes');
    console.log('📋 Appointment ID:', req.params.appointmentId);
    console.log('👤 User ID:', req.user.id);

    const Appointment = require('../models/Appointment');
    const Chat = require('../models/Chat');

    const { appointmentId } = req.params;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment status and enable chat
    appointment.status = 'Approved';
    appointment.approvedAt = new Date();
    appointment.approvedBy = req.user.id;
    appointment.chatEnabled = true; // Enable chat for the session
    appointment.sessionStartTime = new Date(); // Set session start time
    appointment.sessionEndTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    await appointment.save();

    fs.appendFileSync('approval.log', `${new Date().toISOString()} - APPOINTMENT UPDATED: chatEnabled=true, sessionEndTime=${appointment.sessionEndTime}\n`);

    // Find existing chat room between patient and doctor
    let existingChat = await Chat.findOne({
      participants: { $all: [appointment.userId, appointment.providerId] }
    });

    if (existingChat) {
      // Reactivate expired chat room with new appointment
      const logMsg = `${new Date().toISOString()} - REACTIVATING EXISTING CHAT\nChat ID: ${existingChat._id}\nPrevious status: ${existingChat.isActive}\n`;
      fs.appendFileSync('approval.log', logMsg);

      console.log('🔄 Found existing chat room, reactivating...');
      console.log('📋 Chat ID:', existingChat._id);
      console.log('📋 Previous status:', existingChat.isActive);

      existingChat.appointmentId = appointment._id;
      existingChat.isActive = true;
      existingChat.sessionEndTime = null; // Clear previous session end time
      existingChat.renewedAt = new Date();
      existingChat.lastMessageTimestamp = new Date();
      await existingChat.save();

      // Link chat room to appointment
      appointment.chatRoomId = existingChat._id;
      await appointment.save();

      fs.appendFileSync('approval.log', `${new Date().toISOString()} - CHAT REACTIVATED SUCCESSFULLY, chatRoomId=${existingChat._id}\n`);
      console.log('✅ Existing chat room reactivated for new appointment');
    } else {
      // Create new chat room
      fs.appendFileSync('approval.log', `${new Date().toISOString()} - CREATING NEW CHAT\n`);
      console.log('🆕 No existing chat found, creating new one...');
      const newChat = new Chat({
        participants: [appointment.userId, appointment.providerId],
        appointmentId: appointment._id,
        isActive: true,
        createdAt: new Date(),
        lastMessageTimestamp: new Date()
      });
      await newChat.save();

      // Link chat room to appointment
      appointment.chatRoomId = newChat._id;
      await appointment.save();

      fs.appendFileSync('approval.log', `${new Date().toISOString()} - NEW CHAT CREATED: ${newChat._id}\n`);
      console.log('✅ New chat room created for appointment');
      console.log('📋 New chat ID:', newChat._id);
    }

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      appointment
    });

  } catch (error) {
    console.error('❌ Error approving appointment:', error);
    res.status(500).json({ message: 'Server error approving appointment' });
  }
});

// @route   PUT api/appointments/:appointmentId
// @desc    Update an appointment (e.g., status, notes, reschedule)
// @access  Private
router.put('/:appointmentId', authMiddleware, updateAppointment);

// @route   DELETE api/appointments/:appointmentId
// @desc    Delete/cancel an appointment
// @access  Private
router.delete('/:appointmentId', authMiddleware, deleteAppointment);

module.exports = router;
