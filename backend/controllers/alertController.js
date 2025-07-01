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

module.exports = {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  getPatientAlerts
};
