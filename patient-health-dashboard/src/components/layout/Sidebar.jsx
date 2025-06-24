"use client"

import { NavLink } from "react-router-dom"
import React, { useState, useEffect } from "react"
import {
  HomeIcon,
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  UserIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { useAlerts } from "../../contexts/AlertContext"
import { getCurrentUser } from "../../services/authService"
import api from "../../services/api"

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userData, setUserData] = useState(null)
  const [currentTip, setCurrentTip] = useState(null)
  const [healthStatus, setHealthStatus] = useState(null)
  const { getUnreadCount } = useAlerts()

  const unreadCount = getUnreadCount()
  console.log('Sidebar unread count:', unreadCount) // Debug log

  // Load user data
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

  // Load health status
  useEffect(() => {
    const loadHealthStatus = async () => {
      try {
        const response = await api.get('/health-data/latest')
        const latestData = response.data

        // Calculate simple health score based on available data
        let score = 85 // Default good score
        let status = 'good'
        let statusColor = 'green'

        if (latestData.heartRate && latestData.heartRate.length > 0) {
          const hr = latestData.heartRate[0].value
          if (hr < 60 || hr > 100) {
            score -= 10
            status = 'warning'
            statusColor = 'yellow'
          }
        }

        if (latestData.bloodPressure && latestData.bloodPressure.length > 0) {
          const bp = latestData.bloodPressure[0].value
          const systolic = typeof bp === 'object' ? bp.systolic : bp
          if (systolic > 140) {
            score -= 15
            status = 'critical'
            statusColor = 'red'
          }
        }

        setHealthStatus({
          score: Math.max(score, 0),
          status,
          statusColor,
          lastUpdated: new Date().toLocaleTimeString()
        })
      } catch (error) {
        console.error('Failed to load health status:', error)
        // Default status if no data
        setHealthStatus({
          score: 85,
          status: 'good',
          statusColor: 'green',
          lastUpdated: 'No recent data'
        })
      }
    }

    if (userData) {
      loadHealthStatus()
    }
  }, [userData])

  // Helper functions for user data
  const getDisplayName = () => {
    if (userData) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'User'
    }
    return 'Loading...'
  }

  const getPatientId = () => {
    return userData?.patientId || 'Not assigned'
  }

  const getProfilePicture = () => {
    return userData?.profilePicture || null
  }

  // Health tips system
  const healthTips = [
    {
      icon: HeartIcon,
      title: "Heart Health",
      message: "Regular exercise strengthens your heart and improves circulation.",
      color: "red"
    },
    {
      icon: HeartIcon,
      title: "Hydration",
      message: "Drink 8 glasses of water daily to maintain optimal health.",
      color: "blue"
    },
    {
      icon: HeartIcon,
      title: "Sleep Quality",
      message: "Aim for 7-9 hours of quality sleep each night for better recovery.",
      color: "purple"
    },
    {
      icon: HeartIcon,
      title: "Stress Management",
      message: "Practice deep breathing or meditation to reduce stress levels.",
      color: "green"
    },
    {
      icon: HeartIcon,
      title: "Nutrition",
      message: "Include more fruits and vegetables in your daily diet.",
      color: "orange"
    },
    {
      icon: HeartIcon,
      title: "Movement",
      message: "Take short walks every hour to improve blood circulation.",
      color: "indigo"
    }
  ]

  // Rotate health tips every 30 seconds
  useEffect(() => {
    const getRandomTip = () => {
      const randomIndex = Math.floor(Math.random() * healthTips.length)
      setCurrentTip(healthTips[randomIndex])
    }

    // Set initial tip
    getRandomTip()

    // Rotate tips every 30 seconds
    const interval = setInterval(getRandomTip, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigation = React.useMemo(() => [
    { name: "Dashboard", href: "/dashboard/overview", icon: HomeIcon },
    { name: "Health Metrics", href: "/dashboard/health-metrics", icon: HeartIcon },
    { name: "Appointments", href: "/dashboard/appointments", icon: CalendarIcon },
    { name: "Messages", href: "/dashboard/messages", icon: ChatBubbleLeftIcon, badge: 3 },
    { name: "Alerts", href: "/dashboard/alerts", icon: BellIcon, badge: unreadCount },
    { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ], [unreadCount])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    setIsDarkMode(document.documentElement.classList.contains('dark'))
    return () => observer.disconnect()
  }, [])
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 dark:bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 shadow-xl dark:border-r dark:border-slate-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700/80">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200">
                  <span className="text-green-500 dark:text-green-400">Pulse</span>
                  <span className="text-gray-700 dark:text-slate-300">Mate</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
          
          {/* Desktop collapse toggle */}
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-3.5 h-4" />
            ) : (
              <ChevronLeftIcon className="w-3.5 h-4" />
            )}
          </button>
        </div>

        {/* User profile section - moved after logo */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "space-x-3"}`}>
            <div className="relative">
              {getProfilePicture() ? (
                <img
                  className="w-10 h-10 rounded-full ring-2 ring-green-100 shadow-sm object-cover"
                  src={getProfilePicture()}
                  alt="User avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-full ring-2 ring-green-100 bg-green-100 dark:bg-green-700 flex items-center justify-center shadow-sm">
                  <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{getDisplayName()}</p>
                  {healthStatus && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      healthStatus.statusColor === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' :
                      healthStatus.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        healthStatus.statusColor === 'green' ? 'bg-green-500' :
                        healthStatus.statusColor === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span>{healthStatus.score}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Patient ID: {getPatientId()}</p>
                {healthStatus && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">Health: {healthStatus.status}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800/50 dark:bg-gradient-to-r dark:from-green-700/20 dark:to-emerald-700/20"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 hover:shadow-sm"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed ? "" : "mr-3"}`}>
                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 group-hover:scale-110"
                    }`} />
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className={`ml-auto text-xs rounded-full px-2 py-1 font-medium min-w-[20px] text-center ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-600/30 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-800 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 dark:bg-slate-200 rotate-45"></div>
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 dark:bg-green-400 rounded-l-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section - dynamic health tips */}
        {!isCollapsed && currentTip && (
          <div className="flex-shrink-0 p-4">
            <div className={`bg-gradient-to-br ${
              currentTip.color === 'red' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' :
              currentTip.color === 'blue' ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' :
              currentTip.color === 'purple' ? 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' :
              currentTip.color === 'green' ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
              currentTip.color === 'orange' ? 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' :
              'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20'
            } rounded-xl p-4 border ${
              currentTip.color === 'red' ? 'border-red-100 dark:border-red-800/50' :
              currentTip.color === 'blue' ? 'border-blue-100 dark:border-blue-800/50' :
              currentTip.color === 'purple' ? 'border-purple-100 dark:border-purple-800/50' :
              currentTip.color === 'green' ? 'border-green-100 dark:border-green-800/50' :
              currentTip.color === 'orange' ? 'border-orange-100 dark:border-orange-800/50' :
              'border-indigo-100 dark:border-indigo-800/50'
            } transition-all duration-500`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 ${
                  currentTip.color === 'red' ? 'bg-red-100 dark:bg-red-800/50' :
                  currentTip.color === 'blue' ? 'bg-blue-100 dark:bg-blue-800/50' :
                  currentTip.color === 'purple' ? 'bg-purple-100 dark:bg-purple-800/50' :
                  currentTip.color === 'green' ? 'bg-green-100 dark:bg-green-800/50' :
                  currentTip.color === 'orange' ? 'bg-orange-100 dark:bg-orange-800/50' :
                  'bg-indigo-100 dark:bg-indigo-800/50'
                } rounded-lg flex items-center justify-center`}>
                  <currentTip.icon className={`w-4 h-4 ${
                    currentTip.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    currentTip.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    currentTip.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    currentTip.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    currentTip.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-indigo-600 dark:text-indigo-400'
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  currentTip.color === 'red' ? 'text-red-800 dark:text-red-200' :
                  currentTip.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                  currentTip.color === 'purple' ? 'text-purple-800 dark:text-purple-200' :
                  currentTip.color === 'green' ? 'text-green-800 dark:text-green-200' :
                  currentTip.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                  'text-indigo-800 dark:text-indigo-200'
                }`}>{currentTip.title}</span>
              </div>
              <p className={`text-xs ${
                currentTip.color === 'red' ? 'text-red-700 dark:text-red-300' :
                currentTip.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                currentTip.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                currentTip.color === 'green' ? 'text-green-700 dark:text-green-300' :
                currentTip.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                'text-indigo-700 dark:text-indigo-300'
              } leading-relaxed`}>
                {currentTip.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar