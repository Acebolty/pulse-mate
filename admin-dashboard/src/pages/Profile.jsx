import { useState } from "react"
import { motion } from "framer-motion"
import {
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline"

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)

  // Dummy admin data
  const adminData = {
    id: "ADMIN-001",
    firstName: "Admin",
    lastName: "User",
    email: "admin@pulsemate.com",
    phone: "+1 (555) 000-0000",
    role: "System Administrator",
    department: "IT Administration",
    joinDate: "2023-01-15",
    lastLogin: "2024-01-25 09:30 AM",
    permissions: [
      "User Management",
      "System Configuration",
      "Data Access",
      "Report Generation",
      "Security Settings",
      "Backup Management",
    ],
    recentActivity: [
      {
        id: 1,
        action: "Approved doctor registration",
        target: "Dr. Emily Watson",
        timestamp: "2024-01-25 08:45 AM",
        type: "approval",
      },
      {
        id: 2,
        action: "Updated system settings",
        target: "Notification preferences",
        timestamp: "2024-01-24 03:20 PM",
        type: "system",
      },
      {
        id: 3,
        action: "Generated monthly report",
        target: "Patient statistics",
        timestamp: "2024-01-24 10:15 AM",
        type: "report",
      },
      {
        id: 4,
        action: "Deactivated user account",
        target: "Dr. John Smith",
        timestamp: "2024-01-23 02:30 PM",
        type: "user",
      },
    ],
  }

  const tabs = [
    { id: "profile", name: "Profile Information", icon: UserIcon },
    { id: "permissions", name: "Permissions", icon: ShieldCheckIcon },
    { id: "activity", name: "Activity Log", icon: ClockIcon },
    { id: "settings", name: "Settings", icon: Cog6ToothIcon },
  ]

  const getActivityIcon = (type) => {
    const icons = {
      approval: ShieldCheckIcon,
      system: Cog6ToothIcon,
      report: EyeIcon,
      user: UserIcon,
    }
    return icons[type] || ClockIcon
  }

  const getActivityColor = (type) => {
    const colors = {
      approval: "text-green-600 dark:text-green-400",
      system: "text-blue-600 dark:text-blue-400",
      report: "text-purple-600 dark:text-purple-400",
      user: "text-orange-600 dark:text-orange-400",
    }
    return colors[type] || "text-gray-600 dark:text-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {adminData.firstName[0]}{adminData.lastName[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {adminData.firstName} {adminData.lastName}
            </h1>
            <p className="text-green-100">{adminData.role}</p>
            <p className="text-green-200 text-sm">ID: {adminData.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={adminData.firstName}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={adminData.lastName}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminData.email}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={adminData.phone}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={adminData.role}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={adminData.department}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Join Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(adminData.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Last Login
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {adminData.lastLogin}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Permissions Tab */}
          {activeTab === "permissions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Permissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminData.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {permission}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {adminData.recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {activity.action}
                        </p>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                          {activity.target}
                        </p>
                        <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Change Password
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BellIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Notification Preferences
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Manage your notification settings
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
