import { CalendarDaysIcon, ClockIcon, UserIcon, VideoCameraIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real appointments for today
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all doctor appointments
        const appointmentsRes = await api.get('/appointments/doctor');

        // Handle different response structures
        const allAppointments = appointmentsRes.data?.data || appointmentsRes.data || [];

        if (!Array.isArray(allAppointments)) {
          throw new Error('Invalid appointments data structure');
        }

        // Filter for today's appointments
        const today = new Date().toDateString();
        const todaysAppointments = allAppointments.filter(apt => {
          const aptDate = new Date(apt.dateTime);
          return aptDate.toDateString() === today && apt.status === 'Confirmed';
        });

        // Format appointments for display
        const formattedAppointments = todaysAppointments.map(apt => {
          const aptDate = new Date(apt.dateTime);

          // Handle different data structures - check both populated and direct fields
          let patientName = 'Unknown Patient';
          if (apt.userId?.firstName && apt.userId?.lastName) {
            // Populated userId object
            patientName = `${apt.userId.firstName} ${apt.userId.lastName}`;
          } else if (apt.originalData?.userId?.firstName && apt.originalData?.userId?.lastName) {
            // Nested originalData structure
            patientName = `${apt.originalData.userId.firstName} ${apt.originalData.userId.lastName}`;
          } else if (apt.patient?.name) {
            // Direct patient name
            patientName = apt.patient.name;
          }



          return {
            id: apt._id,
            patientName: patientName,
            reason: apt.reason || apt.reasonForVisit || 'General Consultation',
            date: aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            type: apt.appointmentType === 'virtual' || apt.appointmentType === 'chat' ? 'virtual' : 'in-person',
            status: apt.status || 'confirmed',
            originalData: apt
          };
        });

        // Sort by time
        formattedAppointments.sort((a, b) => {
          const timeA = new Date(a.originalData.dateTime);
          const timeB = new Date(b.originalData.dateTime);
          return timeA - timeB;
        });

        setAppointments(formattedAppointments);
        console.log('✅ Formatted today\'s appointments:', formattedAppointments);

      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in to view appointments');
        } else {
          setError('Failed to load today\'s appointments');
        }
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type) => {
    return type === 'virtual' 
      ? <VideoCameraIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" /> 
      : <UserIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
  };


  return (
    <motion.div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }} // Adjusted delay
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Today's Schedule</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">Please refresh the page or contact support.</p>
          </div>
        ) : appointments.length === 0 ? (
          // No appointments state
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">No appointments scheduled for today</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Your schedule is clear!</p>
          </div>
        ) : (
          // Appointments list
          appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700/50 dark:to-slate-800/70 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }} // Adjusted delay
            whileHover={{ x: 5 }}
          >
            <div className="flex-shrink-0 mt-1">
              <div className={`w-10 h-10 bg-gradient-to-br ${appointment.type === 'virtual' ? 'from-blue-400 to-sky-500' : 'from-purple-400 to-indigo-500'} rounded-xl flex items-center justify-center shadow-md`}>
                {getTypeIcon(appointment.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{appointment.patientName}</p>
              <p className="text-xs text-gray-600 dark:text-slate-300">{appointment.reason}</p>
              <div className="flex items-center space-x-3 mt-1.5">
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                  <CalendarDaysIcon className="w-3.5 h-3.5"/>
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                  <ClockIcon className="w-3.5 h-3.5"/>
                  <span>{appointment.time}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 self-center">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
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

export default UpcomingAppointments;
