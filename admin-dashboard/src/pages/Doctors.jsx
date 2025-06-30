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

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Dummy doctor data
  const doctors = [
    {
      id: "D001",
      name: "Dr. Sarah Smith",
      email: "sarah.smith@pulsemate.com",
      specialty: "Cardiology",
      experience: 12,
      phone: "+1 (555) 123-4567",
      status: "active",
      availability: "available",
      patients: 45,
      approvalStatus: "approved",
      totalAppointments: 1250,
      joinDate: "2020-03-15",
      license: "MD12345",
      department: "Cardiology",
    },
    {
      id: "D002",
      name: "Dr. Michael Brown",
      email: "michael.brown@pulsemate.com",
      specialty: "Emergency Medicine",
      experience: 8,
      phone: "+1 (555) 234-5678",
      status: "active",
      availability: "busy",
      patients: 32,
      approvalStatus: "approved",
      totalAppointments: 890,
      joinDate: "2021-07-20",
      license: "MD23456",
      department: "Emergency",
    },
    {
      id: "D003",
      name: "Dr. Emily Johnson",
      email: "emily.johnson@pulsemate.com",
      specialty: "Pediatrics",
      experience: 15,
      phone: "+1 (555) 345-6789",
      status: "active",
      availability: "available",
      patients: 67,
      approvalStatus: "approved",
      totalAppointments: 1580,
      joinDate: "2019-01-10",
      license: "MD34567",
      department: "Pediatrics",
    },
    {
      id: "D004",
      name: "Dr. David Wilson",
      email: "david.wilson@pulsemate.com",
      specialty: "Orthopedics",
      experience: 20,
      phone: "+1 (555) 456-7890",
      status: "inactive",
      availability: "unavailable",
      patients: 28,
      approvalStatus: "pending",
      totalAppointments: 2100,
      joinDate: "2015-09-05",
      license: "MD45678",
      department: "Orthopedics",
    },
    {
      id: "D005",
      name: "Dr. Lisa Anderson",
      email: "lisa.anderson@pulsemate.com",
      specialty: "Dermatology",
      experience: 10,
      phone: "+1 (555) 567-8901",
      status: "active",
      availability: "available",
      patients: 38,
      approvalStatus: "rejected",
      totalAppointments: 950,
      joinDate: "2022-02-14",
      license: "MD56789",
      department: "Dermatology",
    },
  ]

  const specialties = ["all", "Cardiology", "Emergency Medicine", "Pediatrics", "Orthopedics", "Dermatology"]

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    }
    return colors[status] || colors.active
  }

  const getAvailabilityColor = (availability) => {
    const colors = {
      available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      busy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      unavailable: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    }
    return colors[availability] || colors.available
  }

  const getAvailabilityIcon = (availability) => {
    const icons = {
      available: CheckCircleIcon,
      busy: ClockIcon,
      unavailable: XCircleIcon,
    }
    const Icon = icons[availability] || CheckCircleIcon
    return <Icon className="w-4 h-4" />
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

  const handleApprovalChange = (doctorId, newStatus) => {
    // In a real app, this would make an API call to update the doctor's approval status
    console.log(`Updating doctor ${doctorId} approval status to: ${newStatus}`)
    // For demo purposes, you could update local state here
    alert(`Doctor approval status updated to: ${newStatus}`)
    setOpenDropdown(null) // Close dropdown after action
  }

  const toggleDropdown = (doctorId) => {
    setOpenDropdown(openDropdown === doctorId ? null : doctorId)
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = filterSpecialty === "all" || doctor.specialty === filterSpecialty
    const matchesStatus = filterStatus === "all" || doctor.status === filterStatus
    return matchesSearch && matchesSpecialty && matchesStatus
  })

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "experience":
        return b.experience - a.experience
      case "approvalStatus":
        // Sort by approval status: pending first, then approved, then rejected
        const statusOrder = { pending: 0, approved: 1, rejected: 2 }
        return statusOrder[a.approvalStatus] - statusOrder[b.approvalStatus]
      case "patients":
        return b.patients - a.patients
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
          Monitor and manage all registered doctors
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
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

      {/* Doctors Table */}
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
                          {doctor.name.split(' ').map(n => n[1] || n[0]).join('')}
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
                      {doctor.experience} years
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      License: {doctor.license}
                    </div>
                  </td>

                  {/* Patients */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {doctor.patients}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {doctor.totalAppointments} total appointments
                    </div>
                  </td>

                  {/* Approval Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative" ref={openDropdown === doctor.id ? dropdownRef : null}>
                      <button
                        onClick={() => toggleDropdown(doctor.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getApprovalStatusColor(doctor.approvalStatus)}`}
                      >
                        {getApprovalStatusIcon(doctor.approvalStatus)}
                        <span className="ml-1 capitalize">{doctor.approvalStatus}</span>
                        <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === doctor.id && (
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 z-50">
                          <div className="py-1">
                            {doctor.approvalStatus !== 'approved' && (
                              <button
                                onClick={() => handleApprovalChange(doctor.id, 'approved')}
                                className="w-full text-left px-3 py-2 text-xs text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2"
                              >
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {doctor.approvalStatus !== 'pending' && (
                              <button
                                onClick={() => handleApprovalChange(doctor.id, 'pending')}
                                className="w-full text-left px-3 py-2 text-xs text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors flex items-center space-x-2"
                              >
                                <ClockIcon className="w-3 h-3" />
                                <span>Set Pending</span>
                              </button>
                            )}

                            {doctor.approvalStatus !== 'rejected' && (
                              <button
                                onClick={() => handleApprovalChange(doctor.id, 'rejected')}
                                className="w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                              >
                                <XCircleIcon className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium ${getAvailabilityColor(doctor.availability)}`}>
                      {getAvailabilityIcon(doctor.availability)}
                      <span className="ml-1 capitalize">{doctor.availability}</span>
                    </span>
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
    </div>
  )
}

export default Doctors
