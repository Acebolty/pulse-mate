"use client"

import { useState, useEffect } from "react"
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserIcon, // For patient
  UsersIcon, // For multiple patients / patient list
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
import api from "../services/api"
import { getCurrentUser } from "../services/authService"

// Helper function to transform backend appointment data for display
const transformAppointmentData = (appointment, userData = null) => {
  // Use populated userId data if available, otherwise use passed userData
  const patientData = appointment.userId || userData;

  return {
    id: appointment._id,
    appointmentTitle: appointment.reason || "General Consultation",
    patient: {
      name: patientData ? `${patientData.firstName} ${patientData.lastName}` : "Patient",
      age: patientData?.dateOfBirth ? new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear() : "N/A",
      gender: patientData?.gender || "N/A",
      image: patientData?.profilePicture || "https://via.placeholder.com/150/cccccc/808080?text=Patient",
    },
    date: new Date(appointment.dateTime).toISOString().split('T')[0],
    time: new Date(appointment.dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    duration: "30 min", // Default duration, could be added to backend model
    type: appointment.type === 'Virtual' ? 'chat' : 'in-person',
    status: appointment.status.toLowerCase(),
    reasonForVisit: appointment.reason,
    patientNotes: "", // Could be added to backend model
    doctorNotes: appointment.notes || "",
    virtualLink: appointment.virtualLink,
    originalData: appointment // Keep reference to original data
  };
};



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
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [editingNotes, setEditingNotes] = useState(false);
  const [currentDoctorNotes, setCurrentDoctorNotes] = useState("");

  // New state for real data
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Status management state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null); // 'reschedule', 'complete', 'cancel'
  const [statusLoading, setStatusLoading] = useState(false);

  // Patient health chart state
  const [showPatientHealthModal, setShowPatientHealthModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHealthData, setPatientHealthData] = useState(null);
  const [healthDataLoading, setHealthDataLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [completionData, setCompletionData] = useState({
    summary: '',
    followUpNeeded: false,
    followUpDate: '',
    recommendations: ''
  });
  const [cancellationData, setCancellationData] = useState({
    reason: '',
    notifyPatient: true,
    refundRequested: false
  });

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current doctor info
      const user = getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Use the doctor-specific endpoint
      const response = await api.get('/appointments/doctor?limit=100');

      if (response.data && response.data.data) {
        // Transform the data for display
        const transformedAppointments = response.data.data.map(apt =>
          transformAppointmentData(apt, apt.userId)
        );

        setAppointments(transformedAppointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Separate appointments into upcoming and past based on date AND status
  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.originalData.dateTime);
    const isInFuture = appointmentDate >= now;
    const isActive = apt.status !== 'completed' && apt.status !== 'cancelled';
    return isInFuture && isActive;
  });

  const pastAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.originalData.dateTime);
    const isInPast = appointmentDate < now;
    const isCompleted = apt.status === 'completed' || apt.status === 'cancelled';
    return isInPast || isCompleted;
  });

  const tabs = [
    { id: "upcoming", label: "Upcoming Appointments", count: upcomingAppointments.length },
    { id: "past", label: "Past Appointments", count: pastAppointments.length },
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
  
  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      setCurrentDoctorNotes(selectedAppointment.doctorNotes || "");
    }
  }, [selectedAppointment]);


  const handleOpenAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditingNotes(false); // Reset editing state
  };
  
  const handleSaveNotes = async () => {
    if (selectedAppointment) {
      try {
        // Save notes to backend
        await api.put(`/appointments/${selectedAppointment.id}`, {
          notes: currentDoctorNotes
        });

        // Update local state for immediate UI feedback
        setSelectedAppointment(prev => ({...prev, doctorNotes: currentDoctorNotes}));

        // Update the appointments list
        setAppointments(prev => prev.map(apt =>
          apt.id === selectedAppointment.id
            ? {...apt, doctorNotes: currentDoctorNotes}
            : apt
        ));

        setEditingNotes(false);
        console.log("Notes saved successfully");
      } catch (err) {
        console.error("Error saving notes:", err);
        setError("Failed to save notes");
      }
    }
  };

  // Status management functions
  const handleStatusChange = async (newStatus, additionalData = {}) => {
    if (!selectedAppointment) return;

    setStatusLoading(true);
    try {
      const updateData = {
        status: newStatus,
        ...additionalData
      };

      await api.put(`/appointments/${selectedAppointment.id}`, updateData);

      // Update local state
      const updatedAppointment = {
        ...selectedAppointment,
        status: newStatus.toLowerCase(),
        ...additionalData
      };

      setSelectedAppointment(updatedAppointment);

      // Update appointments list
      setAppointments(prev => prev.map(apt =>
        apt.id === selectedAppointment.id
          ? {...apt, status: newStatus.toLowerCase(), ...additionalData}
          : apt
      ));

      // Close modals
      setShowStatusModal(false);
      setStatusAction(null);

      // Reset form data
      setRescheduleData({ date: '', time: '', reason: '' });
      setCompletionData({ summary: '', followUpNeeded: false, followUpDate: '', recommendations: '' });
      setCancellationData({ reason: '', notifyPatient: true, refundRequested: false });

      console.log(`Appointment status updated to: ${newStatus}`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError("Failed to update appointment status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    await handleStatusChange(newStatus);
  };

  const openStatusModal = (action) => {
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      setError("Please select both date and time for rescheduling");
      return;
    }

    const newDateTime = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
    await handleStatusChange('Scheduled', {
      dateTime: newDateTime.toISOString(),
      rescheduleReason: rescheduleData.reason
    });
  };

  const handleComplete = async () => {
    await handleStatusChange('Completed', {
      completionSummary: completionData.summary,
      followUpNeeded: completionData.followUpNeeded,
      followUpDate: completionData.followUpDate,
      recommendations: completionData.recommendations,
      completedAt: new Date().toISOString()
    });
  };

  const handleCancel = async () => {
    if (!cancellationData.reason) {
      setError("Please provide a reason for cancellation");
      return;
    }

    await handleStatusChange('Cancelled', {
      cancellationReason: cancellationData.reason,
      notifyPatient: cancellationData.notifyPatient,
      refundRequested: cancellationData.refundRequested,
      cancelledAt: new Date().toISOString()
    });
  };

  // Patient health chart functions
  const handleViewPatientChart = async (appointment) => {
    setSelectedPatient({
      ...appointment.patient,
      appointmentId: appointment.id,
      appointmentReason: appointment.reasonForVisit,
      userId: appointment.originalData.userId._id || appointment.originalData.userId
    });
    setShowPatientHealthModal(true);

    // Fetch real patient health data
    await fetchPatientHealthData(appointment.originalData.userId._id || appointment.originalData.userId);
  };

  const fetchPatientHealthData = async (patientUserId) => {
    setHealthDataLoading(true);
    try {
      // Get date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Fetch health data, patient profile, and alerts using doctor-specific endpoints
      const [heartRateRes, bloodPressureRes, glucoseRes, temperatureRes, profileRes, alertsRes] = await Promise.allSettled([
        api.get(`/health-data/patient/${patientUserId}?dataType=heartRate&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=50`),
        api.get(`/health-data/patient/${patientUserId}?dataType=bloodPressure&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=50`),
        api.get(`/health-data/patient/${patientUserId}?dataType=glucoseLevel&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=50`),
        api.get(`/health-data/patient/${patientUserId}?dataType=bodyTemperature&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=50`),
        api.get(`/profile/patient/${patientUserId}`),
        api.get(`/alerts/patient/${patientUserId}?limit=10`)
      ]);

      // Process the health data
      const healthData = {
        heartRate: heartRateRes.status === 'fulfilled' ? heartRateRes.value.data.data : [],
        bloodPressure: bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data.data : [],
        glucoseLevel: glucoseRes.status === 'fulfilled' ? glucoseRes.value.data.data : [],
        bodyTemperature: temperatureRes.status === 'fulfilled' ? temperatureRes.value.data.data : [],
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
        alerts: alertsRes.status === 'fulfilled' ? alertsRes.value.data.data : []
      };

      // Calculate latest readings and averages
      const processedData = {
        ...healthData,
        latest: {
          heartRate: healthData.heartRate[0] || null,
          bloodPressure: healthData.bloodPressure[0] || null,
          glucoseLevel: healthData.glucoseLevel[0] || null,
          bodyTemperature: healthData.bodyTemperature[0] || null
        },
        averages: {
          heartRate: calculateAverage(healthData.heartRate, 'value'),
          bloodPressure: calculateBloodPressureAverage(healthData.bloodPressure),
          glucoseLevel: calculateAverage(healthData.glucoseLevel, 'value'),
          bodyTemperature: calculateAverage(healthData.bodyTemperature, 'value')
        }
      };

      setPatientHealthData(processedData);
    } catch (err) {
      console.error('Error fetching patient health data:', err);
      setError('Failed to fetch patient health data');
    } finally {
      setHealthDataLoading(false);
    }
  };

  // Helper functions for calculations
  const calculateAverage = (dataArray, valueField) => {
    if (!dataArray || dataArray.length === 0) return null;
    const sum = dataArray.reduce((acc, item) => acc + (item[valueField] || 0), 0);
    return Math.round((sum / dataArray.length) * 10) / 10;
  };

  const calculateBloodPressureAverage = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;
    const systolicSum = dataArray.reduce((acc, item) => acc + (item.value?.systolic || 0), 0);
    const diastolicSum = dataArray.reduce((acc, item) => acc + (item.value?.diastolic || 0), 0);
    return {
      systolic: Math.round(systolicSum / dataArray.length),
      diastolic: Math.round(diastolicSum / dataArray.length)
    };
  };

  const getHealthStatus = (value, type) => {
    if (!value) return 'No Data';

    switch (type) {
      case 'heartRate':
        return value >= 60 && value <= 100 ? 'Normal' : value < 60 ? 'Low' : 'High';
      case 'bloodPressure':
        const systolic = value.systolic || value;
        const diastolic = value.diastolic || 0;
        if (systolic < 120 && diastolic < 80) return 'Normal';
        if (systolic < 140 && diastolic < 90) return 'Elevated';
        return 'High';
      case 'glucoseLevel':
        return value >= 70 && value <= 140 ? 'Normal' : value < 70 ? 'Low' : 'High';
      case 'bodyTemperature':
        return value >= 97.0 && value <= 99.5 ? 'Normal' : value < 97.0 ? 'Low' : 'High';
      default:
        return 'Unknown';
    }
  };

  // Helper function to process 7-day trend data
  const process7DayTrend = (dataArray, valueField = 'value') => {
    if (!dataArray || dataArray.length === 0) return null;

    // Group by day and get daily averages
    const dailyData = {};
    dataArray.forEach(reading => {
      const day = new Date(reading.timestamp).toDateString();
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      dailyData[day].push(reading);
    });

    // Create 7-day array with daily averages
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toDateString();

      if (dailyData[dayKey]) {
        const dayReadings = dailyData[dayKey];
        let avgValue;

        if (valueField === 'value' && typeof dayReadings[0].value === 'object') {
          // Handle blood pressure
          const systolicAvg = dayReadings.reduce((sum, r) => sum + (r.value.systolic || 0), 0) / dayReadings.length;
          const diastolicAvg = dayReadings.reduce((sum, r) => sum + (r.value.diastolic || 0), 0) / dayReadings.length;
          avgValue = { systolic: Math.round(systolicAvg), diastolic: Math.round(diastolicAvg) };
        } else {
          // Handle single values
          avgValue = dayReadings.reduce((sum, r) => sum + (r[valueField] || 0), 0) / dayReadings.length;
          avgValue = Math.round(avgValue * 10) / 10;
        }

        last7Days.push({
          date: date,
          value: avgValue,
          count: dayReadings.length
        });
      } else {
        last7Days.push({
          date: date,
          value: null,
          count: 0
        });
      }
    }

    return last7Days;
  };

  // Helper function to calculate trend direction
  const getTrendDirection = (trendData, valueField = 'value') => {
    if (!trendData || trendData.length < 2) return { direction: 'stable', change: 0 };

    const validData = trendData.filter(d => d.value !== null);
    if (validData.length < 2) return { direction: 'stable', change: 0 };

    const firstValue = valueField === 'systolic' && typeof validData[0].value === 'object'
      ? validData[0].value.systolic
      : typeof validData[0].value === 'object'
      ? validData[0].value.diastolic || 0
      : validData[0].value;

    const lastValue = valueField === 'systolic' && typeof validData[validData.length - 1].value === 'object'
      ? validData[validData.length - 1].value.systolic
      : typeof validData[validData.length - 1].value === 'object'
      ? validData[validData.length - 1].value.diastolic || 0
      : validData[validData.length - 1].value;

    const change = ((lastValue - firstValue) / firstValue) * 100;

    if (Math.abs(change) < 5) return { direction: 'stable', change: Math.round(change * 10) / 10 };
    return {
      direction: change > 0 ? 'increasing' : 'decreasing',
      change: Math.round(change * 10) / 10
    };
  };


  // Show loading state
  if (loading) {
    return (
      <div className="space-y-10 px-2 md:px-0">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-slate-400">Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-2 md:px-0">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={fetchAppointments}
              className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">My Patient Appointments</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-1">
            Manage your schedule and patient consultations
            {currentUser && ` - Dr. ${currentUser.firstName} ${currentUser.lastName}`}
          </p>
        </div>
      </motion.div>

      {/* Quick Stats - Doctor's Perspective */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-700/30 rounded-xl md:rounded-xl">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {upcomingAppointments.filter(a =>
                  new Date(a.originalData.dateTime).toDateString() === new Date().toDateString()
                ).length}
              </p>
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
                {appointments.filter(a =>
                  (a.status === 'completed' || a.status === 'cancelled') &&
                  new Date(a.originalData.dateTime).toDateString() === new Date().toDateString()
                ).length}
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
                {upcomingAppointments.filter(a =>
                  a.type === "chat" &&
                  new Date(a.originalData.dateTime).toDateString() === new Date().toDateString()
                ).length}
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
                {upcomingAppointments.filter(a => a.status === 'scheduled').length}
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
                {new Set(
                  upcomingAppointments
                    .filter(a => new Date(a.originalData.dateTime).toDateString() === new Date().toDateString())
                    .map(a => a.patient.name)
                ).size}
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
                        {/* Send Message button for both upcoming and past appointments */}
                        <button className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-700/20 rounded-xl transition-colors w-full sm:w-auto justify-center">
                          <ChatBubbleLeftRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Send Message</span>
                        </button>
                         <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPatientChart(appointment);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors w-full sm:w-auto justify-center"
                          >
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

              {/* Status Management Section */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-3">Appointment Management</h4>

                {/* Current Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Current Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      selectedAppointment.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                      selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {selectedAppointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleQuickStatusUpdate('Confirmed')}
                        disabled={statusLoading}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>
                    )}

                    {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'scheduled') && (
                      <>
                        <button
                          onClick={() => openStatusModal('reschedule')}
                          disabled={statusLoading}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <ClockIcon className="w-3 h-3" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => openStatusModal('complete')}
                          disabled={statusLoading}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          <DocumentTextIcon className="w-3 h-3" />
                          <span>Complete</span>
                        </button>

                        <button
                          onClick={() => openStatusModal('cancel')}
                          disabled={statusLoading}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <XMarkIcon className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* No Show Button for past appointments */}
                {selectedAppointment.status === 'confirmed' && new Date(selectedAppointment.originalData.dateTime) < new Date() && (
                  <button
                    onClick={() => handleQuickStatusUpdate('No Show')}
                    disabled={statusLoading}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors mb-4"
                  >
                    Mark as No Show
                  </button>
                )}
              </div>

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

            {/* Modal Footer Actions - Quick Actions Only */}
            {(selectedAppointment.type === 'chat' || selectedAppointment.type === 'in-person') && selectedAppointment.status === 'confirmed' && (
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0 border-t border-gray-200 dark:border-slate-700">
                {selectedAppointment.type === 'chat' && (
                   <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-purple-600 dark:bg-purple-500 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors w-full sm:w-auto">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Start Secure Chat</span>
                    </button>
                )}
                {selectedAppointment.type === 'in-person' && (
                   <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors w-full sm:w-auto">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Mark as Arrived</span>
                    </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Status Management Modals */}
      {showStatusModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowStatusModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reschedule Modal */}
            {statusAction === 'reschedule' && (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Reschedule Appointment</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {selectedAppointment?.patient.name} - {selectedAppointment?.appointmentTitle}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">New Date</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData(prev => ({...prev, date: e.target.value}))}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">New Time</label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData(prev => ({...prev, time: e.target.value}))}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Reason (Optional)</label>
                    <textarea
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData(prev => ({...prev, reason: e.target.value}))}
                      rows="3"
                      placeholder="Reason for rescheduling..."
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="p-6 flex space-x-3 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={statusLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {statusLoading ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                </div>
              </>
            )}

            {/* Complete Modal */}
            {statusAction === 'complete' && (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Complete Appointment</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {selectedAppointment?.patient.name} - {selectedAppointment?.appointmentTitle}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Consultation Summary</label>
                    <textarea
                      value={completionData.summary}
                      onChange={(e) => setCompletionData(prev => ({...prev, summary: e.target.value}))}
                      rows="4"
                      placeholder="Brief summary of consultation, findings, and treatment..."
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Recommendations</label>
                    <textarea
                      value={completionData.recommendations}
                      onChange={(e) => setCompletionData(prev => ({...prev, recommendations: e.target.value}))}
                      rows="3"
                      placeholder="Treatment recommendations, lifestyle changes, etc..."
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="followUpNeeded"
                      checked={completionData.followUpNeeded}
                      onChange={(e) => setCompletionData(prev => ({...prev, followUpNeeded: e.target.checked}))}
                      className="rounded border-gray-300 dark:border-slate-600"
                    />
                    <label htmlFor="followUpNeeded" className="text-sm text-gray-700 dark:text-slate-300">
                      Follow-up appointment needed
                    </label>
                  </div>
                  {completionData.followUpNeeded && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={completionData.followUpDate}
                        onChange={(e) => setCompletionData(prev => ({...prev, followUpDate: e.target.value}))}
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
                <div className="p-6 flex space-x-3 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={statusLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {statusLoading ? 'Completing...' : 'Mark Complete'}
                  </button>
                </div>
              </>
            )}

            {/* Cancel Modal */}
            {statusAction === 'cancel' && (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Cancel Appointment</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {selectedAppointment?.patient.name} - {selectedAppointment?.appointmentTitle}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Cancellation Reason *</label>
                    <select
                      value={cancellationData.reason}
                      onChange={(e) => setCancellationData(prev => ({...prev, reason: e.target.value}))}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
                    >
                      <option value="">Select reason...</option>
                      <option value="Doctor unavailable">Doctor unavailable</option>
                      <option value="Patient requested">Patient requested</option>
                      <option value="Medical emergency">Medical emergency</option>
                      <option value="Equipment issue">Equipment issue</option>
                      <option value="Weather/Emergency">Weather/Emergency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifyPatient"
                      checked={cancellationData.notifyPatient}
                      onChange={(e) => setCancellationData(prev => ({...prev, notifyPatient: e.target.checked}))}
                      className="rounded border-gray-300 dark:border-slate-600"
                    />
                    <label htmlFor="notifyPatient" className="text-sm text-gray-700 dark:text-slate-300">
                      Send notification to patient
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="refundRequested"
                      checked={cancellationData.refundRequested}
                      onChange={(e) => setCancellationData(prev => ({...prev, refundRequested: e.target.checked}))}
                      className="rounded border-gray-300 dark:border-slate-600"
                    />
                    <label htmlFor="refundRequested" className="text-sm text-gray-700 dark:text-slate-300">
                      Process refund if applicable
                    </label>
                  </div>
                </div>
                <div className="p-6 flex space-x-3 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={statusLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {statusLoading ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Patient Health Chart Modal */}
      {showPatientHealthModal && selectedPatient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPatientHealthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                    {selectedPatient.name} - Health Chart
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    {selectedPatient.age} years old • {selectedPatient.gender} • Appointment: {selectedPatient.appointmentReason}
                  </p>
                </div>
                <button
                  onClick={() => setShowPatientHealthModal(false)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Patient Overview */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Patient Overview
                    {healthDataLoading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Blood Type:</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {patientHealthData?.profile?.medicalInfo?.bloodType || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Height:</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {patientHealthData?.profile?.medicalInfo?.height || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Weight:</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {patientHealthData?.profile?.medicalInfo?.weight || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Age:</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {patientHealthData?.profile?.dateOfBirth
                          ? new Date().getFullYear() - new Date(patientHealthData.profile.dateOfBirth).getFullYear()
                          : selectedPatient.age
                        } years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Last Reading:</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {patientHealthData?.latest?.heartRate?.timestamp
                          ? new Date(patientHealthData.latest.heartRate.timestamp).toLocaleDateString()
                          : 'No recent data'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                    <BriefcaseIcon className="w-5 h-5 mr-2" />
                    Current Medications
                  </h3>
                  <div className="space-y-2">
                    {patientHealthData?.profile?.medicalInfo?.medications?.length > 0 ? (
                      patientHealthData.profile.medicalInfo.medications.map((medication, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            {medication.name} {medication.dosage}
                          </span>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                            {medication.frequency || 'As needed'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">
                        {healthDataLoading ? 'Loading medications...' : 'No current medications on file'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Vitals */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Recent Vitals
                  </h3>
                  <div className="space-y-3">
                    {/* Blood Pressure */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Blood Pressure</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {patientHealthData?.latest?.bloodPressure?.value
                            ? `${patientHealthData.latest.bloodPressure.value.systolic}/${patientHealthData.latest.bloodPressure.value.diastolic} mmHg`
                            : 'No recent data'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getHealthStatus(patientHealthData?.latest?.bloodPressure?.value, 'bloodPressure') === 'Normal'
                              ? 'bg-green-500'
                              : getHealthStatus(patientHealthData?.latest?.bloodPressure?.value, 'bloodPressure') === 'Elevated'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{width: patientHealthData?.latest?.bloodPressure ? '75%' : '0%'}}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        getHealthStatus(patientHealthData?.latest?.bloodPressure?.value, 'bloodPressure') === 'Normal'
                          ? 'text-green-600 dark:text-green-400'
                          : getHealthStatus(patientHealthData?.latest?.bloodPressure?.value, 'bloodPressure') === 'Elevated'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getHealthStatus(patientHealthData?.latest?.bloodPressure?.value, 'bloodPressure')}
                      </span>
                    </div>

                    {/* Heart Rate */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Heart Rate</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {patientHealthData?.latest?.heartRate?.value
                            ? `${patientHealthData.latest.heartRate.value} bpm`
                            : 'No recent data'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getHealthStatus(patientHealthData?.latest?.heartRate?.value, 'heartRate') === 'Normal'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{width: patientHealthData?.latest?.heartRate ? '80%' : '0%'}}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        getHealthStatus(patientHealthData?.latest?.heartRate?.value, 'heartRate') === 'Normal'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getHealthStatus(patientHealthData?.latest?.heartRate?.value, 'heartRate')}
                      </span>
                    </div>

                    {/* Blood Sugar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Blood Sugar</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {patientHealthData?.latest?.glucoseLevel?.value
                            ? `${patientHealthData.latest.glucoseLevel.value} mg/dL`
                            : 'No recent data'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getHealthStatus(patientHealthData?.latest?.glucoseLevel?.value, 'glucoseLevel') === 'Normal'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{width: patientHealthData?.latest?.glucoseLevel ? '85%' : '0%'}}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        getHealthStatus(patientHealthData?.latest?.glucoseLevel?.value, 'glucoseLevel') === 'Normal'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getHealthStatus(patientHealthData?.latest?.glucoseLevel?.value, 'glucoseLevel')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real Health Alerts */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Health Alerts
                    {healthDataLoading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>}
                  </h3>
                  <div className="space-y-2">
                    {patientHealthData?.alerts?.length > 0 ? (
                      patientHealthData.alerts.slice(0, 5).map((alert, index) => {
                        const alertColors = {
                          critical: 'bg-red-500',
                          warning: 'bg-yellow-500',
                          info: 'bg-blue-500',
                          success: 'bg-green-500'
                        };

                        const timeAgo = (timestamp) => {
                          const now = new Date();
                          const alertTime = new Date(timestamp);
                          const diffInHours = Math.floor((now - alertTime) / (1000 * 60 * 60));

                          if (diffInHours < 1) return 'Just now';
                          if (diffInHours < 24) return `${diffInHours}h ago`;
                          const diffInDays = Math.floor(diffInHours / 24);
                          return `${diffInDays}d ago`;
                        };

                        return (
                          <div key={index} className="flex items-start space-x-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${alertColors[alert.type] || 'bg-gray-500'}`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{alert.title}</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">{timeAgo(alert.timestamp)}</span>
                              </div>
                              <span className="text-xs text-gray-600 dark:text-slate-400">{alert.message}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        {healthDataLoading ? (
                          <span className="text-sm text-gray-500 dark:text-slate-400">Loading alerts...</span>
                        ) : (
                          <>
                            <div className="text-green-500 text-lg mb-2">✓</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">No active health alerts</div>
                            <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">Patient health metrics are within normal ranges</div>
                          </>
                        )}
                      </div>
                    )}

                    {patientHealthData?.alerts?.length > 5 && (
                      <div className="text-center pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          +{patientHealthData.alerts.length - 5} more alerts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Trends Chart */}
              <div className="mt-6 bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Health Trends (Last 7 Days)
                </h3>

                {/* Real Health Data Averages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {patientHealthData?.averages?.bloodPressure
                        ? `${patientHealthData.averages.bloodPressure.systolic}/${patientHealthData.averages.bloodPressure.diastolic}`
                        : 'No Data'
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Avg Blood Pressure</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">
                      {patientHealthData?.bloodPressure?.length > 0
                        ? `${patientHealthData.bloodPressure.length} readings`
                        : 'No readings available'
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {patientHealthData?.averages?.heartRate
                        ? Math.round(patientHealthData.averages.heartRate)
                        : 'No Data'
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Avg Heart Rate</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">
                      {patientHealthData?.heartRate?.length > 0
                        ? `${patientHealthData.heartRate.length} readings`
                        : 'No readings available'
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {patientHealthData?.averages?.glucoseLevel
                        ? Math.round(patientHealthData.averages.glucoseLevel)
                        : 'No Data'
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Avg Blood Sugar</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">
                      {patientHealthData?.glucoseLevel?.length > 0
                        ? `${patientHealthData.glucoseLevel.length} readings`
                        : 'No readings available'
                      }
                    </div>
                  </div>
                </div>

                {/* Simple 7-Day Health Trends */}
                <div className="mt-4 space-y-6">
                  {/* Heart Rate Trend */}
                  {patientHealthData?.heartRate?.length > 0 && (() => {
                    const trendData = process7DayTrend(patientHealthData.heartRate);
                    const trend = getTrendDirection(trendData);
                    const validPoints = trendData?.filter(d => d.value !== null) || [];

                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-slate-100">Heart Rate</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                              {patientHealthData.latest?.heartRate?.value || '--'} <span className="text-sm font-normal text-gray-500">bpm</span>
                            </div>
                            <div className={`text-sm flex items-center ${
                              trend.direction === 'increasing' ? 'text-red-600' :
                              trend.direction === 'decreasing' ? 'text-green-600' :
                              'text-gray-500'
                            }`}>
                              {trend.direction === 'increasing' ? '↗' : trend.direction === 'decreasing' ? '↘' : '→'}
                              {Math.abs(trend.change)}% this week
                            </div>
                          </div>
                        </div>

                        {/* Simple Line Chart */}
                        <div className="h-24 flex items-end space-x-2">
                          {validPoints.map((point, index) => {
                            const maxVal = Math.max(...validPoints.map(p => p.value));
                            const minVal = Math.min(...validPoints.map(p => p.value));
                            const range = maxVal - minVal || 1;
                            const height = ((point.value - minVal) / range) * 80 + 10;
                            const isNormal = point.value >= 60 && point.value <= 100;

                            return (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full rounded-t-sm transition-all duration-500 ${
                                    isNormal ? 'bg-green-400' : 'bg-red-400'
                                  }`}
                                  style={{ height: `${height}px` }}
                                  title={`${point.value} bpm`}
                                ></div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                                  {point.date.toLocaleDateString('en', { weekday: 'short' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary */}
                        <div className="mt-4 text-center">
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            Average: {patientHealthData.averages?.heartRate ? Math.round(patientHealthData.averages.heartRate) : 'N/A'} bpm
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Blood Pressure Trend */}
                  {patientHealthData?.bloodPressure?.length > 0 && (() => {
                    const trendData = process7DayTrend(patientHealthData.bloodPressure);
                    const systolicTrend = getTrendDirection(trendData, 'systolic');
                    const validPoints = trendData?.filter(d => d.value !== null) || [];

                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-slate-100">Blood Pressure</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                              {patientHealthData.latest?.bloodPressure?.value ?
                                `${patientHealthData.latest.bloodPressure.value.systolic}/${patientHealthData.latest.bloodPressure.value.diastolic}` : '--'}
                              <span className="text-sm font-normal text-gray-500">mmHg</span>
                            </div>
                            <div className={`text-sm flex items-center ${
                              systolicTrend.direction === 'increasing' ? 'text-red-600' :
                              systolicTrend.direction === 'decreasing' ? 'text-green-600' :
                              'text-gray-500'
                            }`}>
                              {systolicTrend.direction === 'increasing' ? '↗' : systolicTrend.direction === 'decreasing' ? '↘' : '→'}
                              {Math.abs(systolicTrend.change)}% this week
                            </div>
                          </div>
                        </div>

                        {/* Simple Dual Bar Chart */}
                        <div className="h-24 flex items-end space-x-2">
                          {validPoints.map((point, index) => {
                            const systolicMax = Math.max(...validPoints.map(p => p.value.systolic));
                            const systolicMin = Math.min(...validPoints.map(p => p.value.systolic));
                            const diastolicMax = Math.max(...validPoints.map(p => p.value.diastolic));
                            const diastolicMin = Math.min(...validPoints.map(p => p.value.diastolic));

                            const sysRange = systolicMax - systolicMin || 1;
                            const diaRange = diastolicMax - diastolicMin || 1;

                            const sysHeight = ((point.value.systolic - systolicMin) / sysRange) * 60 + 15;
                            const diaHeight = ((point.value.diastolic - diastolicMin) / diaRange) * 40 + 10;

                            const isNormal = point.value.systolic < 120 && point.value.diastolic < 80;

                            return (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="w-full flex space-x-1">
                                  <div
                                    className={`flex-1 rounded-t-sm transition-all duration-500 ${
                                      isNormal ? 'bg-blue-400' : 'bg-red-400'
                                    }`}
                                    style={{ height: `${sysHeight}px` }}
                                    title={`${point.value.systolic} mmHg (Systolic)`}
                                  ></div>
                                  <div
                                    className={`flex-1 rounded-t-sm transition-all duration-500 ${
                                      isNormal ? 'bg-blue-300' : 'bg-red-300'
                                    }`}
                                    style={{ height: `${diaHeight}px` }}
                                    title={`${point.value.diastolic} mmHg (Diastolic)`}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                                  {point.date.toLocaleDateString('en', { weekday: 'short' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary */}
                        <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-slate-400">
                          <span>Average: {patientHealthData.averages?.bloodPressure ?
                            `${patientHealthData.averages.bloodPressure.systolic}/${patientHealthData.averages.bloodPressure.diastolic}` : 'N/A'} mmHg</span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center"><span className="w-3 h-2 bg-blue-400 mr-1"></span>Systolic</span>
                            <span className="flex items-center"><span className="w-3 h-2 bg-blue-300 mr-1"></span>Diastolic</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Blood Sugar Trend */}
                  {patientHealthData?.glucoseLevel?.length > 0 && (() => {
                    const trendData = process7DayTrend(patientHealthData.glucoseLevel);
                    const trend = getTrendDirection(trendData);
                    const validPoints = trendData?.filter(d => d.value !== null) || [];

                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-slate-100">Blood Sugar</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                              {patientHealthData.latest?.glucoseLevel?.value || '--'} <span className="text-sm font-normal text-gray-500">mg/dL</span>
                            </div>
                            <div className={`text-sm flex items-center ${
                              trend.direction === 'increasing' ? 'text-red-600' :
                              trend.direction === 'decreasing' ? 'text-green-600' :
                              'text-gray-500'
                            }`}>
                              {trend.direction === 'increasing' ? '↗' : trend.direction === 'decreasing' ? '↘' : '→'}
                              {Math.abs(trend.change)}% this week
                            </div>
                          </div>
                        </div>

                        {/* Simple Line Chart */}
                        <div className="h-24 flex items-end space-x-2">
                          {validPoints.map((point, index) => {
                            const maxVal = Math.max(...validPoints.map(p => p.value));
                            const minVal = Math.min(...validPoints.map(p => p.value));
                            const range = maxVal - minVal || 1;
                            const height = ((point.value - minVal) / range) * 80 + 10;
                            const isNormal = point.value >= 70 && point.value <= 140;

                            return (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full rounded-t-sm transition-all duration-500 ${
                                    isNormal ? 'bg-purple-400' : 'bg-red-400'
                                  }`}
                                  style={{ height: `${height}px` }}
                                  title={`${point.value} mg/dL`}
                                ></div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                                  {point.date.toLocaleDateString('en', { weekday: 'short' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary */}
                        <div className="mt-4 text-center">
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            Average: {patientHealthData.averages?.glucoseLevel ? Math.round(patientHealthData.averages.glucoseLevel) : 'N/A'} mg/dL
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* No Data Message */}
                  {(!patientHealthData?.heartRate?.length && !patientHealthData?.bloodPressure?.length && !patientHealthData?.glucoseLevel?.length) && (
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-8 text-center">
                      <div className="text-gray-500 dark:text-slate-400">
                        {healthDataLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span>Loading health trends...</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-lg mb-2">📊</div>
                            <div className="text-sm">No health data available for the last 7 days</div>
                            <div className="text-xs mt-1">Patient needs to sync health data or add manual readings</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-center">
              <button
                onClick={() => setShowPatientHealthModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}

export default YourAppointments;
