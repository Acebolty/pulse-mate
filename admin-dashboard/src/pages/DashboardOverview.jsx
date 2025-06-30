import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { getDashboardOverview } from "../services/adminService"

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await getDashboardOverview()
        setDashboardData(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
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
      title: "Active Doctors",
      value: dashboardData.overview.totalDoctors.toLocaleString(),
      change: `+${dashboardData.growth.doctors}%`,
      changeType: "increase",
      icon: ShieldCheckIcon,
      color: "green",
    },
    {
      title: "Total Appointments",
      value: dashboardData.overview.totalAppointments.toLocaleString(),
      change: `+${dashboardData.growth.appointments}%`,
      changeType: dashboardData.growth.appointments > 0 ? "increase" : "decrease",
      icon: CalendarIcon,
      color: "yellow",
    },
    {
      title: "Recent Alerts",
      value: dashboardData.overview.recentAlerts.toLocaleString(),
      change: "Last 7 days",
      changeType: "neutral",
      icon: ExclamationTriangleIcon,
      color: "red",
    },
  ] : []

  const recentActivity = [
    {
      id: 1,
      type: "appointment",
      message: "New appointment scheduled by Dr. Smith",
      time: "5 minutes ago",
      icon: CalendarIcon,
    },
    {
      id: 2,
      type: "alert",
      message: "Critical health alert for Patient #1234",
      time: "12 minutes ago",
      icon: ExclamationTriangleIcon,
    },
    {
      id: 3,
      type: "user",
      message: "New doctor registration: Dr. Johnson",
      time: "1 hour ago",
      icon: ShieldCheckIcon,
    },
    {
      id: 4,
      type: "patient",
      message: "Patient data updated: Alice Cooper",
      time: "2 hours ago",
      icon: UserGroupIcon,
    },
  ]

  const pendingApprovals = [
    {
      id: 1,
      type: "Doctor Registration",
      name: "Dr. Emily Watson",
      specialty: "Cardiology",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "Appointment Request",
      name: "John Doe",
      doctor: "Dr. Smith",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "System Access",
      name: "Dr. Michael Brown",
      department: "Emergency",
      time: "6 hours ago",
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      green: "from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
      yellow: "from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
      red: "from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    }
    return colors[color] || colors.blue
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-green-100">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
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
        {dashboardData && (
          <div className="mt-4 text-sm text-green-100">
            <p>System Status: {dashboardData.systemHealth.status} • Uptime: {Math.floor(dashboardData.systemHealth.uptime / 3600)}h</p>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-200"
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
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getColorClasses(metric.color).split(' ')[0]} ${getColorClasses(metric.color).split(' ')[1]} flex items-center justify-center shadow-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
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
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-gray-600 dark:text-slate-400" />
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
            ))}
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Approvals
            </h2>
            <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">
              {pendingApprovals.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {approval.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {approval.name}
                    </p>
                    {approval.specialty && (
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        {approval.specialty}
                      </p>
                    )}
                    {approval.doctor && (
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        with {approval.doctor}
                      </p>
                    )}
                    {approval.department && (
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        {approval.department} Department
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg">
                      Reject
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                  {approval.time}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardOverview
