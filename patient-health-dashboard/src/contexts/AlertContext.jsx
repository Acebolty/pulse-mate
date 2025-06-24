import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

// Smart Alert Generation System (same as in Alerts.jsx)
const generateSmartAlerts = (healthData) => {
  const alerts = [];

  // Process each health metric for alerts
  Object.entries(healthData).forEach(([dataType, readings]) => {
    if (readings.length === 0) return;

    // Generate alerts for ALL readings, not just the latest one
    readings.forEach(reading => {
      const alertId = `${dataType}-${reading.timestamp}`;

    switch (dataType) {
      case 'heartRate':
        const hr = reading.value;
        if (hr < 50) {
          alerts.push({
            id: alertId,
            type: "critical",
            title: "Severe Bradycardia Alert",
            message: `Critical: Heart rate ${hr} bpm detected. This is dangerously low and requires immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Call Emergency", "Contact Doctor", "View Trends"],
            emergencyLevel: "immediate"
          });
        } else if (hr < 60) {
          alerts.push({
            id: alertId,
            type: "warning",
            title: "Bradycardia Warning",
            message: `Heart rate ${hr} bpm is below normal range. Monitor closely and consult healthcare provider.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor", "View Trends", "Monitor"],
            emergencyLevel: "moderate"
          });
        } else if (hr > 120) {
          alerts.push({
            id: alertId,
            type: "critical",
            title: "Severe Tachycardia Alert",
            message: `Critical: Heart rate ${hr} bpm is dangerously high. Seek immediate medical evaluation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Call Emergency", "Contact Doctor", "View Trends"],
            emergencyLevel: "immediate"
          });
        } else if (hr > 100) {
          alerts.push({
            id: alertId,
            type: "warning",
            title: "Tachycardia Warning",
            message: `Heart rate ${hr} bpm is elevated. Monitor for symptoms and consider medical consultation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Heart Rate Monitor",
            dataType: "heartRate",
            value: hr,
            actions: ["Contact Doctor", "View Trends", "Rest"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'bloodPressure':
        const systolic = typeof reading.value === 'object' ? reading.value.systolic : reading.value;
        const diastolic = typeof reading.value === 'object' ? reading.value.diastolic : reading.value - 40;
        
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
            actions: ["Call Emergency", "Contact Doctor", "View Trends"],
            emergencyLevel: "immediate"
          });
        } else if (systolic >= 140 || diastolic >= 90) {
          alerts.push({
            id: alertId,
            type: "warning",
            title: "High Blood Pressure Alert",
            message: `Blood pressure ${systolic}/${diastolic} mmHg is elevated. Contact your healthcare provider for evaluation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Blood Pressure Monitor",
            dataType: "bloodPressure",
            value: `${systolic}/${diastolic}`,
            actions: ["Contact Doctor", "View Trends", "Lifestyle Changes"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'glucoseLevel':
        const glucose = reading.value;
        if (glucose < 70) {
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
            actions: ["Treat Immediately", "Contact Doctor", "Emergency Protocol"],
            emergencyLevel: "immediate"
          });
        } else if (glucose > 250) {
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
            actions: ["Call Emergency", "Contact Doctor", "Check Ketones"],
            emergencyLevel: "immediate"
          });
        } else if (glucose > 180) {
          alerts.push({
            id: alertId,
            type: "warning",
            title: "High Blood Glucose Alert",
            message: `Blood glucose ${glucose} mg/dL is elevated. Take steps to lower blood sugar and monitor closely.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Glucose Monitor",
            dataType: "glucoseLevel",
            value: glucose,
            actions: ["Contact Doctor", "Medication Check", "Lifestyle Adjustment"],
            emergencyLevel: "moderate"
          });
        }
        break;

      case 'bodyTemperature':
        const temp = reading.value;
        if (temp >= 103.0) {
          alerts.push({
            id: alertId,
            type: "critical",
            title: "High Fever Alert",
            message: `CRITICAL: Body temperature ${temp.toFixed(1)}°F indicates high fever. Seek immediate medical attention.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Call Emergency", "Contact Doctor", "Fever Protocol"],
            emergencyLevel: "immediate"
          });
        } else if (temp >= 100.4) {
          alerts.push({
            id: alertId,
            type: "warning",
            title: "Fever Detected",
            message: `Body temperature ${temp.toFixed(1)}°F indicates fever. Monitor symptoms and consider medical consultation.`,
            timestamp: reading.timestamp,
            isRead: false,
            source: "Temperature Monitor",
            dataType: "bodyTemperature",
            value: temp.toFixed(1),
            actions: ["Contact Doctor", "Monitor Symptoms", "Fever Care"],
            emergencyLevel: "moderate"
          });
        }
        break;
    }
    }); // Close the readings.forEach loop
  }); // Close the Object.entries forEach loop

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Generate smart alerts from health data
      const smartAlerts = generateSmartAlerts(newHealthData);

      // Load saved read status
      const savedReadStatus = loadReadStatus();

      // Apply saved read status to alerts
      const alertsWithReadStatus = smartAlerts.map(alert => ({
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

  // Load alerts with read status on mount
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
