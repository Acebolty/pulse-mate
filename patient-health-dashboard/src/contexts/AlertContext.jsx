import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

import { shouldShowNotification } from '../utils/notificationUtils';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

// Enhanced Smart Alert Generation System with User-Defined Thresholds
const generateSmartAlertsWithSettings = (healthData, userSettings) => {
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

    // Generate alerts for ALL readings, not just the latest one
    readings.forEach(reading => {
      const alertId = `${dataType}-${reading.timestamp}`;

    switch (dataType) {
      case 'heartRate':
        const hr = reading.value;
        const hrThresholds = thresholds.heartRate;

        // Critical low (severe bradycardia - medically dangerous)
        if (hr < 50) {
          alerts.push({
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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
            id: alertId,
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

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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

  // Load read status from localStorage
  const loadReadStatus = () => {
    try {
      const savedReadStatus = localStorage.getItem('alertReadStatus');
      return savedReadStatus ? JSON.parse(savedReadStatus) : {};
    } catch (error) {
      console.error('Error loading alert read status:', error);
      return {};
    }
  };

  // Save read status to localStorage
  const saveReadStatus = (readStatus) => {
    try {
      localStorage.setItem('alertReadStatus', JSON.stringify(readStatus));
    } catch (error) {
      console.error('Error saving alert read status:', error);
    }
  };

  // Fetch health data and generate alerts
  const fetchAndGenerateAlerts = async () => {
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
      const smartAlerts = generateSmartAlertsWithSettings(newHealthData, settings);

      // Filter alerts based on notification preferences
      const filteredAlerts = filterAlertsByNotificationPreferences(smartAlerts, settings);

      // Load saved read status
      const savedReadStatus = loadReadStatus();

      // Apply saved read status to filtered alerts
      const alertsWithReadStatus = filteredAlerts.map(alert => ({
        ...alert,
        isRead: savedReadStatus[alert.id] || false
      }));

      // Merge with existing alerts, keeping read status
      setAlerts(prevAlerts => {
        const existingAlertIds = new Set(prevAlerts.map(alert => alert.id));
        const newAlerts = alertsWithReadStatus.filter(alert => !existingAlertIds.has(alert.id));

        // Keep existing alerts and add new ones
        const mergedAlerts = [...prevAlerts, ...newAlerts];

        // Sort by timestamp (newest first)
        return mergedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

    } catch (err) {
      console.error("Failed to fetch health data for alerts:", err);
    } finally {
      setLoading(false);
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

  // Auto-fetch and generate alerts on mount
  React.useEffect(() => {
    console.log('AlertContext: Auto-fetching alerts on mount...');
    fetchAndGenerateAlerts();
  }, []); // Only run once on mount

  // Listen for health data updates to refresh alerts
  React.useEffect(() => {
    const handleHealthDataUpdate = (event) => {
      console.log('AlertContext: Health data updated, refreshing alerts...', event.detail);
      setTimeout(() => {
        fetchAndGenerateAlerts();
      }, 500); // Small delay to ensure data is saved
    };

    // Listen for various health data events
    console.log('AlertContext: Setting up event listeners for health data updates...');
    window.addEventListener('healthDataAdded', handleHealthDataUpdate);
    window.addEventListener('healthDataGenerated', handleHealthDataUpdate);
    window.addEventListener('alertsGenerated', handleHealthDataUpdate);

    return () => {
      console.log('AlertContext: Removing event listeners...');
      window.removeEventListener('healthDataAdded', handleHealthDataUpdate);
      window.removeEventListener('healthDataGenerated', handleHealthDataUpdate);
      window.removeEventListener('alertsGenerated', handleHealthDataUpdate);
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
