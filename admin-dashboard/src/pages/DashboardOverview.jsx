import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,

  UserPlusIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"
import { getDashboardOverview, getRecentActivities, getPendingAppointments, approveAppointment, rejectAppointment } from "../services/adminService"

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch dashboard overview, recent activities, and pending appointments
        const [dashboardResponse, activitiesResponse, appointmentsResponse] = await Promise.allSettled([
          getDashboardOverview(),
          getRecentActivities(10),
          getPendingAppointments()
        ])

        // Handle dashboard data
        if (dashboardResponse.status === 'fulfilled') {
          setDashboardData(dashboardResponse.value.data)
        } else {
          console.error('Error fetching dashboard data:', dashboardResponse.reason)
        }

        // Handle activities data
        if (activitiesResponse.status === 'fulfilled') {
          setRecentActivities(activitiesResponse.value.data)
        } else {
          console.error('Error fetching recent activities:', activitiesResponse.reason)
          // Fall back to static data if API fails
          setRecentActivities(staticRecentActivity)
        }

        // Handle pending appointments data
        if (appointmentsResponse.status === 'fulfilled') {
          console.log('📋 Dashboard pending appointments response:', appointmentsResponse.value)
          setPendingAppointments(appointmentsResponse.value.appointments || [])
        } else {
          console.error('Error fetching pending appointments:', appointmentsResponse.reason)
          setPendingAppointments([])
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        // Fall back to static data if API fails
        setRecentActivities(staticRecentActivity)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Create metrics array from real data
  const metrics = dashboardData ? [
    {
      title: "Total Patients",
      value: dashboardData.overview.totalPatients.toLocaleString(),
      change: `+${dashboardData.growth.patients}%`,
      changeType: "increase",
      icon: UserGroupIcon,
      color: "blue",
    },
    {
      title: "Total Providers",
      value: dashboardData.overview.totalProviders.toLocaleString(),
      change: `+${dashboardData.growth.doctors}%`,
      changeType: "increase",
      icon: ShieldCheckIcon,
      color: "green",
    },
    {
      title: "Active Providers",
      value: dashboardData.overview.activeProviders.toLocaleString(),
      change: `${dashboardData.overview.totalProviders > 0 ? Math.round((dashboardData.overview.activeProviders / dashboardData.overview.totalProviders) * 100) : 0}% accepting patients`,
      changeType: "increase",
      icon: CheckCircleIcon,
      color: "emerald",
    },
    {
      title: "Total Appointments",
      value: dashboardData.overview.totalAppointments.toLocaleString(),
      change: `+${dashboardData.growth.appointments}%`,
      changeType: dashboardData.growth.appointments > 0 ? "increase" : "decrease",
      icon: CalendarIcon,
      color: "yellow",
    },
  ] : []

  // Static fallback data for when API fails
  const staticRecentActivity = [
    {
      id: 1,
      type: "patient_signup",
      message: "New patient registration: Sarah Johnson",
      time: "3 minutes ago",
      icon: UserPlusIcon,
      color: "blue",
    },
    {
      id: 2,
      type: "doctor_signup",
      message: "New provider registration: Dr. Michael Chen",
      time: "15 minutes ago",
      icon: ShieldCheckIcon,
      color: "green",
    },
    {
      id: 3,
      type: "appointment_booked",
      message: "Appointment booked: Emma Wilson with Dr. Smith",
      time: "32 minutes ago",
      icon: CalendarIcon,
      color: "yellow",
    },
    {
      id: 4,
      type: "chat_opened",
      message: "Dr. Rodriguez opened chat session with Patient #1247",
      time: "1 hour ago",
      icon: ChatBubbleLeftRightIcon,
      color: "emerald",
    },
    {
      id: 5,
      type: "appointment_completed",
      message: "Dr. Thompson completed session with Patient #1156",
      time: "2 hours ago",
      icon: CheckCircleIcon,
      color: "purple",
    },
  ]

  // Static pending approvals removed - now using real data from API

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      green: "from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
      emerald: "from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
      yellow: "from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
      red: "from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
      purple: "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    }
    return colors[color] || colors.blue
  }

  const getActivityIconClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    }
    return colors[color] || colors.blue
  }

  const getActivityIcon = (type) => {
    const icons = {
      patient_signup: UserPlusIcon,
      doctor_signup: ShieldCheckIcon,
      appointment_booked: CalendarIcon,
      chat_opened: ChatBubbleLeftRightIcon,
      appointment_completed: CheckCircleIcon,
    }
    return icons[type] || UserGroupIcon
  }

  const handleApproveAppointment = async (appointmentId) => {
    try {
      await approveAppointment(appointmentId)
      // Refresh pending appointments
      const response = await getPendingAppointments()
      setPendingAppointments(response.appointments || [])
    } catch (error) {
      console.error('Error approving appointment:', error)
    }
  }

  const handleRejectAppointment = async (appointmentId) => {
    try {
      await rejectAppointment(appointmentId)
      // Refresh pending appointments
      const response = await getPendingAppointments()
      setPendingAppointments(response.appointments || [])
    } catch (error) {
      console.error('Error rejecting appointment:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-green-100">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-red-100">{error}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            Unable to load dashboard data. Please check if the backend server is running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-green-100">
          Monitor and manage your PulseMate healthcare system
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <p className={`text-sm mt-1 ${
                  metric.changeType === 'increase' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.change} from last month
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getColorClasses(metric.color).split(' ')[0]} ${getColorClasses(metric.color).split(' ')[1]} flex items-center justify-center shadow-lg`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {!recentActivities || recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                <p className="text-sm text-gray-500 dark:text-slate-400">No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${getActivityIconClasses(activity.color)}`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center mt-1">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
              )
            })
            )}
          </div>
        </motion.div>

        {/* Pending Appointments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Appointments
            </h2>
            <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">
              {pendingAppointments?.length || 0} pending
            </span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Loading appointments...</p>
              </div>
            ) : !pendingAppointments || pendingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                <p className="text-sm text-gray-500 dark:text-slate-400">No pending appointments</p>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Appointment Request
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        {appointment.userId?.firstName} {appointment.userId?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        with {appointment.providerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        Reason: {appointment.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        Date: {new Date(appointment.dateTime).toLocaleDateString()} at {new Date(appointment.dateTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveAppointment(appointment._id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectAppointment(appointment._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                    {new Date(appointment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardOverview
