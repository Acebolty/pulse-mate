const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
    getPatientAlerts
} = require('../controllers/alertController');

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

module.exports = router;
