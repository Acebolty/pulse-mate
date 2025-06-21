import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, BeakerIcon, FireIcon, MoonIcon } from "@heroicons/react/24/outline";

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
    lastUpdated: "15 min ago",
  },
  {
    id: 3,
    name: "Calories Burned",
    value: "1,247",
    unit: "kcal",
    status: "good",
    change: "+156",
    icon: FireIcon,
    gradient: "from-orange-400 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    lastUpdated: "1 hour ago",
  },
  {
    id: 4,
    name: "Sleep Quality",
    value: "8.2",
    unit: "/10",
    status: "excellent",
    change: "+0.3",
    icon: MoonIcon,
    gradient: "from-purple-400 to-indigo-500",
    bgGradient: "from-purple-50 to-indigo-50",
    lastUpdated: "Last night",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "excellent":
      return "text-emerald-700 bg-emerald-100 border-emerald-200";
    case "good":
      return "text-green-700 bg-green-100 border-green-200";
    case "normal":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "warning":
      return "text-amber-700 bg-amber-100 border-amber-200";
    case "critical":
      return "text-red-700 bg-red-100 border-red-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

const HealthMetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{ y: -8, scale: 1.02 }}
        >
          {/* Glare effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
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
                  className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                >
                  {metric.value}
                </motion.span>
                <span className="text-sm text-gray-500 font-medium">{metric.unit}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-semibold">{metric.name}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <motion.span 
                className={`flex items-center font-semibold px-2 py-1 rounded-lg ${
                  metric.change.startsWith("+") 
                    ? "text-emerald-700 bg-emerald-50" 
                    : "text-red-700 bg-red-50"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <span className="mr-1">
                  {metric.change.startsWith("+") ? "↗" : "↘"}
                </span>
                {metric.change} vs yesterday
              </motion.span>
              <span className="text-gray-500 font-medium">{metric.lastUpdated}</span>
            </div>
          </div>

          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/30 transition-colors duration-300"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthMetricsGrid;