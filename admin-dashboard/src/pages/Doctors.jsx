import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { getAllDoctors, updateDoctorApprovalStatus, getDoctorDetails, deleteDoctorAccount, updateDoctorAvailability } from "../services/adminService"

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAvailability, setFilterAvailability] = useState("all")
  const intervalRef = useRef(null)
  const [sortBy, setSortBy] = useState("name")
  const [openApprovalDropdown, setOpenApprovalDropdown] = useState(null)
  const [openActionsDropdown, setOpenActionsDropdown] = useState(null)
  const approvalDropdownRef = useRef(null)
  const actionsDropdownRef = useRef(null)

  // Real data state
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState({ action: '', doctorId: '' })
  const [approvalReason, setApprovalReason] = useState('')

  // Fetch doctors data
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        search: searchTerm,
        approvalStatus: filterStatus === 'all' ? 'all' : filterStatus,
        specialty: filterSpecialty === 'all' ? 'all' : filterSpecialty,
        availability: filterAvailability === 'all' ? 'all' : filterAvailability,
        page: 1,
        limit: 50
      }

      console.log('📋 Fetching doctors with params:', params)
      const response = await getAllDoctors(params)

      if (response.success) {
        setDoctors(response.doctors || [])
        setPagination(response.pagination || { current: 1, pages: 1, total: 0 })
        console.log(`✅ Fetched ${response.doctors?.length || 0} doctors`)
      } else {
        throw new Error(response.message || 'Failed to fetch doctors')
      }
    } catch (err) {
      console.error('❌ Error fetching doctors:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch doctors')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (approvalDropdownRef.current && !approvalDropdownRef.current.contains(event.target)) {
        setOpenApprovalDropdown(null)
      }
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setOpenActionsDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch doctors on component mount and when filters change
  useEffect(() => {
    fetchDoctors()
  }, [searchTerm, filterSpecialty, filterStatus, filterAvailability])

  // Real-time status polling (every 2 minutes for online/offline status updates)
  useEffect(() => {
    // Set up polling interval for status updates (every 2 minutes)
    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        console.log('🔄 Checking for doctor status updates...')
        fetchDoctors()
      }, 120000) // 120 seconds = 2 minutes
    }

    // Start polling when component mounts
    startPolling()

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchDoctors()
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Get unique specialties from doctors data
  const specialties = ["all", ...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))]

  const getStatusColor = (status) => {
    const colors = {
      online: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      offline: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    }
    return colors[status] || colors.offline
  }

  const getAvailabilityColor = (isAcceptingPatients) => {
    return isAcceptingPatients
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
  }

  const getAvailabilityIcon = (isAcceptingPatients) => {
    const Icon = isAcceptingPatients ? CheckCircleIcon : XCircleIcon
    return <Icon className="w-4 h-4" />
  }

  const getAvailabilityText = (isAcceptingPatients) => {
    return isAcceptingPatients ? "Accepting Patients" : "Not Accepting"
  }

  const getApprovalStatusColor = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    }
    return colors[status] || colors.pending
  }

  const getApprovalStatusIcon = (status) => {
    const icons = {
      approved: CheckCircleIcon,
      pending: ClockIcon,
      rejected: XCircleIcon,
    }
    const Icon = icons[status] || ClockIcon
    return <Icon className="w-4 h-4" />
  }

  const handleViewDetails = async (doctorId) => {
    try {
      console.log(`📋 Fetching details for doctor: ${doctorId}`)
      const response = await getDoctorDetails(doctorId)

      if (response.success) {
        setSelectedDoctor(response.doctor)
        setShowDetailsModal(true)
      } else {
        throw new Error(response.message || 'Failed to fetch doctor details')
      }
    } catch (error) {
      console.error('❌ Error fetching doctor details:', error)
      alert(`Failed to fetch doctor details: ${error.message}`)
    } finally {
      setOpenActionsDropdown(null)
    }
  }

  const handleApprovalAction = (doctorId, action) => {
    setApprovalAction({ action, doctorId })
    setApprovalReason('')
    setShowApprovalModal(true)
    setOpenApprovalDropdown(null)
  }

  const handleAvailabilityToggle = async (doctorId, currentStatus) => {
    try {
      console.log(`📋 Toggling doctor ${doctorId} availability from ${currentStatus} to ${!currentStatus}`)

      const response = await updateDoctorAvailability(doctorId, !currentStatus)

      if (response.success) {
        // Update local state
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor.id === doctorId
              ? { ...doctor, isAcceptingPatients: !currentStatus }
              : doctor
          )
        )

        console.log(`✅ Doctor availability updated successfully`)
      } else {
        throw new Error(response.message || 'Failed to update availability')
      }
    } catch (error) {
      console.error('❌ Error updating doctor availability:', error)
      alert(`Failed to update availability: ${error.message}`)
    } finally {
      setOpenActionsDropdown(null)
    }
  }

  const confirmApprovalAction = async () => {
    try {
      console.log(`📋 ${approvalAction.action} doctor ${approvalAction.doctorId}`)

      const response = await updateDoctorApprovalStatus(
        approvalAction.doctorId,
        approvalAction.action,
        approvalReason
      )

      if (response.success) {
        // Update local state
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor.id === approvalAction.doctorId
              ? { ...doctor, approvalStatus: approvalAction.action }
              : doctor
          )
        )

        console.log(`✅ Doctor ${approvalAction.action} successfully`)
        setShowApprovalModal(false)
        setApprovalAction({ action: '', doctorId: '' })
        setApprovalReason('')
      } else {
        throw new Error(response.message || 'Failed to update approval status')
      }
    } catch (error) {
      console.error('❌ Error updating approval status:', error)
      alert(`Failed to update approval status: ${error.message}`)
    }
  }

  const handleApprovalChange = async (doctorId, newStatus) => {
    // Use the new modal-based approval for important actions
    if (['approved', 'rejected', 'suspended'].includes(newStatus)) {
      handleApprovalAction(doctorId, newStatus)
      return
    }

    // For simple status changes, use direct update
    try {
      console.log(`📋 Updating doctor ${doctorId} approval status to: ${newStatus}`)

      const response = await updateDoctorApprovalStatus(doctorId, newStatus)

      if (response.success) {
        // Update local state
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor.id === doctorId
              ? { ...doctor, approvalStatus: newStatus }
              : doctor
          )
        )

        console.log(`✅ Doctor approval status updated successfully`)
      } else {
        throw new Error(response.message || 'Failed to update approval status')
      }
    } catch (error) {
      console.error('❌ Error updating approval status:', error)
      alert(`Failed to update approval status: ${error.message}`)
    } finally {
      setOpenApprovalDropdown(null) // Close dropdown after action
    }
  }

  const toggleApprovalDropdown = (doctorId) => {
    setOpenApprovalDropdown(openApprovalDropdown === doctorId ? null : doctorId)
  }

  const toggleActionsDropdown = (doctorId) => {
    setOpenActionsDropdown(openActionsDropdown === doctorId ? null : doctorId)
  }

  // Since filtering is now done on the backend, we just need to sort the data
  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "experience":
        return (b.experience || 0) - (a.experience || 0)
      case "approvalStatus":
        // Sort by approval status: pending_review first, then approved, then rejected
        const statusOrder = {
          pending_review: 0,
          pending: 0,
          approved: 1,
          rejected: 2,
          suspended: 3
        }
        return (statusOrder[a.approvalStatus] || 0) - (statusOrder[b.approvalStatus] || 0)
      case "patients":
        return (b.patientCount || 0) - (a.patientCount || 0)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Doctor Management
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Monitor and manage all registered doctors ({pagination.total} total)
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
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-3">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === "all" ? "All Specialties" : specialty}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending_review">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Availability</option>
              <option value="accepting">Accepting Patients</option>
              <option value="not_accepting">Not Accepting</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="approvalStatus">Sort by Approval Status</option>
              <option value="patients">Sort by Patients</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Error Loading Doctors
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
              <button
                onClick={fetchDoctors}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Doctors...
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Please wait while we fetch the latest doctor data
          </p>
        </div>
      )}

      {/* Doctors Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Patients
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedDoctors.map((doctor, index) => (
                <motion.tr
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  {/* Doctor Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold text-sm">
                          {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          ID: {doctor.id}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          {doctor.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium ${getStatusColor(doctor.status)}`}>
                      <span className="capitalize">{doctor.status}</span>
                    </span>
                  </td>

                  {/* Specialty */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {doctor.specialty}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {doctor.department}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {doctor.experience || 0} years
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      License: {doctor.licenseNumber || 'N/A'}
                    </div>
                  </td>

                  {/* Patients */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {doctor.patientCount || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {doctor.totalAppointments} total appointments
                    </div>
                  </td>

                  {/* Approval Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative" ref={openApprovalDropdown === doctor.id ? approvalDropdownRef : null}>
                      <button
                        onClick={() => toggleApprovalDropdown(doctor.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getApprovalStatusColor(doctor.approvalStatus)}`}
                      >
                        {getApprovalStatusIcon(doctor.approvalStatus)}
                        <span className="ml-1 capitalize">{doctor.approvalStatus?.replace('_', ' ')}</span>
                        <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openApprovalDropdown === doctor.id && (
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 z-[9999]">
                          <div className="py-1">
                            {/* For approved doctors, only show Suspend option */}
                            {doctor.approvalStatus === 'approved' && (
                              <button
                                onClick={() => handleApprovalAction(doctor.id, 'suspended')}
                                className="w-full text-left px-3 py-2 text-xs text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center space-x-2"
                              >
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>
                            )}

                            {/* For suspended doctors, only show Approve and Reject options */}
                            {doctor.approvalStatus === 'suspended' && (
                              <>
                                <button
                                  onClick={() => handleApprovalAction(doctor.id, 'approved')}
                                  className="w-full text-left px-3 py-2 text-xs text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleApprovalAction(doctor.id, 'rejected')}
                                  className="w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <XCircleIcon className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* For other statuses (pending_review, rejected, etc.), show relevant options */}
                            {doctor.approvalStatus !== 'approved' && doctor.approvalStatus !== 'suspended' && (
                              <>
                                <button
                                  onClick={() => handleApprovalAction(doctor.id, 'approved')}
                                  className="w-full text-left px-3 py-2 text-xs text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>

                                {doctor.approvalStatus !== 'pending_review' && doctor.approvalStatus !== 'pending' && (
                                  <button
                                    onClick={() => handleApprovalAction(doctor.id, 'pending_review')}
                                    className="w-full text-left px-3 py-2 text-xs text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors flex items-center space-x-2"
                                  >
                                    <ClockIcon className="w-3 h-3" />
                                    <span>Set Pending Review</span>
                                  </button>
                                )}

                                {doctor.approvalStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleApprovalAction(doctor.id, 'rejected')}
                                    className="w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                  >
                                    <XCircleIcon className="w-3 h-3" />
                                    <span>Reject</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleApprovalAction(doctor.id, 'suspended')}
                                  className="w-full text-left px-3 py-2 text-xs text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <ExclamationTriangleIcon className="w-3 h-3" />
                                  <span>Suspend</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium ${getAvailabilityColor(doctor.isAcceptingPatients)}`}>
                      {getAvailabilityIcon(doctor.isAcceptingPatients)}
                      <span className="ml-1">{getAvailabilityText(doctor.isAcceptingPatients)}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative" ref={openActionsDropdown === doctor.id ? actionsDropdownRef : null}>
                      <button
                        onClick={() => toggleActionsDropdown(doctor.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-xl text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Actions
                        <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {openActionsDropdown === doctor.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-[9999]">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewDetails(doctor.id)}
                              className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
                            >
                              <EyeIcon className="w-3 h-3" />
                              <span>View Details</span>
                            </button>

                            <div className="border-t border-gray-200 dark:border-slate-600 my-1"></div>

                            <button
                              onClick={() => console.log('Delete doctor:', doctor.id)}
                              className="w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                            >
                              <TrashIcon className="w-3 h-3" />
                              <span>Delete Doctor</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="h-32"></div>
        </div>
      </div>
      )}

      {/* Empty State */}
      {sortedDoctors.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No doctors found
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDetailsModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Doctor Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <XCircleIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Name</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Gender</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.gender || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Professional Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Specialty</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.specialty}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Experience</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.experience} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">License Number</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">License State</label>
                      <p className="text-gray-900 dark:text-white">{selectedDoctor.licenseState}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedDoctor.patientCount}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Patients</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedDoctor.totalAppointments}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Total Appointments</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedDoctor.isOnline ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Status</div>
                  </div>
                </div>
              </div>

              {/* Application Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Application Documents
                </h3>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                  {selectedDoctor.applicationDocuments && selectedDoctor.applicationDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDoctor.applicationDocuments.map((doc, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <DocumentCheckIcon className={`w-8 h-8 ${doc.verified ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {doc.documentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                  {doc.fileName || 'Unknown filename'}
                                </p>
                                {doc.uploadedAt && (
                                  <p className="text-xs text-gray-400 dark:text-slate-500">
                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                )}
                                {doc.verified && (
                                  <div className="flex items-center mt-1">
                                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                                    <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end">
                              {doc.fileUrl && (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <EyeIcon className="w-4 h-4 mr-2" />
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          {doc.notes && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                              <span className="font-medium">Notes:</span> {doc.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentCheckIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-slate-400">No documents uploaded</p>
                      <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        This doctor hasn't uploaded any application documents yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Approval Status
                </h3>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium ${getApprovalStatusColor(selectedDoctor.approvalStatus)}`}>
                      {selectedDoctor.approvalStatus?.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Applied: {selectedDoctor.applicationSubmittedAt ? new Date(selectedDoctor.applicationSubmittedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  {selectedDoctor.adminNotes && (
                    <div className="mt-3">
                      <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Admin Notes</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedDoctor.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {selectedDoctor.approvalStatus === 'pending_review' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleApprovalAction(selectedDoctor.id, 'approved')
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleApprovalAction(selectedDoctor.id, 'rejected')
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Action Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirm {approvalAction.action.charAt(0).toUpperCase() + approvalAction.action.slice(1)} Doctor
              </h3>

              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Are you sure you want to {approvalAction.action} this doctor? This action will update their status immediately.
              </p>

              {(approvalAction.action === 'rejected' || approvalAction.action === 'suspended') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Reason {approvalAction.action === 'rejected' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder={`Enter reason for ${approvalAction.action}...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setApprovalAction({ action: '', doctorId: '' })
                    setApprovalReason('')
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprovalAction}
                  disabled={approvalAction.action === 'rejected' && !approvalReason.trim()}
                  className={`px-4 py-2 rounded-xl text-white transition-colors ${
                    approvalAction.action === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : approvalAction.action === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Confirm {approvalAction.action.charAt(0).toUpperCase() + approvalAction.action.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
