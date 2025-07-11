import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, HeartIcon, ShieldCheckIcon, ArrowTrendingUpIcon, BeakerIcon, FireIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';

// Helper functions for health status calculation
const getHeartRateStatus = (heartRate) => {
  if (heartRate < 50) return "critical";
  if (heartRate < 60) return "warning";
  if (heartRate >= 60 && heartRate <= 100) return "stable";
  if (heartRate > 100 && heartRate <= 120) return "warning";
  return "critical";
};

const getBloodPressureStatus = (systolic, diastolic) => {
  console.log(`Evaluating BP: ${systolic}/${diastolic}`);

  if (systolic >= 180 || diastolic >= 120) {
    console.log('BP Status: CRITICAL (Stage 2 Hypertension)');
    return "critical";
  }
  if (systolic >= 140 || diastolic >= 90) {
    console.log('BP Status: WARNING (Stage 1 Hypertension)');
    return "warning";
  }
  if (systolic >= 120 && systolic < 140) {
    console.log('BP Status: WARNING (Elevated)');
    return "warning";
  }

  console.log('BP Status: STABLE (Normal)');
  return "stable";
};

const getGlucoseStatus = (glucose) => {
  if (glucose < 70 || glucose > 200) return "critical";
  if (glucose < 80 || glucose > 140) return "warning";
  return "stable";
};

const getTemperatureStatus = (temp) => {
  if (temp < 95 || temp > 103) return "critical";
  if (temp < 97 || temp > 99.5) return "warning";
  return "stable";
};

// Format timestamp to relative time
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
  return `${Math.floor(diffInMinutes / 1440)} day ago`;
};

const getStatusStyles = (status) => {
  switch (status) {
    case "critical":
      return {
        badge: "text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-700/30 dark:border-red-600/50",
        iconColor: "text-red-500 dark:text-red-400",
        icon: ShieldCheckIcon // Example: different icon for critical status
      };
    case "warning":
      return {
        badge: "text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-700/30 dark:border-amber-600/50",
        iconColor: "text-amber-500 dark:text-amber-400",
        icon: HeartIcon // Example
      };
    case "stable":
      return {
        badge: "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-700/30 dark:border-emerald-600/50",
        iconColor: "text-emerald-500 dark:text-emerald-400",
        icon: ArrowTrendingUpIcon // Example
      };
    default:
      return {
        badge: "text-gray-700 bg-gray-100 border-gray-300 dark:text-gray-300 dark:bg-gray-700/30 dark:border-gray-600/50",
        iconColor: "text-gray-500 dark:text-gray-400",
        icon: UserGroupIcon
      };
  }
};

const PatientMetricsGrid = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for patient details
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHealthData, setPatientHealthData] = useState(null);
  const [healthDataLoading, setHealthDataLoading] = useState(false);

  // Function to fetch detailed health data for a specific patient
  const fetchPatientDetailedHealthData = async (patient) => {
    try {
      setHealthDataLoading(true);

      // Get last 7 days of health data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [heartRateRes, bloodPressureRes, temperatureRes, glucoseRes] = await Promise.allSettled([
        api.get(`/health-data/patient/${patient.id}`, {
          params: {
            dataType: 'heartRate',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 50
          }
        }),
        api.get(`/health-data/patient/${patient.id}`, {
          params: {
            dataType: 'bloodPressure',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 50
          }
        }),
        api.get(`/health-data/patient/${patient.id}`, {
          params: {
            dataType: 'bodyTemperature',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 50
          }
        }),
        api.get(`/health-data/patient/${patient.id}`, {
          params: {
            dataType: 'glucoseLevel',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 50
          }
        })
      ]);

      const healthData = {
        heartRate: heartRateRes.status === 'fulfilled' ? heartRateRes.value.data?.data || [] : [],
        bloodPressure: bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data?.data || [] : [],
        bodyTemperature: temperatureRes.status === 'fulfilled' ? temperatureRes.value.data?.data || [] : [],
        glucoseLevel: glucoseRes.status === 'fulfilled' ? glucoseRes.value.data?.data || [] : []
      };

      setPatientHealthData(healthData);
    } catch (error) {
      console.error('Error fetching patient health data:', error);
      setPatientHealthData(null);
    } finally {
      setHealthDataLoading(false);
    }
  };

  // Function to handle View Details click
  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
    await fetchPatientDetailedHealthData(patient);
  };

  // Health score calculation function (similar to patient dashboard)
  const calculateHealthScore = (healthData, healthTargets) => {
    let score = 100;
    let factors = [];

    // Check heart rate against targets
    if (healthData.heartRate && healthData.heartRate.value) {
      const currentHR = healthData.heartRate.value;
      const hrMin = healthTargets.heartRate.min;
      const hrMax = healthTargets.heartRate.max;

      if (currentHR < hrMin - 10 || currentHR > hrMax + 20) {
        score -= 20;
        factors.push(`Heart rate (${currentHR} bpm) outside optimal range (${hrMin}-${hrMax} bpm)`);
      } else if (currentHR < hrMin || currentHR > hrMax) {
        score -= 10;
        factors.push(`Heart rate (${currentHR} bpm) outside target range (${hrMin}-${hrMax} bpm)`);
      }
    }

    // Check blood pressure against targets
    if (healthData.bloodPressure && healthData.bloodPressure.value) {
      const currentSystolic = healthData.bloodPressure.value.systolic;
      const currentDiastolic = healthData.bloodPressure.value.diastolic;
      const systolicMin = healthTargets.bloodPressure.systolic.min;
      const systolicMax = healthTargets.bloodPressure.systolic.max;
      const diastolicMin = healthTargets.bloodPressure.diastolic.min;
      const diastolicMax = healthTargets.bloodPressure.diastolic.max;

      if (currentSystolic < systolicMin - 10 || currentSystolic > systolicMax + 20 ||
          currentDiastolic < diastolicMin - 10 || currentDiastolic > diastolicMax + 20) {
        score -= 20;
        factors.push(`Blood pressure (${currentSystolic}/${currentDiastolic} mmHg) outside optimal range`);
      } else if (currentSystolic < systolicMin || currentSystolic > systolicMax ||
                 currentDiastolic < diastolicMin || currentDiastolic > diastolicMax) {
        score -= 10;
        factors.push(`Blood pressure (${currentSystolic}/${currentDiastolic} mmHg) outside target range`);
      }
    }

    // Check glucose level against targets (matching patient dashboard logic)
    if (healthData.glucose && healthData.glucose.value) {
      const currentGlucose = healthData.glucose.value;
      const glucoseMin = healthTargets.glucoseLevel.min;
      const glucoseMax = healthTargets.glucoseLevel.max;

      if (currentGlucose > glucoseMax + 40 || currentGlucose < glucoseMin - 20) {
        score -= 20;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) critically outside range`);
      } else if (currentGlucose > glucoseMax || currentGlucose < glucoseMin) {
        score -= 10;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) outside target range (${glucoseMin}-${glucoseMax} mg/dL)`);
      }
    }

    // Check body temperature against targets (matching patient dashboard logic)
    if (healthData.temperature && healthData.temperature.value) {
      const currentTemp = healthData.temperature.value;
      const tempMin = healthTargets.bodyTemperature.min;
      const tempMax = healthTargets.bodyTemperature.max;

      if (currentTemp > tempMax + 1 || currentTemp < tempMin - 1) {
        score -= 15;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside safe range`);
      } else if (currentTemp > tempMax || currentTemp < tempMin) {
        score -= 5;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside target range (${tempMin}-${tempMax}°F)`);
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const getScoreLabel = (score) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Attention';
    };

    return { score: Math.round(score), label: getScoreLabel(score), factors };
  };

  // Helper method to fetch health data for patients and calculate health score
  const fetchHealthDataForPatients = async (patients) => {
    const patientHealthPromises = patients.map(async (patient) => {
      try {
        console.log(`Fetching health data for patient: ${patient.name} (${patient.userId})`);

        // Get latest health readings and health targets for each patient
        const [heartRateRes, bloodPressureRes, glucoseRes, temperatureRes, profileRes] = await Promise.allSettled([
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'heartRate', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'bloodPressure', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'glucoseLevel', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'bodyTemperature', limit: 1 } }),
          api.get(`/users/${patient.userId}`)
        ]);

        console.log(`Health data responses for ${patient.name}:`, {
          heartRate: heartRateRes.status,
          bloodPressure: bloodPressureRes.status,
          glucose: glucoseRes.status,
          temperature: temperatureRes.status,
          profile: profileRes.status
        });

        // Process health data
        const healthData = {
          heartRate: heartRateRes.status === 'fulfilled' && heartRateRes.value.data.data?.[0] ? heartRateRes.value.data.data[0] : null,
          bloodPressure: bloodPressureRes.status === 'fulfilled' && bloodPressureRes.value.data.data?.[0] ? bloodPressureRes.value.data.data[0] : null,
          glucose: glucoseRes.status === 'fulfilled' && glucoseRes.value.data.data?.[0] ? glucoseRes.value.data.data[0] : null,
          temperature: temperatureRes.status === 'fulfilled' && temperatureRes.value.data.data?.[0] ? temperatureRes.value.data.data[0] : null
        };

        // Get patient profile and health targets
        const patientProfile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
        const healthTargets = patientProfile?.healthTargets || {
          heartRate: { min: 60, max: 100 },
          bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },
          glucoseLevel: { min: 70, max: 140 },
          bodyTemperature: { min: 97.0, max: 99.5 }
        };

        console.log(`Processed health data for ${patient.name}:`, healthData);

        // Calculate health score
        const healthScore = calculateHealthScore(healthData, healthTargets);
        console.log(`🩺 Doctor Dashboard - Health Score for ${patient.name}:`, {
          score: healthScore.score,
          factors: healthScore.factors,
          healthData: healthData,
          healthTargets: healthTargets
        });

        // Debug blood pressure specifically
        if (healthData.bloodPressure) {
          console.log('Blood pressure raw data:', healthData.bloodPressure);
          console.log('Blood pressure value:', healthData.bloodPressure.value);
          console.log('Blood pressure value type:', typeof healthData.bloodPressure.value);
        }

        // Determine primary metric and status
        let keyMetric = "No recent data";
        let status = "stable";
        let metricDetails = "No recent health readings available";
        let lastUpdate = "No data";
        let icon = UserGroupIcon;
        let gradient = "from-gray-400 to-gray-500";

        // Prioritize critical metrics
        if (healthData.heartRate) {
          const hr = healthData.heartRate.value;
          status = getHeartRateStatus(hr);
          keyMetric = `HR: ${hr} bpm`;
          metricDetails = status === "critical" ? "Critical heart rate alert" :
                       status === "warning" ? "Heart rate needs monitoring" : "Heart rate normal";
          lastUpdate = formatTimestamp(healthData.heartRate.timestamp);
          icon = HeartIcon;
          gradient = status === "critical" ? "from-red-400 to-pink-500" :
                    status === "warning" ? "from-amber-400 to-orange-500" : "from-emerald-400 to-green-500";
        } else if (healthData.bloodPressure) {
          const bp = healthData.bloodPressure.value;
          console.log(`Blood pressure data for ${patient.name}:`, bp);
          console.log(`Systolic: ${bp.systolic}, Diastolic: ${bp.diastolic}`);

          status = getBloodPressureStatus(bp.systolic, bp.diastolic);
          console.log(`Blood pressure status calculated: ${status}`);

          keyMetric = `BP: ${bp.systolic}/${bp.diastolic} mmHg`;
          metricDetails = status === "critical" ? "Critical blood pressure alert" :
                       status === "warning" ? "Blood pressure elevated" : "Blood pressure normal";
          lastUpdate = formatTimestamp(healthData.bloodPressure.timestamp);
          icon = ShieldCheckIcon;
          gradient = status === "critical" ? "from-red-400 to-pink-500" :
                    status === "warning" ? "from-amber-400 to-orange-500" : "from-sky-400 to-blue-500";
        } else if (healthData.glucose) {
          const glucose = healthData.glucose.value;
          status = getGlucoseStatus(glucose);
          keyMetric = `Glucose: ${glucose} mg/dL`;
          metricDetails = status === "critical" ? "Critical glucose level" :
                       status === "warning" ? "Glucose level elevated" : "Glucose level normal";
          lastUpdate = formatTimestamp(healthData.glucose.timestamp);
          icon = BeakerIcon;
          gradient = status === "critical" ? "from-red-400 to-pink-500" :
                    status === "warning" ? "from-amber-400 to-orange-500" : "from-blue-400 to-cyan-500";
        } else if (healthData.temperature) {
          const temp = healthData.temperature.value;
          status = getTemperatureStatus(temp);
          keyMetric = `Temp: ${temp}°F`;
          metricDetails = status === "critical" ? "Critical temperature alert" :
                       status === "warning" ? "Temperature elevated" : "Temperature normal";
          lastUpdate = formatTimestamp(healthData.temperature.timestamp);
          icon = FireIcon;
          gradient = status === "critical" ? "from-red-400 to-pink-500" :
                    status === "warning" ? "from-amber-400 to-orange-500" : "from-orange-400 to-red-500";
        }

        return {
          id: patient.userId,
          name: patient.name,
          keyMetric: `Health Score: ${healthScore.score}`,
          status: healthScore.score >= 80 ? 'stable' : healthScore.score >= 60 ? 'warning' : 'critical',
          lastUpdate,
          icon: ShieldCheckIcon,
          metricDetails: healthScore.label,
          healthScore: healthScore,
          gradient: healthScore.score >= 80 ? "from-green-400 to-emerald-500" :
                   healthScore.score >= 60 ? "from-amber-400 to-orange-500" : "from-red-400 to-pink-500",
          bgGradient: healthScore.score >= 80 ? "from-emerald-50 to-green-50" :
                     healthScore.score >= 60 ? "from-amber-50 to-orange-50" : "from-red-50 to-pink-50",
          bgGradientDark: healthScore.score >= 80 ? "dark:from-emerald-900/50 dark:to-green-900/50" :
                         healthScore.score >= 60 ? "dark:from-amber-900/50 dark:to-orange-900/50" : "dark:from-red-900/50 dark:to-pink-900/50"
        };

      } catch (err) {
        console.error(`Error fetching health data for patient ${patient.name}:`, err);
        return {
          id: patient.userId,
          name: patient.name,
          keyMetric: "Data unavailable",
          status: "stable",
          lastUpdate: "Error",
          icon: UserGroupIcon,
          metricDetails: "Unable to load health data",
          gradient: "from-gray-400 to-gray-500",
          bgGradient: "from-gray-50 to-gray-50",
          bgGradientDark: "dark:from-gray-900/50 dark:to-gray-900/50"
        };
      }
    });

    return await Promise.all(patientHealthPromises);
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  // Fetch real patient data through appointments (proper medical workflow)
  useEffect(() => {
    const fetchPatientsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get patients through appointments (proper medical workflow) - request more appointments
        const appointmentsRes = await api.get('/appointments/doctor?limit=100');

        // Handle different response structures
        const appointments = appointmentsRes.data?.data || appointmentsRes.data || [];

        if (!Array.isArray(appointments)) {
          throw new Error('Invalid appointments data structure');
        }

        if (appointments.length === 0) {
          setPatientsData([]);
          return;
        }

        // Debug: Log all appointments and their statuses
        console.log('All appointments received:', appointments.length);
        appointments.forEach((apt, index) => {
          console.log(`Appointment ${index + 1}:`, {
            id: apt._id,
            status: apt.status,
            patient: apt.userId?.firstName || apt.userId || 'Unknown',
            date: apt.dateTime
          });
        });

        // Filter appointments to only include "Open Chat" status
        const openChatAppointments = appointments.filter(appointment => {
          const status = appointment.status;
          const isOpenChat = status === 'Open Chat' || status === 'open_chat' || status === 'open chat';
          console.log(`Checking appointment ${appointment._id}: status="${status}", isOpenChat=${isOpenChat}`);
          return isOpenChat;
        });

        console.log('Filtered Open Chat appointments:', openChatAppointments.length);
        console.log('Open Chat appointments:', openChatAppointments);

        // Extract unique patients from Open Chat appointments only
        const uniquePatients = new Map();

        openChatAppointments.forEach(appointment => {
          // Handle different data structures
          let userId, patientData, patientName;

          if (appointment.userId && typeof appointment.userId === 'object') {
            // Populated userId object
            userId = appointment.userId._id;
            patientData = appointment.userId;
            patientName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'Unknown Patient';
          } else if (appointment.userId) {
            // Direct userId string
            userId = appointment.userId;
            patientData = { _id: userId };
            patientName = 'Unknown Patient';
          } else if (appointment.originalData?.userId) {
            // Nested originalData structure
            userId = appointment.originalData.userId._id || appointment.originalData.userId;
            patientData = appointment.originalData.userId;
            patientName = patientData.firstName && patientData.lastName
              ? `${patientData.firstName} ${patientData.lastName}`
              : 'Unknown Patient';
          }

          if (userId && !uniquePatients.has(userId)) {
            uniquePatients.set(userId, {
              userId,
              name: patientName,
              patientData: patientData,
              appointmentStatus: appointment.status
            });
          }
        });

        if (uniquePatients.size === 0) {
          console.log('No patients with Open Chat status found');
          setPatientsData([]);
          return;
        }

        // Fetch health data for each patient using the helper method
        const patientsWithHealth = await fetchHealthDataForPatients(Array.from(uniquePatients.values()));
        setPatientsData(patientsWithHealth);

      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in to view patient data');
        } else {
          setError('Failed to load patient data');
        }
        setPatientsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsData();
  }, []);

  // Helper function to prepare chart data
  const prepareChartData = (healthData) => {
    if (!healthData) return [];

    // Create a map of dates to health readings
    const dateMap = new Map();

    // Process each health data type
    ['heartRate', 'bloodPressure', 'bodyTemperature', 'glucoseLevel'].forEach(dataType => {
      if (healthData[dataType]) {
        healthData[dataType].forEach(reading => {
          const date = new Date(reading.timestamp).toLocaleDateString();
          if (!dateMap.has(date)) {
            dateMap.set(date, { date });
          }

          const entry = dateMap.get(date);
          if (dataType === 'heartRate') {
            entry.heartRate = reading.value;
          } else if (dataType === 'bloodPressure') {
            entry.systolic = reading.value.systolic;
            entry.diastolic = reading.value.diastolic;
          } else if (dataType === 'bodyTemperature') {
            entry.temperature = reading.value;
          } else if (dataType === 'glucoseLevel') {
            entry.glucose = reading.value;
          }
        });
      }
    });

    // Convert to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/30 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <div className="mb-3">
              <div className="w-24 h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="w-full h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-800 dark:text-red-200 font-medium">⚠️ {error}</p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-2">Please refresh the page or contact support if the issue persists.</p>
      </div>
    );
  }

  // No patients state
  if (patientsData.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-8 text-center">
        <UserGroupIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">No Active Chat Sessions</h3>
        <p className="text-gray-500 dark:text-slate-400">No patients with active chat sessions found. Patients will appear here when their appointments have "Open Chat" status.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {patientsData.map((patient, index) => {
        const statusInfo = getStatusStyles(patient.status);
        const PatientIcon = statusInfo.icon || patient.icon; // Use status-specific icon or default

        return (
          <motion.div
            key={patient.id}
            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? patient.bgGradientDark : patient.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={`w-14 h-14 bg-gradient-to-br ${patient.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.3 }}
                >
                  <PatientIcon className={`w-7 h-7 ${statusInfo.iconColor || 'text-white'}`} />
                </motion.div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.badge}`}>
                  {patient.status}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">{patient.name}</p>
                <p className={`text-sm font-medium mt-1 ${statusInfo.iconColor}`}>{patient.keyMetric}</p>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-4 h-8 overflow-hidden"> {/* Fixed height for description */}
                {patient.metricDetails}
              </p>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => handleViewDetails(patient)}
                  className={`font-semibold px-3 py-1.5 rounded-lg transition-colors text-sm ${statusInfo.iconColor} hover:bg-gray-100 dark:hover:bg-slate-700/50`}
                >
                  View Details
                </button>
                <span className="text-gray-500 dark:text-slate-400 font-medium">{patient.lastUpdate}</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/30 dark:group-hover:border-slate-600/50 transition-colors duration-300 pointer-events-none"></div>
          </motion.div>
        );
        })}
      </div>

      {/* Patient Details Modal */}
    {showPatientModal && selectedPatient && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {selectedPatient.name} - Health Details
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                Last 7 days health data and trends
              </p>
            </div>
            <button
              onClick={() => setShowPatientModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {healthDataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-slate-400">Loading health data...</span>
              </div>
            ) : patientHealthData ? (
              <div className="space-y-8">
                {/* Recent Health Readings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    Recent Health Readings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Heart Rate */}
                    {patientHealthData.heartRate.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <HeartIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <span className="font-medium text-gray-900 dark:text-slate-100">Heart Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {patientHealthData.heartRate[0].value} bpm
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {formatTimestamp(patientHealthData.heartRate[0].timestamp)}
                        </p>
                      </div>
                    )}

                    {/* Blood Pressure */}
                    {patientHealthData.bloodPressure.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-slate-100">Blood Pressure</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {patientHealthData.bloodPressure[0].value.systolic}/{patientHealthData.bloodPressure[0].value.diastolic}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {formatTimestamp(patientHealthData.bloodPressure[0].timestamp)}
                        </p>
                      </div>
                    )}

                    {/* Temperature */}
                    {patientHealthData.bodyTemperature.length > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <FireIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span className="font-medium text-gray-900 dark:text-slate-100">Temperature</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {patientHealthData.bodyTemperature[0].value}°F
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {formatTimestamp(patientHealthData.bodyTemperature[0].timestamp)}
                        </p>
                      </div>
                    )}

                    {/* Glucose */}
                    {patientHealthData.glucoseLevel.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <BeakerIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-gray-900 dark:text-slate-100">Glucose</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {patientHealthData.glucoseLevel[0].value} mg/dL
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {formatTimestamp(patientHealthData.glucoseLevel[0].timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7-Day Health Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    7-Day Health Trends
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={prepareChartData(patientHealthData)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                        <XAxis
                          dataKey="date"
                          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                          fontSize={12}
                        />
                        <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            color: isDarkMode ? '#f1f5f9' : '#1f2937'
                          }}
                        />
                        <Legend />
                        {patientHealthData.heartRate.length > 0 && (
                          <Line
                            type="monotone"
                            dataKey="heartRate"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Heart Rate (bpm)"
                          />
                        )}
                        {patientHealthData.bloodPressure.length > 0 && (
                          <Line
                            type="monotone"
                            dataKey="systolic"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Systolic BP"
                          />
                        )}
                        {patientHealthData.bodyTemperature.length > 0 && (
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="Temperature (°F)"
                          />
                        )}
                        {patientHealthData.glucoseLevel.length > 0 && (
                          <Line
                            type="monotone"
                            dataKey="glucose"
                            stroke="#22c55e"
                            strokeWidth={2}
                            name="Glucose (mg/dL)"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400">No health data available for this patient.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PatientMetricsGrid;
