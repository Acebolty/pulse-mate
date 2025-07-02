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

    // Verify the doctor has access to this patient (through appointments)
    const Appointment = require('../models/Appointment');
    const hasAccess = await Appointment.findOne({
      userId: patientId,
      providerId: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. No appointment relationship with this patient.' });
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

    // Get all appointments for this doctor to find their patients
    const Appointment = require('../models/Appointment');
    const User = require('../models/User');

    const appointments = await Appointment.find({ providerId: doctorId })
      .populate('userId', 'firstName lastName email')
      .select('userId');

    // Get unique patient IDs
    const uniquePatientIds = [...new Set(appointments.map(apt => apt.userId._id.toString()))];
    console.log('👥 Doctor has patients:', uniquePatientIds.length);

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

    // Format alerts with patient names
    const formattedAlerts = alerts.map(alert => ({
      ...alert.toObject(),
      patientName: alert.userId ? `${alert.userId.firstName} ${alert.userId.lastName}` : 'Unknown Patient',
      patientEmail: alert.userId?.email || '',
      patientProfilePicture: alert.userId?.profilePicture || null
    }));

    const totalAlerts = await Alert.countDocuments({
      userId: { $in: uniquePatientIds }
    });

    const unreadCount = await Alert.countDocuments({
      userId: { $in: uniquePatientIds },
      isRead: false
    });

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
    const User = require('../models/User');

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

    // Mark the alert as read
    const updatedAlert = await Alert.findByIdAndUpdate(
      alertId,
      { isRead: true },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    console.log('✅ Alert marked as read by doctor:', updatedAlert._id);

    res.json({
      success: true,
      alert: updatedAlert,
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

    // Get all appointments for this doctor to find their patients
    const Appointment = require('../models/Appointment');

    const appointments = await Appointment.find({ providerId: doctorId })
      .select('userId');

    // Get unique patient IDs
    const uniquePatientIds = [...new Set(appointments.map(apt => apt.userId.toString()))];

    if (uniquePatientIds.length === 0) {
      return res.json({
        success: true,
        message: 'No patient alerts to mark as read',
        modifiedCount: 0
      });
    }

    // Mark all unread alerts for these patients as read
    const result = await Alert.updateMany(
      {
        userId: { $in: uniquePatientIds },
        isRead: false
      },
      { $set: { isRead: true } }
    );

    console.log('✅ Marked all patient alerts as read:', result.modifiedCount);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} alerts as read`,
      modifiedCount: result.modifiedCount
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
