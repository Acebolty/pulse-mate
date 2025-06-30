import { useState } from "react"
import { motion } from "framer-motion"
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")

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
      rating: 4.8,
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
      rating: 4.6,
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
      rating: 4.9,
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
      rating: 4.7,
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
      rating: 4.5,
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
      case "rating":
        return b.rating - a.rating
      case "patients":
        return b.patients - a.patients
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
            Doctor Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Monitor and manage all registered doctors
          </p>
        </div>
        <button className="mt-4 sm:mt-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
          Add New Doctor
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
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="rating">Sort by Rating</option>
              <option value="patients">Sort by Patients</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            {/* Doctor Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {doctor.name.split(' ').map(n => n[1] || n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {doctor.specialty}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                  {doctor.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getAvailabilityColor(doctor.availability)}`}>
                  {getAvailabilityIcon(doctor.availability)}
                  <span>{doctor.availability}</span>
                </span>
              </div>
            </div>

            {/* Doctor Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {doctor.patients}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Patients</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <StarIcon className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {doctor.rating}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Rating</p>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Experience:</span>
                <span className="text-gray-900 dark:text-white">{doctor.experience} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">License:</span>
                <span className="text-gray-900 dark:text-white">{doctor.license}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Appointments:</span>
                <span className="text-gray-900 dark:text-white">{doctor.totalAppointments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Joined:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(doctor.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>

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
      {sortedDoctors.length === 0 && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
