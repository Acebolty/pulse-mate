import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, HeartIcon, ShieldCheckIcon, ArrowTrendingUpIcon, BeakerIcon, FireIcon } from "@heroicons/react/24/outline";
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

  // Helper method to fetch health data for patients
  const fetchHealthDataForPatients = async (patients) => {
    const patientHealthPromises = patients.map(async (patient) => {
      try {
        console.log(`Fetching health data for patient: ${patient.name} (${patient.userId})`);

        // Get latest health readings for each patient using the correct endpoint
        const [heartRateRes, bloodPressureRes, glucoseRes, temperatureRes] = await Promise.allSettled([
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'heartRate', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'bloodPressure', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'glucoseLevel', limit: 1 } }),
          api.get(`/health-data/patient/${patient.userId}`, { params: { dataType: 'bodyTemperature', limit: 1 } })
        ]);

        console.log(`Health data responses for ${patient.name}:`, {
          heartRate: heartRateRes.status,
          bloodPressure: bloodPressureRes.status,
          glucose: glucoseRes.status,
          temperature: temperatureRes.status
        });

        // Process health data
        const healthData = {
          heartRate: heartRateRes.status === 'fulfilled' && heartRateRes.value.data.data?.[0] ? heartRateRes.value.data.data[0] : null,
          bloodPressure: bloodPressureRes.status === 'fulfilled' && bloodPressureRes.value.data.data?.[0] ? bloodPressureRes.value.data.data[0] : null,
          glucose: glucoseRes.status === 'fulfilled' && glucoseRes.value.data.data?.[0] ? glucoseRes.value.data.data[0] : null,
          temperature: temperatureRes.status === 'fulfilled' && temperatureRes.value.data.data?.[0] ? temperatureRes.value.data.data[0] : null
        };

        console.log(`Processed health data for ${patient.name}:`, healthData);

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
          keyMetric,
          status,
          lastUpdate,
          icon,
          metricDetails,
          gradient,
          bgGradient: status === "critical" ? "from-red-50 to-pink-50" :
                     status === "warning" ? "from-amber-50 to-orange-50" : "from-emerald-50 to-green-50",
          bgGradientDark: status === "critical" ? "dark:from-red-900/50 dark:to-pink-900/50" :
                         status === "warning" ? "dark:from-amber-900/50 dark:to-orange-900/50" : "dark:from-emerald-900/50 dark:to-green-900/50"
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

        console.log('🏥 Fetching patients through appointments...');

        // Get patients through appointments (proper medical workflow)
        const appointmentsRes = await api.get('/appointments/doctor');
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

        console.log('� Appointments found:', appointments.length);
        console.log('� Sample appointments:', appointments.slice(0, 2));

        if (appointments.length === 0) {
          console.log('❌ No appointments found - no patients to display');
          setPatientsData([]);
          return;
        }

        // Extract unique patients from appointments
        appointments.forEach(appointment => {
          const userId = appointment.userId || appointment.originalData?.userId?._id;
          const patientData = appointment.originalData?.userId || appointment.patient;

          if (userId && patientData) {
            const patientName = patientData.firstName && patientData.lastName
              ? `${patientData.firstName} ${patientData.lastName}`
              : 'Unknown Patient';

            if (!uniquePatients.has(userId)) {
              uniquePatients.set(userId, {
                userId,
                name: patientName,
                patientData: patientData
              });
              console.log(`✅ Found patient from appointment: ${patientName}`);
            }
          }
        });

        console.log(`👥 Total unique patients found: ${uniquePatients.size}`);

        if (uniquePatients.size === 0) {
          console.log('❌ No patients found in appointments');
          setPatientsData([]);
          return;
        }

        // Fetch health data for each patient using the helper method
        console.log('🩺 Fetching health data for patients...');
        const patientsWithHealth = await fetchHealthDataForPatients(Array.from(uniquePatients.values()));
        console.log('✅ Patients with health data processed:', patientsWithHealth.length);
        setPatientsData(patientsWithHealth);

      } catch (err) {
        console.error('Error fetching patients data:', err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsData();
  }, []);

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
        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">No Patients Found</h3>
        <p className="text-gray-500 dark:text-slate-400">No patients are currently under your care or have recent appointments.</p>
      </div>
    );
  }

  return (
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
                <button className={`font-semibold px-3 py-1.5 rounded-lg transition-colors text-sm ${statusInfo.iconColor} hover:bg-gray-100 dark:hover:bg-slate-700/50`}>
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
  );
};

export default PatientMetricsGrid;
