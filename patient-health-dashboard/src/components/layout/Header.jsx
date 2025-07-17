"use client"

import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logout, getCurrentUser } from "../../services/authService"
import { useAlerts } from "../../contexts/AlertContext"
import api from "../../services/api"

const Header = ({ onMenuClick, isCollapsed }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [userData, setUserData] = useState(null)

  const navigate = useNavigate()
  const { alerts, getUnreadCount, markAsRead, markAllAsRead } = useAlerts()



  // Load user data and alerts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get('/profile/me')
        setUserData(response.data)
      } catch (error) {
        console.error('Failed to load user data:', error)
        // Fallback to localStorage user data
        const localUser = getCurrentUser()
        if (localUser) {
          setUserData(localUser)
        }
      }
    }

    loadUserData()
  }, [])





  // Dark mode initialization
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowProfileMenu(false)
        setShowNotifications(false)
        setShowSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  // Helper functions
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



  // Get display name
  const getDisplayName = () => {
    if (userData) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'User'
    }
    return 'Loading...'
  }

  // Get user email
  const getUserEmail = () => {
    return userData?.email || 'user@example.com'
  }

  // Get profile picture
  const getProfilePicture = () => {
    return userData?.profilePicture || null
  }

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
                Welcome back, {userData?.firstName || 'User'}!
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
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 group"
            >
              <BellIcon className="w-5 h-5" />
              {getUnreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {getUnreadCount()}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-800 dark:text-slate-200">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {getUnreadCount()} unread notifications
                  </p>
                </div>

                <div className="py-2">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert._id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-l-4 ${
                          alert.type === 'critical' ? 'border-red-500' :
                          alert.type === 'warning' ? 'border-yellow-500' :
                          'border-blue-500'
                        } ${!alert.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                              {alert.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                              {new Date(alert.timestamp || alert.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(alert.id)
                              }}
                              className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-slate-400">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                  <div className="flex space-x-2 px-4 py-2">
                    {getUnreadCount() > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead()
                        }}
                        className="flex-1 text-center px-3 py-2 text-sm text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-700/30 transition-colors rounded"
                      >
                        Mark All Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/dashboard/alerts')
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
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-sm rounded-2xl p-2 pr-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600"
            >
              <div className="relative">
                {getProfilePicture() ? (
                  <img
                    className="w-8 h-8 rounded-full ring-2 ring-green-100 object-cover"
                    src={getProfilePicture()}
                    alt="User avatar"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full ring-2 ring-green-100 bg-green-100 dark:bg-green-700 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-gray-800 dark:text-slate-200">{getDisplayName()}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{getTimeBasedGreeting()}</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    {getProfilePicture() ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={getProfilePicture()}
                        alt="User avatar"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-700 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{getDisplayName()}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{getUserEmail()}</p>
                      {userData?.patientId && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">ID: {userData.patientId}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/dashboard/profile')
                      setShowProfileMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/dashboard/settings')
                      setShowProfileMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/dashboard/alerts')
                      setShowProfileMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Health Alerts
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                  <button
                    onClick={handleSignOut}
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