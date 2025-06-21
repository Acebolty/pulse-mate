import React from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const WelcomeCard = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-green-400/80 dark:via-emerald-500/80 dark:to-teal-600/80 rounded-3xl p-8 text-white dark:text-green-950 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 rounded-3xl"></div> {/* Will revisit this based on new bg */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 dark:bg-white/10 rounded-full blur-xl"></div> {/* Adjusted for lighter dark bg */}
      <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/5 dark:bg-white/10 rounded-full blur-lg"></div> {/* Adjusted for lighter dark bg */}
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <motion.h1 
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 dark:from-slate-300 dark:to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Hello, John!
          </motion.h1>
          <motion.p 
            className="text-purple-100 dark:text-white mb-6 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            You're doing great! 3/5 health tasks completed today
          </motion.p>
          <motion.div 
            className="flex items-center space-x-6 text-sm text-purple-100 dark:text-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 dark:bg-green-700 rounded-full animate-pulse"></div> {/* Adjusted sync dot for contrast if needed */}
                <span className='dark:text-red-300'>Live sync active</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Progress Ring */}
        <motion.div 
          className="hidden md:block relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
        >
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" className="dark:stroke-emerald-700/50" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="white" 
                className="dark:strokwhite"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="251"
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (60 * 2.51) }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-2xl font-bold dark:text-white" // Inherits dark:text-green-950 from parent
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                60%
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;