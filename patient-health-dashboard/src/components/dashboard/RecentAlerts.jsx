import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../../contexts/AlertContext';

const RecentAlerts = ({ alerts: propAlerts = [] }) => {
  const navigate = useNavigate();
  const { alerts: contextAlerts } = useAlerts();

  // Use AlertContext alerts if available, otherwise use prop alerts
  const alerts = contextAlerts.length > 0 ? contextAlerts : propAlerts;
  // Helper function to format timestamp
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const diffMinutes = Math.round((new Date() - date) / (1000 * 60));
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Map backend alert types to display types
  const mapAlertType = (backendType) => {
    switch (backendType) {
      case 'critical': return 'critical';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  // Sort alerts by priority (critical first) and take the 3 most recent
  const sortedAlerts = alerts.length > 0 ? [...alerts].sort((a, b) => {
    // Priority order: critical > warning > info > success
    const priority = { critical: 4, warning: 3, info: 2, success: 1 };
    const aPriority = priority[a.type] || 0;
    const bPriority = priority[b.type] || 0;

    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }

    // If same priority, sort by timestamp (newest first)
    const aTime = new Date(a.createdAt || a.timestamp);
    const bTime = new Date(b.createdAt || b.timestamp);
    return bTime - aTime;
  }) : [];

  // Use real alerts if available, otherwise fall back to dummy data
  const displayAlerts = sortedAlerts.length > 0 ? sortedAlerts.slice(0, 3).map(alert => ({
    id: alert._id || alert.id,
    type: mapAlertType(alert.type),
    title: alert.title,
    message: alert.message,
    time: formatTimestamp(alert.createdAt || alert.timestamp),
    action: alert.type === 'info' && alert.title.includes('Daily Health Tasks') ? "View Progress" : "Contact Doctor",
  })) : [
    {
      id: 1,
      type: "info",
      title: "No Recent Alerts",
      message: "All your health metrics are looking good!",
      time: "Now",
      action: "View All",
    }
  ];

  const getAlertStyles = (type) => {
    switch (type) {
      case "critical":
        return {
          icon: "🚨",
          bg: "from-red-50 to-rose-50 border-red-200 dark:from-red-800/40 dark:to-rose-800/40 dark:border-red-600/50",
          accent: "text-red-600 dark:text-red-400"
        };
      case "warning":
        return {
          icon: "⚠️",
          bg: "from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-800/40 dark:to-yellow-800/40 dark:border-amber-600/50",
          accent: "text-amber-600 dark:text-amber-400"
        };
      case "info":
        return {
          icon: "ℹ️",
          bg: "from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-800/40 dark:to-cyan-800/40 dark:border-blue-600/50",
          accent: "text-blue-600 dark:text-blue-400"
        };
      case "success":
        return {
          icon: "🎉",
          bg: "from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-800/40 dark:to-green-800/40 dark:border-emerald-600/50",
          accent: "text-emerald-600 dark:text-emerald-400"
        };
      default:
        return {
          icon: "ℹ️",
          bg: "from-gray-50 to-slate-50 border-gray-200 dark:from-gray-700/40 dark:to-slate-700/40 dark:border-gray-600/50",
          accent: "text-gray-600 dark:text-gray-400"
        };
    }
  };

  return (
    <motion.div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Recent Alerts</h3>
        <button
          onClick={() => navigate('/dashboard/alerts')}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-700/30 px-3 py-1 rounded-lg transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {displayAlerts.map((alert, index) => {
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
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">
                    {styles.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{alert.title}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{alert.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{alert.time}</span>
                    <button
                      onClick={() => {
                        if (alert.action === "View Progress") {
                          // For daily health tasks, scroll to welcome card or stay on dashboard
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (alert.action === "View All") {
                          navigate('/dashboard/alerts');
                        } else {
                          navigate('/dashboard/appointments');
                        }
                      }}
                      className={`text-xs font-semibold ${styles.accent} hover:underline`}
                    >
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
