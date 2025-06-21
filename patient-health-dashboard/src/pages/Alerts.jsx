"use client"

import { useState, useEffect } from "react"
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
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState("all")
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark')); // Initial check
    return () => observer.disconnect();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true
    if (filter === "unread") return !alert.isRead
    return alert.type === filter
  })

  const unreadCount = alerts.filter((alert) => !alert.isRead).length
  const criticalCount = alerts.filter((alert) => alert.type === "critical" && !alert.isRead).length

  const markAsRead = (alertId) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, isRead: true })))
  }

  const deleteAlert = (alertId) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Health Alerts</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">
            {unreadCount} unread alerts • {criticalCount} critical alerts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-700/20 rounded-xl transition-colors"
          >
            Mark All Read
          </button>
          <button className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
            Alert Settings
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-700/30 rounded-xl">
              <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{criticalCount}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-600/30 rounded-xl">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {alerts.filter((a) => a.type === "warning" && !a.isRead).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">Warnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-700/30 rounded-xl">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {alerts.filter((a) => a.type === "info" && !a.isRead).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">Info Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-700/30 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{alerts.filter((a) => a.type === "success").length}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">Achievements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-8 px-6">
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
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-slate-400">No alerts found for the selected filter.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                  !alert.isRead 
                    ? (isDarkMode ? 'bg-sky-800/40 border-sky-700/60' : 'bg-sky-50 border-sky-200') // Distinct unread style with border
                    : getAlertBgColor(alert.type) // Style based on type for read messages
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-sm font-medium ${!alert.isRead ? "text-gray-900 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"}`}>
                        {alert.title}
                        {!alert.isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">{alert.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Source: {alert.source}</span>
                        <div className="flex space-x-2">
                          {alert.actions.map((action, index) => (
                            <button key={index} className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
