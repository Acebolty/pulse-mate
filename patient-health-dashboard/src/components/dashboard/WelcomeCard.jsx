import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const WelcomeCard = ({ user, latestMetrics }) => {
  const [showTasks, setShowTasks] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getUserName = () => {
    if (!user) return "User";
    return user.firstName ? `${user.firstName}` : "User";
  };

  const getHealthTasksProgress = (latestMetrics) => {
    const today = new Date().toDateString();
    let completedTasks = 0;
    const totalTasks = 4;
    const tasks = [];

    // Task 1: Log Heart Rate
    const hasHeartRate = latestMetrics?.heartRate;
    const heartRateToday = hasHeartRate && new Date(hasHeartRate.timestamp).toDateString() === today;
    tasks.push({
      name: "Log Heart Rate",
      completed: heartRateToday,
      description: heartRateToday
        ? `Recorded: ${hasHeartRate.value} bpm`
        : "Record your heart rate reading",
      icon: "💓",
      priority: "high"
    });
    if (heartRateToday) completedTasks++;

    // Task 2: Log Blood Pressure
    const hasBloodPressure = latestMetrics?.bloodPressure;
    const bloodPressureToday = hasBloodPressure && new Date(hasBloodPressure.timestamp).toDateString() === today;
    const bpValue = hasBloodPressure && typeof hasBloodPressure.value === 'object'
      ? `${hasBloodPressure.value.systolic}/${hasBloodPressure.value.diastolic} mmHg`
      : hasBloodPressure ? `${hasBloodPressure.value} mmHg` : null;

    tasks.push({
      name: "Log Blood Pressure",
      completed: bloodPressureToday,
      description: bloodPressureToday
        ? `Recorded: ${bpValue}`
        : "Record your blood pressure reading",
      icon: "🩺",
      priority: "high"
    });
    if (bloodPressureToday) completedTasks++;

    // Task 3: Log Glucose Level
    const hasGlucose = latestMetrics?.glucose;
    const glucoseToday = hasGlucose && new Date(hasGlucose.timestamp).toDateString() === today;
    tasks.push({
      name: "Log Glucose Level",
      completed: glucoseToday,
      description: glucoseToday
        ? `Recorded: ${hasGlucose.value} mg/dL`
        : "Record your blood glucose reading",
      icon: "🩸",
      priority: "medium"
    });
    if (glucoseToday) completedTasks++;

    // Task 4: Log Body Temperature
    const hasTemp = latestMetrics?.bodyTemperature;
    const tempToday = hasTemp && new Date(hasTemp.timestamp).toDateString() === today;
    tasks.push({
      name: "Log Body Temperature",
      completed: tempToday,
      description: tempToday
        ? `Recorded: ${hasTemp.value.toFixed(1)}°F`
        : "Record your body temperature",
      icon: "🌡️",
      priority: "medium"
    });
    if (tempToday) completedTasks++;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: (completedTasks / totalTasks) * 100,
      tasks: tasks
    };
  };

  const progress = getHealthTasksProgress(latestMetrics);

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
            Hello, {getUserName()}!
          </motion.h1>
          <motion.p 
            className="text-purple-100 dark:text-white mb-6 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            You're doing great! {progress.completed}/{progress.total} health tasks completed today
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
                animate={{ strokeDashoffset: 251 - (progress.percentage * 2.51) }}
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
{Math.round(progress.percentage)}%
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Task Details Toggle */}
        <motion.div
          className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 transition-colors"
          >
            <span>View Daily Health Tasks</span>
            {showTasks ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {showTasks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3"
            >
              {progress.tasks.map((task, index) => (
                <motion.div
                  key={task.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                    task.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{task.icon}</span>
                    {task.completed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-500 flex-shrink-0"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${task.completed ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-slate-300'}`}>
                        {task.name}
                      </p>
                      {task.priority === 'high' && !task.completed && (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${task.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                      {task.description}
                    </p>
                  </div>
                  {task.completed && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      ✓ Done
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;