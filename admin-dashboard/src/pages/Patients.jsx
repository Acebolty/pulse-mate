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
        <button className="mt-4 sm:mt-0 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
          Add New Patient
        </button>
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
                  Conditions
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

                  {/* Conditions */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {patient.conditions.length > 0 ? (
                        patient.conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300 text-xs rounded-xl"
                          >
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-slate-500">None</span>
                      )}
                    </div>
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
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
            Add First Patient
          </button>
        </div>
      )}
    </div>
  )
}

export default Patients
