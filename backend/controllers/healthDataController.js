const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const User = require('../models/User');
const emailService = require('../services/emailService');


// @desc    Add new health data for the logged-in user
// @route   POST api/health-data
// @access  Private
const addHealthData = async (req, res) => {
  try {
    console.log('🔍 addHealthData endpoint called with:', req.body);
    console.log('🔍 User ID:', req.user?.id);
    const { dataType, value, unit, timestamp, source } = req.body;

    if (!dataType || value === undefined || !unit) {
      return res.status(400).json({ message: 'Please provide dataType, value, and unit for health data.' });
    }

    const allowedDataTypes = HealthData.schema.path('dataType').enumValues;
    if (!allowedDataTypes.includes(dataType)) {
        return res.status(400).json({ message: `Invalid dataType. Allowed types are: ${allowedDataTypes.join(', ')}` });
    }

    if (dataType === 'bloodPressure') {
      if (typeof value !== 'object' || value === null || value.systolic === undefined || value.diastolic === undefined) {
        return res.status(400).json({ message: 'For bloodPressure, value must be an object with systolic and diastolic properties.' });
      }
      if (typeof value.systolic !== 'number' || typeof value.diastolic !== 'number') {
        return res.status(400).json({ message: 'Systolic and diastolic values must be numbers.' });
      }
    }

    const newHealthData = new HealthData({
      userId: req.user.id,
      dataType,
      value,
      unit,
      timestamp: timestamp ? new Date(timestamp) : Date.now(),
      source: source || 'Manual Entry'
    });

    await newHealthData.save();

    // Anomaly Detection & Alert Creation
    try {
      // Check if user has threshold alerts enabled
      const user = await User.findById(req.user.id);
      console.log('🔍 User notification settings:', {
        userId: req.user.id,
        userEmail: user?.email,
        settings: user?.settings?.notifications
      });
      const thresholdAlertsEnabled = user?.settings?.notifications?.healthAlerts !== false;

      let alertToCreate = null;

      // Backend email notifications for critical alerts (frontend handles UI alerts)
      if (thresholdAlertsEnabled) {
        if (dataType === 'bloodPressure' && typeof value === 'object' && value.systolic && value.diastolic) {
          if (value.systolic > 140 || value.diastolic > 90) {
            alertToCreate = { type: 'critical', title: 'High Blood Pressure Alert', message: `Critical blood pressure reading: ${value.systolic}/${value.diastolic} mmHg. Please consult your doctor.`, source: source || 'Blood Pressure Monitor' };
          } else if (value.systolic > 130 || value.diastolic > 85) {
            alertToCreate = { type: 'warning', title: 'Elevated Blood Pressure', message: `Blood pressure reading: ${value.systolic}/${value.diastolic} mmHg is elevated. Monitor closely.`, source: source || 'Blood Pressure Monitor' };
          }
        } else if (dataType === 'heartRate' && typeof value === 'number') {
          if (value > 100) {
            alertToCreate = { type: 'warning', title: 'High Heart Rate Detected', message: `Heart rate of ${value} bpm detected. If resting, please monitor.`, source: source || 'Heart Rate Monitor' };
          } else if (value < 50 && value > 0) {
            alertToCreate = { type: 'warning', title: 'Low Heart Rate Detected', message: `Heart rate of ${value} bpm detected. If experiencing symptoms, consult your doctor.`, source: source || 'Heart Rate Monitor' };
          }
        } else if (dataType === 'glucoseLevel' && typeof value === 'number') {
          if (value > 180) {
            alertToCreate = { type: 'warning', title: 'High Blood Glucose Alert', message: `Blood glucose level is ${value} ${unit}, which is high.`, source: source || 'Glucose Monitor' };
          } else if (value < 70 && value > 0) {
            alertToCreate = { type: 'critical', title: 'Low Blood Glucose Alert', message: `Blood glucose level is ${value} ${unit}, which is low. Please take appropriate action.`, source: source || 'Glucose Monitor' };
          }
        }
      } else {
        console.log(`Threshold alerts disabled for user ${req.user.id} - skipping alert generation for ${dataType}: ${JSON.stringify(value)}`);
      }

      // Backend email notifications for critical alerts (frontend handles UI alerts)
      if (alertToCreate) {
        console.log('🚨 Alert created:', alertToCreate.type, '-', alertToCreate.title);

        // Send email for critical and warning alerts
        if (alertToCreate.type === 'critical' || alertToCreate.type === 'warning') {
          console.log('📧 Attempting to send email notification for:', alertToCreate.type, 'alert');

          // Send email notification based on user's alert type preferences
          try {
            const user = await User.findById(req.user.id);
            console.log('👤 User found:', user ? `${user.firstName} ${user.lastName} (${user.email})` : 'No user found');
            console.log('⚙️ User email settings:', {
              emailNotifications: user?.settings?.notifications?.emailNotifications,
              healthAlerts: user?.settings?.notifications?.healthAlerts,
              emailAlertTypes: user?.settings?.notifications?.emailAlertTypes
            });

            // Temporarily force email sending for testing
            if (user) {
              // Check if user wants emails for this specific alert type
              const emailAlertTypes = user.settings?.notifications?.emailAlertTypes || {
                critical: true, warning: false, info: false, success: false
              };

              const shouldSendEmail = emailAlertTypes[alertToCreate.type];

              if (shouldSendEmail) {
                const emailResult = await emailService.sendHealthAlert(
                  user.email,
                  user.firstName || 'User',
                  {
                    title: alertToCreate.title,
                    message: alertToCreate.message,
                    type: alertToCreate.type,
                    timestamp: new Date(),
                    source: alertToCreate.source,
                    relatedDataType: dataType
                  }
                );

                if (emailResult.success) {
                  console.log(`${alertToCreate.type.toUpperCase()} alert email sent automatically to:`, user.email);
                  if (emailResult.previewUrl) {
                    console.log('Email preview:', emailResult.previewUrl);
                  }
                } else {
                  console.error('Failed to send health alert email:', emailResult.error);
                }
              } else {
                console.log(`Skipping email for ${alertToCreate.type} alert (user preference):`, alertToCreate.title);
              }
            }
          } catch (emailError) {
            console.error('Error sending health alert email:', emailError);
            // Don't fail the whole request if email fails
          }
        }
      }
    } catch (alertError) {
      console.error('Error during anomaly detection or alert creation:', alertError);
    }



    res.status(201).json(newHealthData);

  } catch (error) {
    console.error('Error adding health data:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while adding health data.' });
  }
};

// @desc    Get health data for the logged-in user, with optional filters
// @route   GET api/health-data
// @access  Private
const getHealthData = async (req, res) => {
  try {
    const { dataType, startDate, endDate, limit = 20, page = 1 } = req.query;
    const query = { userId: req.user.id };

    if (dataType) query.dataType = dataType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        let endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endOfDay;
      }
    }
    
    const options = {
      sort: { timestamp: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const healthDataEntries = await HealthData.find(query, null, options);
    const totalEntries = await HealthData.countDocuments(query);

    res.json({
      data: healthDataEntries,
      totalPages: Math.ceil(totalEntries / limit),
      currentPage: parseInt(page),
      totalEntries
    });

  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ message: 'Server error while fetching health data.' });
  }
};

// @desc    Get health data for a specific patient (for doctors)
// @route   GET api/health-data/patient/:patientId
// @access  Private (Doctor only)
const getPatientHealthData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { dataType, startDate, endDate, limit = 20, page = 1 } = req.query;

    // Verify the doctor has access to this patient (through appointments)
    const Appointment = require('../models/Appointment');
    const doctorId = req.user.id;

    // Check if doctor has any appointments with this patient
    const hasAccess = await Appointment.findOne({
      userId: patientId,
      providerId: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. No appointment relationship with this patient.' });
    }

    const query = { userId: patientId };

    if (dataType) query.dataType = dataType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        let endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endOfDay;
      }
    }

    const options = {
      sort: { timestamp: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const healthDataEntries = await HealthData.find(query, null, options);
    const totalEntries = await HealthData.countDocuments(query);

    res.json({
      data: healthDataEntries,
      totalPages: Math.ceil(totalEntries / limit),
      currentPage: parseInt(page),
      totalEntries
    });

  } catch (error) {
    console.error('Error fetching patient health data:', error);
    res.status(500).json({ message: 'Server error while fetching patient health data.' });
  }
};

module.exports = {
  addHealthData,
  getHealthData,
  getPatientHealthData
};
