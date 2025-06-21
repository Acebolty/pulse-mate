import { CalendarIcon, ClockIcon, VideoCameraIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';

const UpcomingAppointments = () => {
  const appointments = [
    {
      id: 1,
      title: "General Checkup",
      doctor: "Dr. Sarah Wilson",
      date: "Jan 15",
      time: "10:00 AM",
      type: "in-person",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Cardiology Consultation",
      doctor: "Dr. Michael Chen",
      date: "Jan 18",
      time: "2:30 PM",
      type: "virtual",
      status: "confirmed",
    },
    {
      id: 3,
      title: "Blood Test Results",
      doctor: "Dr. Emily Rodriguez",
      date: "Jan 22",
      time: "11:15 AM",
      type: "virtual",
      status: "pending",
    },
  ];

  return (
    <motion.div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Upcoming Appointments</h3>
        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-700/30 px-3 py-1 rounded-lg transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700/50 dark:to-slate-800/70 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">
                  {appointment.type === "virtual" ? "💻" : "🏥"}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{appointment.title}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">{appointment.doctor}</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{appointment.date}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{appointment.time}</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                appointment.status === "confirmed" 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-600/30 dark:text-amber-300"
              }`}>
                {appointment.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UpcomingAppointments
