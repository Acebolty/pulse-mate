"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAlerts } from "../contexts/AlertContext"

import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhoneIcon,
  HeartIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  SunIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import api from "../services/api"

// Legacy alert generation - removed (now using AlertContext)



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
  const navigate = useNavigate();
  const { alerts, loading, markAsRead, markAllAsRead, deleteAlert, clearAllAlerts } = useAlerts();
  const [filter, setFilter] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEmergencyPlans, setShowEmergencyPlans] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState(null);



  // Get default actions based on alert type
  const getDefaultActions = (type) => {
    return ['Contact Doctor'];
  };







  // Dark mode listener
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);





  // Filter alerts based on current filter
  const getFilteredAlerts = () => {
    switch (filter) {
      case 'unread':
        return alerts.filter(a => !a.isRead);
      case 'critical':
        return alerts.filter(a => a.type === 'critical');
      case 'warning':
        return alerts.filter(a => a.type === 'warning');
      case 'info':
        return alerts.filter(a => a.type === 'info');
      default:
        return alerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();
  console.log(`📋 Alerts UI - Total: ${alerts.length}, Filter: ${filter}, Filtered: ${filteredAlerts.length}`);

  // Calculate counts
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => !alert.isRead && alert.type === 'critical').length;

  // Calculate alerts this week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const alertsThisWeek = alerts.filter(alert =>
    new Date(alert.timestamp) >= weekAgo
  ).length;

  // Calculate trend
  const alertTrend = alertsThisWeek > 5 ? 'increasing' : alertsThisWeek < 2 ? 'decreasing' : 'stable';

  // Enhanced mark as read handler with UX improvements
  const handleMarkAsRead = (alertId) => {
    const currentUnreadCount = alerts.filter(alert => !alert.isRead).length;
    console.log(`🔄 Marking alert as read: ${alertId}, current filter: ${filter}, unread count: ${currentUnreadCount}`);

    // Mark the alert as read
    markAsRead(alertId);

    // If we're on the "unread" filter and this was the last unread alert,
    // switch to "all" filter so the user can still see their alerts
    if (filter === 'unread' && currentUnreadCount === 1) {
      console.log('🔄 Switching from unread to all filter to show read alerts');
      setTimeout(() => {
        setFilter('all');
      }, 100); // Small delay to let the state update
    }
  };

  // Emergency action handler
  const handleEmergencyAction = (alert, action) => {
    console.log(`Emergency action: ${action} for alert:`, alert);

    switch (action) {
      case 'Contact Doctor':
        // Navigate to appointments page for quick appointment booking
        navigate('/dashboard/appointments');
        break;
      default:
        console.log(`Action: ${action}`);
    }

    // Mark alert as read when action is taken
    handleMarkAsRead(alert.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Health Alerts</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">
            {loading ? 'Analyzing health data...' : `${unreadCount} unread alerts • ${criticalCount} critical alerts • ${alertsThisWeek} this week`}
          </p>
        </div>
        <div className="flex flex-col space-y-2 items-end mt-2 sm:mt-0 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-700/20 rounded-xl transition-colors"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setShowEmergencyPlans(!showEmergencyPlans)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-700/20 rounded-xl transition-colors"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Emergency Plans</span>
          </button>

          <button
            onClick={markAllAsRead}
            className="px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-700/20 rounded-xl transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </motion.div>

      {/* Alert Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-6 border border-blue-200 dark:border-slate-600"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Alert Analytics Dashboard</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Alert Frequency */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{alertsThisWeek}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Alerts This Week</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Trend: {alertTrend === 'increasing' ? '📈 Increasing' : alertTrend === 'decreasing' ? '📉 Decreasing' : '➡️ Stable'}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">2.5</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Avg Response (min)</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                ✓ Excellent response time
              </div>
            </div>

            {/* Critical Alert Ratio */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {alerts.length > 0 ? Math.round((alerts.filter(a => a.type === 'critical').length / alerts.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Critical Alerts</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                {alerts.filter(a => a.type === 'critical').length} of {alerts.length} total
              </div>
            </div>

            {/* Health Score Impact */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <HeartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {alerts.filter(a => a.type === 'critical').length === 0 ? 'Good' : alerts.filter(a => a.type === 'critical').length < 3 ? 'Fair' : 'Poor'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Health Status</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                Based on alert patterns
              </div>
            </div>
          </div>

          {/* Alert Distribution Chart */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Alert Type Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{alerts.filter(a => a.type === 'critical').length}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">Critical</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{alerts.filter(a => a.type === 'warning').length}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">Warning</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{alerts.filter(a => a.type === 'info').length}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">Info</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{alerts.length}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">Total</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Emergency Action Plans */}
      {showEmergencyPlans && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-6 border border-red-200 dark:border-slate-600"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Emergency Action Plans</h3>
            <button
              onClick={() => setShowEmergencyPlans(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Critical Heart Rate */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm border-l-4 border-red-500">
              <div className="flex items-center space-x-3 mb-4">
                <HeartIcon className="w-8 h-8 text-red-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Critical Heart Rate</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-red-600 dark:text-red-400">1.</span>
                  <span>Stop all physical activity immediately</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-red-600 dark:text-red-400">2.</span>
                  <span>Sit down and rest in a comfortable position</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-red-600 dark:text-red-400">3.</span>
                  <span>Call emergency services if experiencing chest pain</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-red-600 dark:text-red-400">4.</span>
                  <span>Contact your healthcare provider immediately</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Emergency call: 911</p>
              </div>
            </div>

            {/* Critical Blood Pressure */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center space-x-3 mb-4">
                <ArrowTrendingUpIcon className="w-8 h-8 text-orange-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Hypertensive Crisis</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">1.</span>
                  <span>Call 911 immediately - this is a medical emergency</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">2.</span>
                  <span>Sit upright and remain calm</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">3.</span>
                  <span>Do not take additional blood pressure medication</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">4.</span>
                  <span>Bring medication list to hospital</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Emergency call: 911</p>
              </div>
            </div>

            {/* Severe Hypoglycemia */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center space-x-3 mb-4">
                <BeakerIcon className="w-8 h-8 text-green-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Severe Hypoglycemia</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">1.</span>
                  <span>Consume 15g fast-acting carbs immediately</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">2.</span>
                  <span>Wait 15 minutes, then recheck blood glucose</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">3.</span>
                  <span>If still low, repeat treatment</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">4.</span>
                  <span>Call 911 if unconscious or unable to swallow</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Fast-acting carbs: glucose tablets, juice, candy</p>
              </div>
            </div>

            {/* High Fever */}
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center space-x-3 mb-4">
                <SunIcon className="w-8 h-8 text-purple-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">High Fever Protocol</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">1.</span>
                  <span>Take appropriate fever-reducing measures as directed by healthcare provider</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">2.</span>
                  <span>Increase fluid intake significantly</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">3.</span>
                  <span>Use cool compresses on forehead and wrists</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">4.</span>
                  <span>Seek immediate medical care for fever &gt;103°F</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Monitor temperature every 30 minutes</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-700/30 rounded-lg sm:rounded-xl">
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{alerts.filter(a => a.type === 'critical').length}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Critical Alerts</p>
              {alerts.filter(a => a.type === 'critical').length > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Immediate attention required</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-600/30 rounded-lg sm:rounded-xl">
              <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{alerts.filter(a => a.type === 'warning').length}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Warning Alerts</p>
              {alerts.filter(a => a.type === 'warning').length > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Monitor closely</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-700/30 rounded-lg sm:rounded-xl">
              <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{alerts.filter(a => a.type === 'info').length}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Info Alerts</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Informational</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-700/30 rounded-lg sm:rounded-xl">
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{unreadCount}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Unread Alerts</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Needs review</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-3 sm:px-4 md:px-6 whitespace-nowrap">
            {[
              { key: "all", label: "All Alerts", count: alerts.length },
              { key: "unread", label: "Unread", count: unreadCount },
              { key: "critical", label: "Critical", count: alerts.filter(a => a.type === 'critical').length },
              { key: "warning", label: "Warnings", count: alerts.filter(a => a.type === 'warning').length },
              { key: "info", label: "Info", count: alerts.filter(a => a.type === 'info').length },
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

          {!loading && !error && filteredAlerts.length === 0 && alerts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                All Clear! No Health Alerts
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Your recent health readings are within normal ranges. The intelligent monitoring system will automatically generate alerts if any concerning patterns are detected.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
                {[
                  { icon: HeartIcon, name: "Heart Rate", color: "text-red-500" },
                  { icon: ArrowTrendingUpIcon, name: "Blood Pressure", color: "text-blue-500" },
                  { icon: BeakerIcon, name: "Blood Glucose", color: "text-green-500" },
                  { icon: SunIcon, name: "Body Temperature", color: "text-orange-500" }
                ].map((metric, index) => (
                  <div key={metric.name} className="flex flex-col items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <metric.icon className={`w-6 h-6 ${metric.color} mb-2`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300 text-center">
                      {metric.name}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Normal</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && !error && filteredAlerts.length === 0 && alerts.length > 0 && (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              {filter === 'unread' ? (
                <div>
                  <p className="text-gray-500 dark:text-slate-400">Great! No unread alerts.</p>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">
                    All your alerts have been read. Check the "All Alerts" tab to see your complete alert history.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Alerts
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 dark:text-slate-400">No alerts found for the selected filter.</p>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">
                    Try selecting a different filter or check "All Alerts" to see all generated alerts.
                  </p>
                </div>
              )}
            </div>
          )}

        {!loading && !error && filteredAlerts.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all ${
                  !alert.isRead
                    ? (isDarkMode ? 'bg-sky-800/40 border-l-4 border-sky-500' : 'bg-sky-50 border-l-4 border-sky-500')
                    : alert.type === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
                        : 'bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Emergency Level */}
                    <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-semibold ${!alert.isRead ? "text-gray-900 dark:text-slate-100" : "text-gray-700 dark:text-slate-300"}`}>
                          {alert.title}
                        </h3>
                        {alert.emergencyLevel === 'immediate' && (
                          <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
                            URGENT
                          </span>
                        )}
                        {!alert.isRead && <span className="inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>}
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 dark:text-slate-400 mt-1 sm:mt-0">
                        <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>

                    {/* Health Value Display */}
                    {alert.value && (
                      <div className="mb-2 p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600 dark:text-slate-400">Reading:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{alert.value}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            ({alert.dataType?.replace(/([A-Z])/g, ' $1').trim()})
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">{alert.message}</p>

                    {/* Recommendations */}
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {(alert.recommendations || []).map((rec, index) => (
                            <li key={index} className="text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-1">
                              <span className="text-blue-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Source: {alert.source}</span>
                        <div className="flex flex-wrap gap-2">
                          {(alert.actions || getDefaultActions(alert.type)).map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmergencyAction(alert, action)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                action.includes('Emergency') || action.includes('Call')
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : action.includes('Doctor')
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>


    </div>
  )
}

export default Alerts
