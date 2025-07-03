const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Create a new appointment for the logged-in user
// @route   POST api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { providerId, providerName, dateTime, reason, type, notes, virtualLink } = req.body;

    if (!providerName || !dateTime || !reason) {
      return res.status(400).json({ message: 'Please provide provider name, date/time, and reason for the appointment.' });
    }

    const appointmentDate = new Date(dateTime);
    if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date/time format for appointment.' });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      providerId: providerId || null,
      providerName,
      dateTime: appointmentDate,
      reason,
      type: type || 'Chat', // Default to Chat for school project
      notes,
      virtualLink,
      status: 'Pending' // Set to Pending for admin approval
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);

  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating appointment.' });
  }
};

// @desc    Get appointments for the logged-in user
// @route   GET api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, upcoming, past, limit = 10, page = 1, sortBy = 'dateTime', order = 'asc' } = req.query;
    const query = { userId: req.user.id };

    if (status) query.status = status;

    const now = new Date();
    if (upcoming === 'true') query.dateTime = { $gte: now };
    else if (past === 'true') query.dateTime = { $lt: now };
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    if (sortBy === 'dateTime') sortOptions.dateTime = sortOrder;
    else sortOptions.createdAt = sortOrder;

    const options = {
      sort: sortOptions,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const appointments = await Appointment.find(query, null, options);
    const totalAppointments = await Appointment.countDocuments(query);

    res.json({
      data: appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      totalAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments.' });
  }
};

// @desc    Update an appointment
// @route   PUT api/appointments/:appointmentId
// @access  Private
const updateAppointment = async (req, res) => {
  const {
    providerName,
    dateTime,
    reason,
    type,
    status,
    notes,
    virtualLink,
    // Additional fields for doctor status management
    completionSummary,
    followUpNeeded,
    followUpDate,
    recommendations,
    completedAt,
    cancellationReason,
    notifyPatient,
    refundRequested,
    cancelledAt,
    rescheduleReason
  } = req.body;
  const { appointmentId } = req.params;

  try {
    // Check if user is the patient (original logic) or the doctor/provider
    let appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [
        { userId: req.user.id }, // User is the patient
        { providerId: req.user.id } // User is the doctor/provider
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or user not authorized.' });
    }

    if (providerName) appointment.providerName = providerName;
    if (dateTime) {
        const newDateTime = new Date(dateTime);
        if (isNaN(newDateTime.getTime())) return res.status(400).json({ message: 'Invalid date/time format.' });
        appointment.dateTime = newDateTime;
    }
    if (reason) appointment.reason = reason;
    if (type) appointment.type = type;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (virtualLink !== undefined) appointment.virtualLink = virtualLink;

    // Handle additional doctor status management fields
    if (completionSummary !== undefined) appointment.completionSummary = completionSummary;
    if (followUpNeeded !== undefined) appointment.followUpNeeded = followUpNeeded;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);
    if (recommendations !== undefined) appointment.recommendations = recommendations;
    if (completedAt) appointment.completedAt = new Date(completedAt);
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;
    if (notifyPatient !== undefined) appointment.notifyPatient = notifyPatient;
    if (refundRequested !== undefined) appointment.refundRequested = refundRequested;
    if (cancelledAt) appointment.cancelledAt = new Date(cancelledAt);
    if (rescheduleReason !== undefined) appointment.rescheduleReason = rescheduleReason;

    // Handle chat session management based on status changes
    if (status) {
      await handleChatSessionManagement(appointment, status);
    }

    await appointment.save();
    res.json(appointment);

  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Appointment not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while updating appointment.' });
  }
};

// @desc    Delete/cancel an appointment
// @route   DELETE api/appointments/:appointmentId
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ 
        _id: req.params.appointmentId, 
        userId: req.user.id 
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or user not authorized.' });
    }
    res.json({ message: 'Appointment deleted successfully.' });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    if (error.kind === 'ObjectId') { // Changed err to error
        return res.status(404).json({ message: 'Appointment not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while deleting appointment.' });
  }
};

// @desc    Get appointments for a doctor (where doctor is the provider)
// @route   GET api/appointments/doctor
// @access  Private
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, upcoming, past, limit = 10, page = 1, sortBy = 'dateTime', order = 'asc' } = req.query;

    console.log('🩺 getDoctorAppointments called for user:', req.user.id);

    // Get the current doctor's info
    const User = require('../models/User');
    const doctor = await User.findById(req.user.id);
    if (!doctor) {
      console.log('❌ Doctor not found for ID:', req.user.id);
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('✅ Doctor found:', doctor.firstName, doctor.lastName);

    // Build the query to find appointments where this doctor is the provider
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    const query = {
      $or: [
        { providerName: { $regex: doctorName, $options: 'i' } },
        { providerId: req.user.id },
        { providerId: req.user.id.toString() }
      ]
    };

    if (status) query.status = status;

    const now = new Date();
    if (upcoming === 'true') query.dateTime = { $gte: now };
    else if (past === 'true') query.dateTime = { $lt: now };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    if (sortBy === 'dateTime') sortOptions.dateTime = sortOrder;
    else sortOptions.createdAt = sortOrder;

    const options = {
      sort: sortOptions,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    console.log('🔍 Query for doctor appointments:', JSON.stringify(query, null, 2));

    // Populate patient information
    const appointments = await Appointment.find(query, null, options).populate('userId', 'firstName lastName email dateOfBirth gender profilePicture');
    const totalAppointments = await Appointment.countDocuments(query);

    console.log('📅 Found appointments:', appointments.length);
    console.log('📋 Appointment details:', appointments.map(apt => ({
      id: apt._id,
      patient: apt.userId ? `${apt.userId.firstName} ${apt.userId.lastName}` : 'Unknown',
      date: apt.dateTime,
      status: apt.status,
      providerName: apt.providerName,
      providerId: apt.providerId
    })));

    res.json({
      data: appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      totalAppointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server error while fetching doctor appointments.' });
  }
};

// @desc    Get active appointment sessions for the logged-in user
// @route   GET api/appointments/active-sessions
// @access  Private
const getActiveSessions = async (req, res) => {
  try {
    console.log('🔍 Fetching active sessions for user:', req.user.id);

    const activeSessions = await Appointment.find({
      userId: req.user.id,
      status: 'Open Chat', // Only sessions that doctor has opened
      chatEnabled: true
    }).populate('userId', 'firstName lastName email').populate('providerId', 'firstName lastName email doctorInfo');

    console.log('📋 Found active sessions:', activeSessions.length);

    res.json({
      success: true,
      data: activeSessions,
      message: 'Active sessions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get active appointment sessions for the logged-in doctor
// @route   GET api/appointments/doctor-sessions
// @access  Private
const getDoctorSessions = async (req, res) => {
  try {
    console.log('🔍 Fetching doctor sessions for user:', req.user.id);

    const doctorSessions = await Appointment.find({
      providerId: req.user.id,
      status: { $in: ['Approved', 'Open Chat', 'Completed'] } // Include all relevant statuses
    }).populate('userId', 'firstName lastName email').populate('providerId', 'firstName lastName email doctorInfo');

    console.log('📋 Found doctor sessions:', doctorSessions.length);

    res.json({
      success: true,
      data: doctorSessions,
      message: 'Doctor sessions retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching doctor sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get available doctors for appointment booking
 * @route   GET /api/appointments/available-doctors
 * @access  Private
 */
const getAvailableDoctors = async (req, res) => {
  try {
    console.log('🔍 Fetching available doctors...');

    // First, let's see all doctors
    const allDoctors = await User.find({ role: 'doctor' })
      .select('firstName lastName email profilePicture doctorInfo');

    console.log('👨‍⚕️ All doctors found:', allDoctors.length);
    allDoctors.forEach(doctor => {
      console.log(`- ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
      console.log(`  doctorInfo:`, doctor.doctorInfo);
      console.log(`  approvalStatus:`, doctor.doctorInfo?.approvalStatus);
    });

    // Get all approved doctors with their basic info and doctorInfo
    const doctors = await User.find({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'approved'
    })
    .select('firstName lastName email profilePicture doctorInfo')
    .sort({ 'doctorInfo.specialty': 1, firstName: 1 });

    console.log('✅ Approved doctors found:', doctors.length);
    doctors.forEach(doctor => {
      console.log(`- Approved: ${doctor.firstName} ${doctor.lastName} - ${doctor.doctorInfo?.specialty}`);
    });

    res.json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error('Get available doctors error:', error.message);
    res.status(500).json({
      message: 'Server error fetching available doctors'
    });
  }
};

// @desc    Get doctor dashboard analytics
// @route   GET api/appointments/doctor/analytics
// @access  Private (Doctor only)
const getDoctorDashboardAnalytics = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log('📊 getDoctorDashboardAnalytics called for doctor:', doctorId);

    // Get current date for today's calculations
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Get all appointments for this doctor
    const allAppointments = await Appointment.find({ providerId: doctorId })
      .populate('userId', 'firstName lastName email profilePicture')
      .sort({ dateTime: -1 });

    console.log(`📋 Total appointments found for doctor: ${allAppointments.length}`);

    // Calculate unique patients (patients who have appointments with this doctor)
    const uniquePatientIds = [...new Set(allAppointments.map(apt => apt.userId._id.toString()))];
    const totalPatients = uniquePatientIds.length;

    // Today's appointments
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= startOfToday && aptDate < endOfToday;
    });

    // Approved appointments today
    const approvedToday = todayAppointments.filter(apt => apt.status === 'approved').length;

    // Total approved appointments (all time)
    const totalApproved = allAppointments.filter(apt => apt.status === 'approved').length;

    // Total appointments (all statuses)
    const totalAppointments = allAppointments.length;

    // Completed appointments today
    const completedToday = todayAppointments.filter(apt =>
      apt.status === 'completed' || apt.status === 'cancelled'
    ).length;

    // Get health alerts for doctor's patients
    const Alert = require('../models/Alert');
    const patientAlerts = await Alert.find({
      userId: { $in: uniquePatientIds },
      isRead: false
    });

    // Critical alerts requiring doctor review
    const criticalAlerts = patientAlerts.filter(alert =>
      alert.type === 'critical' || alert.priority === 'high'
    ).length;

    // Pending reviews (critical health alerts)
    const pendingReviews = criticalAlerts;

    const analytics = {
      totalPatients,
      appointmentsToday: todayAppointments.length,
      approvedToday,
      totalApproved,
      totalAppointments,
      completedToday,
      pendingReviews,
      criticalAlerts,
      systemStatus: totalAppointments > 0 ? 'All Systems Operational' : 'No Data Available'
    };

    console.log('📊 Doctor dashboard analytics:', analytics);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get doctor dashboard analytics error:', error.message);
    res.status(500).json({
      message: 'Server error fetching doctor dashboard analytics'
    });
  }
};

// Helper function to manage chat sessions based on appointment status
const handleChatSessionManagement = async (appointment, newStatus) => {
  try {
    console.log(`🔄 Managing chat session for appointment ${appointment._id}, status: ${newStatus}`);

    // Find or create chat room for this appointment
    let chat = await Chat.findOne({
      participants: { $all: [appointment.userId, appointment.providerId] }
    });

    if (!chat) {
      // Create new chat room if it doesn't exist
      console.log('🆕 Creating new chat room...');
      chat = new Chat({
        participants: [appointment.userId, appointment.providerId],
        appointmentId: appointment._id,
        isActive: false,
        lastMessageTimestamp: new Date()
      });
      await chat.save();

      // Link chat to appointment
      appointment.chatRoomId = chat._id;
    }

    // Handle status-based session management
    if (newStatus === 'Open Chat') {
      console.log('🟢 Opening chat session...');
      chat.isActive = true;
      chat.sessionEndTime = null; // Remove any previous end time
      chat.appointmentId = appointment._id;
      chat.renewedAt = new Date();

      // Update appointment
      appointment.chatEnabled = true;
      appointment.sessionStartTime = new Date();
      appointment.sessionEndTime = null; // Doctor-controlled, no fixed end time

    } else if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      console.log('🔴 Closing chat session...');
      chat.isActive = false;
      chat.sessionEndTime = new Date();

      // Update appointment
      appointment.chatEnabled = false;
      if (newStatus === 'Completed') {
        appointment.completedAt = new Date();
      } else if (newStatus === 'Cancelled') {
        appointment.cancelledAt = new Date();
      }
    }

    await chat.save();
    console.log(`✅ Chat session management completed for status: ${newStatus}`);

  } catch (error) {
    console.error('❌ Error managing chat session:', error);
    throw error;
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  getActiveSessions,
  getDoctorSessions,
  getAvailableDoctors,
  getDoctorDashboardAnalytics
};
