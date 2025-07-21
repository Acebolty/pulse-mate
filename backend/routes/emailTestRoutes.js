const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Test endpoint to check email notification settings for a user
router.get('/email-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emailSettings = {
      email: user.email,
      emailNotifications: user.settings?.notifications?.emailNotifications || false,
      healthAlerts: user.settings?.notifications?.healthAlerts || false,
      emailAlertTypes: user.settings?.notifications?.emailAlertTypes || {
        critical: true,
        warning: true,
        info: false,
        success: false
      },
      weeklyHealthSummary: user.settings?.notifications?.weeklyHealthSummary || false
    };

    // Determine if emails would be sent
    const wouldSendCritical = emailSettings.emailNotifications && 
                             emailSettings.healthAlerts && 
                             emailSettings.emailAlertTypes.critical;

    const wouldSendWarning = emailSettings.emailNotifications && 
                            emailSettings.healthAlerts && 
                            emailSettings.emailAlertTypes.warning;

    res.json({
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      settings: emailSettings,
      emailWouldBeSent: {
        criticalAlerts: wouldSendCritical,
        warningAlerts: wouldSendWarning,
        weeklyHealthSummary: emailSettings.emailNotifications && emailSettings.weeklyHealthSummary
      },
      explanation: {
        criticalAlerts: wouldSendCritical ? 
          'Critical alert emails WILL be sent' : 
          'Critical alert emails will NOT be sent (check emailNotifications, healthAlerts, and critical alert type settings)',
        warningAlerts: wouldSendWarning ? 
          'Warning alert emails WILL be sent' : 
          'Warning alert emails will NOT be sent (check emailNotifications, healthAlerts, and warning alert type settings)'
      }
    });

  } catch (error) {
    console.error('Email status check error:', error);
    res.status(500).json({ message: 'Server error checking email status' });
  }
});

// Test endpoint to simulate email notification logic
router.post('/simulate-alert/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { alertType = 'critical' } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate the exact logic from healthDataController.js
    const emailNotifications = user.settings?.notifications?.emailNotifications;
    const healthAlerts = user.settings?.notifications?.healthAlerts;
    
    if (emailNotifications && healthAlerts) {
      const emailAlertTypes = user.settings?.notifications?.emailAlertTypes || {
        critical: true, warning: true, info: false, success: false
      };

      const shouldSendEmail = emailAlertTypes[alertType];

      if (shouldSendEmail) {
        res.json({
          result: 'EMAIL_WOULD_BE_SENT',
          message: `${alertType} alert email would be sent to ${user.email}`,
          settings: {
            emailNotifications,
            healthAlerts,
            alertTypeEnabled: shouldSendEmail
          }
        });
      } else {
        res.json({
          result: 'EMAIL_SKIPPED_ALERT_TYPE_DISABLED',
          message: `Email skipped: ${alertType} alert type is disabled`,
          settings: {
            emailNotifications,
            healthAlerts,
            alertTypeEnabled: shouldSendEmail
          }
        });
      }
    } else {
      res.json({
        result: 'EMAIL_SKIPPED_NOTIFICATIONS_DISABLED',
        message: 'Email skipped: email notifications or health alerts are disabled',
        settings: {
          emailNotifications,
          healthAlerts,
          reason: !emailNotifications ? 'emailNotifications is false' : 'healthAlerts is false'
        }
      });
    }

  } catch (error) {
    console.error('Simulate alert error:', error);
    res.status(500).json({ message: 'Server error simulating alert' });
  }
});

module.exports = router;
