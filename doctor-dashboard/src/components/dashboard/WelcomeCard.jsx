import React from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, UsersIcon, BellAlertIcon } from "@heroicons/react/24/outline"; // Changed ClockIcon to UsersIcon and added BellAlertIcon

const WelcomeCard = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Placeholder data for doctor
  const pendingReviews = 5;
  const upcomingAppointments = 3;

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-500 dark:from-sky-400/80 dark:via-blue-500/80 dark:to-indigo-600/80 rounded-3xl p-8 text-white dark:text-sky-950 overflow-hidden" // Adjusted color scheme for doctor
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 rounded-3xl"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 dark:bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/5 dark:bg-white/10 rounded-full blur-lg"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <motion.h1 
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-sky-100 dark:from-slate-300 dark:to-white bg-clip-text text-transparent" // Adjusted gradient text
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Hello, Dr. Smith! 
          </motion.h1>
          <motion.p 
            className="text-sky-100 dark:text-white mb-6 text-lg" // Adjusted text color
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            You have {pendingReviews} patient reports to review and {upcomingAppointments} appointments today.
          </motion.p>
          <motion.div 
            className="flex items-center space-x-6 text-sm text-sky-100 dark:text-slate-200" // Adjusted text color
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-4 h-4" /> 
              <span>{pendingReviews} Pending Reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <BellAlertIcon className="w-4 h-4 text-yellow-300 dark:text-yellow-200" /> 
              <span>2 Critical Alerts</span>
            </div>
          </motion.div>
        </div>

        {/* Progress/Summary (Optional: Can be adapted or removed) */}
        <motion.div 
          className="hidden md:block relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
        >
          <div className="relative w-28 h-28">
            {/* Example: Could show number of appointments for the day */}
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" className="dark:stroke-sky-700/50" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="white" 
                className="dark:stroke-white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="251" // Circumference
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (upcomingAppointments / 10 * 251) }} // Example: 3 out of 10 max appointments
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-2xl font-bold dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                {upcomingAppointments}
              </motion.span>
              <span className="text-xs text-sky-100 dark:text-slate-200">Appts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
