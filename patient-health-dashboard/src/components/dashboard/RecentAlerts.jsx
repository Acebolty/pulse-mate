import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';

const RecentAlerts = () => {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "High Blood Pressure Detected",
      message: "Your blood pressure reading of 145/90 is above normal range.",
      time: "2 hours ago",
      action: "Contact Doctor",
    },
    {
      id: 2,
      type: "info",
      title: "Medication Reminder",
      message: "Time to take your evening medication (Metformin 500mg).",
      time: "4 hours ago",
      action: "Mark as Taken",
    },
    {
      id: 3,
      type: "success",
      title: "Daily Goal Achieved",
      message: "Congratulations! You've reached your daily step goal of 10,000 steps.",
      time: "6 hours ago",
      action: "View Progress",
    },
  ];

  const getAlertStyles = (type) => {
    switch (type) {
      case "warning":
        return {
          icon: "⚠️",
          bg: "from-amber-50 to-yellow-50 border-amber-200",
          accent: "text-amber-600"
        };
      case "info":
        return {
          icon: "💊",
          bg: "from-blue-50 to-cyan-50 border-blue-200",
          accent: "text-blue-600"
        };
      case "success":
        return {
          icon: "🎉",
          bg: "from-emerald-50 to-green-50 border-emerald-200",
          accent: "text-emerald-600"
        };
      default:
        return {
          icon: "ℹ️",
          bg: "from-gray-50 to-slate-50 border-gray-200",
          accent: "text-gray-600"
        };
    }
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Alerts</h3>
        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const styles = getAlertStyles(alert.type);
          return (
            <motion.div 
              key={alert.id} 
              className={`p-4 rounded-xl border bg-gradient-to-r ${styles.bg} hover:shadow-md transition-shadow duration-300`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    {styles.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 font-medium">{alert.time}</span>
                    <button className={`text-xs font-semibold ${styles.accent} hover:underline`}>
                      {alert.action}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentAlerts
