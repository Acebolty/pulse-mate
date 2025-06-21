"use client"

import { useState } from "react"
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

// Dummy appointments data
const upcomingAppointments = [
  {
    id: 1,
    title: "Annual Physical Checkup",
    doctor: {
      name: "Dr. Sarah Wilson",
      specialty: "Internal Medicine",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    date: "2024-01-25",
    time: "10:00 AM",
    duration: "60 min",
    type: "in-person",
    status: "confirmed",
    location: "Health Center - Room 205",
    address: "123 Medical Plaza, Suite 205",
    notes: "Bring previous lab results and current medication list",
    preparation: ["Fasting for 12 hours", "Bring insurance card", "List of current medications"],
  },
  {
    id: 2,
    title: "Cardiology Follow-up Chat",
    doctor: {
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    date: "2024-01-28",
    time: "2:30 PM",
    duration: "45 min",
    type: "chat",
    status: "confirmed",
    chatRoom: "cardiology-followup-abc123",
    notes: "Follow-up on recent EKG results via secure messaging",
    preparation: ["Have recent test results ready", "Prepare list of symptoms or concerns"],
    chatInstructions:
      "Dr. Chen will initiate the chat session at your scheduled time. You'll receive a notification when the chat begins.",
  },
  {
    id: 3,
    title: "Blood Test Results Review",
    doctor: {
      name: "Dr. Emily Rodriguez",
      specialty: "Endocrinology",
      image:
        "https://images.unsplash.com/photo-1594824475317-d0b8e8b5e8b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    date: "2024-02-02",
    time: "11:15 AM",
    duration: "30 min",
    type: "chat",
    status: "pending",
    chatRoom: "endocrinology-results-def456",
    notes: "Review diabetes management and A1C results through secure chat",
    preparation: ["Review glucose log", "Prepare questions about medication"],
    chatInstructions:
      "This will be a text-based consultation. You can share images of your glucose readings if needed.",
  },
  {
    id: 4,
    title: "Physical Therapy Session",
    doctor: {
      name: "Dr. James Thompson",
      specialty: "Physical Therapy",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    },
    date: "2024-02-05",
    time: "3:00 PM",
    duration: "60 min",
    type: "in-person",
    status: "confirmed",
    location: "Rehabilitation Center - Gym A",
    address: "456 Wellness Drive, Building B",
    notes: "Continue shoulder rehabilitation exercises",
    preparation: ["Wear comfortable workout clothes", "Bring water bottle"],
  },
  {
    id: 5,
    title: "Mental Health Check-in",
    doctor: {
      name: "Dr. Amanda Foster",
      specialty: "Psychology",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    },
    date: "2024-02-08",
    time: "4:00 PM",
    duration: "50 min",
    type: "chat",
    status: "confirmed",
    chatRoom: "psychology-checkin-ghi789",
    notes: "Weekly mental health support session via secure chat",
    preparation: ["Reflect on the past week", "Note any mood changes or concerns"],
    chatInstructions: "Private, secure chat session. Feel free to share openly about your mental health journey.",
  },
]

const pastAppointments = [
  {
    id: 6,
    title: "Routine Blood Work",
    doctor: {
      name: "Dr. Sarah Wilson",
      specialty: "Internal Medicine",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    date: "2024-01-15",
    time: "9:00 AM",
    duration: "30 min",
    type: "in-person",
    status: "completed",
    location: "Lab - Floor 1",
    summary: "Blood work completed. Results show improved cholesterol levels.",
    followUp: "Schedule follow-up in 3 months",
  },
  {
    id: 7,
    title: "Diabetes Management Chat",
    doctor: {
      name: "Dr. Emily Rodriguez",
      specialty: "Endocrinology",
      image:
        "https://images.unsplash.com/photo-1594824475317-d0b8e8b5e8b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    date: "2024-01-10",
    time: "2:00 PM",
    duration: "45 min",
    type: "chat",
    status: "completed",
    chatRoom: "diabetes-management-completed",
    summary:
      "A1C levels improved to 6.8%. Discussed medication adjustments via chat. Patient responded well to text-based consultation.",
    followUp: "Next chat session in 6 weeks",
    chatSummary: "45-minute secure chat session completed. Patient asked 8 questions, all answered comprehensively.",
  },
  {
    id: 8,
    title: "Eye Examination",
    doctor: {
      name: "Dr. Lisa Park",
      specialty: "Ophthalmology",
      image:
        "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    },
    date: "2024-01-05",
    time: "1:30 PM",
    duration: "60 min",
    type: "in-person",
    status: "completed",
    location: "Eye Center - Room 3",
    summary: "No diabetic retinopathy detected. Vision prescription updated.",
    followUp: "Annual eye exam recommended",
  },
]

const availableSlots = [
  { date: "2024-01-26", time: "9:00 AM", available: true, type: "both" },
  { date: "2024-01-26", time: "10:30 AM", available: true, type: "chat" },
  { date: "2024-01-26", time: "2:00 PM", available: false, type: "both" },
  { date: "2024-01-27", time: "11:00 AM", available: true, type: "in-person" },
  { date: "2024-01-27", time: "3:30 PM", available: true, type: "chat" },
  { date: "2024-01-29", time: "9:30 AM", available: true, type: "both" },
]

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    specialty: "Internal Medicine",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    rating: 4.9,
    nextAvailable: "Tomorrow",
    chatAvailable: true,
    responseTime: "Usually responds within 2 hours",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    rating: 4.8,
    nextAvailable: "Jan 28",
    chatAvailable: true,
    responseTime: "Usually responds within 4 hours",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    image:
      "https://images.unsplash.com/photo-1594824475317-d0b8e8b5e8b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    rating: 4.9,
    nextAvailable: "Feb 1",
    chatAvailable: true,
    responseTime: "Usually responds within 1 hour",
  },
  {
    id: 4,
    name: "Dr. Amanda Foster",
    specialty: "Psychology",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    rating: 4.9,
    nextAvailable: "Jan 30",
    chatAvailable: true,
    responseTime: "Usually responds within 30 minutes",
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "text-green-600 bg-green-100"
    case "pending":
      return "text-yellow-600 bg-yellow-100"
    case "completed":
      return "text-blue-600 bg-blue-100"
    case "cancelled":
      return "text-red-600 bg-red-100"
    case "rescheduled":
      return "text-purple-600 bg-purple-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return <CheckCircleIcon className="w-4 h-4 text-green-600" />
    case "pending":
      return <ClockIcon className="w-4 h-4 text-yellow-600" />
    case "completed":
      return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
    case "cancelled":
      return <XMarkIcon className="w-4 h-4 text-red-600" />
    case "rescheduled":
      return <ArrowPathIcon className="w-4 h-4 text-purple-600" />
    default:
      return <InformationCircleIcon className="w-4 h-4 text-gray-600" />
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } })
}

const Appointments = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcomingAppointments.length },
    { id: "past", label: "Past", count: pastAppointments.length },
    { id: "book", label: "Book New", count: 0 },
  ]

  const filteredAppointments = (activeTab === "upcoming" ? upcomingAppointments : pastAppointments).filter(
    (appointment) => {
      const matchesSearch =
        appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus
      const matchesType = filterType === "all" || appointment.type === filterType

      return matchesSearch && matchesStatus && matchesType
    },
  )

  return (
    <div className="space-y-10 px-2 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your healthcare appointments and schedule new visits</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Schedule New</span>
        </button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pastAppointments.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingAppointments.filter((a) => a.type === "chat").length}
              </p>
              <p className="text-sm text-gray-600">Chat Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingAppointments.filter((a) => a.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <UserIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              <p className="text-sm text-gray-600">Providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments, doctors, or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="in-person">In-Person</option>
              <option value="chat">Chat Sessions</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-green-100 rounded-xl transition-colors">
              <FunnelIcon className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg"
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Upcoming/Past Appointments */}
          {(activeTab === "upcoming" || activeTab === "past") && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments found.</p>
                  {activeTab === "upcoming" && (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Schedule your first appointment
                    </button>
                  )}
                </div>
              ) : (
                filteredAppointments.map((appointment, i) => (
                  <motion.div
                    key={appointment.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(16,185,129,0.10)" }}
                    className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={appointment.doctor.image || "/placeholder.svg"}
                          alt={appointment.doctor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {appointment.doctor.name} • {appointment.doctor.specialty}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                {appointment.time} ({appointment.duration})
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {appointment.type === "chat" ? (
                                <>
                                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                  <span>Chat Session</span>
                                </>
                              ) : (
                                <>
                                  <MapPinIcon className="w-4 h-4" />
                                  <span>In-Person</span>
                                </>
                              )}
                            </div>
                          </div>

                          {appointment.notes && <p className="text-sm text-gray-600 mb-3">{appointment.notes}</p>}

                          {appointment.chatInstructions && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Chat Instructions</span>
                              </div>
                              <p className="text-sm text-purple-700">{appointment.chatInstructions}</p>
                            </div>
                          )}

                          {appointment.summary && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <p className="text-sm text-blue-800">{appointment.summary}</p>
                              {appointment.followUp && (
                                <p className="text-xs text-blue-600 mt-1">Follow-up: {appointment.followUp}</p>
                              )}
                              {appointment.chatSummary && (
                                <p className="text-xs text-blue-600 mt-1">Chat Summary: {appointment.chatSummary}</p>
                              )}
                            </div>
                          )}

                          {appointment.preparation && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-yellow-800 mb-2">Preparation Required:</p>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {appointment.preparation.map((item, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {activeTab === "upcoming" && (
                          <>
                            {appointment.type === "chat" && appointment.chatRoom && (
                              <button className="flex items-center space-x-1 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span>Open Chat</span>
                              </button>
                            )}
                            <button className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </>
                        )}
                        {getStatusIcon(appointment.status)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Book New Appointment */}
          {activeTab === "book" && (
            <div className="space-y-6">
              {/* Available Doctors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Healthcare Provider</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={doctor.image || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          {doctor.chatAvailable && (
                            <div className="flex items-center space-x-1 mt-1">
                              <ChatBubbleLeftRightIcon className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600">Chat Available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-gray-600">{doctor.rating}</span>
                          </div>
                          <span className="text-green-600">Next: {doctor.nextAvailable}</span>
                        </div>
                        {doctor.responseTime && <p className="text-xs text-gray-500">{doctor.responseTime}</p>}
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Book In-Person
                        </button>
                        {doctor.chatAvailable && (
                          <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-1">
                            <ChatBubbleLeftRightIcon className="w-3 h-3" />
                            <span>Book Chat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Booking Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Booking Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <HeartIcon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Annual Physical</h4>
                        <p className="text-sm text-gray-600">Comprehensive health checkup</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Duration: 60 minutes • In-Person Only</p>
                    <button className="w-full px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      Schedule Now
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Chat Consultation</h4>
                        <p className="text-sm text-gray-600">Text-based appointment</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Duration: 30-45 minutes • Secure Chat</p>
                    <button className="w-full px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      Start Chat Session
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Urgent Care</h4>
                        <p className="text-sm text-gray-600">Same-day appointment</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Duration: 45 minutes • Both Options</p>
                    <button className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      Book Urgent
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Time Slots */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {availableSlots.map((slot, index) => (
                      <div key={index} className="space-y-2">
                        <button
                          disabled={!slot.available}
                          className={`w-full p-3 rounded-lg text-sm font-medium transition-colors ${
                            slot.available
                              ? "bg-white border border-gray-200 text-gray-900 hover:border-green-500 hover:text-green-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <div>
                            {new Date(slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div>{slot.time}</div>
                        </button>
                        {slot.available && (
                          <div className="flex justify-center space-x-1">
                            {(slot.type === "both" || slot.type === "in-person") && (
                              <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">In-Person</span>
                            )}
                            {(slot.type === "both" || slot.type === "chat") && (
                              <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">Chat</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Showing next available slots. Need a different time?{" "}
                    <button className="text-green-600 hover:text-green-700 font-medium">View more options</button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedAppointment.title}</h2>
                <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAppointment.doctor.image || "/placeholder.svg"}
                  alt={selectedAppointment.doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAppointment.doctor.name}</h3>
                  <p className="text-gray-600">{selectedAppointment.doctor.specialty}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {selectedAppointment.time} ({selectedAppointment.duration})
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Type & Location</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedAppointment.type === "chat" ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>Secure Chat Session</span>
                        </div>
                        {selectedAppointment.chatRoom && (
                          <p className="text-xs text-gray-500 ml-6">Room: {selectedAppointment.chatRoom}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{selectedAppointment.location}</span>
                        </div>
                        {selectedAppointment.address && (
                          <p className="text-xs text-gray-500 ml-6">{selectedAppointment.address}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Chat Instructions */}
              {selectedAppointment.chatInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Chat Session Information</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-700">{selectedAppointment.chatInstructions}</p>
                  </div>
                </div>
              )}

              {/* Preparation */}
              {selectedAppointment.preparation && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preparation Required</h4>
                  <ul className="space-y-1">
                    {selectedAppointment.preparation.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedAppointment.type === "chat" && selectedAppointment.chatRoom && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>
                )}
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <PencilIcon className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Appointments
