"use client"

import { useState } from "react"
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  KeyIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline"

// Dummy user data
const userSettings = {
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    profilePicture: null,
    timezone: "America/New_York",
    language: "English",
  },
  privacy: {
    profileVisibility: "healthcare-providers",
    dataSharing: true,
    researchParticipation: false,
    marketingEmails: false,
    thirdPartySharing: false,
    anonymousAnalytics: true,
  },
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    medicationReminders: true,
    healthAlerts: true,
    labResults: true,
    messageNotifications: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  health: {
    units: "imperial", // imperial or metric
    glucoseUnit: "mg/dL", // mg/dL or mmol/L
    temperatureUnit: "fahrenheit", // fahrenheit or celsius
    autoSync: true,
    dataRetention: "5-years", // 1-year, 3-years, 5-years, forever
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
  },
  security: {
    twoFactorEnabled: true,
    biometricLogin: false,
    sessionTimeout: "30-minutes",
    loginAlerts: true,
  },
  appearance: {
    theme: "system", // light, dark, system
    fontSize: "medium", // small, medium, large
    colorScheme: "green", // green, blue, purple
  },
}

const connectedDevices = [
  {
    id: 1,
    name: "Apple Watch Series 8",
    type: "Smartwatch",
    status: "Connected",
    lastSync: "2 minutes ago",
    batteryLevel: 85,
  },
  {
    id: 2,
    name: "Blood Pressure Monitor",
    type: "Medical Device",
    status: "Connected",
    lastSync: "1 hour ago",
    batteryLevel: null,
  },
  {
    id: 3,
    name: "Glucose Monitor",
    type: "Medical Device",
    status: "Disconnected",
    lastSync: "3 hours ago",
    batteryLevel: 45,
  },
  {
    id: 4,
    name: "Smart Scale",
    type: "Health Device",
    status: "Connected",
    lastSync: "This morning",
    batteryLevel: null,
  },
]

const Settings = () => {
  const [activeTab, setActiveTab] = useState("privacy")
  const [settings, setSettings] = useState(userSettings)
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const tabs = [
    { id: "privacy", label: "Privacy", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "health", label: "Health Settings", icon: HeartIcon },
    { id: "devices", label: "Connected Devices", icon: DevicePhoneMobileIcon },
    { id: "security", label: "Security", icon: KeyIcon },
    { id: "appearance", label: "Appearance", icon: CogIcon },
  ]

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasUnsavedChanges(true)
  }

  const handleNestedSettingChange = (section, nestedKey, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...prev[section][nestedKey],
          [key]: value,
        },
      },
    }))
    setHasUnsavedChanges(true)
  }

  const saveSettings = () => {
    // Here you would save settings to your backend
    console.log("Saving settings:", settings)
    setHasUnsavedChanges(false)
    // Show success message
  }

  const resetSettings = () => {
    setSettings(userSettings)
    setHasUnsavedChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your account preferences and privacy settings</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0">
            <button
              onClick={resetSettings}
              className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={saveSettings}
              className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-700/30 border border-yellow-200 dark:border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">You have unsaved changes. Don't forget to save your settings.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto"> {/* Moved overflow-x-auto here */}
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-2 sm:px-4 md:px-6 whitespace-nowrap"> {/* Added whitespace-nowrap and responsive spacing/padding */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {/* Icon color will inherit from text color */}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Privacy & Data Control</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Profile Visibility */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Profile Visibility</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Control who can see your profile information</p>
                    </div>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange("privacy", "profileVisibility", e.target.value)}
                      className="w-full sm:w-auto mt-1 sm:mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="healthcare-providers">Healthcare Providers Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {/* Data Sharing with Providers */}
                  {/* THIS BLOCK WAS ALREADY MODIFIED IN A PREVIOUS FAILED DIFF, VERIFYING IT'S CORRECT */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Data Sharing with Providers</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Allow healthcare providers to access your health data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => handleSettingChange("privacy", "dataSharing", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Research Participation */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Research Participation</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Allow anonymized data to be used for medical research</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.researchParticipation}
                        onChange={(e) => handleSettingChange("privacy", "researchParticipation", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Marketing Communications */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Marketing Communications</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive promotional emails and health tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.marketingEmails}
                        onChange={(e) => handleSettingChange("privacy", "marketingEmails", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Anonymous Analytics */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Anonymous Analytics</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Help improve our services with anonymous usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.anonymousAnalytics}
                        onChange={(e) => handleSettingChange("privacy", "anonymousAnalytics", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Download My Data</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">Get a copy of all your health data</p>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm">Export</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 border border-red-200 dark:border-red-500/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-700/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300">Delete My Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                      </div>
                      <span className="text-red-600 dark:text-red-400 text-sm">Delete</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Notification Preferences</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Push Notifications */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Push Notifications</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Email Notifications</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">SMS Notifications</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive critical alerts via text message</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Health Notifications</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Appointment Reminders */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Appointment Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Get reminded about upcoming appointments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.appointmentReminders}
                        onChange={(e) => handleSettingChange("notifications", "appointmentReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Medication Reminders */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Medication Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Never miss your medication schedule</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.medicationReminders}
                        onChange={(e) => handleSettingChange("notifications", "medicationReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Health Alerts */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Health Alerts</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Critical health notifications and warnings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.healthAlerts}
                        onChange={(e) => handleSettingChange("notifications", "healthAlerts", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Quiet Hours</h3>
                <div className="p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg">
                  <div className="flex flex-col items-start space-y-2 mb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Enable Quiet Hours</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Pause non-critical notifications during specified hours</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.quietHoursEnabled}
                        onChange={(e) => handleSettingChange("notifications", "quietHoursEnabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {settings.notifications.quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={settings.notifications.quietHoursStart}
                          onChange={(e) => handleSettingChange("notifications", "quietHoursStart", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">End Time</label>
                        <input
                          type="time"
                          value={settings.notifications.quietHoursEnd}
                          onChange={(e) => handleSettingChange("notifications", "quietHoursEnd", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Health Settings */}
          {activeTab === "health" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Health Data Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> {/* Adjusted gap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Measurement Units</label>
                    <select
                      value={settings.health.units}
                      onChange={(e) => handleSettingChange("health", "units", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="imperial">Imperial (lbs, ft, °F)</option>
                      <option value="metric">Metric (kg, cm, °C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Glucose Units</label>
                    <select
                      value={settings.health.glucoseUnit}
                      onChange={(e) => handleSettingChange("health", "glucoseUnit", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="mg/dL">mg/dL</option>
                      <option value="mmol/L">mmol/L</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Temperature Units</label>
                    <select
                      value={settings.health.temperatureUnit}
                      onChange={(e) => handleSettingChange("health", "temperatureUnit", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                      <option value="celsius">Celsius (°C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Data Retention</label>
                    <select
                      value={settings.health.dataRetention}
                      onChange={(e) => handleSettingChange("health", "dataRetention", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="1-year">1 Year</option>
                      <option value="3-years">3 Years</option>
                      <option value="5-years">5 Years</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Data Sync</h3>
                <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Automatic Data Sync</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Automatically sync data from connected devices</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                    <input
                      type="checkbox"
                      checked={settings.health.autoSync}
                      onChange={(e) => handleSettingChange("health", "autoSync", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"> {/* Adjusted gap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Name</label>
                    <input
                      type="text"
                      value={settings.health.emergencyContact.name}
                      onChange={(e) => handleNestedSettingChange("health", "emergencyContact", "name", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 sm:mb-2">Relationship</label>
                    <input
                      type="text"
                      value={settings.health.emergencyContact.relationship}
                      onChange={(e) =>
                        handleNestedSettingChange("health", "emergencyContact", "relationship", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={settings.health.emergencyContact.phone}
                      onChange={(e) => handleNestedSettingChange("health", "emergencyContact", "phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Connected Devices</h3>
                <div className="space-y-3 sm:space-y-4">
                  {connectedDevices.map((device) => (
                    <div key={device.id} className="border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-700/30 rounded-lg">
                            <DevicePhoneMobileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">{device.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">{device.type}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Last sync: {device.lastSync}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start space-y-2 w-full sm:w-auto sm:items-end sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
                          {device.batteryLevel && (
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Battery: {device.batteryLevel}%</div>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${
                              device.status === "Connected" 
                                ? "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300" 
                                : "bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300"
                            }`}
                          >
                            {device.status}
                          </span>
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium">
                            {device.status === "Connected" ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 p-3 sm:p-4 text-sm border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                  + Add New Device
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Account Security</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Two-Factor Authentication */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Two-Factor Authentication</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 mt-1 sm:mt-0 self-end sm:self-auto">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          settings.security.twoFactorEnabled
                            ? "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200"
                        }`}
                      >
                        {settings.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium">
                        {settings.security.twoFactorEnabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>

                  {/* Biometric Login */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Biometric Login</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Use fingerprint or face recognition to log in</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.security.biometricLogin}
                        onChange={(e) => handleSettingChange("security", "biometricLogin", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Session Timeout */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Session Timeout</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Automatically log out after inactivity</p>
                    </div>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange("security", "sessionTimeout", e.target.value)}
                      className="w-full sm:w-auto mt-1 sm:mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="15-minutes">15 minutes</option>
                      <option value="30-minutes">30 minutes</option>
                      <option value="1-hour">1 hour</option>
                      <option value="4-hours">4 hours</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  {/* Login Alerts */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Login Alerts</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => handleSettingChange("security", "loginAlerts", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Password & Authentication</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Change Password</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">Update your account password</p>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0 self-end sm:self-auto">Change</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Login History</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">View recent login activity</p>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0 self-end sm:self-auto">View</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "light")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.theme === "light"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <SunIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-yellow-500 dark:text-yellow-400" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Light</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "dark")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.theme === "dark"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <MoonIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-gray-700 dark:text-slate-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Dark</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "system")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.theme === "system"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <ComputerDesktopIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-gray-700 dark:text-slate-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">System</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Font Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "small")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.fontSize === "small"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Small</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Compact view</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "medium")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.fontSize === "medium"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Medium</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Default size</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "large")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.fontSize === "large"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Large</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Easy reading</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "green")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.colorScheme === "green"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Green</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "blue")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.colorScheme === "blue"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Blue</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "purple")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settings.appearance.colorScheme === "purple"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Purple</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 text-sm sm:px-4 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button className="px-3 py-2 text-sm sm:px-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-700/20 rounded-lg transition-colors">
                Delete Account
              </button>
              <button className="px-3 py-2 text-sm sm:px-4 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
