const Alert = require('../models/Alert');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
const emailService = require('./emailService');

class HealthAlertGenerator {
  constructor(userId) {
    this.userId = userId;
    this.alertThresholds = {
      heartRate: { low: 50, high: 100, critical: 120 },
      bloodPressure: { 
        systolic: { normal: 120, high: 140, critical: 180 },
        diastolic: { normal: 80, high: 90, critical: 110 }
      },
      bodyTemperature: { low: 97.0, normal: 99.0, high: 100.4, critical: 103.0 },
      glucoseLevel: { low: 70, normal: 100, high: 140, critical: 200 }
    };
  }

  async generateAlertsFromRecentData() {
    try {
      // Get recent health data (last 24 hours)
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

      const recentData = await HealthData.find({
        userId: this.userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: -1 });

      const alerts = [];

      // Check each recent reading for alerts
      for (const reading of recentData) {
        const alertsForReading = this.checkReadingForAlerts(reading);
        alerts.push(...alertsForReading);
      }

      // Check for pattern-based alerts
      const patternAlerts = await this.checkForPatternAlerts();
      alerts.push(...patternAlerts);

      // Check for missed readings alerts
      const missedReadingAlerts = await this.checkForMissedReadings();
      alerts.push(...missedReadingAlerts);

      // Save alerts to database and send email notifications
      const savedAlerts = [];
      for (const alertData of alerts) {
        // Check if similar alert already exists in last 6 hours
        const existingAlert = await Alert.findOne({
          userId: this.userId,
          type: alertData.type,
          createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
        });

        if (!existingAlert) {
          const alert = new Alert(alertData);
          const savedAlert = await alert.save();
          savedAlerts.push(savedAlert);

          // Send email notification based on user's alert type preferences
          try {
            const user = await User.findById(this.userId);
            if (user && user.settings?.notifications?.emailNotifications && user.settings?.notifications?.healthAlerts) {
              // Check if user wants emails for this specific alert type
              const emailAlertTypes = user.settings?.notifications?.emailAlertTypes || {
                critical: true, warning: true, info: false, success: false
              };

              const shouldSendEmail = emailAlertTypes[savedAlert.type];

              if (shouldSendEmail) {
                const emailResult = await emailService.sendHealthAlert(
                  user.email,
                  user.firstName || 'User',
                  {
                    title: savedAlert.title,
                    message: savedAlert.message,
                    type: savedAlert.type,
                    timestamp: savedAlert.timestamp,
                    source: savedAlert.source,
                    relatedDataType: alertData.relatedDataType
                  }
                );

                if (emailResult.success) {
                  console.log(`${savedAlert.type.toUpperCase()} alert email sent automatically to:`, user.email);
                  if (emailResult.previewUrl) {
                    console.log('Email preview:', emailResult.previewUrl);
                  }
                } else {
                  console.error('Failed to send health alert email:', emailResult.error);
                }
              } else {
                console.log(`Skipping email for ${savedAlert.type} alert (user preference):`, savedAlert.title);
              }
            }
          } catch (emailError) {
            console.error('Error sending health alert email:', emailError);
            // Don't fail the whole process if email fails
          }
        }
      }

      return savedAlerts;
    } catch (error) {
      console.error('Error generating health alerts:', error);
      throw error;
    }
  }

  checkReadingForAlerts(reading) {
    const alerts = [];
    const { dataType, value, timestamp } = reading;

    switch (dataType) {
      case 'heartRate':
        if (value < this.alertThresholds.heartRate.low) {
          alerts.push(this.createAlert(
            'critical',
            'Low Heart Rate',
            `Heart rate ${value} bpm is below normal range (${this.alertThresholds.heartRate.low}+ bpm)`,
            'heartRate',
            timestamp
          ));
        } else if (value > this.alertThresholds.heartRate.critical) {
          alerts.push(this.createAlert(
            'critical',
            'High Heart Rate',
            `Heart rate ${value} bpm is critically high (>${this.alertThresholds.heartRate.critical} bpm)`,
            'heartRate',
            timestamp
          ));
        } else if (value > this.alertThresholds.heartRate.high) {
          alerts.push(this.createAlert(
            'warning',
            'Elevated Heart Rate',
            `Heart rate ${value} bpm is above normal range (${this.alertThresholds.heartRate.high}+ bpm)`,
            'heartRate',
            timestamp
          ));
        }
        break;

      case 'bloodPressure':
        const systolic = typeof value === 'object' ? value.systolic : value;
        const diastolic = typeof value === 'object' ? value.diastolic : value - 40;

        if (systolic >= this.alertThresholds.bloodPressure.systolic.critical || 
            diastolic >= this.alertThresholds.bloodPressure.diastolic.critical) {
          alerts.push(this.createAlert(
            'critical',
            'Critical Blood Pressure',
            `Blood pressure ${systolic}/${diastolic} mmHg is critically high`,
            'bloodPressure',
            timestamp
          ));
        } else if (systolic >= this.alertThresholds.bloodPressure.systolic.high || 
                   diastolic >= this.alertThresholds.bloodPressure.diastolic.high) {
          alerts.push(this.createAlert(
            'warning',
            'High Blood Pressure',
            `Blood pressure ${systolic}/${diastolic} mmHg exceeds normal range`,
            'bloodPressure',
            timestamp
          ));
        }
        break;

      case 'bodyTemperature':
        if (value >= this.alertThresholds.bodyTemperature.critical) {
          alerts.push(this.createAlert(
            'critical',
            'High Fever',
            `Body temperature ${value.toFixed(1)}°F indicates high fever`,
            'bodyTemperature',
            timestamp
          ));
        } else if (value >= this.alertThresholds.bodyTemperature.high) {
          alerts.push(this.createAlert(
            'warning',
            'Fever Detected',
            `Body temperature ${value.toFixed(1)}°F indicates fever`,
            'bodyTemperature',
            timestamp
          ));
        } else if (value < this.alertThresholds.bodyTemperature.low) {
          alerts.push(this.createAlert(
            'warning',
            'Low Body Temperature',
            `Body temperature ${value.toFixed(1)}°F is below normal range`,
            'bodyTemperature',
            timestamp
          ));
        }
        break;

      case 'glucoseLevel':
        if (value >= this.alertThresholds.glucoseLevel.critical) {
          alerts.push(this.createAlert(
            'critical',
            'Critical Blood Glucose',
            `Blood glucose ${value} mg/dL is critically high`,
            'glucoseLevel',
            timestamp
          ));
        } else if (value >= this.alertThresholds.glucoseLevel.high) {
          alerts.push(this.createAlert(
            'warning',
            'High Blood Glucose',
            `Blood glucose ${value} mg/dL exceeds target range`,
            'glucoseLevel',
            timestamp
          ));
        } else if (value < this.alertThresholds.glucoseLevel.low) {
          alerts.push(this.createAlert(
            'warning',
            'Low Blood Glucose',
            `Blood glucose ${value} mg/dL is below normal range`,
            'glucoseLevel',
            timestamp
          ));
        }
        break;
    }

    return alerts;
  }

  async checkForPatternAlerts() {
    const alerts = [];
    
    // Get last 3 days of data for pattern analysis
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    const recentData = await HealthData.find({
      userId: this.userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    // Check for trending blood pressure
    const bpReadings = recentData.filter(d => d.dataType === 'bloodPressure');
    if (bpReadings.length >= 3) {
      const systolicValues = bpReadings.map(r => 
        typeof r.value === 'object' ? r.value.systolic : r.value
      );
      
      // Check if last 3 readings are all increasing
      const isIncreasing = systolicValues.slice(-3).every((val, i, arr) => 
        i === 0 || val > arr[i - 1]
      );
      
      if (isIncreasing && systolicValues[systolicValues.length - 1] > 130) {
        alerts.push(this.createAlert(
          'warning',
          'Blood Pressure Trending Up',
          'Blood pressure has been increasing over the last 3 readings',
          'bloodPressure',
          new Date()
        ));
      }
    }

    // Check for irregular heart rate pattern
    const hrReadings = recentData.filter(d => d.dataType === 'heartRate');
    if (hrReadings.length >= 5) {
      const hrValues = hrReadings.slice(-5).map(r => r.value);
      const variance = this.calculateVariance(hrValues);
      
      if (variance > 200) { // High variability
        alerts.push(this.createAlert(
          'info',
          'Heart Rate Variability',
          'Heart rate showing high variability in recent readings',
          'heartRate',
          new Date()
        ));
      }
    }

    return alerts;
  }

  async checkForMissedReadings() {
    const alerts = [];
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Check for missing readings in last 24 hours
    const dataTypes = ['heartRate', 'bloodPressure', 'glucoseLevel', 'bodyTemperature'];
    
    for (const dataType of dataTypes) {
      const recentReading = await HealthData.findOne({
        userId: this.userId,
        dataType: dataType,
        timestamp: { $gte: yesterday }
      });

      if (!recentReading) {
        const readingNames = {
          heartRate: 'heart rate',
          bloodPressure: 'blood pressure',
          glucoseLevel: 'blood glucose',
          bodyTemperature: 'body temperature'
        };

        alerts.push(this.createAlert(
          'info',
          'Missed Reading Reminder',
          `No ${readingNames[dataType]} readings logged in the last 24 hours`,
          dataType,
          new Date()
        ));
      }
    }

    return alerts;
  }

  createAlert(severity, title, message, relatedDataType, timestamp) {
    return {
      userId: this.userId,
      type: severity,
      title: title,
      message: message,
      relatedDataType: relatedDataType,
      timestamp: timestamp,
      createdAt: new Date(),
      isRead: false
    };
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Generate positive/informational alerts when health data is normal
  async generatePositiveAlerts() {
    const positiveAlerts = [];

    // Check if user has been consistent with logging
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayReadings = await HealthData.find({
      userId: this.userId,
      timestamp: { $gte: yesterday }
    });

    // Group by data type
    const readingsByType = {};
    todayReadings.forEach(reading => {
      if (!readingsByType[reading.dataType]) {
        readingsByType[reading.dataType] = [];
      }
      readingsByType[reading.dataType].push(reading);
    });

    // Check for daily task completion
    const expectedTypes = ['heartRate', 'bloodPressure', 'glucoseLevel', 'bodyTemperature'];
    const completedTypes = expectedTypes.filter(type => readingsByType[type] && readingsByType[type].length > 0);

    if (completedTypes.length === 4) {
      positiveAlerts.push({
        userId: this.userId,
        type: 'info',
        title: 'Daily Health Tasks Completed',
        message: 'Excellent! You have logged all 4 vital signs today',
        relatedDataType: 'general',
        timestamp: new Date(),
        createdAt: new Date(),
        isRead: false
      });
    } else if (completedTypes.length >= 2) {
      positiveAlerts.push({
        userId: this.userId,
        type: 'info',
        title: 'Good Progress',
        message: `You have logged ${completedTypes.length}/4 vital signs today. Keep it up!`,
        relatedDataType: 'general',
        timestamp: new Date(),
        createdAt: new Date(),
        isRead: false
      });
    }

    // Check for consistent readings over multiple days
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyReadings = await HealthData.find({
      userId: this.userId,
      timestamp: { $gte: weekAgo }
    });

    if (weeklyReadings.length >= 20) {
      positiveAlerts.push({
        userId: this.userId,
        type: 'info',
        title: 'Consistent Health Monitoring',
        message: `Great job! You have ${weeklyReadings.length} health readings this week`,
        relatedDataType: 'general',
        timestamp: new Date(),
        createdAt: new Date(),
        isRead: false
      });
    }

    // Save positive alerts
    const savedAlerts = [];
    for (const alertData of positiveAlerts) {
      // Check if similar alert already exists
      const existingAlert = await Alert.findOne({
        userId: this.userId,
        title: alertData.title,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!existingAlert) {
        const alert = new Alert(alertData);
        const savedAlert = await alert.save();
        savedAlerts.push(savedAlert);
      }
    }

    return savedAlerts;
  }
}

module.exports = HealthAlertGenerator;
