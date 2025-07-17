import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

import { shouldShowNotification } from '../utils/notificationUtils';

const AlertContext = createContext();

// Module-level mutex to prevent concurrent alert fetching
let isCurrentlyFetching = false;

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

// Enhanced Smart Alert Generation System with User-Defined Thresholds
const generateSmartAlertsWithSettings = (healthData, userSettings, lastProcessedTime = null) => {
  const alerts = [];

  // Get user-defined thresholds or use defaults
  const thresholds = userSettings?.health?.alertThresholds || {
    heartRate: { low: 60, high: 120 },
    bloodPressure: { systolic: 140, diastolic: 90 },
    bodyTemperature: { low: 96.0, high: 100.4 },
    glucoseLevel: { low: 70, high: 180 }
  };

  // Process each health metric for alerts
  Object.entries(healthData).forEach(([dataType, readings]) => {
    if (readings.length === 0) return;
    console.log(`🔍 Processing ${dataType} with ${readings.length} readings`);

    // Filter readings to only process new ones (if lastProcessedTime is provided)
    const readingsToProcess = lastProcessedTime
      ? readings.filter(reading => new Date(reading.timestamp) > new Date(lastProcessedTime))
      : readings.slice(-1); // If no lastProcessedTime, only process the latest reading

    console.log(`📊 Processing ${readingsToProcess.length} new ${dataType} readings (filtered from ${readings.length} total)`);

    // Generate alerts for new readings only
    readingsToProcess.forEach(reading => {
      // Create timestamp-based alert ID for testing flexibility
      const baseAlertId = `${dataType}-${reading.timestamp}`;
      console.log(`📊 Checking ${dataType} reading:`, reading.value, 'at', reading.timestamp, 'Base ID:', baseAlertId);

    switch (dataType) {
      case 'heartRate':
        const hr = reading.value;
        const hrThresholds = thresholds.heartRate;
        console.log(`💓 Heart rate ${hr} bpm - checking against critical (<50) and warning (<${hrThresholds.low}, >${hrThresholds.high})`);

        // Critical low (severe bradycardia - medically dangerous)
        if (hr < 50) {
          console.log('🚨 CRITICAL: Severe bradycardia detected!');
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Bradycardia Alert",
            message: `CRITICAL: Heart rate ${hr} bpm is dangerously low. This requires immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (hr < hrThresholds.low) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "Low Heart Rate Detected",
            message: `Heart rate of ${hr} bpm is below normal range. Monitor for symptoms and consult your doctor if concerned.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        } else if (hr > 150) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Tachycardia Alert",
            message: `CRITICAL: Heart rate ${hr} bpm is dangerously high. Seek immediate medical evaluation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (hr > hrThresholds.high) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "High Heart Rate Alert",
            message: `Heart rate ${hr} bpm is above your target range (${hrThresholds.low}-${hrThresholds.high} bpm). Monitor for symptoms and consider medical consultation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'bloodPressure':
        const systolic = typeof reading.value === 'object' ? reading.value.systolic : reading.value;
        const diastolic = typeof reading.value === 'object' ? reading.value.diastolic : reading.value - 40;
        const bpThresholds = thresholds.bloodPressure;

        // Critical high (hypertensive crisis)
        if (systolic >= 180 || diastolic >= 110) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Hypertensive Crisis Alert",
            message: `CRITICAL: Blood pressure ${systolic}/${diastolic} mmHg indicates hypertensive crisis. Seek emergency medical care immediately.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Blood Pressure Monitor",
            dataType: "bloodPressure",
            value: `${systolic}/${diastolic}`,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (systolic >= bpThresholds.systolic || diastolic >= bpThresholds.diastolic) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "High Blood Pressure Alert",
            message: `Blood pressure ${systolic}/${diastolic} mmHg exceeds your target range (below ${bpThresholds.systolic}/${bpThresholds.diastolic} mmHg). Contact your healthcare provider for evaluation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Blood Pressure Monitor",
            dataType: "bloodPressure",
            value: `${systolic}/${diastolic}`,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        } else if (systolic < 70 || diastolic < 40) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Hypotension Alert",
            message: `CRITICAL: Blood pressure ${systolic}/${diastolic} mmHg is dangerously low. Risk of shock. Seek immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Blood Pressure Monitor",
            dataType: "bloodPressure",
            value: `${systolic}/${diastolic}`,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (systolic < 90 || diastolic < 60) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "Low Blood Pressure Alert",
            message: `Blood pressure ${systolic}/${diastolic} mmHg is low. Monitor for symptoms like dizziness or fatigue.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Blood Pressure Monitor",
            dataType: "bloodPressure",
            value: `${systolic}/${diastolic}`,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'glucoseLevel':
        const glucose = reading.value;
        const glucoseThresholds = thresholds.glucoseLevel;

        // Critical low (severe hypoglycemia)
        if (glucose < 54) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Hypoglycemia Alert",
            message: `CRITICAL: Blood glucose ${glucose} mg/dL is dangerously low. Take immediate action to raise blood sugar.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Glucose Monitor",
            dataType: "glucoseLevel",
            value: glucose,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (glucose < glucoseThresholds.low) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "Low Blood Glucose Alert",
            message: `Blood glucose ${glucose} mg/dL is below your target range (${glucoseThresholds.low}-${glucoseThresholds.high} mg/dL). Consider taking action to raise blood sugar.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Glucose Monitor",
            dataType: "glucoseLevel",
            value: glucose,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        } else if (glucose > 400) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Hyperglycemia Alert",
            message: `CRITICAL: Blood glucose ${glucose} mg/dL is extremely high. Risk of diabetic ketoacidosis. Seek immediate medical care.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Glucose Monitor",
            dataType: "glucoseLevel",
            value: glucose,
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (glucose > glucoseThresholds.high) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "High Blood Glucose Alert",
            message: `Blood glucose ${glucose} mg/dL is above your target range (${glucoseThresholds.low}-${glucoseThresholds.high} mg/dL). Take steps to lower blood sugar and monitor closely.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Glucose Monitor",
            dataType: "glucoseLevel",
            value: glucose,
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'bodyTemperature':
        const temp = reading.value;
        const tempThresholds = thresholds.bodyTemperature;

        // Critical high (severe fever)
        if (temp >= 104.0) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Fever Alert",
            message: `CRITICAL: Body temperature ${temp.toFixed(1)}°F is dangerously high. Risk of heat stroke. Seek immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (temp > tempThresholds.high) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "High Temperature Alert",
            message: `Body temperature ${temp.toFixed(1)}°F is above your target range (${tempThresholds.low}-${tempThresholds.high}°F). Monitor for fever symptoms.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Contact Doctor"],
            emergencyLevel: "moderate"
          });
        } else if (temp < 95.0) {
          alerts.push({
            id: baseAlertId,
            type: "critical",
            title: "Severe Hypothermia Alert",
            message: `CRITICAL: Body temperature ${temp.toFixed(1)}°F is dangerously low. Risk of hypothermia. Seek immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Contact Doctor"],
            emergencyLevel: "immediate"
          });
        } else if (temp < tempThresholds.low) {
          alerts.push({
            id: baseAlertId,
            type: "warning",
            title: "Low Temperature Alert",
            message: `Body temperature ${temp.toFixed(1)}°F is below your target range (${tempThresholds.low}-${tempThresholds.high}°F). Monitor for symptoms.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Contact Doctor"],
            emergencyLevel: "low"
          });
        }
        break;
    }
    }); // Close the readings.forEach loop
  }); // Close the Object.entries forEach loop

  // Deduplicate alerts by ID (keep the most recent one for each ID)
  const deduplicatedAlerts = [];
  const seenIds = new Set();

  // Sort by timestamp first (newest first), then deduplicate
  const sortedAlerts = alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  for (const alert of sortedAlerts) {
    if (!seenIds.has(alert.id)) {
      deduplicatedAlerts.push(alert);
      seenIds.add(alert.id);
    } else {
      console.log(`🔄 Skipping duplicate alert during generation: ${alert.id} - ${alert.title}`);
    }
  }

  console.log(`🔄 Deduplicated alerts: ${alerts.length} → ${deduplicatedAlerts.length}`);
  return deduplicatedAlerts;
};

// Filter alerts based on user notification preferences
const filterAlertsByNotificationPreferences = (alerts, userSettings) => {
  const notificationSettings = userSettings?.notifications || {};

  // If health alerts are disabled, filter out all health-related alerts
  if (!notificationSettings.healthAlerts) {
    return alerts.filter(alert =>
      alert.emergencyLevel === 'immediate' // Always show critical/emergency alerts
    );
  }

  // Note: Anomaly detection has been replaced with Weekly Health Summary feature
  // No additional filtering needed here

  return alerts;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastProcessedTime, setLastProcessedTime] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  // Use default settings since we removed the settings context
  const settings = {
    notifications: {
      healthAlerts: true, // Enable health alerts by default
      appointmentReminders: true,
      medicationReminders: true
    },
    health: {
      alertThresholds: {
        heartRate: { low: 60, high: 120 }, // Warning thresholds (Critical: <50, >150)
        bloodPressure: { systolic: 140, diastolic: 90 }, // Warning thresholds (Critical: <70/40, ≥180/110)
        bodyTemperature: { low: 96.0, high: 100.4 }, // Warning thresholds (Critical: <95°F, ≥104°F)
        glucoseLevel: { low: 70, high: 180 } // Warning thresholds (Critical: <54, >400)
      }
    }
  };

  // Get user-specific localStorage key
  const getUserSpecificKey = (baseKey) => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        return `${baseKey}_${user.id || user._id || 'unknown'}`;
      }
    } catch (error) {
      console.error('Error getting user ID for localStorage key:', error);
    }
    return baseKey; // Fallback to base key if user ID not available
  };

  // Load read status from localStorage (user-specific)
  const loadReadStatus = () => {
    try {
      const userSpecificKey = getUserSpecificKey('alertReadStatus');
      const savedReadStatus = localStorage.getItem(userSpecificKey);
      return savedReadStatus ? JSON.parse(savedReadStatus) : {};
    } catch (error) {
      console.error('Error loading alert read status:', error);
      return {};
    }
  };

  // Save read status to localStorage (user-specific)
  const saveReadStatus = (readStatus) => {
    try {
      const userSpecificKey = getUserSpecificKey('alertReadStatus');
      localStorage.setItem(userSpecificKey, JSON.stringify(readStatus));
    } catch (error) {
      console.error('Error saving alert read status:', error);
    }
  };

  // Helper functions for persisting read alerts (user-specific)
  const loadReadAlerts = () => {
    try {
      const userSpecificKey = getUserSpecificKey('readAlerts');
      const saved = localStorage.getItem(userSpecificKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading read alerts:', error);
      return [];
    }
  };

  const saveReadAlerts = (readAlerts) => {
    try {
      // Only keep alerts from the last 7 days to prevent localStorage bloat
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentReadAlerts = readAlerts.filter(alert =>
        new Date(alert.timestamp) > sevenDaysAgo
      );
      const userSpecificKey = getUserSpecificKey('readAlerts');
      localStorage.setItem(userSpecificKey, JSON.stringify(recentReadAlerts));
    } catch (error) {
      console.error('Error saving read alerts:', error);
    }
  };

  // Save alerts to database for doctor visibility
  const saveAlertsToDatabase = async (alertsToSave) => {
    if (!alertsToSave || alertsToSave.length === 0) {
      console.log('💾 No alerts to save to database');
      return;
    }

    try {
      console.log(`💾 Attempting to save ${alertsToSave.length} alerts to database...`);

      // Save each alert individually with staggered timing to prevent race conditions
      const savePromises = alertsToSave.map(async (alert, index) => {
        try {
          // Add a small delay between requests to prevent race conditions
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 100 * index));
          }

          // Convert frontend alert format to backend format
          const alertData = {
            type: alert.type,
            title: alert.title,
            message: alert.message,
            timestamp: alert.timestamp,
            source: alert.source || 'Health Monitor'
          };

          const response = await api.post('/alerts', alertData);
          console.log('✅ Alert saved to database:', alert.title);
          return response.data;
        } catch (error) {
          // Check if it's a duplicate error (409 status)
          if (error.response?.status === 409) {
            console.log('🔄 Skipping duplicate alert (server-side detection):', alert.title);
            return null;
          }
          console.error('❌ Failed to save alert to database:', alert.title, error);
          return null;
        }
      });

      const results = await Promise.allSettled(savePromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
      console.log(`💾 Finished saving alerts to database: ${successCount}/${alertsToSave.length} successful`);
    } catch (error) {
      console.error('❌ Error saving alerts to database:', error);
    }
  };

  // Fetch health data and generate alerts
  const fetchAndGenerateAlerts = async () => {
    // Prevent concurrent calls using module-level variable
    if (isCurrentlyFetching) {
      console.log('🔒 AlertContext: Already fetching alerts, skipping concurrent call');
      return;
    }

    const callId = Math.random().toString(36).substr(2, 9);
    console.log(`🔄 AlertContext: Fetching health data and generating alerts... [Call ID: ${callId}]`);
    isCurrentlyFetching = true;
    setLoading(true);

    try {
      // Calculate date range for recent data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7); // Last 7 days

      const commonParams = { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        limit: 50,
        sortBy: 'timestamp',
        order: 'desc'
      };

      // Fetch health data for all metrics
      const [heartRateRes, bloodPressureRes, temperatureRes, glucoseRes] = await Promise.allSettled([
        api.get('/health-data', { params: { ...commonParams, dataType: 'heartRate' } }),
        api.get('/health-data', { params: { ...commonParams, dataType: 'bloodPressure' } }),
        api.get('/health-data', { params: { ...commonParams, dataType: 'bodyTemperature' } }),
        api.get('/health-data', { params: { ...commonParams, dataType: 'glucoseLevel' } })
      ]);

      // Process the health data
      const newHealthData = {
        heartRate: heartRateRes.status === 'fulfilled' ? heartRateRes.value.data.data : [],
        bloodPressure: bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data.data : [],
        bodyTemperature: temperatureRes.status === 'fulfilled' ? temperatureRes.value.data.data : [],
        glucoseLevel: glucoseRes.status === 'fulfilled' ? glucoseRes.value.data.data : []
      };

      // Generate smart alerts from health data using user settings
      console.log(`🔍 AlertContext: Generating smart alerts from health data... [Call ID: ${callId}]`);
      const smartAlerts = generateSmartAlertsWithSettings(newHealthData, settings, lastProcessedTime);
      console.log(`⚠️ AlertContext: Generated smart alerts: ${smartAlerts.length} [Call ID: ${callId}]`);

      // Filter alerts based on notification preferences
      const filteredAlerts = filterAlertsByNotificationPreferences(smartAlerts, settings);
      console.log('🔽 AlertContext: Filtered alerts:', filteredAlerts.length);

      // Load saved read status
      const savedReadStatus = loadReadStatus();

      // Apply saved read status to filtered alerts
      const alertsWithReadStatus = filteredAlerts.map(alert => ({
        ...alert,
        isRead: savedReadStatus[alert.id] || false
      }));

      // Load saved read alerts from localStorage
      const savedReadAlerts = loadReadAlerts();
      console.log('📖 Loaded saved read alerts:', savedReadAlerts.length);

      // Merge with existing alerts, keeping read status
      setAlerts(prevAlerts => {
        console.log('🔄 Merging alerts - Previous alerts:', prevAlerts.length, 'New filtered alerts:', alertsWithReadStatus.length);

        // Create a map of new alerts by ID for easy lookup
        const newAlertsMap = new Map(alertsWithReadStatus.map(alert => [alert.id, alert]));

        // Update existing alerts with latest data while preserving read status
        const updatedExistingAlerts = prevAlerts.map(existingAlert => {
          if (newAlertsMap.has(existingAlert.id)) {
            // Alert exists in new data, update with latest values but preserve read status
            const newAlert = newAlertsMap.get(existingAlert.id);
            console.log(`🔄 Updating existing alert: ${existingAlert.id} - preserving read status: ${existingAlert.isRead}, updating values`);
            return {
              ...newAlert, // Use latest alert data (updated values, timestamp, etc.)
              isRead: existingAlert.isRead // But preserve the original read status
            };
          }
          console.log(`❌ Existing alert not in new data: ${existingAlert.id} - ${existingAlert.title}`);
          return existingAlert;
        });

        // Find truly new alerts (not in existing alerts)
        const existingAlertIds = new Set(prevAlerts.map(alert => alert.id));
        const newAlerts = alertsWithReadStatus.filter(alert => !existingAlertIds.has(alert.id));
        console.log('➕ New alerts to add:', newAlerts.length, newAlerts.map(a => a.title));

        // Save new alerts to database so doctors can see them
        if (newAlerts.length > 0) {
          console.log(`💾 AlertContext: Saving ${newAlerts.length} new alerts to database... [Call ID: ${callId}]`);
          saveAlertsToDatabase(newAlerts);
        }

        // Add saved read alerts that are not already present
        const allAlertIds = new Set([...updatedExistingAlerts.map(a => a.id), ...newAlerts.map(a => a.id)]);
        const missingReadAlerts = savedReadAlerts.filter(alert => !allAlertIds.has(alert.id));
        console.log('📖 Adding missing read alerts:', missingReadAlerts.length);

        // Combine updated existing alerts, new alerts, and missing read alerts
        const mergedAlerts = [...updatedExistingAlerts, ...newAlerts, ...missingReadAlerts];
        console.log('✅ Final merged alerts count:', mergedAlerts.length);

        // Sort by timestamp (newest first)
        return mergedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      // Update the last processed time to the latest reading timestamp
      // Find the latest timestamp from all processed readings
      const allReadings = Object.values(newHealthData).flat();
      if (allReadings.length > 0) {
        const latestTimestamp = allReadings
          .map(reading => new Date(reading.timestamp))
          .sort((a, b) => b - a)[0]
          .toISOString();
        setLastProcessedTime(latestTimestamp);
        console.log('⏰ Updated lastProcessedTime to latest reading:', latestTimestamp);
      } else {
        console.log('⏰ No readings to process, keeping lastProcessedTime unchanged');
      }

    } catch (err) {
      console.error("Failed to fetch health data for alerts:", err);
    } finally {
      setLoading(false);
      isCurrentlyFetching = false;
    }
  };

  // Mark alert as read
  const markAsRead = (alertId) => {
    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );

      // Save read status to localStorage
      const readStatus = loadReadStatus();
      readStatus[alertId] = true;
      saveReadStatus(readStatus);

      // Save the read alert to localStorage so it persists across page refreshes
      const readAlert = updatedAlerts.find(alert => alert.id === alertId);
      if (readAlert) {
        const existingReadAlerts = loadReadAlerts();
        const alertExists = existingReadAlerts.some(alert => alert.id === alertId);

        if (!alertExists) {
          const updatedReadAlerts = [...existingReadAlerts, readAlert];
          saveReadAlerts(updatedReadAlerts);
        }
      }

      return updatedAlerts;
    });
  };

  // Mark all alerts as read
  const markAllAsRead = () => {
    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.map(alert => ({ ...alert, isRead: true }));

      // Save all read statuses to localStorage
      const readStatus = loadReadStatus();
      updatedAlerts.forEach(alert => {
        readStatus[alert.id] = true;
      });
      saveReadStatus(readStatus);

      // Save all read alerts to localStorage so they persist across page refreshes
      const existingReadAlerts = loadReadAlerts();
      const newReadAlerts = [...existingReadAlerts];

      updatedAlerts.forEach(alert => {
        const alertExists = existingReadAlerts.some(existing => existing.id === alert.id);
        if (!alertExists) {
          newReadAlerts.push(alert);
        }
      });

      if (newReadAlerts.length > existingReadAlerts.length) {
        saveReadAlerts(newReadAlerts);
      }

      return updatedAlerts;
    });
  };

  // Delete alert
  const deleteAlert = (alertId) => {
    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.filter(alert => alert.id !== alertId);

      // Remove from localStorage
      const readStatus = loadReadStatus();
      delete readStatus[alertId];
      saveReadStatus(readStatus);

      return updatedAlerts;
    });
  };

  // Clear all alerts (for debugging)
  const clearAllAlerts = async () => {
    try {
      // Clear from state
      setAlerts([]);

      // Clear from localStorage (user-specific)
      const alertReadStatusKey = getUserSpecificKey('alertReadStatus');
      const readAlertsKey = getUserSpecificKey('readAlerts');
      localStorage.removeItem(alertReadStatusKey);
      localStorage.removeItem(readAlertsKey);

      // Clear from database using simulation endpoint
      await api.delete('/simulation/clear-alerts');

      // Reset last processed time
      setLastProcessedTime(null);

      console.log('🧹 All alerts cleared');
    } catch (error) {
      console.error('Failed to clear alerts:', error);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    const count = alerts.filter(alert => !alert.isRead).length;
    console.log('AlertContext getUnreadCount:', count, 'from alerts:', alerts.length); // Debug log
    return count;
  };

  // Get critical unread count
  const getCriticalUnreadCount = () => {
    return alerts.filter(alert => !alert.isRead && alert.type === 'critical').length;
  };

  // Monitor user changes and refresh alerts when user switches
  React.useEffect(() => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        const userId = user.id || user._id;

        // Set current user ID if not set, or if user has changed
        if (!currentUserId) {
          console.log('AlertContext: Setting initial user ID:', userId);
          setCurrentUserId(userId);
        } else if (currentUserId !== userId) {
          // User has changed, fetch fresh alerts for the new user
          console.log('AlertContext: User changed from', currentUserId, 'to', userId, '- fetching alerts for new user');
          setCurrentUserId(userId);
          fetchAndGenerateAlerts();
        }
      } else {
        // No user logged in, clear alerts
        if (currentUserId) {
          console.log('AlertContext: No user logged in, clearing alerts');
          setCurrentUserId(null);
          setAlerts([]);
        }
      }
    } catch (error) {
      console.error('Error checking user change:', error);
    }
  });

  // Auto-fetch and generate alerts on mount and when auth changes
  React.useEffect(() => {
    console.log('AlertContext: Auto-fetching alerts on mount...');
    fetchAndGenerateAlerts();
  }, []); // Only run once on mount

  // Listen for auth changes to refresh alerts for new user
  React.useEffect(() => {
    const handleAuthChange = () => {
      console.log('AlertContext: Auth changed, refreshing alerts...');
      // Small delay to ensure new auth data is available
      setTimeout(() => {
        fetchAndGenerateAlerts();
      }, 100);
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Listen for health data updates to refresh alerts
  React.useEffect(() => {
    const handleHealthDataUpdate = (event) => {
      console.log('AlertContext: Health data updated, refreshing alerts...', event.detail);

      // Skip alert generation for manual data entry since backend already creates alerts
      if (event.detail?.source === 'manualDataEntry') {
        console.log('AlertContext: Skipping alert generation for manual data entry (backend handles this)');
        return;
      }

      setTimeout(() => {
        fetchAndGenerateAlerts();
      }, 500); // Small delay to ensure data is saved
    };

    const handleClearAllAlerts = () => {
      console.log('AlertContext: Received clearAllAlerts event, clearing alerts...');
      clearAllAlerts();
    };

    // Listen for various health data events
    console.log('AlertContext: Setting up event listeners for health data updates...');
    window.addEventListener('healthDataAdded', handleHealthDataUpdate);
    window.addEventListener('healthDataGenerated', handleHealthDataUpdate);
    // Removed 'alertsGenerated' listener to prevent feedback loop causing duplicate alerts
    window.addEventListener('clearAllAlerts', handleClearAllAlerts);

    return () => {
      console.log('AlertContext: Removing event listeners...');
      window.removeEventListener('healthDataAdded', handleHealthDataUpdate);
      window.removeEventListener('healthDataGenerated', handleHealthDataUpdate);
      // Removed 'alertsGenerated' listener to prevent feedback loop causing duplicate alerts
      window.removeEventListener('clearAllAlerts', handleClearAllAlerts);
    };
  }, []);

  // Load alerts with read status when alerts change
  React.useEffect(() => {
    if (alerts.length > 0) {
      const savedReadStatus = loadReadStatus();
      setAlerts(prevAlerts =>
        prevAlerts.map(alert => ({
          ...alert,
          isRead: savedReadStatus[alert.id] || alert.isRead || false
        }))
      );
    }
  }, []); // Only run once on mount

  const value = {
    alerts,
    loading,
    fetchAndGenerateAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    clearAllAlerts,
    getUnreadCount,
    getCriticalUnreadCount,
    setAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
