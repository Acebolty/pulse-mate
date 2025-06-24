"use client"

import { useState, useEffect } from "react"
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserIcon, // For patient
  UsersIcon, // For multiple patients / patient list
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon, // For notes/charts
  VideoCameraIcon, // For virtual appointments (doctor's view)
  BriefcaseIcon, // For specialties or general doctor icon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

// Dummy appointments data for Doctor's View
const upcomingAppointments = [
  {
    id: 1,
    appointmentTitle: "Follow-up: Diabetes Management",
    patient: {
      name: "Alice Wonderland",
      age: 45,
      gender: "Female",
      image: "https://randomuser.me/api/portraits/women/44.jpg", // Placeholder
    },
    date: "2024-01-25",
    time: "10:00 AM",
    duration: "30 min",
    type: "chat", // 'chat' or 'in-person'
    status: "confirmed", // 'confirmed', 'pending', 'completed', 'cancelled'
    reasonForVisit: "Review A1C levels and medication adjustment.",
    patientNotes: "Feeling tired lately, occasional dizziness.",
    doctorNotes: "", // For doctor to fill
    chatRoom: "diabetes-followup-alice-xyz789",
  },
  {
    id: 2,
    appointmentTitle: "New Patient: Cardiac Evaluation",
    patient: {
      name: "Robert Smith",
      age: 58,
      gender: "Male",
      image: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder
    },
    date: "2024-01-25",
    time: "11:00 AM",
    duration: "60 min",
    type: "in-person",
    status: "confirmed",
    location: "Clinic Room 3B",
    reasonForVisit: "Referred by GP for palpitations.",
    patientNotes: "Experiencing heart flutters, especially after exertion.",
    doctorNotes: "Perform EKG, check vitals, review family history.",
  },
  {
    id: 3,
    appointmentTitle: "Routine Check-up",
    patient: {
      name: "Maria Garcia",
      age: 32,
      gender: "Female",
      image: "https://randomuser.me/api/portraits/women/68.jpg", // Placeholder
    },
    date: "2024-01-26",
    time: "09:30 AM",
    duration: "45 min",
    type: "in-person",
    status: "pending", // Patient needs to confirm
    location: "Clinic Room 1A",
    reasonForVisit: "Annual physical examination.",
    patientNotes: "No specific concerns, general wellness check.",
    doctorNotes: "",
  },
    {
    id: 4,
    appointmentTitle: "Mental Health Support",
    patient: {
      name: "John Doe",
      age: 28,
      gender: "Male",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    date: "2024-01-26",
    time: "02:00 PM",
    duration: "50 min",
    type: "chat",
    status: "confirmed",
    reasonForVisit: "Weekly check-in for anxiety management.",
    patientNotes: "Feeling more anxious this week due to work stress.",
    chatRoom: "mentalhealth-johnd-abc123",
    doctorNotes: "Explore coping mechanisms, review medication effectiveness.",
  },
]

const pastAppointments = [
  {
    id: 5,
    appointmentTitle: "Medication Review",
    patient: {
      name: "Charles Brown",
      age: 67,
      gender: "Male",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
    },
    date: "2024-01-18",
    time: "02:00 PM",
    duration: "30 min",
    type: "chat",
    status: "completed",
    reasonForVisit: "Reviewing blood pressure medication.",
    summary: "Adjusted Lisinopril dosage. Patient reports no side effects. BP readings stable.",
    followUp: "Check BP in 2 weeks.",
  },
  {
    id: 6,
    appointmentTitle: "Post-Op Follow-up",
    patient: {
      name: "Linda Green",
      age: 52,
      gender: "Female",
      image: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    date: "2024-01-15",
    time: "10:30 AM",
    duration: "45 min",
    type: "in-person",
    status: "completed",
    location: "Clinic Room 2C",
    reasonForVisit: "Knee surgery follow-up.",
    summary: "Incision healing well. Range of motion improving. Prescribed further PT.",
    followUp: "Physical therapy twice a week. Next follow-up in 4 weeks.",
  },
]

// Simplified patient list for "Schedule Patient" tab
const patientsForScheduling = [
    { id: 101, name: "Alice Wonderland", lastSeen: "2024-01-10" },
    { id: 102, name: "Robert Smith", lastSeen: "2023-12-05" },
    { id: 103, name: "Maria Garcia", lastSeen: "2024-01-02" },
    { id: 104, name: "John Doe", lastSeen: "2024-01-18" },
    { id: 105, name: "Charles Brown", lastSeen: "2024-01-18"},
    { id: 106, name: "Linda Green", lastSeen: "2024-01-15"},
    { id: 107, name: "Kevin White", lastSeen: "2023-11-20"},
];


const getStatusColor = (status) => {
  // Same as patient's version, can be reused or made a shared util
  switch (status) {
    case "confirmed": return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-700/30";
    case "pending": return "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-600/30";
    case "completed": return "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30";
    case "cancelled": return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-700/30";
    default: return "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50";
  }
}

const getStatusIcon = (status) => {
  // Same as patient's version
  switch (status) {
    case "confirmed": return <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "pending": return <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    case "completed": return <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "cancelled": return <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default: return <InformationCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  }
}

const formatDate = (dateString) => {
  // Same as patient's version
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } })
};

const YourAppointments = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showSchedulingModal, setShowSchedulingModal] = useState(false); // For doctor scheduling
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [editingNotes, setEditingNotes] = useState(false);
  const [currentDoctorNotes, setCurrentDoctorNotes] = useState("");

  const tabs = [
    { id: "upcoming", label: "Upcoming Appointments", count: upcomingAppointments.length },
    { id: "past", label: "Past Appointments", count: pastAppointments.length },
    { id: "schedule", label: "Schedule Patient / Calendar", count: 0 }, // Changed from "Book New"
  ];

  const filteredAppointments = (activeTab === "upcoming" ? upcomingAppointments : pastAppointments).filter(
    (appointment) => {
      const matchesSearch =
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.appointmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.reasonForVisit && appointment.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      const matchesType = filterType === "all" || appointment.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }
  );
  
  useEffect(() => {
    if (selectedAppointment) {
      setCurrentDoctorNotes(selectedAppointment.doctorNotes || "");
    }
  }, [selectedAppointment]);


  const handleOpenAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditingNotes(false); // Reset editing state
  };
  
  const handleSaveNotes = () => {
    if (selectedAppointment) {
        // Here you would typically save the notes to your backend
        console.log("Saving notes for appointment ID:", selectedAppointment.id, "Notes:", currentDoctorNotes);
        // Update the local state for immediate UI feedback (optional, depends on data flow)
        setSelectedAppointment(prev => ({...prev, doctorNotes: currentDoctorNotes}));
        setEditingNotes(false);
        // You might want to refresh the appointments list or update the specific appointment
    }
  };


  return (
    <div className="space-y-10 px-2 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Patient Appointments</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-1">Manage your schedule and patient consultations</p>
        </div>
        <button
          onClick={() => { setActiveTab("schedule"); setShowSchedulingModal(true); }}
          className="flex items-center justify-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 md:px-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow text-sm md:text-base"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </motion.div>

      {/* Quick Stats - Doctor's Perspective */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-700/30 rounded-xl md:rounded-xl">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">{upcomingAppointments.length}</p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Upcoming Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-700/30 rounded-xl md:rounded-xl">
              <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {pastAppointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-700/30 rounded-xl md:rounded-xl">
              <ChatBubbleLeftRightIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {upcomingAppointments.filter(a => a.type === "chat").length}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Active Chats</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-600/30 rounded-xl md:rounded-xl">
              <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {/* Placeholder for pending actions, e.g. lab results to review */}3
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Pending Actions</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700 col-span-2 sm:col-span-1 md:col-span-1">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-indigo-100 dark:bg-indigo-700/30 rounded-xl md:rounded-xl">
              <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {new Set(upcomingAppointments.map(a => a.patient.name)).size}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Patients Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 md:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search patient name, appointment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="in-person">In-Person</option>
              <option value="chat">Chat Sessions</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
             <button className="flex items-center justify-center space-x-2 px-3 py-2 text-sm md:text-base text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-blue-100 dark:hover:bg-blue-700/20 rounded-xl transition-colors w-full sm:w-auto">
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg"
      >
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 px-3 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 md:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                {tab.label} {tab.count > 0 && tab.id !== 'schedule' && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {(activeTab === "upcoming" || activeTab === "past") && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No appointments found for this view.</p>
                </div>
              ) : (
                filteredAppointments.map((appointment, i) => (
                  <motion.div
                    key={appointment.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(59,130,246,0.10)" }} // Blueish shadow
                    className="border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 md:p-6 bg-white dark:bg-slate-800 hover:shadow-xl dark:hover:shadow-slate-700/30 transition-shadow cursor-pointer"
                    onClick={() => handleOpenAppointmentModal(appointment)}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        <img
                          src={appointment.patient.image || "https://via.placeholder.com/150/cccccc/808080?text=Patient"}
                          alt={appointment.patient.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-2">
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-slate-100">{appointment.patient.name}</h3>
                            <span className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)} self-start sm:self-center`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-300 mb-1 sm:mb-2">
                            {appointment.appointmentTitle}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 md:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-2 md:mb-3">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                              <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                              {appointment.type === "chat" ? (
                                <><ChatBubbleLeftRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" /><span>Chat</span></>
                              ) : (
                                <><MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" /><span>In-Person</span></>
                              )}
                            </div>
                          </div>
                           {appointment.reasonForVisit && <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-3 italic">Reason: {appointment.reasonForVisit}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-0 ml-0 sm:ml-4">
                        {activeTab === "upcoming" && (
                          <>
                            {appointment.type === "chat" && (
                              <button className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-700/20 rounded-xl transition-colors w-full sm:w-auto justify-center">
                                <ChatBubbleLeftRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Start Chat</span>
                              </button>
                            )}
                             <button className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-700/20 rounded-xl transition-colors w-full sm:w-auto justify-center">
                                <VideoCameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Join Video</span>
                              </button>
                          </>
                        )}
                         <button className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors w-full sm:w-auto justify-center">
                            <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View Chart</span>
                          </button>
                        <div className="self-center sm:self-auto pt-1 sm:pt-0">{getStatusIcon(appointment.status)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "schedule" && (
             <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Schedule New Appointment / Manage Calendar</h3>
                <p className="text-gray-600 dark:text-slate-300">
                    This section will house the doctor's calendar view for managing availability and tools for scheduling specific patients. 
                    Development for this feature is planned.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Quick Schedule for Patient</h4>
                        <select className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg mb-3 dark:bg-slate-700 dark:text-slate-200">
                            <option>Select Patient</option>
                            {patientsForScheduling.map(p => <option key={p.id} value={p.id}>{p.name} (Last seen: {p.lastSeen})</option>)}
                        </select>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">Find Next Available</button>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Manage Availability</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Block off time, set recurring availability, etc.</p>
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg">Open Calendar Settings</button>
                    </div>
                </div>
                 {/* Placeholder for a more detailed calendar view component */}
                <div className="bg-gray-100 dark:bg-slate-700/30 p-10 rounded-xl text-center text-gray-500 dark:text-slate-400">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-2" />
                    Full Calendar View - Coming Soon
                </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Appointment Detail Modal (Doctor's View) */}
      {selectedAppointment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAppointment(null)} // Close on backdrop click
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100">
                  {selectedAppointment.appointmentTitle}
                </h2>
                <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Patient: {selectedAppointment.patient.name} ({selectedAppointment.patient.age}, {selectedAppointment.patient.gender})
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-1">Date & Time</h4>
                  <p className="text-sm text-gray-800 dark:text-slate-100">{formatDate(selectedAppointment.date)} at {selectedAppointment.time} ({selectedAppointment.duration})</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-1">Type & Location/Room</h4>
                  <p className="text-sm text-gray-800 dark:text-slate-100">
                    {selectedAppointment.type === 'chat' ? `Chat Session (${selectedAppointment.chatRoom || 'N/A'})` : `In-Person (${selectedAppointment.location || 'N/A'})`}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-1">Reason for Visit</h4>
                <p className="text-sm text-gray-600 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-md">{selectedAppointment.reasonForVisit || "Not specified."}</p>
              </div>

              {selectedAppointment.patientNotes && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-1">Patient Provided Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-md">{selectedAppointment.patientNotes}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300">Doctor's Consultation Notes</h4>
                    {!editingNotes && (
                        <button onClick={() => setEditingNotes(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                    )}
                </div>
                {editingNotes ? (
                    <>
                        <textarea 
                            value={currentDoctorNotes}
                            onChange={(e) => setCurrentDoctorNotes(e.target.value)}
                            rows="4"
                            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm dark:bg-slate-700 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter consultation notes, findings, treatment plan..."
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => { setEditingNotes(false); setCurrentDoctorNotes(selectedAppointment.doctorNotes || "");}} className="text-xs px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">Cancel</button>
                            <button onClick={handleSaveNotes} className="text-xs px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Notes</button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-md min-h-[50px]">
                        {currentDoctorNotes || "No notes added yet."}
                    </p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0 border-t border-gray-200 dark:border-slate-700">
              {selectedAppointment.type === 'chat' && selectedAppointment.status === 'confirmed' && (
                 <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-purple-600 dark:bg-purple-500 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors w-full sm:w-auto">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Start Secure Chat</span>
                  </button>
              )}
              {selectedAppointment.type === 'in-person' && selectedAppointment.status === 'confirmed' && (
                 <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors w-full sm:w-auto">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Mark as Arrived</span>
                  </button>
              )}
               <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reschedule</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm border border-red-300 dark:border-red-500/70 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-700/20 transition-colors w-full sm:w-auto">
                <XMarkIcon className="w-4 h-4" />
                <span>Cancel Appointment</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}

export default YourAppointments;
