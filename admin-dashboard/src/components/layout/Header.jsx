import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import { logout } from "../../services/authService"
import { getRecentActivities } from "../../services/adminService"

const Header = ({ onMenuClick, isCollapsed, user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)
  const notificationRef = useRef(null)

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode === "true") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("darkMode", newMode.toString())
    
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning! 🌅"
    if (hour < 17) return "Good Afternoon! ☀️"
    return "Good Evening! 🌙"
  }

  const handleSignOut = () => {
    logout(navigate)
    setShowProfileMenu(false)
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await getRecentActivities(10)
      console.log('🔔 Header notification response:', response)

      // Get read notifications from localStorage
      const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]')

      // Transform recent activities into notifications
      const activityNotifications = response.data?.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: getNotificationTitle(activity.type),
        message: activity.message,
        timestamp: activity.timestamp,
        isRead: readNotifications.includes(activity.id),
        color: activity.color
      })) || []

      // Clean up old read notifications (keep only IDs that are still in current activities)
      const currentActivityIds = activityNotifications.map(a => a.id)
      const cleanedReadNotifications = readNotifications.filter(id => currentActivityIds.includes(id))
      if (cleanedReadNotifications.length !== readNotifications.length) {
        localStorage.setItem('admin_read_notifications', JSON.stringify(cleanedReadNotifications))
      }

      // Count only unread notifications
      const unreadCount = activityNotifications.filter(notif => !notif.isRead).length

      setNotifications(activityNotifications)
      setNotificationCount(unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setNotificationCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true)
      console.log('🔔 Admin: Marking all notifications as read...')

      // Get current read notifications from localStorage
      const currentReadNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]')

      // Add all current notification IDs to read list
      const allNotificationIds = notifications.map(notif => notif.id)
      const updatedReadNotifications = [...new Set([...currentReadNotifications, ...allNotificationIds])]

      // Save to localStorage
      localStorage.setItem('admin_read_notifications', JSON.stringify(updatedReadNotifications))

      // Update frontend state immediately
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setNotificationCount(0)

      console.log('✅ Admin: Marked all notifications as read')
    } catch (error) {
      console.error('❌ Admin: Error marking notifications as read:', error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const getNotificationTitle = (type) => {
    const titles = {
      patient_signup: 'New Patient',
      doctor_signup: 'New Provider',
      appointment_booked: 'New Appointment',
      chat_opened: 'Chat Session',
      appointment_completed: 'Session Completed'
    }
    return titles[type] || 'System Activity'
  }

  const getActivityIcon = (type) => {
    const icons = {
      patient_signup: UserPlusIcon,
      doctor_signup: ShieldCheckIcon,
      appointment_booked: CalendarIcon,
      chat_opened: ChatBubbleLeftRightIcon,
      appointment_completed: CheckCircleIcon,
    }
    return icons[type] || BellIcon
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getDisplayName = () => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Admin'
    }
    return 'Loading...'
  }

  const getUserEmail = () => {
    return user?.email || 'admin@pulsemate.com'
  }

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Greeting */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Welcome back, Admin
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications) {
                  fetchNotifications() // Refresh when opening
                }
              }}
              className="relative p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <BellIcon className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50 max-h-96 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Recent Activities
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {notificationCount} unread activities
                      </p>
                    </div>
                    {notificationCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={markingAllAsRead}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        {markingAllAsRead ? 'Marking...' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Loading activities...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-slate-400">No recent activities</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const ActivityIcon = getActivityIcon(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 border-b border-gray-100 dark:border-slate-700 last:border-b-0 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                          onClick={() => {
                            if (!notification.isRead) {
                              // Mark this notification as read
                              const currentReadNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]')
                              const updatedReadNotifications = [...currentReadNotifications, notification.id]
                              localStorage.setItem('admin_read_notifications', JSON.stringify(updatedReadNotifications))

                              // Update state
                              setNotifications(notifications.map(n =>
                                n.id === notification.id ? { ...n, isRead: true } : n
                              ))
                              setNotificationCount(prev => Math.max(0, prev - 1))
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              notification.color === 'blue' ? 'bg-blue-100 dark:bg-blue-700/30' :
                              notification.color === 'green' ? 'bg-green-100 dark:bg-green-700/30' :
                              notification.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-700/30' :
                              notification.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-700/30' :
                              notification.color === 'purple' ? 'bg-purple-100 dark:bg-purple-700/30' :
                              'bg-gray-100 dark:bg-gray-700/30'
                            }`}>
                              <ActivityIcon className={`w-4 h-4 ${
                                notification.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                notification.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                notification.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                notification.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                                notification.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.isRead
                                    ? 'text-gray-600 dark:text-slate-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className={`text-xs mt-1 ${
                                notification.isRead
                                  ? 'text-gray-500 dark:text-slate-500'
                                  : 'text-gray-600 dark:text-slate-300'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center mt-1">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard')
                        setShowNotifications(false)
                      }}
                      className="w-full text-center text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      View all activities on dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              {!isCollapsed && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Admin
                  </p>
                </div>
              )}
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {getUserEmail()}
                  </p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
