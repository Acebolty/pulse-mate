const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getNotifications,
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCounts
} = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, getNotifications);

// @route   GET api/notifications/doctor
// @desc    Get notifications for doctors (appointment requests, etc.)
// @access  Private (Doctor only)
router.get('/doctor', authMiddleware, getDoctorNotifications);

// @route   GET api/notifications/counts
// @desc    Get notification counts for badges
// @access  Private
router.get('/counts', authMiddleware, getNotificationCounts);

// @route   PUT api/notifications/:notificationId/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:notificationId/read', authMiddleware, markNotificationAsRead);

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);

// @route   DELETE api/notifications/:notificationId
// @desc    Delete a notification
// @access  Private
router.delete('/:notificationId', authMiddleware, deleteNotification);

module.exports = router;
