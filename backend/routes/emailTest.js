const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');
const User = require('../models/User');

// @route   POST /api/email-test/send-test-alert
// @desc    Send a test health alert email (for development/testing)
// @access  Private
router.post('/send-test-alert', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has email notifications enabled
    if (!user.settings?.notifications?.emailNotifications) {
      return res.status(400).json({ 
        message: 'Email notifications are disabled in your settings' 
      });
    }

    // Create a test alert
    const testAlert = {
      title: 'Test Health Alert',
      message: 'This is a test email to verify that health alert notifications are working correctly.',
      type: 'info',
      timestamp: new Date(),
      source: 'Email Test System',
      relatedDataType: 'test'
    };

    const emailResult = await emailService.sendHealthAlert(
      user.email,
      user.firstName || 'User',
      testAlert
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        emailSentTo: user.email,
        previewUrl: emailResult.previewUrl // Only available in development
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending test email',
      error: error.message
    });
  }
});

// @route   GET /api/email-test/email-status
// @desc    Check user's email notification settings
// @access  Private
router.get('/email-status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      email: user.email,
      emailNotifications: user.settings?.notifications?.emailNotifications || false,
      healthAlerts: user.settings?.notifications?.healthAlerts || false,
      canReceiveEmails: user.settings?.notifications?.emailNotifications && user.settings?.notifications?.healthAlerts
    });
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({
      message: 'Server error while checking email status',
      error: error.message
    });
  }
});

module.exports = router;
