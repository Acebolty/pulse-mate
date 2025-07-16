"use client"

import { NavLink } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  HomeIcon,
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  BellIcon,
  UserIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline"
import api from "../../services/api"
import { useDoctorProfile } from "../../contexts/DoctorProfileContext"
import { getCurrentUser } from "../../services/authService"
import { generateDoctorAvatar } from "../../utils/avatarUtils"

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const [notificationCount, setNotificationCount] = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentTip, setCurrentTip] = useState(null)

  // Use the doctor profile context for real-time data
  const { profileData, displayName, profilePicture } = useDoctorProfile()

  // Professional tips for doctors
  const professionalTips = [
    // Clinical Insights
    {
      icon: AcademicCapIcon,
      category: "Clinical Insight",
      title: "Evidence-Based Care",
      message: "Studies show patients are 40% more likely to follow treatment plans when doctors explain the 'why' behind recommendations.",
      color: "blue"
    },
    {
      icon: ClipboardDocumentCheckIcon,
      category: "Clinical Insight",
      title: "Diagnostic Accuracy",
      message: "Taking an extra 30 seconds to review patient history can improve diagnostic accuracy by 25%.",
      color: "green"
    },
    {
      icon: AcademicCapIcon,
      category: "Clinical Insight",
      title: "Medication Adherence",
      message: "Patients who understand their medication's purpose are 60% more likely to take it as prescribed.",
      color: "purple"
    },

    // Communication Strategies
    {
      icon: ChatBubbleOvalLeftEllipsisIcon,
      category: "Communication Tip",
      title: "Teach-Back Method",
      message: "Ask patients to repeat instructions in their own words to ensure understanding and improve compliance.",
      color: "indigo"
    },
    {
      icon: ChatBubbleOvalLeftEllipsisIcon,
      category: "Communication Tip",
      title: "Active Listening",
      message: "Maintain eye contact and nod to show engagement. Patients feel more heard and trust increases by 35%.",
      color: "teal"
    },
    {
      icon: ChatBubbleOvalLeftEllipsisIcon,
      category: "Communication Tip",
      title: "Empathy Building",
      message: "Use phrases like 'I understand this must be concerning' to validate patient emotions and build rapport.",
      color: "pink"
    },

    // Practice Efficiency
    {
      icon: ClipboardDocumentCheckIcon,
      category: "Practice Tip",
      title: "Pre-Consultation Review",
      message: "Reviewing patient health trends before consultations can reduce session time by 25% and improve care quality.",
      color: "orange"
    },
    {
      icon: ClipboardDocumentCheckIcon,
      category: "Practice Tip",
      title: "Documentation Efficiency",
      message: "Document key points during the consultation to reduce post-visit admin time by up to 40%.",
      color: "red"
    },
    {
      icon: LightBulbIcon,
      category: "Practice Tip",
      title: "Time Management",
      message: "Schedule complex cases earlier in the day when your cognitive energy is highest for better outcomes.",
      color: "yellow"
    },

    // Telemedicine Best Practices
    {
      icon: ChatBubbleLeftIcon,
      category: "Telehealth Tip",
      title: "Virtual Presence",
      message: "Look at the camera, not the screen, to maintain eye contact and build better patient rapport in virtual consultations.",
      color: "blue"
    },
    {
      icon: ChatBubbleLeftIcon,
      category: "Telehealth Tip",
      title: "Technical Setup",
      message: "Good lighting and clear audio improve patient satisfaction scores by 45% in telehealth appointments.",
      color: "green"
    },

    // Doctor Wellness
    {
      icon: HeartIcon,
      category: "Doctor Wellness",
      title: "Burnout Prevention",
      message: "Take 2 minutes between patients for deep breathing. Physician burnout affects 50% of doctors - self-care matters.",
      color: "red"
    },
    {
      icon: HeartIcon,
      category: "Doctor Wellness",
      title: "Work-Life Balance",
      message: "Set boundaries with work communications after hours. Well-rested doctors make 23% fewer diagnostic errors.",
      color: "purple"
    },
    {
      icon: HeartIcon,
      category: "Doctor Wellness",
      title: "Stress Management",
      message: "Practice the 4-7-8 breathing technique between difficult cases to reset your mental state and maintain focus.",
      color: "teal"
    }
  ]

  // Get current user data
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch real notification and appointment counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        console.log('📋 Sidebar: Fetching counts...')

        // Fetch notifications, alerts and appointments (same endpoints as Header and Notifications page)
        const [notificationsRes, alertsRes, appointmentsRes] = await Promise.allSettled([
          api.get('/notifications/doctor?limit=50'),
          api.get('/alerts/doctor/notifications?limit=50'),
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

        // Process appointments
        const appointmentsData = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : {}
        const appointments = Array.isArray(appointmentsData.data) ? appointmentsData.data :
                           Array.isArray(appointmentsData) ? appointmentsData : []

        // Count today's appointments
        const today = new Date().toDateString()
        const todayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.dateTime)
          return aptDate.toDateString() === today && apt.status === 'Confirmed'
        }).length

        // Count unread appointment notifications
        const unreadAppointmentNotifications = appointmentNotifications.filter(notif => !notif.isRead).length

        // Count unread health alerts
        const unreadHealthAlerts = alerts.filter(alert => !alert.isRead).length

        // Total notification count = unread appointment notifications + unread health alerts
        const totalNotifications = unreadAppointmentNotifications + unreadHealthAlerts

        console.log('📋 Sidebar counts:')
        console.log('  - Health alerts:', alerts.length, '(', unreadHealthAlerts, 'unread)')
        console.log('  - Total appointments:', appointments.length)
        console.log('  - Today appointments:', todayAppointments)
        console.log('  - Appointment notifications:', appointmentNotifications.length, '(', unreadAppointmentNotifications, 'unread)')
        console.log('  - Total notifications:', totalNotifications)

        setNotificationCount(totalNotifications)
        setAppointmentCount(todayAppointments)

      } catch (err) {
        console.error('❌ Error fetching sidebar counts:', err)
        setNotificationCount(0)
        setAppointmentCount(0)
      }
    }

    fetchCounts()

    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000)

    // Listen for mark all as read events from other components
    const handleNotificationsMarkedAsRead = () => {
      console.log('📋 Sidebar: Received notifications marked as read event, performing silent refresh...');

      // Immediately update UI to show 0 notifications for instant feedback
      setNotificationCount(0);

      // Then fetch fresh data from backend to ensure consistency
      fetchCounts();
    };

    window.addEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);
    }
  }, [])

  // Dynamic navigation with real counts
  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Your Appointments", href: "/your_appointments", icon: CalendarIcon, badge: appointmentCount > 0 ? appointmentCount : null },
    { name: "Notifications", href: "/notifications", icon: BellIcon, badge: notificationCount > 0 ? notificationCount : null },
    { name: "Messages", href: "/messages", icon: ChatBubbleLeftIcon }, // Remove dummy badge
    { name: "Profile", href: "/profile", icon: UserIcon },
  ]

  // Rotate professional tips every 45 seconds
  useEffect(() => {
    const getRandomTip = () => {
      const randomIndex = Math.floor(Math.random() * professionalTips.length)
      setCurrentTip(professionalTips[randomIndex])
    }

    // Set initial tip
    getRandomTip()

    // Rotate tips every 45 seconds
    const interval = setInterval(getRandomTip, 45000)
    return () => clearInterval(interval)
  }, [])

  console.log('📋 Sidebar counts:', { notificationCount, appointmentCount })
  console.log('📋 Sidebar navigation with badges:', navigation.map(item => ({
    name: item.name,
    badge: item.badge
  })))
  console.log('👤 Sidebar profile data:', {
    displayName,
    profilePicture,
    firstName: profileData?.firstName,
    lastName: profileData?.lastName,
    specialization: profileData?.doctorInfo?.specialization
  })

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
              <img
                className="w-10 h-10 rounded-full ring-2 ring-green-100 shadow-sm"
                src={
                  profilePicture ||
                  generateDoctorAvatar(
                    profileData?.firstName || currentUser?.firstName,
                    profileData?.lastName || currentUser?.lastName,
                    80
                  )
                }
                alt="Doctor avatar"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                  {displayName || `${profileData?.doctorInfo?.title || currentUser?.doctorInfo?.title || 'Dr.'} ${profileData?.firstName || currentUser?.firstName || ''} ${profileData?.lastName || currentUser?.lastName || ''}`.trim() || 'Doctor'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {profileData?.doctorInfo?.specialization || 'Medical Professional'}
                </p>
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
                      {item.badge && (
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
                      {item.badge && (
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

        {/* Professional Tips Section */}
        {!isCollapsed && currentTip && (
          <div className="flex-shrink-0 p-4">
            <div className={`bg-gradient-to-br rounded-xl p-4 border transition-all duration-500 ${
              currentTip.color === 'blue' ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800' :
              currentTip.color === 'green' ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800' :
              currentTip.color === 'purple' ? 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-100 dark:border-purple-800' :
              currentTip.color === 'indigo' ? 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-100 dark:border-indigo-800' :
              currentTip.color === 'teal' ? 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-100 dark:border-teal-800' :
              currentTip.color === 'pink' ? 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800' :
              currentTip.color === 'orange' ? 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800' :
              currentTip.color === 'red' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-100 dark:border-red-800' :
              currentTip.color === 'yellow' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-100 dark:border-yellow-800' :
              'from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700/80 border-blue-100 dark:border-slate-600'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentTip.color === 'blue' ? 'bg-blue-100 dark:bg-blue-800' :
                  currentTip.color === 'green' ? 'bg-green-100 dark:bg-green-800' :
                  currentTip.color === 'purple' ? 'bg-purple-100 dark:bg-purple-800' :
                  currentTip.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-800' :
                  currentTip.color === 'teal' ? 'bg-teal-100 dark:bg-teal-800' :
                  currentTip.color === 'pink' ? 'bg-pink-100 dark:bg-pink-800' :
                  currentTip.color === 'orange' ? 'bg-orange-100 dark:bg-orange-800' :
                  currentTip.color === 'red' ? 'bg-red-100 dark:bg-red-800' :
                  currentTip.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-800' :
                  'bg-blue-100 dark:bg-slate-600'
                }`}>
                  <currentTip.icon className={`w-4 h-4 ${
                    currentTip.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                    currentTip.color === 'green' ? 'text-green-600 dark:text-green-300' :
                    currentTip.color === 'purple' ? 'text-purple-600 dark:text-purple-300' :
                    currentTip.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-300' :
                    currentTip.color === 'teal' ? 'text-teal-600 dark:text-teal-300' :
                    currentTip.color === 'pink' ? 'text-pink-600 dark:text-pink-300' :
                    currentTip.color === 'orange' ? 'text-orange-600 dark:text-orange-300' :
                    currentTip.color === 'red' ? 'text-red-600 dark:text-red-300' :
                    currentTip.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-300' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  currentTip.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                  currentTip.color === 'green' ? 'text-green-800 dark:text-green-200' :
                  currentTip.color === 'purple' ? 'text-purple-800 dark:text-purple-200' :
                  currentTip.color === 'indigo' ? 'text-indigo-800 dark:text-indigo-200' :
                  currentTip.color === 'teal' ? 'text-teal-800 dark:text-teal-200' :
                  currentTip.color === 'pink' ? 'text-pink-800 dark:text-pink-200' :
                  currentTip.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                  currentTip.color === 'red' ? 'text-red-800 dark:text-red-200' :
                  currentTip.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-blue-800 dark:text-slate-200'
                }`}>
                  {currentTip.category}
                </span>
              </div>
              <h4 className={`text-xs font-medium mb-1 ${
                currentTip.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                currentTip.color === 'green' ? 'text-green-700 dark:text-green-300' :
                currentTip.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                currentTip.color === 'indigo' ? 'text-indigo-700 dark:text-indigo-300' :
                currentTip.color === 'teal' ? 'text-teal-700 dark:text-teal-300' :
                currentTip.color === 'pink' ? 'text-pink-700 dark:text-pink-300' :
                currentTip.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                currentTip.color === 'red' ? 'text-red-700 dark:text-red-300' :
                currentTip.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                'text-blue-700 dark:text-slate-300'
              }`}>
                {currentTip.title}
              </h4>
              <p className={`text-xs leading-relaxed ${
                currentTip.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                currentTip.color === 'green' ? 'text-green-600 dark:text-green-400' :
                currentTip.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                currentTip.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                currentTip.color === 'teal' ? 'text-teal-600 dark:text-teal-400' :
                currentTip.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                currentTip.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                currentTip.color === 'red' ? 'text-red-600 dark:text-red-400' :
                currentTip.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-700 dark:text-slate-300'
              }`}>
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