"use client"

import { useState, useEffect } from "react"
import api from '../services/api'; // Import API service
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline"

// Dummy alerts data
const alertsData = [
  {
    id: 1,
    type: "critical",
    title: "High Blood Pressure Alert",
    message:
      "Your blood pressure reading of 165/95 mmHg is significantly above normal range. Please contact your healthcare provider immediately.",
    timestamp: "2024-01-20T14:30:00Z",
    isRead: false,
    source: "Blood Pressure Monitor",
    actions: ["Contact Doctor", "View Trends", "Dismiss"],
  },
  {
    id: 2,
    type: "warning",
    title: "Irregular Heart Rate Detected",
    message: "Your heart rate has been irregular for the past 15 minutes. Current rate: 105 bpm with irregular rhythm.",
    timestamp: "2024-01-20T13:45:00Z",
    isRead: false,
    source: "Heart Rate Monitor",
    actions: ["View Details", "Contact Doctor", "Mark as Read"],
  },
  {
    id: 3,
    type: "info",
    title: "Medication Reminder",
    message: "Time to take your evening medication: Metformin 500mg and Lisinopril 10mg.",
    timestamp: "2024-01-20T19:00:00Z",
    isRead: true,
    source: "Medication Tracker",
    actions: ["Mark as Taken", "Snooze", "Skip"],
  },
  {
    id: 4,
    type: "success",
    title: "Daily Step Goal Achieved",
    message: "Congratulations! You've reached your daily step goal of 10,000 steps. Total steps today: 12,450.",
    timestamp: "2024-01-20T16:20:00Z",
    isRead: true,
    source: "Activity Tracker",
    actions: ["View Progress", "Share Achievement"],
  },
  {
    id: 5,
    type: "warning",
    title: "Low Blood Glucose Alert",
    message: "Your blood glucose level is 65 mg/dL, which is below the normal range. Consider having a snack.",
    timestamp: "2024-01-20T11:15:00Z",
    isRead: false,
    source: "Glucose Monitor",
    actions: ["Log Food Intake", "Contact Doctor", "Dismiss"],
  },
  {
    id: 6,
    type: "info",
    title: "Sleep Quality Report",
    message:
      "Your sleep quality last night was below average (6.2/10). You had 3 interruptions and 5.5 hours of total sleep.",
    timestamp: "2024-01-20T08:00:00Z",
    isRead: true,
    source: "Sleep Tracker",
    actions: ["View Sleep Report", "Set Sleep Goals"],
  },
  {
    id: 7,
    type: "critical",
    title: "Device Connection Lost",
    message: "Your glucose monitor has been disconnected for over 2 hours. Please check device connection.",
    timestamp: "2024-01-20T10:30:00Z",
    isRead: false,
    source: "System",
    actions: ["Check Device", "Reconnect", "Contact Support"],
  },
  {
    id: 8,
    type: "info",
    title: "Weekly Health Summary Ready",
    message: "Your weekly health summary is now available. Review your progress and trends from the past week.",
    timestamp: "2024-01-20T09:00:00Z",
    isRead: true,
    source: "Health Analytics",
    actions: ["View Summary", "Share with Doctor"],
  },
]

const getAlertIcon = (type) => {
  switch (type) {
    case "critical":
      return <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
    case "warning":
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
    case "info":
      return <InformationCircleIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
    case "success":
      return <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" />
    default:
      return <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
  }
}

const getAlertBgColor = (type) => { // isRead logic will be handled in JSX
  switch (type) {
    case "critical":
      return "bg-red-100 border-red-200 dark:bg-red-700/30 dark:border-red-600/50"
    case "warning":
      return "bg-yellow-100 border-yellow-200 dark:bg-yellow-600/30 dark:border-yellow-500/50"
    case "info":
      return "bg-blue-100 border-blue-200 dark:bg-blue-700/30 dark:border-blue-600/50"
    case "success":
      return "bg-green-100 border-green-200 dark:bg-green-700/30 dark:border-green-600/50"
    default:
      return "bg-gray-100 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600/50"
  }
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}

const Alerts = () => {
  const [alerts, setAlerts] = useState([]); // Initialize with empty array
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'critical', 'warning', 'info'
  const [showSettings, setShowSettings] = useState(false); // This seems to be for an on-page settings panel
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state (optional, but good for many alerts)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const alertsPerPage = 10; // Or make this configurable

  // Dark mode listener
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  // Fetch alerts
  const fetchAlerts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: alertsPerPage,
      };
      if (filter !== "all" && filter !== "unread") {
        params.type = filter; // 'critical', 'warning', 'info'
      }
      if (filter === "unread") {
        params.filter = "unread"; // Backend expects 'filter=unread'
      }
      // If filter is 'all', no specific filter/type param is needed beyond pagination

      const response = await api.get('/alerts', { params });
      setAlerts(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotalAlerts(response.data.totalAlerts);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Could not load alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(currentPage);
  }, [filter, currentPage]); // Re-fetch when filter or page changes

  // Counts will now be derived from fetched data or potentially from API summary if available
  // For now, let's calculate from the currently displayed page of alerts or use totalAlerts for 'all'.
  // A more accurate unread/critical count would ideally come from a separate API endpoint or be aggregated if fetching all alerts.
  const unreadCount = filter === 'unread' ? totalAlerts : alerts.filter(a => !a.isRead).length; // This is an approximation
  const criticalCount = filter === 'critical' ? totalAlerts : alerts.filter(a => a.type === 'critical' && !a.isRead).length; // Approximation


  const markAsRead = async (alertId) => {
    try {
      const response = await api.put(`/alerts/${alertId}/read`);
      setAlerts(alerts.map((alert) => (alert._id === alertId ? response.data : alert)));
      // Optionally re-fetch or update counts more accurately
      fetchAlerts(currentPage); // Re-fetch to update counts and list accurately
    } catch (err) {
      console.error("Error marking alert as read:", err);
      setError("Failed to mark alert as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/alerts/read-all/action');
      fetchAlerts(1); // Reset to page 1 and re-fetch all alerts
    } catch (err) {
      console.error("Error marking all alerts as read:", err);
      setError("Failed to mark all alerts as read.");
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      // setAlerts(alerts.filter((alert) => alert._id !== alertId)); // Optimistic update
      fetchAlerts(currentPage); // Re-fetch to update list and counts
    } catch (err) {
      console.error("Error deleting alert:", err);
      setError("Failed to delete alert.");
    }
  };
  
  // The filteredAlerts logic is now handled by the API query based on 'filter' state
  // So, 'alerts' state directly holds the filtered list for the current page.
  // const filteredAlerts = alerts; // No longer needed if API does filtering

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Health Alerts</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">
            {/* These counts might need to come from a summary API endpoint for accuracy across all pages */}
            {loading ? 'Loading counts...' : `${unreadCount} unread alerts • ${criticalCount} critical alerts`}
          </p>
        </div>
        <div className="flex flex-col space-y-2 items-end mt-2 sm:mt-0 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)} // This toggles the on-page settings panel
            className="flex items-center justify-center space-x-2 p-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors w-full sm:w-auto md:hidden"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 flex-shrink-0" /> {/* Added flex-shrink-0 */}
            <span>Alert Settings</span>
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 text-sm sm:px-4 sm:py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-700/20 rounded-xl transition-colors w-full sm:w-auto"
          >
            Mark All Read
          </button>
          {/* Hide less critical "Alert Settings" button on very small screens, or make it part of the settings panel itself */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hidden sm:inline-flex bg-green-600 dark:bg-green-500 text-white px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors w-full sm:w-auto"
          >
            Alert Settings
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-700/30 rounded-lg sm:rounded-xl">
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{criticalCount}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-600/30 rounded-lg sm:rounded-xl">
              <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {alerts.filter((a) => a.type === "warning" && !a.isRead).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Warnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-700/30 rounded-lg sm:rounded-xl">
              <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {alerts.filter((a) => a.type === "info" && !a.isRead).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Info Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-700/30 rounded-lg sm:rounded-xl">
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{alerts.filter((a) => a.type === "success").length}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Achievements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-3 sm:px-4 md:px-6 whitespace-nowrap">
            {[
              { key: "all", label: "All Alerts", count: alerts.length },
              { key: "unread", label: "Unread", count: unreadCount },
              { key: "critical", label: "Critical", count: alerts.filter((a) => a.type === "critical").length },
              { key: "warning", label: "Warnings", count: alerts.filter((a) => a.type === "warning").length },
              { key: "info", label: "Info", count: alerts.filter((a) => a.type === "info").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {loading && (
            <div className="p-8 text-center">
              <ClockIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 dark:text-slate-400">Loading alerts...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && alerts.length === 0 && (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-slate-400">No alerts found for the selected filter.</p>
            </div>
          )}

        {!loading && !error && alerts.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {alerts.map((alert) => ( // Changed from filteredAlerts to alerts
              <div
                key={alert._id} // Use _id from MongoDB
                className={`p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                  !alert.isRead
                    ? (isDarkMode ? 'bg-sky-800/40 border-sky-700/60' : 'bg-sky-50 border-sky-200') // Distinct unread style with border
                    : getAlertBgColor(alert.type) // Style based on type for read messages
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Timestamp Line */}
                    <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2">
                      <h3 className={`text-sm font-medium ${!alert.isRead ? "text-gray-900 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"}`}>
                        {alert.title}
                        {!alert.isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-0">
                        <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-2 sm:mb-3">{alert.message}</p>

                    {/* Source & Actions Line */}
                    <div className="flex flex-col items-start space-y-2 mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:mt-3">
                      {/* Source & primary actions */}
                      <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Source: {alert.source}</span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {alert.actions.map((action, index) => (
                            <button key={index} className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Secondary actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert._id)} // Corrected to alert._id
                            disabled={loading}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert._id)} // Corrected to alert._id
                          disabled={loading}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Alert Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Alert Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-slate-200 mb-3">Critical Alerts</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">High Blood Pressure</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Irregular Heart Rate</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Low Blood Glucose</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-slate-200 mb-3">Notification Methods</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Push Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Email Alerts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">SMS Notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Alerts
