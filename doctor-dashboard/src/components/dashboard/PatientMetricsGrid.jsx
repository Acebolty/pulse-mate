import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, HeartIcon, ShieldCheckIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// Placeholder data for multiple patients - this would come from a backend
const patientsData = [
  {
    id: 1,
    name: "Alice Johnson",
    keyMetric: "HR: 105 bpm (High)",
    status: "critical", // critical, warning, stable
    lastUpdate: "5 min ago",
    icon: UserGroupIcon, // Or a specific icon based on metric
    metricDetails: "High heart rate alert",
    gradient: "from-red-400 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    bgGradientDark: "dark:from-red-900/50 dark:to-pink-900/50",
  },
  {
    id: 2,
    name: "Robert Davis",
    keyMetric: "Glucose: 180 mg/dL",
    status: "warning",
    lastUpdate: "30 min ago",
    icon: UserGroupIcon,
    metricDetails: "Elevated blood glucose",
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    bgGradientDark: "dark:from-amber-900/50 dark:to-orange-900/50",
  },
  {
    id: 3,
    name: "Maria Garcia",
    keyMetric: "Sleep: 7.5 hrs",
    status: "stable",
    lastUpdate: "2 hrs ago",
    icon: UserGroupIcon,
    metricDetails: "Consistent sleep pattern",
    gradient: "from-emerald-400 to-green-500",
    bgGradient: "from-emerald-50 to-green-50",
    bgGradientDark: "dark:from-emerald-900/50 dark:to-green-900/50",
  },
  {
    id: 4,
    name: "David Wilson",
    keyMetric: "BP: 130/85 mmHg",
    status: "stable",
    lastUpdate: "1 hr ago",
    icon: UserGroupIcon,
    metricDetails: "Blood pressure within acceptable range",
    gradient: "from-sky-400 to-blue-500",
    bgGradient: "from-sky-50 to-blue-50",
    bgGradientDark: "dark:from-sky-900/50 dark:to-blue-900/50",
  },
];

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

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"> {/* Adjusted for potentially fewer, larger cards */}
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
