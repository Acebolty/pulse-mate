import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, BeakerIcon, FireIcon, ArrowTrendingUpIcon, SunIcon, PlusIcon, ChartBarIcon } from "@heroicons/react/24/outline";
;

const metrics = [
  {
    id: 1,
    name: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    change: "+2",
    icon: HeartIcon,
    gradient: "from-red-400 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    bgGradientDark: "dark:from-red-900/50 dark:to-pink-900/50",

    lastUpdated: "2 min ago",
  },
  {
    id: 2,
    name: "Blood Glucose",
    value: "95",
    unit: "mg/dL",
    status: "normal",
    change: "-3",
    icon: BeakerIcon,
    gradient: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    bgGradientDark: "dark:from-blue-900/50 dark:to-cyan-900/50",

    lastUpdated: "15 min ago",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "excellent":
      return "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-700/30 dark:border-emerald-600/50";
    case "good":
      return "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-700/30 dark:border-green-600/50";
    case "normal":
      return "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-700/30 dark:border-blue-600/50";
    case "warning":
      return "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-600/30 dark:border-amber-500/50";
    case "critical":
      return "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-700/30 dark:border-red-600/50";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-700/50 dark:border-gray-600/50";
  }
};

const HealthMetricsGrid = ({ latestMetrics = {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);



  // Helper function to format timestamp
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const diffMinutes = Math.round((new Date() - date) / (1000 * 60));
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return date.toLocaleDateString();
  };

  // Helper function to calculate heart rate status
  const getHeartRateStatus = (heartRate) => {
    if (heartRate < 50) return "critical";
    if (heartRate < 60) return "warning";
    if (heartRate >= 60 && heartRate <= 100) return "good";
    if (heartRate > 100 && heartRate <= 150) return "warning";
    return "critical";
  };

  // Helper function to calculate blood pressure status
  const getBloodPressureStatus = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 110) return "critical";
    if (systolic < 70 || diastolic < 40) return "critical";
    if (systolic >= 140 || diastolic >= 90) return "warning";
    if (systolic < 90 || diastolic < 60) return "warning";
    return "good";
  };

  // Helper function to calculate glucose status
  const getGlucoseStatus = (glucose) => {
    if (glucose < 54 || glucose > 400) return "critical";
    if (glucose < 70 || glucose > 180) return "warning";
    if (glucose >= 70 && glucose <= 140) return "good";
    return "warning";
  };

  // Helper function to calculate temperature status
  const getTemperatureStatus = (temp) => {
    if (temp < 95.0 || temp >= 104.0) return "critical";
    if (temp < 96.0 || temp > 100.4) return "warning";
    return "good";
  };



  // Create dynamic metrics based on fetched data
  const getDynamicMetrics = () => {
    const baseMetrics = [...metrics]; // Start with static structure

    // Update with real data if available
    if (latestMetrics.heartRate) {
      const hrMetric = baseMetrics.find(m => m.name === "Heart Rate");
      if (hrMetric) {
        const heartRateValue = latestMetrics.heartRate.value;
        hrMetric.value = heartRateValue.toString();
        hrMetric.unit = 'bpm';
        hrMetric.status = getHeartRateStatus(heartRateValue);
        hrMetric.lastUpdated = formatTimestamp(latestMetrics.heartRate.timestamp);
        hrMetric.change = latestMetrics.heartRate.change || "First reading";
      }
    }

    if (latestMetrics.glucose) {
      const glucoseMetric = baseMetrics.find(m => m.name === "Blood Glucose");
      if (glucoseMetric) {
        const glucoseValue = latestMetrics.glucose.value;
        glucoseMetric.value = glucoseValue.toString();
        glucoseMetric.unit = 'mg/dL';
        glucoseMetric.status = getGlucoseStatus(glucoseValue);
        glucoseMetric.lastUpdated = formatTimestamp(latestMetrics.glucose.timestamp);
        glucoseMetric.change = latestMetrics.glucose.change || "First reading";
      }
    }

    if (latestMetrics.bloodPressure) {
      // Add blood pressure metric if not in base metrics
      let bpMetric = baseMetrics.find(m => m.name === "Blood Pressure");
      if (!bpMetric) {
        const systolic = typeof latestMetrics.bloodPressure.value === 'object'
          ? latestMetrics.bloodPressure.value.systolic
          : latestMetrics.bloodPressure.value;
        const diastolic = typeof latestMetrics.bloodPressure.value === 'object'
          ? latestMetrics.bloodPressure.value.diastolic
          : latestMetrics.bloodPressure.value - 40; // Estimate if not available

        bpMetric = {
          id: 6,
          name: "Blood Pressure",
          value: `${systolic}/${diastolic}`,
          unit: 'mmHg',
          status: getBloodPressureStatus(systolic, diastolic),
          change: latestMetrics.bloodPressure.change || "First reading",
          icon: ArrowTrendingUpIcon,
          gradient: "from-red-400 to-pink-500",
          bgGradient: "from-red-50 to-pink-50",
          bgGradientDark: "dark:from-red-900/50 dark:to-pink-900/50",

          lastUpdated: formatTimestamp(latestMetrics.bloodPressure.timestamp),
        };
        baseMetrics.push(bpMetric);
      } else {
        const systolic = typeof latestMetrics.bloodPressure.value === 'object'
          ? latestMetrics.bloodPressure.value.systolic
          : latestMetrics.bloodPressure.value;
        const diastolic = typeof latestMetrics.bloodPressure.value === 'object'
          ? latestMetrics.bloodPressure.value.diastolic
          : latestMetrics.bloodPressure.value - 40;

        bpMetric.value = `${systolic}/${diastolic}`;
        bpMetric.status = getBloodPressureStatus(systolic, diastolic);
        bpMetric.change = latestMetrics.bloodPressure.change || "First reading";
        bpMetric.lastUpdated = formatTimestamp(latestMetrics.bloodPressure.timestamp);
      }
    }

    if (latestMetrics.bodyTemperature) {
      // Add body temperature metric if not in base metrics
      let tempMetric = baseMetrics.find(m => m.name === "Body Temperature");
      if (!tempMetric) {
        const temp = parseFloat(latestMetrics.bodyTemperature.value.toFixed(1));

        tempMetric = {
          id: 7,
          name: "Body Temperature",
          value: temp.toFixed(1),
          unit: '°F',
          status: getTemperatureStatus(temp),
          change: latestMetrics.bodyTemperature.change || "First reading",
          icon: SunIcon,
          gradient: "from-orange-400 to-yellow-500",
          bgGradient: "from-orange-50 to-yellow-50",
          bgGradientDark: "dark:from-orange-900/50 dark:to-yellow-900/50",

          lastUpdated: formatTimestamp(latestMetrics.bodyTemperature.timestamp),
        };
        baseMetrics.push(tempMetric);
      } else {
        const temp = parseFloat(latestMetrics.bodyTemperature.value.toFixed(1));
        tempMetric.value = temp.toFixed(1);
        tempMetric.unit = '°F';
        tempMetric.status = getTemperatureStatus(temp);
        tempMetric.change = latestMetrics.bodyTemperature.change || "First reading";
        tempMetric.lastUpdated = formatTimestamp(latestMetrics.bodyTemperature.timestamp);
      }
    }





    // Weight metric removed - no longer displayed in health metrics grid

    return baseMetrics;
  };

  const dynamicMetrics = getDynamicMetrics();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark')); // Initial check
    return () => observer.disconnect();
  }, []);

  // Check if user has any health data
  const hasAnyData = latestMetrics && Object.keys(latestMetrics).length > 0 &&
    Object.values(latestMetrics).some(metric => metric && metric.value !== undefined);

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full"
    >
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-8 border-2 border-dashed border-blue-200 dark:border-slate-600 text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
            Start Your Health Journey
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Record your first health readings to see your personalized health metrics and track your wellness progress.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: HeartIcon, name: "Heart Rate", color: "text-red-500" },
              { icon: ArrowTrendingUpIcon, name: "Blood Pressure", color: "text-blue-500" },
              { icon: BeakerIcon, name: "Blood Glucose", color: "text-green-500" },
              { icon: SunIcon, name: "Body Temperature", color: "text-orange-500" }
            ].map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                className="flex flex-col items-center p-3 bg-white dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600"
              >
                <metric.icon className={`w-6 h-6 ${metric.color} mb-2`} />
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300 text-center">
                  {metric.name}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <PlusIcon className="w-4 h-4" />
              <span>Use the simulation panel to generate sample data</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              or manually enter your readings
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Show empty state if no data, otherwise show metrics
  if (!hasAnyData) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dynamicMetrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{ y: -8, scale: 1.02 }}
        >
          {/* Glare effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-slate-700/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? metric.bgGradientDark : metric.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.3 }}
                transition={{ duration: 0.3 }}
              >
                <metric.icon className="w-7 h-7 text-white" />
              </motion.div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <motion.span 
                  className="text-3xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                >
                  {metric.value}
                </motion.span>
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">{metric.unit}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 font-semibold">{metric.name}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <motion.span
                className={`flex items-center ${
                  metric.change.startsWith("+")
                    ? "text-green-600 dark:text-green-400"
                    : metric.change.startsWith("-")
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {metric.change.startsWith("+") ? "↗" : metric.change.startsWith("-") ? "↘" : ""} {metric.change}
              </motion.span>
              <span className="text-gray-500 dark:text-slate-400 font-medium">{metric.lastUpdated}</span>
            </div>
          </div>

          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/30 dark:group-hover:border-slate-600/50 transition-colors duration-300"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthMetricsGrid;