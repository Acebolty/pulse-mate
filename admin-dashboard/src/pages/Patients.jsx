import { useState } from "react"
import { motion } from "framer-motion"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showHealthModal, setShowHealthModal] = useState(false)

  // Dummy patient data
  const patients = [
    {
      id: "P001",
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      age: 34,
      gender: "Female",
      phone: "+1 (555) 123-4567",
      status: "critical",
      lastVisit: "2024-01-15",
      doctor: "Dr. Smith",
      healthScore: 65,
      conditions: ["Hypertension", "Diabetes"],
      avatar: null,
      recentReadings: {
        heartRate: 85,
        bloodPressure: "140/90",
        temperature: 98.6,
        glucose: 180,
        weight: 165,
        lastUpdated: "2024-01-25 09:30 AM"
      },
      weeklyData: [
        { day: "Mon", heartRate: 82, bloodPressure: 138, glucose: 175 },
        { day: "Tue", heartRate: 85, bloodPressure: 142, glucose: 180 },
        { day: "Wed", heartRate: 88, bloodPressure: 145, glucose: 185 },
        { day: "Thu", heartRate: 85, bloodPressure: 140, glucose: 178 },
        { day: "Fri", heartRate: 87, bloodPressure: 143, glucose: 182 },
        { day: "Sat", heartRate: 84, bloodPressure: 139, glucose: 176 },
        { day: "Sun", heartRate: 85, bloodPressure: 140, glucose: 180 },
      ],
    },
    {
      id: "P002",
      name: "Bob Wilson",
      email: "bob.wilson@email.com",
      age: 45,
      gender: "Male",
      phone: "+1 (555) 234-5678",
      status: "stable",
      lastVisit: "2024-01-20",
      doctor: "Dr. Brown",
      healthScore: 82,
      conditions: ["High Cholesterol"],
      avatar: null,
      recentReadings: {
        heartRate: 72,
        bloodPressure: "125/80",
        temperature: 98.4,
        glucose: 95,
        weight: 180,
        lastUpdated: "2024-01-25 08:15 AM"
      },
      weeklyData: [
        { day: "Mon", heartRate: 70, bloodPressure: 122, glucose: 92 },
        { day: "Tue", heartRate: 72, bloodPressure: 125, glucose: 95 },
        { day: "Wed", heartRate: 74, bloodPressure: 128, glucose: 98 },
        { day: "Thu", heartRate: 71, bloodPressure: 124, glucose: 94 },
        { day: "Fri", heartRate: 73, bloodPressure: 126, glucose: 96 },
        { day: "Sat", heartRate: 70, bloodPressure: 123, glucose: 93 },
        { day: "Sun", heartRate: 72, bloodPressure: 125, glucose: 95 },
      ],
    },
    {
      id: "P003",
      name: "Carol Davis",
      email: "carol.davis@email.com",
      age: 28,
      gender: "Female",
      phone: "+1 (555) 345-6789",
      status: "healthy",
      lastVisit: "2024-01-18",
      doctor: "Dr. Johnson",
      healthScore: 95,
      conditions: [],
      avatar: null,
      recentReadings: {
        heartRate: 68,
        bloodPressure: "110/70",
        temperature: 98.2,
        glucose: 85,
        weight: 125,
        lastUpdated: "2024-01-25 07:45 AM"
      },
      weeklyData: [
        { day: "Mon", heartRate: 66, bloodPressure: 108, glucose: 82 },
        { day: "Tue", heartRate: 68, bloodPressure: 110, glucose: 85 },
        { day: "Wed", heartRate: 70, bloodPressure: 112, glucose: 88 },
        { day: "Thu", heartRate: 67, bloodPressure: 109, glucose: 84 },
        { day: "Fri", heartRate: 69, bloodPressure: 111, glucose: 86 },
        { day: "Sat", heartRate: 66, bloodPressure: 108, glucose: 83 },
        { day: "Sun", heartRate: 68, bloodPressure: 110, glucose: 85 },
      ],
    },
    {
      id: "P004",
      name: "David Miller",
      email: "david.miller@email.com",
      age: 52,
      gender: "Male",
      phone: "+1 (555) 456-7890",
      status: "warning",
      lastVisit: "2024-01-12",
      doctor: "Dr. Smith",
      healthScore: 73,
      conditions: ["Asthma"],
      avatar: null,
      recentReadings: {
        heartRate: 78,
        bloodPressure: "130/85",
        temperature: 98.8,
        glucose: 105,
        weight: 190,
        lastUpdated: "2024-01-25 06:20 AM"
      },
      weeklyData: [
        { day: "Mon", heartRate: 76, bloodPressure: 128, glucose: 102 },
        { day: "Tue", heartRate: 78, bloodPressure: 130, glucose: 105 },
        { day: "Wed", heartRate: 80, bloodPressure: 132, glucose: 108 },
        { day: "Thu", heartRate: 77, bloodPressure: 129, glucose: 104 },
        { day: "Fri", heartRate: 79, bloodPressure: 131, glucose: 106 },
        { day: "Sat", heartRate: 76, bloodPressure: 128, glucose: 103 },
        { day: "Sun", heartRate: 78, bloodPressure: 130, glucose: 105 },
      ],
    },
    {
      id: "P005",
      name: "Emma Thompson",
      email: "emma.thompson@email.com",
      age: 39,
      gender: "Female",
      phone: "+1 (555) 567-8901",
      status: "stable",
      lastVisit: "2024-01-22",
      doctor: "Dr. Wilson",
      healthScore: 88,
      conditions: ["Migraine"],
      avatar: null,
      recentReadings: {
        heartRate: 75,
        bloodPressure: "118/75",
        temperature: 98.3,
        glucose: 90,
        weight: 140,
        lastUpdated: "2024-01-25 10:15 AM"
      },
      weeklyData: [
        { day: "Mon", heartRate: 73, bloodPressure: 116, glucose: 87 },
        { day: "Tue", heartRate: 75, bloodPressure: 118, glucose: 90 },
        { day: "Wed", heartRate: 77, bloodPressure: 120, glucose: 93 },
        { day: "Thu", heartRate: 74, bloodPressure: 117, glucose: 89 },
        { day: "Fri", heartRate: 76, bloodPressure: 119, glucose: 91 },
        { day: "Sat", heartRate: 73, bloodPressure: 116, glucose: 88 },
        { day: "Sun", heartRate: 75, bloodPressure: 118, glucose: 90 },
      ],
    },
  ]

  const getStatusColor = (status) => {
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      stable: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      healthy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    }
    return colors[status] || colors.stable
  }

  const getStatusIcon = (status) => {
    const icons = {
      critical: ExclamationTriangleIcon,
      warning: ExclamationTriangleIcon,
      stable: HeartIcon,
      healthy: CheckCircleIcon,
    }
    const Icon = icons[status] || HeartIcon
    return <Icon className="w-4 h-4" />
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "age":
        return a.age - b.age
      case "healthScore":
        return b.healthScore - a.healthScore
      case "lastVisit":
        return new Date(b.lastVisit) - new Date(a.lastVisit)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Patient Management
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Monitor and manage all registered patients
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="stable">Stable</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="healthScore">Sort by Health Score</option>
              <option value="lastVisit">Sort by Last Visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Health Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Health Data
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedPatients.map((patient, index) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  {/* Patient Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold text-sm">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          ID: {patient.id}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1 capitalize">{patient.status}</span>
                    </span>
                  </td>

                  {/* Age/Gender */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {patient.age} years
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {patient.gender}
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {patient.doctor}
                    </div>
                  </td>

                  {/* Health Score */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-bold ${
                        patient.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                        patient.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {patient.healthScore}/100
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            patient.healthScore >= 80 ? 'bg-green-500' :
                            patient.healthScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${patient.healthScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Last Visit */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Health Data */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient)
                        setShowHealthModal(true)
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      <ChartBarIcon className="w-3 h-3" />
                      <span>View Data</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {sortedPatients.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No patients found
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Health Data Modal */}
      {showHealthModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPatient.name} - Health Data
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Patient ID: {selectedPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHealthModal(false)
                  setSelectedPatient(null)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Recent Readings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Readings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <HeartIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">Heart Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {selectedPatient.recentReadings.heartRate} bpm
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-5 h-5 text-blue-600 dark:text-blue-400 text-lg">🩸</span>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Blood Pressure</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {selectedPatient.recentReadings.bloodPressure}
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-5 h-5 text-yellow-600 dark:text-yellow-400 text-lg">🌡️</span>
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Temperature</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {selectedPatient.recentReadings.temperature}°F
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-5 h-5 text-purple-600 dark:text-purple-400 text-lg">🍯</span>
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Glucose</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {selectedPatient.recentReadings.glucose} mg/dL
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-5 h-5 text-green-600 dark:text-green-400 text-lg">⚖️</span>
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Weight</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {selectedPatient.recentReadings.weight} lbs
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-5 h-5 text-gray-600 dark:text-slate-400 text-lg">🕒</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-300">Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {selectedPatient.recentReadings.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Day Charts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Past 7 Days Trends
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Heart Rate Chart */}
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Heart Rate (bpm)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={selectedPatient.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Blood Pressure Chart */}
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Blood Pressure (Systolic)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={selectedPatient.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Glucose Chart */}
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl lg:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Glucose Level (mg/dL)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={selectedPatient.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="glucose" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              {selectedPatient.conditions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Medical Conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.conditions.map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-sm rounded-2xl border border-orange-200 dark:border-orange-800"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-slate-700 p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowHealthModal(false)
                    setSelectedPatient(null)
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-all duration-200"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                  Generate Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Patients
