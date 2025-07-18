"use client"

import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logout, getCurrentUser } from "../../services/authService"
import api from "../../services/api"
import { useDoctorProfile } from "../../contexts/DoctorProfileContext"

const Header = ({ onMenuClick, isCollapsed }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const navigate = useNavigate()
  const { profileData, displayName, profilePicture } = useDoctorProfile()

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode === "true") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    }

    // Get current user data
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("darkMode", "true")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("darkMode", "false")
    }
  }

  const handleLogout = () => {
    logout(navigate)
    setShowProfileMenu(false)
  }

  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch real notifications (appointments + health alerts)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        console.log('📱 Fetching real notifications...')

        // Fetch notifications, alerts and appointments (same endpoints as main Notifications page)
        const [notificationsRes, alertsRes, appointmentsRes] = await Promise.allSettled([
          api.get('/notifications/doctor?limit=10'),
          api.get('/alerts/doctor/notifications?limit=10'),
          api.get('/appointments/doctor')
        ])

        // Process appointment notifications
        const appointmentNotificationsData = notificationsRes.status === 'fulfilled' ? notificationsRes.value.data : {}
        const appointmentNotifications = Array.isArray(appointmentNotificationsData.data) ? appointmentNotificationsData.data :
                                       Array.isArray(appointmentNotificationsData) ? appointmentNotificationsData : []

        // Process health alerts
        const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value.data : {}
        const alerts = Array.isArray(alertsData.data) ? alertsData.data :
                      Array.isArray(alertsData) ? alertsData : []

        // Process appointments for notifications
        const appointmentsData = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : {}
        const appointments = Array.isArray(appointmentsData.data) ? appointmentsData.data :
                           Array.isArray(appointmentsData) ? appointmentsData : []

        console.log('📱 Found:', appointmentNotifications.length, 'appointment notifications,', alerts.length, 'health alerts')

        // Format appointment notifications from API
        const formattedAppointmentNotifications = appointmentNotifications.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt,
          isRead: notification.isRead || false,
          type: notification.type,
          priority: notification.priority || 'normal',
          patientName: notification.patientName || 'Unknown Patient'
        }))

        // Format health alerts (now with patient names from backend)
        const formattedHealthNotifications = alerts.map(alert => ({
          id: alert._id,
          title: alert.type === 'critical' ? `Critical: ${alert.title || 'Health Alert'}` : `Warning: ${alert.title || 'Health Alert'}`,
          message: alert.message || alert.description || 'Health data requires review',
          timestamp: alert.createdAt || alert.timestamp,
          isRead: alert.isRead || false,
          type: alert.type === 'critical' ? 'critical_alert' : 'health_metric_warning',
          priority: alert.priority || 'medium',
          patientName: alert.patientName || 'Unknown Patient'
        }))

        // Combine all notifications
        const allNotifications = [...formattedAppointmentNotifications, ...formattedHealthNotifications]

        // Sort by timestamp (most recent first)
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        // Count unread notifications
        const unreadCount = allNotifications.filter(notif => !notif.isRead).length

        console.log('📱 Total notifications:', allNotifications.length)
        console.log('📱 Unread count:', unreadCount)
        console.log('📱 Appointment notifications:', formattedAppointmentNotifications.length)
        console.log('📱 Health notifications:', formattedHealthNotifications.length)

        setNotifications(allNotifications)
        setNotificationCount(unreadCount)

      } catch (err) {
        console.error('❌ Error fetching notifications:', err)
        setNotificationCount(0)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    // Listen for mark all as read events from other components
    const handleNotificationsMarkedAsRead = () => {
      console.log('📱 Header: Received notifications marked as read event, performing silent refresh...');

      // Immediately update UI to show 0 notifications for instant feedback
      setNotificationCount(0);
      setNotifications([]);

      // Then fetch fresh data from backend to ensure consistency
      fetchNotifications();
    };

    window.addEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true); // Show loading state
      console.log('📱 Header: Marking all notifications as read...');

      // Mark both notification types as read (doctor-specific endpoints)
      const [notificationsRes, alertsRes] = await Promise.allSettled([
        api.put('/notifications/read-all'),
        api.put('/alerts/doctor/read-all')
      ]);

      // Check if at least one succeeded
      const notificationsSuccess = notificationsRes.status === 'fulfilled' && notificationsRes.value.data.success;
      const alertsSuccess = alertsRes.status === 'fulfilled' && alertsRes.value.data.success;

      if (notificationsSuccess || alertsSuccess) {
        // Update frontend state immediately
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setNotificationCount(0);

        console.log('✅ Header: Marked all notifications as read');
        console.log('📧 Notifications:', notificationsSuccess ? 'Success' : 'Failed');
        console.log('🚨 Alerts:', alertsSuccess ? 'Success' : 'Failed');

        // Silent refresh: Trigger updates in other components after a small delay
        setTimeout(() => {
          console.log('🔄 Header: Triggering silent refresh of sidebar and main page...');
          window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
          setMarkingAllAsRead(false); // Reset loading state after silent refresh
        }, 500);

      } else {
        setMarkingAllAsRead(false); // Reset loading state on failure
        throw new Error('Failed to mark notifications as read');
      }
    } catch (err) {
      console.error('❌ Header: Error marking all notifications as read:', err);

      // Still update frontend for better UX
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);

      // Still trigger the silent refresh for UI updates
      setTimeout(() => {
        console.log('🔄 Header: Triggering silent refresh (fallback after error)...');
        window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
        setMarkingAllAsRead(false); // Reset loading state after silent refresh
      }, 500);

      console.warn('⚠️ Header: Updated frontend but backend update may have failed');
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Page title - shows when sidebar is collapsed */}
          {isCollapsed && (
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-200">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Welcome back, {displayName || `${currentUser?.doctorInfo?.title || 'Dr.'} ${currentUser?.firstName || 'Doctor'}`}!
              </p>
            </div>
          )}

        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 group"
            >
              <BellIcon className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-800 dark:text-slate-200">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {notificationCount} unread notifications
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <BellIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-slate-400 text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => {
                      const timeAgo = notification.timestamp ?
                        new Date(notification.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'Just now'

                      return (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-50 dark:border-slate-700 last:border-b-0 cursor-pointer transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.isRead ? 'bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-600'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.isRead ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'
                                }`}>
                                  {notification.title}
                                </p>
                                {notification.type === 'critical' && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full flex-shrink-0">
                                    Critical
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                                {notification.message}
                              </p>
                              {notification.patientName && (
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                  Patient: <span className="font-medium">{notification.patientName}</span>
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                {timeAgo}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                  <div className="flex space-x-2 px-4 py-2">
                    {notificationCount > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead()
                          setShowNotifications(false)
                        }}
                        disabled={markingAllAsRead}
                        className="flex-1 text-center px-3 py-2 text-sm text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-700/30 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {markingAllAsRead && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-500"></div>
                        )}
                        <span>{markingAllAsRead ? 'Marking...' : 'Mark All Read'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Navigate to notifications page
                        window.location.href = '/notifications'
                        setShowNotifications(false)
                      }}
                      className="flex-1 text-center px-3 py-2 text-sm text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-700/30 transition-colors rounded"
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-sm rounded-2xl p-2 pr-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600"
            >
              <div className="relative">
                <img
                  className="w-8 h-8 rounded-full ring-2 ring-green-100"
                  src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Doctor')}&background=3b82f6&color=ffffff&size=64`}
                  alt="User avatar"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-gray-800 dark:text-slate-200">
                  {displayName || `${currentUser?.doctorInfo?.title || 'Dr.'} ${currentUser?.firstName} ${currentUser?.lastName}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Good Morning! 🌅</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Doctor')}&background=3b82f6&color=ffffff&size=80`}
                      alt="User avatar"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-slate-200">
                        {displayName || `${currentUser?.doctorInfo?.title || 'Dr.'} ${currentUser?.firstName} ${currentUser?.lastName}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{profileData?.email || currentUser?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    View Profile
                  </a>
                </div>
                
                <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-700/30 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header