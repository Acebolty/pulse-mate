const Alert = require('../models/Alert');

// @desc    Get all alerts for the logged-in user
// @route   GET api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const { limit = 20, page = 1, filter, type } = req.query;
    const query = { userId: req.user.id };

    if (filter === 'unread') {
      query.isRead = false;
    }
    if (type && ['critical', 'warning', 'info', 'success'].includes(type)) {
        query.type = type;
    }
    
    const options = {
      sort: { timestamp: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const alerts = await Alert.find(query, null, options);
    const totalAlerts = await Alert.countDocuments(query);
    
    res.json({
        data: alerts,
        totalPages: Math.ceil(totalAlerts / limit),
        currentPage: parseInt(page),
        totalAlerts
    });
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark a specific alert as read
// @route   PUT api/alerts/:alertId/read
// @access  Private
const markAlertAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.alertId, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or user not authorized.' });
    }
    res.json(alert);
  } catch (err) {
    console.error('Error marking alert as read:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Alert not found (invalid ID format).' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Mark all alerts for the user as read
// @route   PUT api/alerts/read-all/action
// @access  Private
const markAllAlertsAsRead = async (req, res) => {
  try {
    await Alert.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All unread alerts marked as read.' });
  } catch (err) {
    console.error('Error marking all alerts as read:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a specific alert
// @route   DELETE api/alerts/:alertId
// @access  Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete(
      { _id: req.params.alertId, userId: req.user.id }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or user not authorized.' });
    }
    res.json({ message: 'Alert removed successfully.' });
  } catch (err) {
    console.error('Error deleting alert:', err.message);
    if (err.kind === 'ObjectId') { // Corrected from err.kind to error.kind for consistency if copy-pasting
        return res.status(404).json({ message: 'Alert not found (invalid ID format).' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get alerts for a specific patient (for doctors)
// @route   GET api/alerts/patient/:patientId
// @access  Private (Doctor only)
const getPatientAlerts = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, type } = req.query;
    const doctorId = req.user.id;

    // Verify the doctor has access to this patient (through ACTIVE appointments only)
    const Appointment = require('../models/Appointment');
    const hasAccess = await Appointment.findOne({
      userId: patientId,
      providerId: doctorId,
      status: 'Open Chat' // Only allow access if there's an active chat session
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. No active appointment with this patient.' });
    }

    const query = { userId: patientId };

    // Filter by alert type if specified
    if (type && ['critical', 'warning', 'info', 'success'].includes(type)) {
      query.type = type;
    }

    const options = {
      sort: { timestamp: -1 },
      limit: parseInt(limit)
    };

    const alerts = await Alert.find(query, null, options);
    const totalAlerts = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({ ...query, isRead: false });

    res.json({
      data: alerts,
      totalAlerts,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching patient alerts:', error);
    res.status(500).json({ message: 'Server error while fetching patient alerts.' });
  }
};

// @desc    Get alerts for doctor's patients (for doctor notifications)
// @route   GET api/alerts/doctor/notifications
// @access  Private (Doctor only)
const getDoctorNotifications = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { limit = 50 } = req.query;

    console.log('🔔 Getting doctor notifications for:', doctorId);

    // Get ONLY active "Open Chat" appointments for this doctor
    const Appointment = require('../models/Appointment');
    const User = require('../models/User');
    const DoctorAlertRead = require('../models/DoctorAlertRead');

    const appointments = await Appointment.find({
      providerId: doctorId,
      status: 'Open Chat' // Only show alerts for patients with active chat sessions
    })
      .populate('userId', 'firstName lastName email')
      .select('userId');

    // Get unique patient IDs from active appointments only
    const uniquePatientIds = [...new Set(appointments.map(apt => apt.userId._id.toString()))];
    console.log('👥 Doctor has active "Open Chat" patients:', uniquePatientIds.length);

    if (uniquePatientIds.length === 0) {
      return res.json({
        data: [],
        totalAlerts: 0,
        unreadCount: 0
      });
    }

    // Get alerts for these patients with patient information
    const alerts = await Alert.find({
      userId: { $in: uniquePatientIds }
    })
    .populate('userId', 'firstName lastName email profilePicture')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

    // Get doctor's read status for these alerts
    const doctorReadStatuses = await DoctorAlertRead.find({
      doctorId,
      alertId: { $in: alerts.map(alert => alert._id) }
    });

    const readAlertIds = new Set(doctorReadStatuses.map(dr => dr.alertId.toString()));

    // Format alerts with patient names and doctor's read status
    const formattedAlerts = alerts.map(alert => ({
      ...alert.toObject(),
      patientName: alert.userId ? `${alert.userId.firstName} ${alert.userId.lastName}` : 'Unknown Patient',
      patientEmail: alert.userId?.email || '',
      patientProfilePicture: alert.userId?.profilePicture || null,
      isRead: readAlertIds.has(alert._id.toString()) // Doctor's read status, not patient's
    }));

    const totalAlerts = await Alert.countDocuments({
      userId: { $in: uniquePatientIds }
    });

    // Count unread alerts based on doctor's read status, not patient's
    const allPatientAlerts = await Alert.find({
      userId: { $in: uniquePatientIds }
    }).select('_id');

    const allDoctorReadStatuses = await DoctorAlertRead.find({
      doctorId,
      alertId: { $in: allPatientAlerts.map(alert => alert._id) }
    });

    const allReadAlertIds = new Set(allDoctorReadStatuses.map(dr => dr.alertId.toString()));
    const unreadCount = allPatientAlerts.filter(alert => !allReadAlertIds.has(alert._id.toString())).length;

    console.log('📊 Doctor notifications:', {
      total: formattedAlerts.length,
      unread: unreadCount
    });

    res.json({
      data: formattedAlerts,
      totalAlerts,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching doctor notifications:', error);
    res.status(500).json({ message: 'Server error while fetching doctor notifications.' });
  }
};

// @desc    Mark a patient alert as read by doctor
// @route   PUT api/alerts/doctor/:alertId/read
// @access  Private (Doctor only)
const markPatientAlertAsRead = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const alertId = req.params.alertId;

    console.log('🩺 Doctor marking patient alert as read:', { doctorId, alertId });

    // First, verify the doctor has access to this alert through appointments
    const Appointment = require('../models/Appointment');
    const DoctorAlertRead = require('../models/DoctorAlertRead');

    // Get the alert to find the patient
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    // Check if doctor has any appointments with this patient
    const hasAccess = await Appointment.findOne({
      userId: alert.userId,
      providerId: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. No appointment relationship with this patient.' });
    }

    // Create or update doctor read status (separate from patient's read status)
    const doctorRead = await DoctorAlertRead.findOneAndUpdate(
      { doctorId, alertId },
      {
        doctorId,
        alertId,
        patientId: alert.userId,
        readAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ Alert marked as read by doctor (separate tracking):', alertId);

    res.json({
      success: true,
      alert: alert,
      doctorRead: doctorRead,
      message: 'Alert marked as read successfully'
    });

  } catch (error) {
    console.error('Error marking patient alert as read:', error);
    res.status(500).json({ message: 'Server error while marking alert as read.' });
  }
};

// @desc    Mark all patient alerts as read by doctor
// @route   PUT api/alerts/doctor/read-all
// @access  Private (Doctor only)
const markAllPatientAlertsAsRead = async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log('🩺 Doctor marking all patient alerts as read:', doctorId);

    // Get ALL appointments for this doctor to find all their patients
    const Appointment = require('../models/Appointment');

    const appointments = await Appointment.find({
      providerId: doctorId
      // Remove status restriction - doctor can mark alerts as read for all their patients
    })
      .select('userId');

    // Get unique patient IDs from all appointments
    const uniquePatientIds = [...new Set(appointments.map(apt => apt.userId.toString()))];

    if (uniquePatientIds.length === 0) {
      return res.json({
        success: true,
        message: 'No patient alerts to mark as read',
        modifiedCount: 0
      });
    }

    // Get all unread alerts for these patients (that doctor hasn't read yet)
    const DoctorAlertRead = require('../models/DoctorAlertRead');

    // Find alerts that doctor hasn't read yet
    const unreadAlerts = await Alert.find({
      userId: { $in: uniquePatientIds }
    });

    // Filter out alerts that doctor has already read
    const doctorReadAlerts = await DoctorAlertRead.find({
      doctorId,
      alertId: { $in: unreadAlerts.map(alert => alert._id) }
    });

    const readAlertIds = new Set(doctorReadAlerts.map(dr => dr.alertId.toString()));
    const alertsToMarkAsRead = unreadAlerts.filter(alert => !readAlertIds.has(alert._id.toString()));

    // Create doctor read records for all unread alerts (separate from patient's read status)
    const doctorReadRecords = alertsToMarkAsRead.map(alert => ({
      doctorId,
      alertId: alert._id,
      patientId: alert.userId,
      readAt: new Date()
    }));

    let insertedCount = 0;
    if (doctorReadRecords.length > 0) {
      const result = await DoctorAlertRead.insertMany(doctorReadRecords, { ordered: false });
      insertedCount = result.length;
    }

    console.log('✅ Marked all patient alerts as read by doctor (separate tracking):', insertedCount);

    res.json({
      success: true,
      message: `Marked ${insertedCount} alerts as read`,
      modifiedCount: insertedCount
    });

  } catch (error) {
    console.error('Error marking all patient alerts as read:', error);
    res.status(500).json({ message: 'Server error while marking all alerts as read.' });
  }
};

module.exports = {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  getPatientAlerts,
  getDoctorNotifications,
  markPatientAlertAsRead,
  markAllPatientAlertsAsRead
};
