const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createAlert,
    getAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
    getPatientAlerts,
    getDoctorNotifications,
    markPatientAlertAsRead,
    markAllPatientAlertsAsRead
} = require('../controllers/alertController');

// @route   POST api/alerts
// @desc    Create a new alert for the logged-in user
// @access  Private
router.post('/', authMiddleware, createAlert);

// @route   GET api/alerts
// @desc    Get all alerts for the logged-in user, sorted by most recent
// @access  Private
router.get('/', authMiddleware, getAlerts);

// @route   PUT api/alerts/:alertId/read
// @desc    Mark a specific alert as read
// @access  Private
router.put('/:alertId/read', authMiddleware, markAlertAsRead);

// @route   PUT api/alerts/read-all/action
// @desc    Mark all alerts for the user as read
// @access  Private
router.put('/read-all/action', authMiddleware, markAllAlertsAsRead);

// @route   DELETE api/alerts/:alertId
// @desc    Delete a specific alert
// @access  Private
router.delete('/:alertId', authMiddleware, deleteAlert);

// @route   GET api/alerts/patient/:patientId
// @desc    Get alerts for a specific patient (for doctors)
// @access  Private (Doctor only)
router.get('/patient/:patientId', authMiddleware, getPatientAlerts);

// @route   GET api/alerts/doctor/notifications
// @desc    Get alerts for doctor's patients with patient names (for doctor notifications)
// @access  Private (Doctor only)
router.get('/doctor/notifications', authMiddleware, getDoctorNotifications);

// @route   PUT api/alerts/doctor/:alertId/read
// @desc    Mark a patient alert as read by doctor
// @access  Private (Doctor only)
router.put('/doctor/:alertId/read', authMiddleware, markPatientAlertAsRead);

// @route   PUT api/alerts/doctor/read-all
// @desc    Mark all patient alerts as read by doctor
// @access  Private (Doctor only)
router.put('/doctor/read-all', authMiddleware, markAllPatientAlertsAsRead);

module.exports = router;
