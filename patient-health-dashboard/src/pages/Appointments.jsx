"use client"

import { useState, useEffect } from "react" // Added useEffect
import api from '../services/api'; // Import API service
import { getCurrentUser } from '../services/authService';
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



const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
    case "Confirmed":
      return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-700/30"
    case "pending":
    case "Pending":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-600/30"
    case "completed":
    case "Completed":
      return "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30"
    case "cancelled":
    case "Cancelled":
      return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-700/30"
    case "Open Chat":
      return "text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-700/30"
    case "rescheduled":
    case "Rescheduled":
      return "text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-700/30"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50"
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
    case "Confirmed":
      return <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
    case "pending":
    case "Pending":
      return <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
    case "completed":
    case "Completed":
      return <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    case "cancelled":
    case "Cancelled":
      return <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
    case "Open Chat":
      return <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    case "rescheduled":
    case "Rescheduled":
      return <ArrowPathIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    default:
      return <InformationCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [fetchedUpcomingAppointments, setFetchedUpcomingAppointmentsOriginal] = useState([]);
  const [fetchedPastAppointments, setFetchedPastAppointments] = useState([]);

  // Add debugging wrapper for state changes
  const setFetchedUpcomingAppointments = (newValue) => {
    console.log('🔄 setFetchedUpcomingAppointments called with:', typeof newValue === 'function' ? 'function' : newValue);
    if (typeof newValue === 'function') {
      setFetchedUpcomingAppointmentsOriginal(prev => {
        const result = newValue(prev);
        console.log('📊 Upcoming appointments changed from', prev.length, 'to', result.length);
        console.log('📋 Previous IDs:', prev.map(a => a._id?.slice(-8)));
        console.log('📋 New IDs:', result.map(a => a._id?.slice(-8)));
        return result;
      });
    } else {
      console.log('📊 Setting upcoming appointments directly to length:', newValue?.length || 0);
      setFetchedUpcomingAppointmentsOriginal(newValue);
    }
  };
  const [allAppointments, setAllAppointments] = useState([]); // For summary cards
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsMap, setDoctorsMap] = useState({}); // Map of doctorId -> doctor info
  const [error, setError] = useState(null);
  const [lastCreatedAppointmentId, setLastCreatedAppointmentId] = useState(null);

  // Form state for new/editing appointment
  const initialAppointmentFormState = {
    providerId: "", // Doctor ID
    providerName: "", // Doctor name (auto-filled when doctor is selected)
    dateTime: "", // Should be ISO string or Date object for backend
    reason: "",
    type: "Chat", // Default - only Chat is allowed for school project
    notes: "",
    virtualLink: ""
  };
  const [newAppointmentData, setNewAppointmentData] = useState(initialAppointmentFormState);
  const [isEditingModal, setIsEditingModal] = useState(false); // To differentiate create/edit in modal
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  // Helper function to get correct doctor display name
  const getDoctorDisplayName = (appointment) => {
    // Try to get current doctor info from the doctors map
    if (appointment.providerId && doctorsMap[appointment.providerId]) {
      const doctor = doctorsMap[appointment.providerId];
      const title = doctor.doctorInfo?.title || 'Dr.';
      return `${title} ${doctor.firstName} ${doctor.lastName}`;
    }

    // Fallback to stored providerName if doctor not found in map
    return appointment.providerName || "Doctor";
  };

  // Fetch all appointments for summary cards
  const fetchAllAppointments = async () => {
    try {
      console.log('🔄 Fetching all appointments for summary cards...');
      const response = await api.get('/appointments');
      const appointments = response.data.data || [];
      console.log('📊 All appointments fetched:', appointments.length);
      console.log('📋 Appointment statuses:', appointments.map(a => a.status));
      setAllAppointments(appointments);
    } catch (err) {
      console.error("Failed to fetch all appointments:", err);
    }
  };

  const fetchAppointments = async () => {
    console.log('🚨 fetchAppointments called! Stack trace:');
    console.trace();

    setLoading(true);
    setError(null);

    // Log current user context
    const authToken = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('authUser'); // Fixed: use correct key
    console.log('👤 Current user context:');
    console.log('🔑 Auth token:', authToken ? 'Present' : 'Missing');
    console.log('👤 User info raw:', userInfo);
    console.log('👤 User info parsed:', userInfo ? JSON.parse(userInfo) : 'Missing');



    // Check if user is properly authenticated
    if (!authToken || !userInfo) {
      console.error('❌ User not properly authenticated');
      setError('Please log in to view your appointments');
      setLoading(false);
      return;
    }

    try {
      const params = {
        status: filterStatus === "all" ? undefined : filterStatus,
        sortBy: 'createdAt', // Sort by creation date to get newest first
        order: 'desc', // Newest first
        limit: 50, // Increase limit to ensure we get recent appointments
        // type: filterType === "all" ? undefined : filterType, // Backend doesn't have type filter yet
        // Add pagination params if implemented: page: currentPage, limit: itemsPerPage
      };
      if (activeTab === "upcoming") {
        // Don't use backend date filter for "Current" tab - let frontend handle it
        // This ensures newly booked appointments appear immediately
        console.log('📅 Fetching all appointments for Current tab (frontend will filter)');
      } else if (activeTab === "past") {
        params.past = true;
      }
      // If activeTab is "book", we don't fetch appointments list in the same way

      console.log(`📅 Fetching ${activeTab} appointments with params:`, params);

      if (activeTab === "upcoming" || activeTab === "past") {
        const response = await api.get('/appointments', { params });
        console.log(`✅ ${activeTab} appointments response:`, response.data);
        console.log(`📊 Raw appointments data:`, response.data.data);
        console.log(`📋 Appointments with statuses:`, response.data.data?.map(a => ({
          id: a._id?.slice(-8),
          status: a.status,
          reason: a.reason,
          providerName: a.providerName,
          patientId: a.patientId,
          providerId: a.providerId
        })));

        // Check if appointments belong to current user
        const currentUser = getCurrentUser();
        console.log('🔍 Current user from authService:', currentUser);
        console.log('🔍 Current user ID:', currentUser?._id || currentUser?.id);

        // Debug: Check all appointment user IDs vs current user ID
        response.data.data?.forEach(apt => {
          console.log(`🔍 Appointment ${apt._id?.slice(-8)}: userId="${apt.userId}", patientId="${apt.patientId}", providerId="${apt.providerId}"`);
          console.log(`🔍 Current user ID: "${currentUser?._id || currentUser?.id}"`);
          console.log(`🔍 Match userId: ${apt.userId === (currentUser?._id || currentUser?.id)}`);
          console.log(`🔍 Match patientId: ${apt.patientId === (currentUser?._id || currentUser?.id)}`);
          console.log(`🔍 Match providerId: ${apt.providerId === (currentUser?._id || currentUser?.id)}`);
          console.log('---');
        });

        console.log('🔍 Appointments for current user:', response.data.data?.filter(a =>
          a.userId === (currentUser?._id || currentUser?.id) ||
          a.patientId === (currentUser?._id || currentUser?.id) ||
          a.providerId === (currentUser?._id || currentUser?.id)
        ).length);

        // Debug: Show all appointment statuses
        console.log('🔍 ALL APPOINTMENTS FETCHED:', response.data.data?.map(a => ({
          id: a._id?.slice(-8),
          status: a.status,
          reason: a.reason,
          date: new Date(a.dateTime).toLocaleString()
        })));

        // Check if the newly created appointment is in the list
        if (lastCreatedAppointmentId) {
          const hasNewAppointment = response.data.data?.some(a => a._id === lastCreatedAppointmentId);
          console.log(`🔍 Newly created appointment (${lastCreatedAppointmentId.slice(-8)}) in fetched list: ${hasNewAppointment}`);

          if (hasNewAppointment) {
            const newAppointment = response.data.data?.find(a => a._id === lastCreatedAppointmentId);
            console.log(`✅ Found newly created appointment with status: ${newAppointment?.status}`);
          } else {
            console.log(`❌ Newly created appointment NOT found in fetched list`);
          }
        }

        if (activeTab === "upcoming") {
          setFetchedUpcomingAppointments(response.data.data || []);
          console.log(`📋 Set ${response.data.data?.length || 0} upcoming appointments`);
        } else {
          setFetchedPastAppointments(response.data.data || []);
          console.log(`📋 Set ${response.data.data?.length || 0} past appointments`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Could not load appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    setDoctorsLoading(true);
    try {
      console.log('🔍 Fetching available doctors...');
      console.log('🔑 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');

      const response = await api.get('/appointments/available-doctors');
      console.log('✅ Fetched available doctors response:', response.data);
      console.log('📋 Doctors array:', response.data.doctors);
      console.log('📊 Number of doctors:', response.data.doctors?.length || 0);

      const doctors = response.data.doctors || [];
      setAvailableDoctors(doctors);

      // Create a map of doctorId -> doctor info for quick lookup
      const doctorMap = {};
      doctors.forEach(doctor => {
        if (doctor._id) {
          doctorMap[doctor._id] = doctor;
        }
      });
      setDoctorsMap(doctorMap);
      console.log('📋 Created doctors map with', Object.keys(doctorMap).length, 'doctors');
    } catch (error) {
      console.error('❌ Error fetching available doctors:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);

      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        setError('Endpoint not found. Please check server configuration.');
      } else {
        setError(`Failed to load available doctors: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Fetch all appointments and available doctors on component mount for summary cards
  useEffect(() => {
    fetchAllAppointments();
    fetchAvailableDoctors(); // Fetch doctors for "Available Providers" summary card
  }, []);

  useEffect(() => {
    if (activeTab === "upcoming" || activeTab === "past") {
      // Only fetch if we don't have a recently created appointment
      // This prevents overwriting manually added appointments
      if (!lastCreatedAppointmentId) {
        fetchAppointments();
      } else {
        console.log('🚫 Skipping fetch to preserve manually added appointment');
        setLoading(false); // Stop loading since we're not fetching
      }
    } else {
      // For "book" tab, we might not need to fetch a list initially,
      // or fetch providers/slots (which is out of scope for now)
      setLoading(false); // Stop loading if book tab
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterStatus, filterType]); // Removed lastCreatedAppointmentId to prevent re-triggering


  // Calculate actual filtered counts for tab badges and summary cards
  const currentStatuses = ['pending', 'approved', 'open_chat', 'open chat'];
  const pastStatuses = ['completed', 'cancelled'];

  // Combine all appointments for accurate counts
  const allUserAppointments = [...(fetchedUpcomingAppointments || []), ...(fetchedPastAppointments || [])];

  const currentCount = fetchedUpcomingAppointments.filter(apt =>
    currentStatuses.includes(apt.status?.toLowerCase())
  ).length;

  const pastCount = fetchedPastAppointments.filter(apt =>
    pastStatuses.includes(apt.status?.toLowerCase())
  ).length;

  // Summary card counts using combined data
  const openChatCount = allUserAppointments.filter(apt => apt.status?.toLowerCase() === 'open chat').length;
  const pendingCount = allUserAppointments.filter(apt => apt.status?.toLowerCase() === 'pending').length;
  const completedCount = allUserAppointments.filter(apt => apt.status?.toLowerCase() === 'completed').length;

  const tabs = [
    { id: "upcoming", label: "Current", count: currentCount }, // Use actual filtered count
    { id: "past", label: "Past", count: pastCount },           // Use actual filtered count
    { id: "book", label: "Book New", count: 0 }, // Count for "book" tab might not be relevant
  ];

  // Apply frontend search to the currently fetched list for the active tab
  const currentList = activeTab === "upcoming" ? fetchedUpcomingAppointments : fetchedPastAppointments;

  // Additional frontend filtering based on tab and status
  let filteredByStatus = currentList;

  if (activeTab === "upcoming") {
    // Current/Active appointments: Match doctor dashboard exactly
    // Doctor uses: ['pending', 'approved', 'open_chat', 'open chat']
    const currentStatuses = ['pending', 'approved', 'open_chat', 'open chat'];
    filteredByStatus = currentList.filter(appointment => {
      const status = appointment.status?.toLowerCase();

      // Check if status qualifies as "current" - match doctor dashboard logic exactly
      const hasCurrentStatus = currentStatuses.includes(status);

      console.log(`🔍 Checking appointment ${appointment._id?.slice(-8)} for Current tab:`);
      console.log(`   Status: "${appointment.status}" (normalized: "${status}") → ${hasCurrentStatus ? 'CURRENT STATUS' : 'NOT CURRENT'}`);
      console.log(`   Expected statuses: ${currentStatuses.join(', ')}`);
      console.log(`   Result: ${hasCurrentStatus ? 'INCLUDED' : 'EXCLUDED'}`);

      return hasCurrentStatus;
    });

    console.log(`📋 Current appointments after filtering: ${filteredByStatus.length}`);
    console.log(`📊 Current appointment statuses:`, filteredByStatus.map(a => a.status));

    // Sort current appointments by creation date (newest first) to show recent appointments at top
    filteredByStatus.sort((a, b) => new Date(b.createdAt || b.dateTime) - new Date(a.createdAt || a.dateTime));
  } else if (activeTab === "past") {
    // Past/Finished appointments: completed, cancelled
    const pastStatuses = ['completed', 'cancelled'];
    filteredByStatus = currentList.filter(appointment =>
      pastStatuses.includes(appointment.status?.toLowerCase())
    );
    console.log(`📋 Past appointments after status filter: ${filteredByStatus.length}`);
    console.log(`📊 Past appointment statuses:`, filteredByStatus.map(a => a.status));

    // Sort past appointments by date (most recent first)
    filteredByStatus.sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateB - dateA; // Descending order (newest first)
    });
  }

  const filteredAppointments = filteredByStatus.filter(
    (appointment) => {
      const searchLower = searchTerm.toLowerCase();
      // Backend provides providerName, not nested doctor object for now
      const matchesSearch =
        (appointment.title?.toLowerCase() || '').includes(searchLower) ||
        (appointment.providerName?.toLowerCase() || '').includes(searchLower) ||
        (appointment.reason?.toLowerCase() || '').includes(searchLower);

      // Backend already filters by status and type if params are sent.
      // If backend doesn't filter by type, we can do it here:
      // const matchesType = filterType === "all" || appointment.type === filterType;
      // return matchesSearch && matchesType;
      return matchesSearch; // Assuming backend handles status filter, and type filter is simple for now
    }
  );
  
  // Handlers for modal and form
  const handleOpenBookingModal = (appointmentToEdit = null) => {
    if (appointmentToEdit) {
      setIsEditingModal(true);
      setEditingAppointmentId(appointmentToEdit._id); // Use _id from MongoDB
      setNewAppointmentData({
        providerName: appointmentToEdit.providerName,
        // Format date for datetime-local input: YYYY-MM-DDTHH:mm
        dateTime: appointmentToEdit.dateTime ? new Date(appointmentToEdit.dateTime).toISOString().slice(0, 16) : "",
        reason: appointmentToEdit.reason,
        type: appointmentToEdit.type,
        notes: appointmentToEdit.notes || "",
        virtualLink: appointmentToEdit.virtualLink || ""
      });
    } else {
      setIsEditingModal(false);
      setEditingAppointmentId(null);
      setNewAppointmentData(initialAppointmentFormState);
    }
    setShowBookingModal(true);
    setError(null); // Clear previous modal errors
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setNewAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorSelection = (doctor) => {
    setNewAppointmentData(prev => ({
      ...prev,
      providerId: doctor._id,
      providerName: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Consider a specific modal loading state
    setError(null);
    try {
      const payload = { ...newAppointmentData };

      console.log('📋 Appointment data before processing:', newAppointmentData);

      // Ensure dateTime is in a format backend expects, e.g., ISO string
      if (payload.dateTime) {
        payload.dateTime = new Date(payload.dateTime).toISOString();
      } else {
        setError("Date and time are required.");
        setLoading(false);
        return;
      }

      console.log('📤 Sending appointment payload:', payload);

      // Log current user for appointment creation
      const currentUser = getCurrentUser();
      console.log('👤 Current user from authService:', currentUser);
      console.log('👤 Creating appointment for user:', currentUser?._id || currentUser?.id, currentUser?.firstName, currentUser?.lastName);

      if (isEditingModal && editingAppointmentId) {
        await api.put(`/appointments/${editingAppointmentId}`, payload);
        console.log('✅ Appointment updated successfully');
      } else {
        const response = await api.post('/appointments', payload);
        console.log('✅ Appointment created successfully:', response.data);

        // Handle different response structures
        const appointmentData = response.data.data || response.data;
        console.log('📋 New appointment full data:', appointmentData);
        console.log('📋 New appointment status:', appointmentData?.status);
        console.log('📋 New appointment ID:', appointmentData?._id);
        console.log('📋 New appointment dateTime:', appointmentData?.dateTime);
        console.log('📋 New appointment userId:', appointmentData?.userId);
        console.log('📋 New appointment patientId:', appointmentData?.patientId);

        // Store the newly created appointment ID for tracking
        if (appointmentData?._id) {
          setLastCreatedAppointmentId(appointmentData._id);
        }

        // Immediately add the new appointment to the current list
        if (appointmentData && appointmentData.status?.toLowerCase() === 'pending') {
          console.log('➕ Adding newly created appointment to current list immediately');
          console.log('📋 Appointment data being added:', appointmentData);

          setFetchedUpcomingAppointments(prev => {
            // Check if appointment already exists
            const exists = prev.some(a => a._id === appointmentData._id);
            if (!exists) {
              const newList = [appointmentData, ...prev];
              console.log('✅ New upcoming appointments list length:', newList.length);
              return newList;
            }
            console.log('⚠️ Appointment already exists in list');
            return prev;
          });

          // Also add to all appointments for summary cards
          setAllAppointments(prev => {
            const exists = prev.some(a => a._id === appointmentData._id);
            if (!exists) {
              return [appointmentData, ...prev];
            }
            return prev;
          });
        }
      }

      // Reset form and close
      setNewAppointmentData(initialAppointmentFormState);
      setShowBookingModal(false); // Close the booking modal
      setActiveTab("upcoming"); // Switch to current tab to see the new appointment

      // Refresh both summary cards and appointments list after a delay
      // This ensures the backend has time to save the appointment
      setTimeout(async () => {
        await fetchAllAppointments(); // Re-fetch all appointments for summary cards
        console.log('🔄 Summary cards refreshed after appointment creation');

        // Also refresh the appointments list to get the backend version
        // Clear the protection flag first so the fetch will work
        setLastCreatedAppointmentId(null);
        await fetchAppointments();
        console.log('🔄 Appointments list refreshed after appointment creation');
      }, 2000); // 2 second delay to ensure backend has saved the appointment
    } catch (err) {
      console.error("❌ Error saving appointment:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setError(err.response?.data?.message || "Failed to save appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setLoading(true);
      setError(null);
      try {
        // Update appointment status to 'Cancelled' instead of deleting
        const response = await api.put(`/appointments/${appointmentId}`, {
          status: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Cancelled by patient'
        });

        console.log('✅ Appointment cancelled successfully:', response.data);

        // Update the selected appointment if it's the one being cancelled
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          setSelectedAppointment({
            ...selectedAppointment,
            status: 'Cancelled',
            cancelledAt: new Date().toISOString()
          });
        }

        // Re-fetch appointments to update the lists and summary cards
        await fetchAllAppointments();
        await fetchAppointments();

        setLoading(false);
      } catch (err) {
        console.error("Error cancelling appointment:", err);
        setError(err.response?.data?.message || "Failed to cancel appointment.");
        setLoading(false);
      }
    }
  };


  return (
    <div className="space-y-10 px-2 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center md:text-left"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Appointments</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-1">Manage your healthcare appointments and schedule new visits</p>
      </motion.div>

      {/* Quick Stats - Updated categories with specific status filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-700/30 rounded-lg md:rounded-xl">
              <ChatBubbleLeftRightIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {openChatCount}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Chat Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-600/30 rounded-lg md:rounded-xl">
              <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {pendingCount}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Pending Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-700/30 rounded-lg md:rounded-xl">
              <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {completedCount}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Completed Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-indigo-100 dark:bg-indigo-700/30 rounded-lg md:rounded-xl">
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {(availableDoctors || []).filter((doctor) => doctor.doctorInfo?.isAcceptingPatients === true).length}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300">Available Providers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700/30 p-3 rounded-md text-center">{error}</p>}


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
              placeholder="Search appointments, doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="chat">Chat Sessions</option>
              <option value="in-person">In-Person</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="open chat">Open Chat</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6"> {/* Background for tab content area will be inherited from parent or page bg */}
          {/* Current/Past Appointments */}
          {(activeTab === "upcoming" || activeTab === "past") && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No appointments found.</p>
                  {activeTab === "upcoming" && (
                    <button
                      onClick={() => setActiveTab("book")}
                      className="mt-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      Schedule your first appointment
                    </button>
                  )}
                </div>
              ) : (
                filteredAppointments.map((appointment, i) => (
                  <motion.div
                    key={appointment._id || appointment.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(16,185,129,0.10)" }}
                    className="border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 md:p-6 bg-white dark:bg-slate-800 hover:shadow-xl dark:hover:shadow-slate-700/30 transition-shadow cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        {/* Doctor Profile Image */}
                        <img
                          src={appointment.doctor?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.providerName || 'Doctor')}&background=10b981&color=ffffff&size=150`}
                          alt={appointment.providerName || "Doctor"}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-green-100 dark:border-green-800"
                        />

                        <div className="flex-1 min-w-0">
                          {/* Doctor Name and Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-2">
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-slate-100">
                              {getDoctorDisplayName(appointment)}
                            </h3>
                            <span
                              className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)} self-start sm:self-center`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          {/* Appointment Reason/Title */}
                          <p className="text-sm text-gray-600 dark:text-slate-300 mb-1 sm:mb-2 font-medium">
                            {appointment.reason || appointment.title || "General Consultation"}
                          </p>

                          {/* Date, Time, Duration, Type */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 md:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-2 md:mb-3">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>
                                {appointment.dateTime ? formatDate(appointment.dateTime) : 'Date TBD'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                              <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>
                                {appointment.dateTime ?
                                  `${new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} (30 min)` :
                                  'Time TBD'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                              <ChatBubbleLeftRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                              <span>Chat Session</span>
                            </div>
                          </div>

                          {/* Additional Notes */}
                          {appointment.notes && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-3 italic">
                              Note: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-0 ml-0 sm:ml-4">
                        {/* View Details Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(appointment);
                          }}
                          className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors w-full sm:w-auto justify-center"
                        >
                          <InformationCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Details</span>
                        </button>
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
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Choose Your Healthcare Provider</h3>

                {doctorsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-green-600" />
                    <span className="ml-2 text-gray-600 dark:text-slate-300">Loading available doctors...</span>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-slate-300">No doctors available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    {availableDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3">
                        <img
                          src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${doctor.firstName} ${doctor.lastName}`)}&background=random`}
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-base md:text-lg">
                            {doctor.doctorInfo?.title || 'Dr.'} {doctor.firstName} {doctor.lastName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-slate-300">
                            {doctor.doctorInfo?.specialization || 'General Medicine'}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <ChatBubbleLeftRightIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs text-purple-600 dark:text-purple-300">Chat Available</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-gray-600 dark:text-slate-300">4.8</span>
                          </div>
                          {doctor.doctorInfo?.isAcceptingPatients !== false ? (
                            <span className="text-green-600 dark:text-green-400">Accepting New Patients</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Not Accepting Patients</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {doctor.doctorInfo?.experience || doctor.doctorInfo?.yearsOfExperience || 0} years experience
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        {doctor.doctorInfo?.isAcceptingPatients !== false ? (
                          <button
                            onClick={() => handleDoctorSelection(doctor)}
                            className="flex-1 px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-xs sm:text-sm"
                          >
                            Book Appointment
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 px-3 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg cursor-not-allowed text-xs sm:text-sm"
                          >
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Appointment Booking Form */}
              {newAppointmentData.providerId && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    Book Appointment with {newAppointmentData.providerName}
                  </h3>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Appointment Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          name="dateTime"
                          value={newAppointmentData.dateTime}
                          onChange={handleModalFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Appointment Type
                        </label>
                        <select
                          name="type"
                          value={newAppointmentData.type}
                          onChange={handleModalFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
                        >
                          <option value="Chat">Chat Session</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Reason for Appointment
                      </label>
                      <input
                        type="text"
                        name="reason"
                        value={newAppointmentData.reason}
                        onChange={handleModalFormChange}
                        required
                        placeholder="Brief description of your concern"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={newAppointmentData.notes}
                        onChange={handleModalFormChange}
                        rows={3}
                        placeholder="Any additional information you'd like to share"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Booking...' : 'Book Appointment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAppointmentData(initialAppointmentFormState)}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}


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
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={selectedAppointment.doctor?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.providerName || 'Doctor')}&background=10b981&color=ffffff&size=150`}
                    alt={selectedAppointment.providerName || "Doctor"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-green-100 dark:border-green-800"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100">
                      {getDoctorDisplayName(selectedAppointment)}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      {selectedAppointment.reason || selectedAppointment.title || "General Consultation"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}
                      >
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">

              {/* Appointment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Date & Time</h4>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>
                        {selectedAppointment.date ? formatDate(selectedAppointment.date) :
                         selectedAppointment.dateTime ? formatDate(selectedAppointment.dateTime) : 'Date TBD'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>
                        {selectedAppointment.time ? `${selectedAppointment.time} ${selectedAppointment.duration ? `(${selectedAppointment.duration})` : ''}` :
                         selectedAppointment.dateTime ? new Date(selectedAppointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Appointment Type</h4>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                      <span>Secure Chat Session</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Appointment Details</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    {selectedAppointment._id && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Appointment ID:</span>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {selectedAppointment._id.slice(-8)}
                        </span>
                      </div>
                    )}
                    {selectedAppointment.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Booked On:</span>
                        <span>{new Date(selectedAppointment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Reason */}
              {selectedAppointment.reason && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Appointment Reason</h4>
                  <div className="bg-blue-50 dark:bg-blue-700/20 border border-blue-200 dark:border-blue-600/40 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">{selectedAppointment.reason}</p>
                  </div>
                </div>
              )}

              {/* Patient Concerns/Symptoms */}
              {(selectedAppointment.symptoms || selectedAppointment.concerns || selectedAppointment.description) && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Patient Information</h4>
                  <div className="bg-orange-50 dark:bg-orange-700/20 border border-orange-200 dark:border-orange-600/40 rounded-lg p-2 sm:p-3 space-y-2">
                    {selectedAppointment.symptoms && (
                      <div>
                        <span className="text-xs font-medium text-orange-800 dark:text-orange-300">Symptoms:</span>
                        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200 mt-1">{selectedAppointment.symptoms}</p>
                      </div>
                    )}
                    {selectedAppointment.concerns && (
                      <div>
                        <span className="text-xs font-medium text-orange-800 dark:text-orange-300">Concerns:</span>
                        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200 mt-1">{selectedAppointment.concerns}</p>
                      </div>
                    )}
                    {selectedAppointment.description && (
                      <div>
                        <span className="text-xs font-medium text-orange-800 dark:text-orange-300">Description:</span>
                        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200 mt-1">{selectedAppointment.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Additional Notes</h4>
                  <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/40 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Appointment Summary (for completed appointments) */}
              {selectedAppointment.summary && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Appointment Summary</h4>
                  <div className="bg-green-50 dark:bg-green-700/20 border border-green-200 dark:border-green-600/40 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">{selectedAppointment.summary}</p>
                    {selectedAppointment.followUp && (
                      <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-600/40">
                        <span className="text-xs font-medium text-green-800 dark:text-green-300">Follow-up Instructions:</span>
                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-200 mt-1">{selectedAppointment.followUp}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Instructions */}
              {selectedAppointment.chatInstructions && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Chat Session Information</h4>
                  <div className="bg-purple-50 dark:bg-purple-700/20 border border-purple-200 dark:border-purple-600/40 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-200">{selectedAppointment.chatInstructions}</p>
                  </div>
                </div>
              )}

              {/* Preparation */}
              {selectedAppointment.preparation && (
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-slate-200 mb-1 sm:mb-2">Preparation Required</h4>
                  <ul className="space-y-1">
                    {selectedAppointment.preparation.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 border-t border-gray-200 dark:border-slate-700">
              {selectedAppointment.type === "chat" && selectedAppointment.chatRoom && (
                <button className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors w-full sm:w-auto">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Open Chat</span>
                </button>
              )}
              <button
                onClick={() => handleCancelAppointment(selectedAppointment._id)}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-xs sm:text-sm border border-red-300 dark:border-red-500/70 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-700/20 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>{loading ? 'Cancelling...' : 'Cancel'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Appointments
