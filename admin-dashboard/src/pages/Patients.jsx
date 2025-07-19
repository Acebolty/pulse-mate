import { useState, useEffect } from "react"
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
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  BeakerIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getAllPatients } from '../services/adminService'
import api from '../services/api'

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [patientDetailData, setPatientDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch patients data
  useEffect(() => {
    fetchPatients()
  }, [searchTerm, filterStatus])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        search: searchTerm,
        healthStatus: filterStatus === 'all' ? '' : filterStatus,
        limit: 50 // Get more patients for admin view
      }

      console.log('📋 Fetching patients with params:', params)
      const response = await getAllPatients(params)
      console.log('📋 Admin patients response:', response)

      if (response.success) {
        // Process patients data and calculate health status
        const processedPatients = response.patients.map(patient => {
          console.log('📊 Processing patient:', patient.firstName, 'Health data count:', patient.recentHealthData?.length || 0);
          if (patient.recentHealthData?.length > 0) {
            console.log('📊 Sample health data for', patient.firstName, ':', patient.recentHealthData[0]);
          }

          const healthStatus = calculateHealthStatus(patient);
          console.log('📊 Calculated health status for', patient.firstName, ':', healthStatus);

          return {
            ...patient,
            healthStatus,
            displayName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'
          };
        })

        setPatients(processedPatients)
        setPagination(response.pagination || { current: 1, pages: 1, total: processedPatients.length })
      } else {
        throw new Error(response.message || 'Failed to fetch patients')
      }
    } catch (err) {
      console.error('❌ Error fetching patients:', err)
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      })
      setError(err.response?.data?.message || err.message || 'Failed to load patients')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Calculate health status based on recent health data (using same logic as patient profile)
  const calculateHealthStatus = (patient) => {
    if (!patient.recentHealthData || patient.recentHealthData.length === 0) {
      return { status: 'unknown', score: 0, label: 'No health data available' }
    }

    // Get latest readings for each metric
    const latestReadings = {}
    patient.recentHealthData.forEach(data => {
      if (!latestReadings[data.dataType] || new Date(data.timestamp) > new Date(latestReadings[data.dataType].timestamp)) {
        latestReadings[data.dataType] = data
      }
    })

    // Use default health targets (same as patient dashboard defaults)
    const defaultHealthTargets = {
      heartRate: { min: 60, max: 100 },
      bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },
      glucoseLevel: { min: 70, max: 140 },
      bodyTemperature: { min: 97.0, max: 99.5 }
    }

    // Start with perfect score and subtract points (same as patient profile logic)
    let score = 100
    let factors = []

    // Check heart rate against targets
    if (latestReadings.heartRate) {
      const currentHR = latestReadings.heartRate.value
      const hrMin = defaultHealthTargets.heartRate.min
      const hrMax = defaultHealthTargets.heartRate.max

      if (currentHR < hrMin - 10 || currentHR > hrMax + 20) {
        score -= 20
        factors.push(`Heart rate (${currentHR} bpm) outside optimal range`)
      } else if (currentHR < hrMin || currentHR > hrMax) {
        score -= 10
        factors.push(`Heart rate (${currentHR} bpm) outside target range`)
      }
    }

    // Check blood pressure against targets
    if (latestReadings.bloodPressure) {
      const bp = latestReadings.bloodPressure.value
      const systolic = typeof bp === 'object' ? bp.systolic : bp
      const diastolic = typeof bp === 'object' ? bp.diastolic : bp - 40 // fallback
      const bpSysMin = defaultHealthTargets.bloodPressure.systolic.min
      const bpSysMax = defaultHealthTargets.bloodPressure.systolic.max
      const bpDiaMin = defaultHealthTargets.bloodPressure.diastolic.min
      const bpDiaMax = defaultHealthTargets.bloodPressure.diastolic.max

      if (systolic > bpSysMax + 20 || diastolic > bpDiaMax + 10 || systolic < bpSysMin - 20 || diastolic < bpDiaMin - 10) {
        score -= 20
        factors.push(`Blood pressure critically outside range`)
      } else if (systolic > bpSysMax || diastolic > bpDiaMax || systolic < bpSysMin || diastolic < bpDiaMin) {
        score -= 10
        factors.push(`Blood pressure outside target range`)
      }
    }

    // Check glucose levels against targets
    if (latestReadings.glucoseLevel) {
      const currentGlucose = latestReadings.glucoseLevel.value
      const glucoseMin = defaultHealthTargets.glucoseLevel.min
      const glucoseMax = defaultHealthTargets.glucoseLevel.max

      if (currentGlucose > glucoseMax + 40 || currentGlucose < glucoseMin - 20) {
        score -= 20
        factors.push(`Blood glucose critically outside range`)
      } else if (currentGlucose > glucoseMax || currentGlucose < glucoseMin) {
        score -= 10
        factors.push(`Blood glucose outside target range`)
      }
    }

    // Check body temperature against targets
    if (latestReadings.bodyTemperature) {
      const currentTemp = latestReadings.bodyTemperature.value
      const tempMin = defaultHealthTargets.bodyTemperature.min
      const tempMax = defaultHealthTargets.bodyTemperature.max

      if (currentTemp > tempMax + 1 || currentTemp < tempMin - 1) {
        score -= 15
        factors.push(`Body temperature outside safe range`)
      } else if (currentTemp > tempMax || currentTemp < tempMin) {
        score -= 5
        factors.push(`Body temperature outside target range`)
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score)

    // Determine status based on score (same logic as patient profile)
    let status, label
    if (score >= 90) {
      status = 'healthy'
      label = 'Excellent'
    } else if (score >= 80) {
      status = 'healthy'
      label = 'Very Good'
    } else if (score >= 70) {
      status = 'stable'
      label = 'Good'
    } else if (score >= 60) {
      status = 'stable'
      label = 'Fair'
    } else {
      status = score >= 40 ? 'warning' : 'critical'
      label = 'Needs Attention'
    }

    return { status, score: Math.round(score), label, factors }
  }

  // Fetch detailed patient data for modal
  const fetchPatientDetails = async (patient) => {
    setDetailLoading(true)
    try {
      // Fetch comprehensive patient data using admin-specific routes
      const [profileRes, healthDataRes, appointmentsRes, alertsRes] = await Promise.allSettled([
        // Get patient profile (admin route)
        api.get(`/admin/patients/${patient._id}`),
        // Get detailed health data (admin route)
        api.get(`/admin/patients/${patient._id}/health-data`, {
          params: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            limit: 100
          }
        }),
        // Get appointment history (general route - should work for admin)
        api.get(`/appointments`, { params: { patientId: patient._id } }),
        // Get patient alerts (admin route)
        api.get(`/admin/patients/${patient._id}/alerts`)
      ])

      const detailData = {
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data?.patient || patient : patient,
        healthData: healthDataRes.status === 'fulfilled' ? healthDataRes.value.data?.data || [] : [],
        appointments: appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data?.appointments || [] : [],
        alerts: alertsRes.status === 'fulfilled' ? alertsRes.value.data?.alerts || [] : [],
        rawPatient: patient
      }

      // Process health data into charts format
      detailData.chartData = processHealthDataForCharts(detailData.healthData)

      setPatientDetailData(detailData)
    } catch (error) {
      console.error('❌ Error fetching patient details:', error)
      // Fallback to basic patient data
      setPatientDetailData({
        profile: patient,
        healthData: patient.recentHealthData || [],
        appointments: [],
        alerts: [],
        chartData: {},
        rawPatient: patient
      })
    } finally {
      setDetailLoading(false)
    }
  }

  // Process health data for charts
  const processHealthDataForCharts = (healthData) => {
    const chartData = {
      heartRate: [],
      bloodPressure: [],
      glucoseLevel: [],
      bodyTemperature: []
    }

    healthData.forEach(data => {
      const date = new Date(data.timestamp).toLocaleDateString()
      const entry = { date, value: data.value, timestamp: data.timestamp }

      if (chartData[data.dataType]) {
        chartData[data.dataType].push(entry)
      }
    })

    // Sort by timestamp and limit to last 14 days for charts
    Object.keys(chartData).forEach(key => {
      chartData[key] = chartData[key]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-14)
    })

    return chartData
  }

  // Handle opening patient details modal
  const handleViewPatientDetails = async (patient) => {
    setSelectedPatient(patient)
    setShowHealthModal(true)
    await fetchPatientDetails(patient)
  }

  // Handle delete patient
  const handleDeletePatient = async (patient) => {
    setPatientToDelete(patient)
    setShowDeleteModal(true)
  }

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return

    console.log('🗑️ Starting delete process for patient:', patientToDelete._id);
    setDeleteLoading(true)
    try {
      console.log('🗑️ Making DELETE request to:', `/admin/patients/${patientToDelete._id}`);
      const response = await api.delete(`/admin/patients/${patientToDelete._id}`)
      console.log('🗑️ Delete response received:', response);

      if (response.data.success) {
        // Remove patient from local state
        setPatients(patients.filter(p => p._id !== patientToDelete._id))
        setShowDeleteModal(false)
        setPatientToDelete(null)

        // Show success message
        alert(`✅ ${response.data.message}`)
        console.log('✅ Patient deleted successfully:', response.data.deletedUser)
      } else {
        throw new Error(response.data.message || 'Failed to delete patient')
      }
    } catch (error) {
      console.error('❌ Error deleting patient:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete patient'
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      stable: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      healthy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      unknown: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    }
    return colors[status] || colors.unknown
  }

  const getStatusIcon = (status) => {
    const icons = {
      critical: ExclamationTriangleIcon,
      warning: ExclamationTriangleIcon,
      stable: HeartIcon,
      healthy: CheckCircleIcon,
      unknown: UserIcon,
    }
    const Icon = icons[status] || UserIcon
    return <Icon className="w-4 h-4" />
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || patient.healthStatus?.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.displayName.localeCompare(b.displayName)
      case "age":
        return (a.age === 'N/A' ? 0 : a.age) - (b.age === 'N/A' ? 0 : b.age)
      case "healthScore":
        return (b.healthStatus?.score || 0) - (a.healthStatus?.score || 0)
      case "joinDate":
        return new Date(b.createdAt) - new Date(a.createdAt)
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
              <option value="all">All Health Status</option>
              <option value="healthy">Healthy</option>
              <option value="stable">Stable</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="unknown">No Data</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="healthScore">Sort by Health Score</option>
              <option value="joinDate">Sort by Join Date</option>
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
                  Health Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Health Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  View Details
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      <span className="text-gray-500 dark:text-slate-400">Loading patients...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-red-500 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                      <p>{error}</p>
                      <button
                        onClick={fetchPatients}
                        className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : sortedPatients.map((patient, index) => (
                <motion.tr
                  key={patient._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  {/* Patient Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      {patient.profilePicture ? (
                        <img
                          src={patient.profilePicture}
                          alt={patient.displayName}
                          className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-blue-100 dark:ring-blue-700/50"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold text-sm">
                            {patient.displayName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {patient.displayName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          ID: {patient.patientId || patient._id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Health Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium ${getStatusColor(patient.healthStatus?.status || 'unknown')}`}>
                      {getStatusIcon(patient.healthStatus?.status || 'unknown')}
                      <span className="ml-1 capitalize">{patient.healthStatus?.status || 'Unknown'}</span>
                    </span>
                  </td>

                  {/* Age/Gender */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {patient.age} years
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {patient.gender || 'Not specified'}
                    </div>
                  </td>

                  {/* Health Score */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-bold ${
                        (patient.healthStatus?.score || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                        (patient.healthStatus?.score || 0) >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {patient.healthStatus?.score || 0}/100
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (patient.healthStatus?.score || 0) >= 80 ? 'bg-green-500' :
                            (patient.healthStatus?.score || 0) >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${patient.healthStatus?.score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {patient.phone || 'Not provided'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      Joined: {new Date(patient.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* View Details */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewPatientDetails(patient)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      <ChartBarIcon className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeletePatient(patient)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Delete Patient"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && !error && sortedPatients.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No patients found
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No patients have registered yet'
            }
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Enhanced Patient Details Modal */}
      {showHealthModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
              <div className="flex items-center space-x-4">
                {selectedPatient.profilePicture ? (
                  <img
                    src={selectedPatient.profilePicture}
                    alt={selectedPatient.displayName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-blue-100 dark:ring-blue-700/50"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-lg">
                      {selectedPatient.displayName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedPatient.displayName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Patient ID: {selectedPatient.patientId || selectedPatient._id.substring(0, 8)}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.healthStatus?.status || 'unknown')}`}>
                      {getStatusIcon(selectedPatient.healthStatus?.status || 'unknown')}
                      <span className="ml-1 capitalize">{selectedPatient.healthStatus?.status || 'Unknown'}</span>
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      Health Score: {selectedPatient.healthStatus?.score || 0}/100
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHealthModal(false)
                  setSelectedPatient(null)
                  setPatientDetailData(null)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            {detailLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-slate-400">Loading patient details...</p>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Patient Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <div className="lg:col-span-2 bg-gray-50 dark:bg-slate-700 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Full Name</label>
                        <p className="text-gray-900 dark:text-white font-medium">{selectedPatient.displayName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Date of Birth</label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Gender</label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Age</label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.age} years</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Address</label>
                        <p className="text-gray-900 dark:text-white">
                          {patientDetailData?.profile?.address ?
                            `${patientDetailData.profile.address.street || ''} ${patientDetailData.profile.address.city || ''} ${patientDetailData.profile.address.state || ''} ${patientDetailData.profile.address.zipCode || ''}`.trim() || 'Not provided'
                            : 'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Patient ID</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {selectedPatient.patientId || selectedPatient._id.substring(0, 8)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Registration Date</label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(selectedPatient.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Account Status</label>
                        <p className="text-gray-900 dark:text-white">
                          {(() => {
                            // Determine account status based on available data
                            const profile = patientDetailData?.profile || selectedPatient;
                            const hasRecentActivity = profile.lastLoginAt &&
                              new Date(profile.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
                            return hasRecentActivity ? 'Active' : 'Inactive';
                          })()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white">
                          {(() => {
                            const profile = patientDetailData?.profile || selectedPatient;
                            return profile.lastLoginAt ?
                              new Date(profile.lastLoginAt).toLocaleDateString() + ' at ' +
                              new Date(profile.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Never';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Health Readings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Current Health Readings
                  </h3>
                  {patientDetailData?.healthData && patientDetailData.healthData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Get latest readings for each metric */}
                      {(() => {
                        const latestReadings = {}
                        patientDetailData.healthData.forEach(data => {
                          if (!latestReadings[data.dataType] || new Date(data.timestamp) > new Date(latestReadings[data.dataType].timestamp)) {
                            latestReadings[data.dataType] = data
                          }
                        })

                        // Helper function to get metric styles
                        const getMetricStyles = (metricKey) => {
                          const styles = {
                            heartRate: {
                              bg: 'bg-red-50 dark:bg-red-900/20',
                              border: 'border-red-200 dark:border-red-800',
                              icon: 'text-red-600 dark:text-red-400',
                              label: 'text-red-800 dark:text-red-300',
                              value: 'text-red-900 dark:text-red-100'
                            },
                            bloodPressure: {
                              bg: 'bg-blue-50 dark:bg-blue-900/20',
                              border: 'border-blue-200 dark:border-blue-800',
                              icon: 'text-blue-600 dark:text-blue-400',
                              label: 'text-blue-800 dark:text-blue-300',
                              value: 'text-blue-900 dark:text-blue-100'
                            },
                            glucoseLevel: {
                              bg: 'bg-purple-50 dark:bg-purple-900/20',
                              border: 'border-purple-200 dark:border-purple-800',
                              icon: 'text-purple-600 dark:text-purple-400',
                              label: 'text-purple-800 dark:text-purple-300',
                              value: 'text-purple-900 dark:text-purple-100'
                            },
                            bodyTemperature: {
                              bg: 'bg-orange-50 dark:bg-orange-900/20',
                              border: 'border-orange-200 dark:border-orange-800',
                              icon: 'text-orange-600 dark:text-orange-400',
                              label: 'text-orange-800 dark:text-orange-300',
                              value: 'text-orange-900 dark:text-orange-100'
                            }
                          }
                          return styles[metricKey] || styles.heartRate
                        }

                        return [
                          { key: 'heartRate', name: 'Heart Rate', unit: 'bpm', icon: HeartIcon },
                          { key: 'bloodPressure', name: 'Blood Pressure', unit: 'mmHg', icon: ArrowTrendingUpIcon },
                          { key: 'glucoseLevel', name: 'Glucose Level', unit: 'mg/dL', icon: BeakerIcon },
                          { key: 'bodyTemperature', name: 'Temperature', unit: '°F', icon: FireIcon }
                        ].map(metric => {
                          const reading = latestReadings[metric.key]
                          if (!reading) return null

                          const styles = getMetricStyles(metric.key)

                          return (
                            <div key={metric.key} className={`${styles.bg} p-4 rounded-2xl border ${styles.border}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <metric.icon className={`w-5 h-5 ${styles.icon}`} />
                                <span className={`text-sm font-medium ${styles.label}`}>{metric.name}</span>
                              </div>
                              <p className={`text-2xl font-bold ${styles.value}`}>
                                {typeof reading.value === 'object'
                                  ? `${reading.value.systolic}/${reading.value.diastolic}`
                                  : reading.value
                                } {metric.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                {new Date(reading.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          )
                        }).filter(Boolean)
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-slate-700 rounded-2xl">
                      <HeartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                      <p className="text-gray-500 dark:text-slate-400">No health data available</p>
                    </div>
                  )}
                </div>

                {/* Health Data Charts */}
                {patientDetailData?.chartData && Object.keys(patientDetailData.chartData).some(key => patientDetailData.chartData[key].length > 0) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      Health Trends (Last 14 Days)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Heart Rate Chart */}
                      {patientDetailData.chartData.heartRate?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Heart Rate (bpm)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={patientDetailData.chartData.heartRate}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Blood Pressure Chart */}
                      {patientDetailData.chartData.bloodPressure?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Blood Pressure</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={patientDetailData.chartData.bloodPressure}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value.systolic" stroke="#3b82f6" strokeWidth={2} name="Systolic" />
                              <Line type="monotone" dataKey="value.diastolic" stroke="#06b6d4" strokeWidth={2} name="Diastolic" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Glucose Chart */}
                      {patientDetailData.chartData.glucoseLevel?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Glucose Level (mg/dL)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={patientDetailData.chartData.glucoseLevel}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Temperature Chart */}
                      {patientDetailData.chartData.bodyTemperature?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Body Temperature (°F)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={patientDetailData.chartData.bodyTemperature}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Appointment History & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Appointment History */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Recent Appointments
                    </h3>
                    {patientDetailData?.appointments && patientDetailData.appointments.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {patientDetailData.appointments.slice(0, 5).map((appointment, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {appointment.reason || 'General Consultation'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {new Date(appointment.dateTime).toLocaleDateString()} at {new Date(appointment.dateTime).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                appointment.status === 'open_chat' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                                appointment.status === 'approved' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                        <p className="text-gray-500 dark:text-slate-400">No appointments found</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Alerts */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      Recent Health Alerts
                    </h3>
                    {patientDetailData?.alerts && patientDetailData.alerts.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {patientDetailData.alerts.slice(0, 5).map((alert, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {new Date(alert.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                                alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                        <p className="text-gray-500 dark:text-slate-400">No alerts found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact Information */}
                {patientDetailData?.profile?.emergencyContact && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <PhoneIcon className="w-5 h-5 mr-2" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Name</label>
                        <p className="text-gray-900 dark:text-white">
                          {patientDetailData.profile.emergencyContact.name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Relationship</label>
                        <p className="text-gray-900 dark:text-white">
                          {patientDetailData.profile.emergencyContact.relationship || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">
                          {patientDetailData.profile.emergencyContact.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-slate-700 p-6 bg-gray-50 dark:bg-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400">
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Health Score: {selectedPatient.healthStatus?.score || 0}/100</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowHealthModal(false)
                      setSelectedPatient(null)
                      setPatientDetailData(null)
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && patientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Patient
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-slate-300 mb-4">
                Are you sure you want to delete <strong>{patientToDelete.displayName}</strong>?
                This will permanently remove all their data including:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-400 space-y-1 mb-6">
                <li>Patient profile and personal information</li>
                <li>All health data and medical records</li>
                <li>Appointment history</li>
                <li>Health alerts and notifications</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">
                    Warning: This action is irreversible
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-slate-700 p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setPatientToDelete(null)
                  }}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePatient}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete Patient</span>
                    </>
                  )}
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
