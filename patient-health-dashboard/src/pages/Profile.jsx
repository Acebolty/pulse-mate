"use client"

import { useState } from "react"
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ShieldCheckIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"

// Dummy user data
const userData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    address: "123 Health Street, Wellness City, WC 12345",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
  },
  medicalInfo: {
    bloodType: "O+",
    height: "5'10\"",
    weight: "175 lbs",
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily" },
    ],
    primaryDoctor: {
      name: "Dr. Sarah Wilson",
      specialty: "Internal Medicine",
      phone: "+1 (555) 234-5678",
      email: "s.wilson@healthcenter.com",
    },
  },
  deviceSettings: {
    connectedDevices: [
      { name: "Apple Watch Series 8", status: "Connected", lastSync: "2 minutes ago" },
      { name: "Blood Pressure Monitor", status: "Connected", lastSync: "1 hour ago" },
      { name: "Glucose Monitor", status: "Disconnected", lastSync: "3 hours ago" },
      { name: "Smart Scale", status: "Connected", lastSync: "This morning" },
    ],
    notifications: {
      pushNotifications: true,
      emailAlerts: true,
      smsAlerts: false,
      criticalAlertsOnly: false,
    },
  },
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userData)

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: UserIcon },
    { id: "medical", label: "Medical Info", icon: HeartIcon },
    { id: "devices", label: "Connected Devices", icon: DevicePhoneMobileIcon },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Profile Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your personal information and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 text-sm sm:px-4 sm:py-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors mt-3 sm:mt-0"
        >
          <PencilIcon className="w-4 h-4" />
          <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-700/30 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
              <CameraIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex-1 mt-4 sm:mt-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
              {formData.personalInfo.firstName} {formData.personalInfo.lastName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300">Patient ID: #12345</p>
            <div className="flex flex-col space-y-1 items-center mt-2 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{calculateAge(formData.personalInfo.dateOfBirth)} years old</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Wellness City, WC</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Last active: 2 minutes ago</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 text-center sm:text-right">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-1">Health Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">87</div>
            <div className="text-2xs sm:text-xs text-gray-500 dark:text-slate-400">Excellent</div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto"> {/* Moved overflow-x-auto here */}
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-2 sm:px-4 md:px-6 whitespace-nowrap"> {/* Added whitespace-nowrap */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {/* Icon color will be inherited from text color */}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Gender</label>
                  <select
                    value={formData.personalInfo.gender}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Address</label>
                <textarea
                  value={formData.personalInfo.address}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.personalInfo.emergencyContact.name}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.personalInfo.emergencyContact.relationship}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.personalInfo.emergencyContact.phone}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === "medical" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Blood Type</label>
                  <input
                    type="text"
                    value={formData.medicalInfo.bloodType}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Height</label>
                  <input
                    type="text"
                    value={formData.medicalInfo.height}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Weight</label>
                  <input
                    type="text"
                    value={formData.medicalInfo.weight}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalInfo.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-full text-sm text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500">
                      + Add Allergy
                    </button>
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalInfo.chronicConditions.map((condition, index) => (
                    <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-600/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-full text-sm text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500">
                      + Add Condition
                    </button>
                  )}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Current Medications</h3>
                <div className="space-y-3">
                  {formData.medicalInfo.medications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{medication.name}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-300">
                          {medication.dosage} - {medication.frequency}
                        </p>
                      </div>
                      {isEditing && (
                        <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500">
                      + Add Medication
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Doctor */}
              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Primary Healthcare Provider</h3>
                <div className="bg-green-50 dark:bg-green-700/20 border border-green-200 dark:border-green-600/40 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col items-center text-center space-y-3 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation if needed */}
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-slate-100">{formData.medicalInfo.primaryDoctor.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">{formData.medicalInfo.primaryDoctor.specialty}</p>
                      <div className="flex flex-col items-center sm:items-start space-y-0.5 sm:space-y-0 sm:flex-row sm:space-x-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                        <span>{formData.medicalInfo.primaryDoctor.phone}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formData.medicalInfo.primaryDoctor.email}</span>
                      </div>
                    </div>
                    <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex-shrink-0 mt-2 sm:mt-0">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected Devices Tab */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.deviceSettings.connectedDevices.map((device, index) => (
                  <div key={index} className="border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-slate-100">{device.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          device.status === "Connected" 
                            ? "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300" 
                            : "bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300"
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-2 sm:mb-3">Last sync: {device.lastSync}</p>
                    <div className="flex flex-wrap gap-2"> {/* Use flex-wrap and gap for button adaptability */}
                      <button className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                        {device.status === "Connected" ? "Sync Now" : "Reconnect"}
                      </button>
                      <button className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 font-medium">Settings</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-slate-700 pt-6">
                <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
                  + Add New Device
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Security Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Data Sharing Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Share data with healthcare providers</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Allow data for medical research</span>
                    <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Share anonymized data for health insights</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Account Security</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-slate-100">Change Password</span>
                      <span className="text-sm text-gray-500 dark:text-slate-400">Last changed 3 months ago</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-slate-100">Two-Factor Authentication</span>
                      <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-slate-100">Login History</span>
                      <span className="text-sm text-gray-500 dark:text-slate-400">View recent activity</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Push Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Receive notifications on your device</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={formData.deviceSettings.notifications.pushNotifications}
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Email Alerts</span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Receive health alerts via email</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={formData.deviceSettings.notifications.emailAlerts}
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">SMS Alerts</span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Receive critical alerts via text message</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={formData.deviceSettings.notifications.smsAlerts}
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Critical Alerts Only</span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Only receive notifications for critical health events</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={formData.deviceSettings.notifications.criticalAlertsOnly}
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Notification Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quiet Hours Start</label>
                    <input
                      type="time"
                      defaultValue="22:00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quiet Hours End</label>
                    <input
                      type="time"
                      defaultValue="07:00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
