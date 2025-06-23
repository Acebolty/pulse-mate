import { CalendarDaysIcon, ClockIcon, UserIcon, VideoCameraIcon } from "@heroicons/react/24/outline" // Added UserIcon
import { motion } from 'framer-motion';

const UpcomingAppointments = () => {
  // Placeholder data for doctor's appointments
  const appointments = [
    {
      id: 1,
      patientName: "Alice Johnson",
      reason: "Follow-up Consultation",
      date: "Jan 15",
      time: "10:00 AM",
      type: "virtual", // 'virtual' or 'in-person'
      status: "confirmed", // 'confirmed', 'pending', 'cancelled'
    },
    {
      id: 2,
      patientName: "Robert Davis",
      reason: "Annual Physical Exam",
      date: "Jan 15",
      time: "11:30 AM",
      type: "in-person",
      status: "confirmed",
    },
    {
      id: 3,
      patientName: "Maria Garcia",
      reason: "Medication Review",
      date: "Jan 16",
      time: "2:00 PM",
      type: "virtual",
      status: "pending",
    },
     {
      id: 4,
      patientName: "John Doe",
      reason: "New Patient Intake",
      date: "Jan 16",
      time: "03:30 PM",
      type: "in-person",
      status: "confirmed",
    },
  ];

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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Today's Schedule</h3>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-700/30 px-3 py-1 rounded-lg transition-colors">
          View Calendar
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max height and scroll */}
        {appointments.map((appointment, index) => (
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
        ))}
        {appointments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-slate-400 py-4">No appointments scheduled for today.</p>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingAppointments;
