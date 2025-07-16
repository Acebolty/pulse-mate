const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get notifications for the logged-in user
// @route   GET api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, filter, type } = req.query;
    const query = { recipientId: req.user.id };

    if (filter === 'unread') {
      query.isRead = false;
    }
    if (type && ['appointment_request', 'appointment_approved', 'appointment_cancelled', 'health_alert', 'message_received'].includes(type)) {
      query.type = type;
    }
    
    const options = {
      sort: { createdAt: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const notifications = await Notification.find(query, null, options)
      .populate('senderId', 'firstName lastName email profilePicture')
      .populate('relatedId');
    
    const totalNotifications = await Notification.countDocuments(query);
    
    res.json({
      data: notifications,
      totalPages: Math.ceil(totalNotifications / limit),
      currentPage: parseInt(page),
      totalNotifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};

// @desc    Get notifications for doctors (appointment requests from patients)
// @route   GET api/notifications/doctor
// @access  Private (Doctor only)
const getDoctorNotifications = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { limit = 50 } = req.query;

    console.log('🔔 Getting doctor notifications for:', doctorId);

    // Get notifications for this doctor
    const notifications = await Notification.find({
      recipientId: doctorId
    })
    .populate('senderId', 'firstName lastName email profilePicture')
    .populate('relatedId')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Format notifications with patient names
    const formattedNotifications = notifications.map(notification => ({
      ...notification.toObject(),
      patientName: notification.senderId ? 
        `${notification.senderId.firstName} ${notification.senderId.lastName}` : 
        notification.data?.patientName || 'Unknown Patient',
      patientEmail: notification.senderId?.email || '',
      patientProfilePicture: notification.senderId?.profilePicture || null
    }));

    const totalNotifications = await Notification.countDocuments({
      recipientId: doctorId
    });

    const unreadCount = await Notification.countDocuments({
      recipientId: doctorId,
      isRead: false
    });

    console.log('📊 Doctor notifications:', {
      total: formattedNotifications.length,
      unread: unreadCount
    });

    res.json({
      data: formattedNotifications,
      totalNotifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching doctor notifications:', error);
    res.status(500).json({ message: 'Server error while fetching doctor notifications.' });
  }
};

// @desc    Mark notification as read
// @route   PUT api/notifications/:notificationId/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while marking notification as read.' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error while marking all notifications as read.' });
  }
};

// @desc    Delete notification
// @route   DELETE api/notifications/:notificationId
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification.' });
  }
};

// @desc    Get notification counts for badges
// @route   GET api/notifications/counts
// @access  Private
const getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCount = await Notification.countDocuments({ recipientId: userId });
    const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });
    const appointmentCount = await Notification.countDocuments({ 
      recipientId: userId, 
      type: { $in: ['appointment_request', 'appointment_approved', 'appointment_cancelled'] },
      isRead: false 
    });

    res.json({
      total: totalCount,
      unread: unreadCount,
      appointments: appointmentCount
    });

  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ message: 'Server error while fetching notification counts.' });
  }
};

module.exports = {
  getNotifications,
  getDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCounts
};
