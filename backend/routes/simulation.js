const express = require('express');
const router = express.Router();
const HealthDataSimulator = require('../services/healthDataSimulator');
const HealthAlertGenerator = require('../services/healthAlertGenerator');
const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/simulation/generate-historical
// @desc    Generate historical health data for the authenticated user
// @access  Private
router.post('/generate-historical', auth, async (req, res) => {
  try {
    const { days = 30, scenarios = [] } = req.body;
    const userId = req.user.id;

    // Validate input
    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    // Create simulator instance
    const simulator = new HealthDataSimulator(userId);

    // Calculate start date (going back from today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    console.log(`Generating ${days} days of health data for user ${userId}`);

    // Generate data
    const healthDataArray = await simulator.generateMultipleDays(startDate, days, scenarios);

    // Clear existing data for this user (optional - comment out to keep existing data)
    await HealthData.deleteMany({ userId: userId });

    // Save to database
    const savedData = await simulator.saveToDatabase(healthDataArray);

    // Generate alerts based on the new data - DISABLED (using frontend AlertContext instead)
    // const alertGenerator = new HealthAlertGenerator(userId);
    // const generatedAlerts = await alertGenerator.generateAlertsFromRecentData();

    res.json({
      success: true,
      message: `Successfully generated ${savedData.length} health data entries for ${days} days`,
      data: {
        entriesCreated: savedData.length,
        daysGenerated: days,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        dataTypes: [...new Set(savedData.map(item => item.dataType))],
        summary: {
          heartRate: savedData.filter(item => item.dataType === 'heartRate').length,
          bloodPressure: savedData.filter(item => item.dataType === 'bloodPressure').length,
          glucoseLevel: savedData.filter(item => item.dataType === 'glucoseLevel').length,
          weight: savedData.filter(item => item.dataType === 'weight').length,
          bodyTemperature: savedData.filter(item => item.dataType === 'bodyTemperature').length,
          stepsTaken: savedData.filter(item => item.dataType === 'stepsTaken').length,
          caloriesBurned: savedData.filter(item => item.dataType === 'caloriesBurned').length,
          sleepDuration: savedData.filter(item => item.dataType === 'sleepDuration').length
        },
        alertsGenerated: generatedAlerts.length
      }
    });

  } catch (error) {
    console.error('Error generating historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate historical health data',
      error: error.message
    });
  }
});

// @route   POST /api/simulation/generate-day
// @desc    Generate health data for a specific day
// @access  Private
router.post('/generate-day', auth, async (req, res) => {
  try {
    const { date, scenario = 'normal' } = req.body;
    const userId = req.user.id;

    // Validate date
    const targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Create simulator instance
    const simulator = new HealthDataSimulator(userId);

    console.log(`Generating health data for ${targetDate.toDateString()} with scenario: ${scenario}`);

    // Generate data for the specific day
    const dayData = await simulator.generateDayData(targetDate, scenario);

    // Save to database
    const savedData = await simulator.saveToDatabase(dayData);

    res.json({
      success: true,
      message: `Successfully generated health data for ${targetDate.toDateString()}`,
      data: {
        entriesCreated: savedData.length,
        date: targetDate.toISOString(),
        scenario: scenario,
        entries: savedData.map(item => ({
          dataType: item.dataType,
          value: item.value,
          unit: item.unit,
          timestamp: item.timestamp,
          source: item.source
        }))
      }
    });

  } catch (error) {
    console.error('Error generating day data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate day health data',
      error: error.message
    });
  }
});

// @route   POST /api/simulation/generate-realtime
// @desc    Generate current/recent health readings
// @access  Private
router.post('/generate-realtime', auth, async (req, res) => {
  try {
    const { dataTypes = ['heartRate', 'bloodPressure', 'bodyTemperature'] } = req.body;
    const userId = req.user.id;

    // Create simulator instance
    const simulator = new HealthDataSimulator(userId);

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const realtimeData = [];

    // Generate current readings for specified data types
    if (dataTypes.includes('heartRate')) {
      const heartRate = simulator.generateHeartRate(currentHour, 'normal');
      realtimeData.push({
        userId: userId,
        dataType: 'heartRate',
        value: heartRate,
        unit: 'bpm',
        timestamp: new Date(), // Current time for immediate display
        source: 'Apple Watch'
      });
    }

    if (dataTypes.includes('bloodPressure')) {
      const bloodPressure = simulator.generateBloodPressure(currentHour, 'normal');
      realtimeData.push({
        userId: userId,
        dataType: 'bloodPressure',
        value: bloodPressure,
        unit: 'mmHg',
        timestamp: new Date(), // Current time for immediate display
        source: 'BP Monitor'
      });
    }

    if (dataTypes.includes('bodyTemperature')) {
      const temperature = simulator.generateBodyTemperature(currentHour, 'healthy');
      realtimeData.push({
        userId: userId,
        dataType: 'bodyTemperature',
        value: temperature,
        unit: '°F',
        timestamp: new Date(), // Current time for immediate display
        source: 'Smart Thermometer'
      });
    }

    if (dataTypes.includes('glucoseLevel')) {
      const glucose = simulator.generateGlucoseLevel(currentHour, 'fasting');
      realtimeData.push({
        userId: userId,
        dataType: 'glucoseLevel',
        value: glucose,
        unit: 'mg/dL',
        timestamp: new Date(), // Current time for immediate display
        source: 'Glucose Monitor'
      });
    }

    // Save to database
    const savedData = await simulator.saveToDatabase(realtimeData);

    res.json({
      success: true,
      message: `Successfully generated ${savedData.length} real-time health readings`,
      data: {
        entriesCreated: savedData.length,
        timestamp: currentTime.toISOString(),
        readings: savedData.map(item => ({
          dataType: item.dataType,
          value: item.value,
          unit: item.unit,
          timestamp: item.timestamp,
          source: item.source
        }))
      }
    });

  } catch (error) {
    console.error('Error generating real-time data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate real-time health data',
      error: error.message
    });
  }
});

// @route   GET /api/simulation/scenarios
// @desc    Get available simulation scenarios
// @access  Private
router.get('/scenarios', auth, async (req, res) => {
  try {
    const scenarios = {
      'normal': {
        name: 'Normal Day',
        description: 'Regular daily activities with normal health readings',
        characteristics: ['Normal heart rate', 'Stable blood pressure', 'Regular activity levels']
      },
      'active_day': {
        name: 'Active Day',
        description: 'High activity day with exercise and increased movement',
        characteristics: ['Higher step count', 'Elevated heart rate periods', 'Increased calorie burn']
      },
      'sick_day': {
        name: 'Sick Day',
        description: 'Day with mild illness symptoms',
        characteristics: ['Slight fever', 'Reduced activity', 'Lower step count']
      },
      'stressful_day': {
        name: 'Stressful Day',
        description: 'High stress day affecting health metrics',
        characteristics: ['Elevated blood pressure', 'Higher heart rate', 'Irregular patterns']
      }
    };

    res.json({
      success: true,
      scenarios: scenarios
    });

  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch simulation scenarios',
      error: error.message
    });
  }
});

// @route   POST /api/simulation/generate-alerts
// @desc    Generate health alerts based on actual user data
// @access  Private
router.post('/generate-alerts', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const alertGenerator = new HealthAlertGenerator(userId);

    let generatedAlerts = [];

    // Generate alerts from actual data
    const dataAlerts = await alertGenerator.generateAlertsFromRecentData();
    generatedAlerts.push(...dataAlerts);

    // Generate positive alerts if no critical issues found
    if (dataAlerts.length === 0) {
      const positiveAlerts = await alertGenerator.generatePositiveAlerts();
      generatedAlerts.push(...positiveAlerts);
    }

    res.json({
      success: true,
      message: generatedAlerts.length > 0
        ? `Successfully generated ${generatedAlerts.length} health alerts based on your data`
        : 'No alerts needed - your health readings are all within normal ranges!',
      data: {
        alertsGenerated: generatedAlerts.length,
        alerts: generatedAlerts.map(alert => ({
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timestamp: alert.timestamp,
          relatedDataType: alert.relatedDataType
        }))
      }
    });

  } catch (error) {
    console.error('Error generating alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate health alerts',
      error: error.message
    });
  }
});

// @route   DELETE /api/simulation/clear-alerts
// @desc    Clear all alerts for the user
// @access  Private
router.delete('/clear-alerts', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Alert.deleteMany({ userId: userId });

    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} alerts`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Error clearing alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear alerts',
      error: error.message
    });
  }
});

// @route   GET /api/simulation/debug-alerts
// @desc    Debug: Check current alerts in database
// @access  Private
router.get('/debug-alerts', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const Alert = require('../models/Alert');
    const DoctorAlertRead = require('../models/DoctorAlertRead');

    // Get current user info
    const user = await User.findById(userId).select('firstName lastName email role');

    // Get all alerts for this user
    const userAlerts = await Alert.find({ userId: userId }).sort({ timestamp: -1 });

    // If user is a doctor, also get alerts for their patients
    let patientAlerts = [];
    if (user.role === 'doctor') {
      const Appointment = require('../models/Appointment');

      // Get patients with Open Chat appointments
      const appointments = await Appointment.find({
        providerId: userId,
        status: 'Open Chat'
      }).populate('userId', 'firstName lastName email');

      const patientIds = appointments.map(apt => apt.userId._id);

      if (patientIds.length > 0) {
        patientAlerts = await Alert.find({
          userId: { $in: patientIds }
        }).populate('userId', 'firstName lastName email').sort({ timestamp: -1 });
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      userAlerts: {
        count: userAlerts.length,
        alerts: userAlerts.map(alert => ({
          id: alert._id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timestamp: alert.timestamp,
          isRead: alert.isRead
        }))
      },
      patientAlerts: {
        count: patientAlerts.length,
        alerts: patientAlerts.map(alert => ({
          id: alert._id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timestamp: alert.timestamp,
          isRead: alert.isRead,
          patientName: alert.userId ? `${alert.userId.firstName} ${alert.userId.lastName}` : 'Unknown'
        }))
      }
    });

  } catch (error) {
    console.error('Error debugging alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug alerts',
      error: error.message
    });
  }
});

// @route   DELETE /api/simulation/clear-data
// @desc    Clear all simulated health data and alerts for the user
// @access  Private
router.delete('/clear-data', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear both health data and alerts
    const [healthDataResult, alertsResult] = await Promise.all([
      HealthData.deleteMany({ userId: userId }),
      Alert.deleteMany({ userId: userId })
    ]);

    res.json({
      success: true,
      message: `Successfully cleared ${healthDataResult.deletedCount} health data entries and ${alertsResult.deletedCount} alerts`,
      data: {
        healthDataDeleted: healthDataResult.deletedCount,
        alertsDeleted: alertsResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear health data and alerts',
      error: error.message
    });
  }
});

module.exports = router;
