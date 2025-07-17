import { CalendarIcon, ClockIcon, VideoCameraIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorsMap, setDoctorsMap] = useState({});
  const navigate = useNavigate();

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

  // Fetch doctors information
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/appointments/available-doctors');
      const doctors = response.data.doctors || [];

      // Create a map of doctorId -> doctor info for quick lookup
      const doctorMap = {};
      doctors.forEach(doctor => {
        if (doctor._id) {
          doctorMap[doctor._id] = doctor;
        }
      });
      setDoctorsMap(doctorMap);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  // Fetch current appointments using the same logic as Appointments page
  useEffect(() => {
    const fetchCurrentAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch doctors first
        await fetchDoctors();

        // Fetch all appointments
        const response = await api.get('/appointments', {
          params: {
            sortBy: 'createdAt',
            order: 'desc',
            limit: 50
          }
        });

        const allAppointments = response.data?.data || response.data || [];

        // Apply the same "current" status filtering as Appointments page
        const currentStatuses = ['pending', 'approved', 'open_chat', 'open chat'];
        const currentAppointments = allAppointments.filter(appointment =>
          currentStatuses.includes(appointment.status?.toLowerCase())
        );

        // Sort by creation date (newest first) and limit to 3 for dashboard
        const sortedAppointments = currentAppointments
          .sort((a, b) => new Date(b.createdAt || b.dateTime) - new Date(a.createdAt || a.dateTime))
          .slice(0, 3);

        setAppointments(sortedAppointments);
      } catch (err) {
        console.error('Error fetching current appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAppointments();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-600/30 dark:text-yellow-300";
      case "approved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-600/30 dark:text-blue-300";
      case "open_chat":
      case "open chat":
        return "bg-purple-100 text-purple-700 dark:bg-purple-600/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Current Appointments</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Current Appointments</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Current Appointments</h3>
        <button
          onClick={() => navigate('/dashboard/appointments')}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-700/30 px-3 py-1 rounded-lg transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 mb-2">No current appointments</p>
            <button
              onClick={() => navigate('/dashboard/appointments')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm"
            >
              Schedule your first appointment
            </button>
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700/50 dark:to-slate-800/70 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-700 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
              whileHover={{ x: 5 }}
              onClick={() => navigate('/dashboard/appointments')}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">💬</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {appointment.reason || 'Chat Session'}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  {getDoctorDisplayName(appointment)}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {formatDate(appointment.dateTime)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {formatTime(appointment.dateTime)}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingAppointments
