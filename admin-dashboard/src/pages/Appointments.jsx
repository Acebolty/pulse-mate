import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import * as adminService from "../services/adminService"

const Appointments = () => {
  // Pending appointments state
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Past appointments state
  const [pastAppointments, setPastAppointments] = useState([])
  const [pastPagination, setPastPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // UI state
  const [loading, setLoading] = useState(true)
  const [pastLoading, setPastLoading] = useState(false)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)

  // Filters and search
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch pending appointments
  useEffect(() => {
    fetchPendingAppointments()
    fetchPastAppointments()
  }, [])

  // Fetch past appointments when filters change
  useEffect(() => {
    if (statusFilter !== 'all' || searchTerm) {
      fetchPastAppointments(1) // Reset to page 1 when filtering
    }
  }, [statusFilter, searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.status-dropdown')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const fetchPendingAppointments = async (page = 1) => {
    try {
      setLoading(true)
      const response = await adminService.getPendingAppointments(page, 15)
      setPendingAppointments(response.appointments || [])
      setPendingPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        hasNextPage: response.hasNextPage || false,
        hasPrevPage: response.hasPrevPage || false
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching pending appointments:', err)
      setError('Failed to load pending appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchPastAppointments = async (page = 1) => {
    try {
      setPastLoading(true)
      const response = await adminService.getPastAppointments(page, 15, statusFilter, searchTerm)
      setPastAppointments(response.appointments || [])
      setPastPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
        hasNextPage: response.hasNextPage || false,
        hasPrevPage: response.hasPrevPage || false
      })
    } catch (err) {
      console.error('Error fetching past appointments:', err)
      // Don't set main error state for past appointments
    } finally {
      setPastLoading(false)
    }
  }

  // Pagination handlers
  const handlePendingPageChange = (newPage) => {
    fetchPendingAppointments(newPage)
  }

  const handlePastPageChange = (newPage) => {
    fetchPastAppointments(newPage)
  }

  // Filter handlers
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleApprove = async (appointmentId) => {
    try {
      setProcessingId(appointmentId)
      await adminService.approveAppointment(appointmentId)

      // Refresh both lists to reflect changes
      fetchPendingAppointments(pendingPagination.currentPage)
      fetchPastAppointments(pastPagination.currentPage)

      // Show success message
      alert('Appointment approved successfully! Chat room created.')
    } catch (err) {
      console.error('Error approving appointment:', err)
      alert('Failed to approve appointment. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (appointmentId) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled
    
    try {
      setProcessingId(appointmentId)
      await adminService.rejectAppointment(appointmentId, reason)
      
      // Remove from pending list
      setPendingAppointments(prev => 
        prev.filter(apt => apt._id !== appointmentId)
      )
      
      alert('Appointment rejected successfully.')
    } catch (err) {
      console.error('Error rejecting appointment:', err)
      alert('Failed to reject appointment. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'open chat':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Pagination component
  const PaginationControls = ({ pagination, onPageChange, loading }) => {
    if (pagination.totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500 dark:text-slate-400">
          Showing {((pagination.currentPage - 1) * 15) + 1} to {Math.min(pagination.currentPage * 15, pagination.totalCount)} of {pagination.totalCount} appointments
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || loading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Previous
          </button>

          <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Next
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    )
  }

  const StatusDropdown = ({ appointment }) => {
    const isOpen = openDropdown === appointment._id
    const isProcessing = processingId === appointment._id

    const toggleDropdown = () => {
      setOpenDropdown(isOpen ? null : appointment._id)
    }

    const handleAction = async (action) => {
      setOpenDropdown(null)
      if (action === 'approve') {
        await handleApprove(appointment._id)
      } else if (action === 'reject') {
        await handleReject(appointment._id)
      }
    }

    return (
      <div className="relative status-dropdown">
        <button
          onClick={toggleDropdown}
          disabled={isProcessing}
          className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${isProcessing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer'
            }
            border border-yellow-200 hover:border-yellow-300
          `}
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          {isProcessing ? 'Processing...' : 'Pending'}
          <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-50"
            >
              <div className="py-2">
                <button
                  onClick={() => handleAction('approve')}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-3" />
                  Approve & Create Chat
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <XCircleIcon className="w-4 h-4 mr-3" />
                  Reject Appointment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Appointment Approvals</h1>
          <p className="text-blue-100">Loading pending appointments...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Appointment Approvals</h1>
          <p className="text-red-100">{error}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center">
          <button 
            onClick={fetchPendingAppointments} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Appointment Approvals</h1>
            <p className="text-white/80">
              Review and approve patient appointment requests for chat sessions
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{pendingAppointments.length}</div>
            <div className="text-white/80 text-sm">Pending</div>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Chat Sessions Only</span>
          </div>
        </div>
      </div>

      {/* Pending Appointments */}
      {pendingAppointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto">
            No pending appointments to review at the moment. New appointment requests will appear here for your approval.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {pendingAppointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                {/* Left: Patient Avatar & Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Patient Name & ID */}
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appointment.userId?.firstName} {appointment.userId?.lastName}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 text-xs rounded-md font-medium">
                        {appointment.userId?.patientId}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <p className="text-gray-600 dark:text-slate-400 mb-3 font-medium">
                      {appointment.reason}
                    </p>

                    {/* Doctor & Session Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{appointment.providerName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(appointment.dateTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTime(appointment.dateTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Chat Session</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-medium">Patient Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Dropdown */}
                <div className="flex-shrink-0 ml-4">
                  <StatusDropdown appointment={appointment} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination for Pending Appointments */}
      <PaginationControls
        pagination={pendingPagination}
        onPageChange={handlePendingPageChange}
        loading={loading}
      />

      {/* Past Appointments History Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Appointment History
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              View all previously processed appointments
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Open Chat">Open Chat</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Past Appointments List */}
        {pastLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Loading appointment history...</p>
          </div>
        ) : pastAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              {statusFilter !== 'all' || searchTerm ? 'No appointments found matching your filters.' : 'No appointment history available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {appointment.userId?.firstName?.[0]}{appointment.userId?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.userId?.firstName} {appointment.userId?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          ID: {appointment.userId?.patientId}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <p className="text-gray-600 dark:text-slate-400 mb-3 font-medium">
                      {appointment.reason}
                    </p>

                    {/* Doctor & Session Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{appointment.providerName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(appointment.dateTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTime(appointment.dateTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Chat Session</span>
                      </div>
                    </div>

                    {/* Approval Info */}
                    {appointment.approvedBy && (
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Processed by: {appointment.approvedBy.firstName} {appointment.approvedBy.lastName}
                        {appointment.approvedAt && (
                          <span> on {formatDate(appointment.approvedAt)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination for Past Appointments */}
        <PaginationControls
          pagination={pastPagination}
          onPageChange={handlePastPageChange}
          loading={pastLoading}
        />
      </div>
    </div>
  )
}

export default Appointments
