import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, UsersIcon, BellAlertIcon } from "@heroicons/react/24/outline"; // Changed ClockIcon to UsersIcon and added BellAlertIcon
import { getCurrentUser } from '../../services/authService';

const WelcomeCard = ({ dashboardData = {}, loading = false }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Real data from props using new dashboard structure
  const totalPatients = loading ? '...' : (dashboardData.totalPatients || 0);
  const openAppointments = loading ? '...' : (dashboardData.openAppointments || 0);
  const appointmentsWaiting = loading ? '...' : (dashboardData.appointmentsWaiting || 0);
  const recentAlerts = loading ? '...' : (dashboardData.recentAlerts || 0);

  // Helper function to get time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to get status message
  const getStatusMessage = () => {
    if (loading) return 'Loading your practice overview...';

    if (openAppointments > 0) {
      return `You have ${openAppointments} active consultation${openAppointments !== 1 ? 's' : ''} in progress`;
    }

    if (appointmentsWaiting > 0) {
      return `${appointmentsWaiting} patient${appointmentsWaiting !== 1 ? 's' : ''} waiting for you to open chat`;
    }

    return 'All caught up! Time to relax or review patient histories.';
  };

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-400 dark:from-sky-400/80 dark:via-blue-500/80 dark:to-indigo-600/80 rounded-3xl p-8 text-white dark:text-sky-950 overflow-hidden" // Adjusted color scheme for doctor
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
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-sky-100 dark:from-slate-300 dark:to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {getTimeGreeting()}, {currentUser?.doctorInfo?.title || 'Dr.'} {currentUser?.firstName || 'Doctor'}!
          </motion.h1>

          <motion.div
            className="text-sky-100 dark:text-white mb-6 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="mb-4">
              <div className="space-y-2 text-base">
                <div className="flex items-center space-x-2">
                  <span className={openAppointments === 0 ? "text-green-300" : "text-yellow-300"}>
                    {openAppointments === 0 ? "✅" : "🔄"}
                  </span>
                  <span>
                    {openAppointments === 0 ? "All consultations completed" : `${openAppointments} active chat session${openAppointments !== 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={appointmentsWaiting === 0 ? "text-green-300" : "text-orange-300"}>
                    {appointmentsWaiting === 0 ? "✅" : "⏳"}
                  </span>
                  <span>
                    {appointmentsWaiting === 0 ? "No patients waiting" : `${appointmentsWaiting} patient${appointmentsWaiting !== 1 ? 's' : ''} waiting for chat`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-blue-300">📊</span>
                  <span>{totalPatients} patient{totalPatients !== 1 ? 's' : ''} under your care</span>
                </div>
              </div>
            </div>

            <motion.p
              className="text-sky-200 dark:text-slate-300 text-base italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {getStatusMessage()}
            </motion.p>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-6 text-sm text-sky-100 dark:text-slate-200" // Adjusted text color
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BellAlertIcon className={`w-4 h-4 ${recentAlerts > 0 ? 'text-red-300 dark:text-red-200' : 'text-green-300 dark:text-green-200'}`} />
              <span>
                {recentAlerts > 0 ? `${recentAlerts} Active Alert${recentAlerts !== 1 ? 's' : ''}` : 'No Active Alerts'}
              </span>
            </div>
          </motion.div>
        </div>


      </div>
    </motion.div>
  );
};

export default WelcomeCard;
