import { BellIcon, ChatBubbleLeftEllipsisIcon, DocumentArrowDownIcon, UserIcon, HeartIcon, BeakerIcon, FireIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const RecentPatientActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  // Helper function to get activity details based on health data
  const getActivityDetails = (healthData, patientName) => {
    const dataType = healthData.dataType;
    const value = healthData.value;
    const timestamp = healthData.timestamp;

    let activity = {
      id: healthData._id,
      patientName: patientName,
      time: formatTimestamp(timestamp),
      type: "new_data"
    };

    switch (dataType) {
      case 'heartRate':
        const hrStatus = value < 50 || value > 120 ? 'critical' : value < 60 || value > 100 ? 'warning' : 'normal';
        activity = {
          ...activity,
          summary: `Updated heart rate data`,
          details: `HR: ${value} bpm ${hrStatus === 'critical' ? '(Critical)' : hrStatus === 'warning' ? '(Elevated)' : '(Normal)'}`,
          icon: HeartIcon,
          iconColor: hrStatus === 'critical' ? "text-red-500 dark:text-red-400" :
                    hrStatus === 'warning' ? "text-amber-500 dark:text-amber-400" : "text-green-500 dark:text-green-400",
          bgColor: hrStatus === 'critical' ? "bg-red-50 dark:bg-red-700/20" :
                  hrStatus === 'warning' ? "bg-amber-50 dark:bg-amber-700/20" : "bg-green-50 dark:bg-green-700/20",
          type: hrStatus === 'critical' ? 'critical_alert' : 'new_data'
        };
        break;

      case 'bloodPressure':
        const systolic = value.systolic;
        const diastolic = value.diastolic;
        const bpStatus = (systolic >= 180 || diastolic >= 120) ? 'critical' :
                        (systolic >= 140 || diastolic >= 90) ? 'warning' : 'normal';
        activity = {
          ...activity,
          summary: `Updated blood pressure data`,
          details: `BP: ${systolic}/${diastolic} mmHg ${bpStatus === 'critical' ? '(Critical)' : bpStatus === 'warning' ? '(High)' : '(Normal)'}`,
          icon: DocumentArrowDownIcon,
          iconColor: bpStatus === 'critical' ? "text-red-500 dark:text-red-400" :
                    bpStatus === 'warning' ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400",
          bgColor: bpStatus === 'critical' ? "bg-red-50 dark:bg-red-700/20" :
                  bpStatus === 'warning' ? "bg-amber-50 dark:bg-amber-700/20" : "bg-blue-50 dark:bg-blue-700/20",
          type: bpStatus === 'critical' ? 'critical_alert' : 'new_data'
        };
        break;

      case 'glucoseLevel':
        const glucoseStatus = (value < 70 || value > 200) ? 'critical' :
                             (value < 80 || value > 140) ? 'warning' : 'normal';
        activity = {
          ...activity,
          summary: `Updated glucose level data`,
          details: `Glucose: ${value} mg/dL ${glucoseStatus === 'critical' ? '(Critical)' : glucoseStatus === 'warning' ? '(Elevated)' : '(Normal)'}`,
          icon: BeakerIcon,
          iconColor: glucoseStatus === 'critical' ? "text-red-500 dark:text-red-400" :
                    glucoseStatus === 'warning' ? "text-amber-500 dark:text-amber-400" : "text-cyan-500 dark:text-cyan-400",
          bgColor: glucoseStatus === 'critical' ? "bg-red-50 dark:bg-red-700/20" :
                  glucoseStatus === 'warning' ? "bg-amber-50 dark:bg-amber-700/20" : "bg-cyan-50 dark:bg-cyan-700/20",
          type: glucoseStatus === 'critical' ? 'critical_alert' : 'new_data'
        };
        break;

      case 'bodyTemperature':
        const tempStatus = (value < 95 || value > 103) ? 'critical' :
                          (value < 97 || value > 99.5) ? 'warning' : 'normal';
        activity = {
          ...activity,
          summary: `Updated temperature data`,
          details: `Temp: ${value}°F ${tempStatus === 'critical' ? '(Critical)' : tempStatus === 'warning' ? '(Fever)' : '(Normal)'}`,
          icon: FireIcon,
          iconColor: tempStatus === 'critical' ? "text-red-500 dark:text-red-400" :
                    tempStatus === 'warning' ? "text-orange-500 dark:text-orange-400" : "text-green-500 dark:text-green-400",
          bgColor: tempStatus === 'critical' ? "bg-red-50 dark:bg-red-700/20" :
                  tempStatus === 'warning' ? "bg-orange-50 dark:bg-orange-700/20" : "bg-green-50 dark:bg-green-700/20",
          type: tempStatus === 'critical' ? 'critical_alert' : 'new_data'
        };
        break;

      default:
        activity = {
          ...activity,
          summary: `Updated health data`,
          details: `New ${dataType} reading recorded`,
          icon: DocumentArrowDownIcon,
          iconColor: "text-blue-500 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-700/20"
        };
    }

    return activity;
  };

  // Fetch real patient activity data
  useEffect(() => {
    const fetchPatientActivity = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching patient activity...');

        // Get doctor's appointments to find patients
        const appointmentsRes = await api.get('/appointments/doctor');
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

        if (appointments.length === 0) {
          console.log('❌ No appointments found - no patient activity to show');
          setActivities([]);
          return;
        }

        // Get unique patient IDs and their names
        const patientMap = new Map();
        appointments.forEach(apt => {
          const userId = apt.userId || apt.originalData?.userId?._id;
          const patientData = apt.originalData?.userId || apt.patient;

          if (userId && patientData) {
            const patientName = patientData.firstName && patientData.lastName
              ? `${patientData.firstName} ${patientData.lastName}`
              : 'Unknown Patient';
            patientMap.set(userId, patientName);
          }
        });

        console.log('👥 Found patients:', Array.from(patientMap.values()));

        // Fetch recent health data for all patients
        const allActivities = [];

        for (const [userId, patientName] of patientMap) {
          try {
            // Get recent health data for this patient (last 24 hours)
            const healthDataRes = await api.get(`/health-data/patient/${userId}`, {
              params: { limit: 10 } // Get last 10 entries per patient
            });

            const healthData = Array.isArray(healthDataRes.data?.data) ? healthDataRes.data.data : [];
            console.log(`📈 Health data for ${patientName}:`, healthData.length, 'entries');

            // Convert health data to activities
            healthData.forEach(data => {
              const activity = getActivityDetails(data, patientName);
              allActivities.push(activity);
            });

          } catch (healthError) {
            console.log(`⚠️ Could not fetch health data for ${patientName}:`, healthError.message);
          }
        }

        // Sort activities by timestamp (most recent first)
        allActivities.sort((a, b) => {
          // Extract timestamp from the activity (we need to get it from the original data)
          // For now, sort by the time string (this is approximate)
          return a.time.localeCompare(b.time);
        });

        // Take only the most recent 10 activities
        const recentActivities = allActivities.slice(0, 10);

        console.log('✅ Recent patient activities:', recentActivities.length);
        setActivities(recentActivities);

      } catch (err) {
        console.error('❌ Error fetching patient activity:', err);
        setError('Failed to load patient activity');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientActivity();
  }, []);

  return (
    <motion.div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }} // Adjusted delay
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Patient Activity Feed</h3>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-700/30 px-3 py-1 rounded-lg transition-colors">
          Filter Activity
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">Please refresh the page or contact support.</p>
          </div>
        ) : activities.length === 0 ? (
          // No activity state
          <div className="text-center py-8">
            <DocumentArrowDownIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">No recent patient activity</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Patient health updates will appear here</p>
          </div>
        ) : (
          // Activities list
          activities.map((activity, index) => {
          const ActivityIcon = activity.icon;
          return (
            <motion.div 
              key={activity.id} 
              className={`p-4 rounded-xl border border-gray-100 dark:border-slate-700/80 hover:shadow-md transition-shadow duration-300 ${activity.bgColor}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }} // Adjusted delay
            >
              <div className="flex items-start space-x-3.5">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-9 h-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center ring-1 ring-inset ring-gray-200 dark:ring-slate-600`}>
                    <ActivityIcon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {activity.patientName} - <span className="font-medium text-gray-600 dark:text-slate-300">{activity.summary}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{activity.details}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{activity.time}</span>
                    <button className={`text-xs font-semibold ${activity.iconColor} hover:underline`}>
                      {activity.type === 'message' ? 'View Message' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
          })
        )}
      </div>
    </motion.div>
  );
};

export default RecentPatientActivity;
