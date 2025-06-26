const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');
const weeklyHealthSummaryService = require('../services/weeklyHealthSummaryService');
const medicationReminderService = require('../services/medicationReminderService');
const User = require('../models/User');

// @route   POST /api/email-test/send-test-alert
// @desc    Send a test health alert email (for development/testing)
// @access  Private
router.post('/send-test-alert', auth, async (req, res) => {
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
router.get('/email-status', auth, async (req, res) => {
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

// @route   POST /api/email-test/send-weekly-summary
// @desc    Send a test weekly health summary email
// @access  Private
router.post('/send-weekly-summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and send weekly summary
    const result = await weeklyHealthSummaryService.sendWeeklySummaryEmail(req.user.id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Weekly health summary email sent successfully!',
        previewUrl: result.previewUrl
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.reason === 'disabled'
          ? 'Weekly health summary emails are disabled in your settings'
          : `Failed to send weekly summary: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending weekly summary email'
    });
  }
});

// @route   POST /api/email-test/send-medication-reminder
// @desc    Send a test medication reminder email
// @access  Private
router.post('/send-medication-reminder', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has medications
    if (!user.medicalInfo?.medications || user.medicalInfo.medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medications found in your profile. Please add medications first.'
      });
    }

    // Use the first medication for testing
    const firstMedication = user.medicalInfo.medications[0];
    const schedule = medicationReminderService.generateMedicationSchedule([firstMedication]);

    if (schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Unable to generate medication schedule. Please check your medication frequency.'
      });
    }

    // Send reminder for the first scheduled dose
    const result = await medicationReminderService.sendMedicationReminder(req.user.id, schedule[0]);

    if (result.success) {
      res.json({
        success: true,
        message: `Test medication reminder sent for ${schedule[0].medicationName}!`,
        previewUrl: result.previewUrl
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.reason === 'disabled'
          ? 'Medication reminders are disabled in your settings'
          : `Failed to send medication reminder: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error sending medication reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending medication reminder'
    });
  }
});

// @route   POST /api/email-test/send-daily-medication-summary
// @desc    Send a test daily medication summary email
// @access  Private
router.post('/send-daily-medication-summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has medications
    if (!user.medicalInfo?.medications || user.medicalInfo.medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medications found in your profile. Please add medications first.'
      });
    }

    // Send daily summary
    const result = await medicationReminderService.sendDailyMedicationSummary(req.user.id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test daily medication summary sent successfully!',
        previewUrl: result.previewUrl
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.reason === 'disabled'
          ? 'Medication reminders are disabled in your settings'
          : result.reason === 'no_medications'
          ? 'No medications found in your profile'
          : `Failed to send daily summary: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error sending daily medication summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending daily medication summary'
    });
  }
});

// @route   GET /api/email-test/medication-schedule
// @desc    Get user's medication schedule
// @access  Private
router.get('/medication-schedule', auth, async (req, res) => {
  try {
    const schedule = await medicationReminderService.getUserMedicationSchedule(req.user.id);
    const user = await User.findById(req.user.id);

    const insights = medicationReminderService.getMedicationInsights(
      user?.medicalInfo?.medications || []
    );

    res.json({
      success: true,
      schedule: schedule,
      insights: insights,
      totalMedications: user?.medicalInfo?.medications?.length || 0,
      totalDailyDoses: schedule.length
    });
  } catch (error) {
    console.error('Error getting medication schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting medication schedule'
    });
  }
});

// @route   POST /api/email-test/generate-medication-alerts
// @desc    Generate test medication alerts for the alerts system
// @access  Private
router.post('/generate-medication-alerts', auth, async (req, res) => {
  try {
    const result = await medicationReminderService.generateTestMedicationAlerts(req.user.id);

    if (result.success) {
      res.json({
        success: true,
        message: `Generated ${result.alertsCreated} test medication alerts!`,
        alertsCreated: result.alertsCreated,
        alerts: result.alerts
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || `Failed to generate alerts: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error generating medication alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating medication alerts'
    });
  }
});

module.exports = router;
