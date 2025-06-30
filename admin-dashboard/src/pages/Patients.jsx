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
} from "@heroicons/react/24/outline"

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Patient Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Monitor and manage all registered patients
          </p>
        </div>
        <button className="mt-4 sm:mt-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
          Add New Patient
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="healthScore">Sort by Health Score</option>
              <option value="lastVisit">Sort by Last Visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            {/* Patient Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    ID: {patient.id}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(patient.status)}`}>
                {getStatusIcon(patient.status)}
                <span className="capitalize">{patient.status}</span>
              </span>
            </div>

            {/* Patient Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Age:</span>
                <span className="text-gray-900 dark:text-white">{patient.age}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Gender:</span>
                <span className="text-gray-900 dark:text-white">{patient.gender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Doctor:</span>
                <span className="text-gray-900 dark:text-white">{patient.doctor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Health Score:</span>
                <span className={`font-medium ${
                  patient.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                  patient.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {patient.healthScore}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Last Visit:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Conditions */}
            {patient.conditions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedPatients.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No patients found
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}

export default Patients
