import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const staticData = [
  { day: "Mon", steps: 8500, calories: 1200 },
  { day: "Tue", steps: 9200, calories: 1350 },
  { day: "Wed", steps: 7800, calories: 1100 },
  { day: "Thu", steps: 10500, calories: 1450 },
  { day: "Fri", steps: 9800, calories: 1380 },
  { day: "Sat", steps: 12000, calories: 1600 },
  { day: "Sun", steps: 6500, calories: 950 },
];

const CustomTooltip = ({ active, payload, label, isDarkMode }) => { // Added isDarkMode prop
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-sm rounded-xl p-4 shadow-xl ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
        <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === "Steps" ? " steps" : " kcal"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ActivitySummary = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activityData, setActivityData] = useState(staticData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark')); // Initial check
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);

        // Get last 7 days of data
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [stepsRes, caloriesRes] = await Promise.allSettled([
          api.get('/health-data', {
            params: {
              dataType: 'stepsTaken',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              sortBy: 'timestamp',
              order: 'asc'
            }
          }),
          api.get('/health-data', {
            params: {
              dataType: 'caloriesBurned',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              sortBy: 'timestamp',
              order: 'asc'
            }
          })
        ]);

        const stepsData = stepsRes.status === 'fulfilled' ? stepsRes.value.data.data : [];
        const caloriesData = caloriesRes.status === 'fulfilled' ? caloriesRes.value.data.data : [];

        if (stepsData.length > 0 || caloriesData.length > 0) {
          // Transform data for chart
          const dayMap = new Map();
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

          // Process steps data
          stepsData.forEach(item => {
            const date = new Date(item.timestamp);
            const dayName = dayNames[date.getDay()];
            const existing = dayMap.get(dayName) || { day: dayName, steps: 0, calories: 0 };
            existing.steps = item.value;
            dayMap.set(dayName, existing);
          });

          // Process calories data
          caloriesData.forEach(item => {
            const date = new Date(item.timestamp);
            const dayName = dayNames[date.getDay()];
            const existing = dayMap.get(dayName) || { day: dayName, steps: 0, calories: 0 };
            existing.calories = item.value;
            dayMap.set(dayName, existing);
          });

          // Convert to array and sort by day order
          const chartArray = Array.from(dayMap.values()).sort((a, b) => {
            return dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
          });

          if (chartArray.length > 0) {
            setActivityData(chartArray);
          }
        }
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  // Calculate weekly totals
  const totalSteps = activityData.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = activityData.reduce((sum, day) => sum + day.calories, 0);
  const avgSteps = Math.round(totalSteps / activityData.length);

  return (
    <motion.div 
      className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-slate-700/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            Weekly Activity
          </motion.h3>
          <motion.div 
            className="flex items-center space-x-4 text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm"></div>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Steps</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Calories</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f1f5f9"} strokeWidth={1} /> {/* slate-700 for dark */}
              <XAxis 
                dataKey="day" 
                stroke={isDarkMode ? "#94a3b8" : "#64748b"} // slate-400 for dark
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={isDarkMode ? "#94a3b8" : "#64748b"} // slate-400 for dark
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ fill: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(229, 231, 235, 0.4)' }} />
              <Bar 
                dataKey="steps" 
                fill="url(#stepsGradient)" 
                radius={[6, 6, 0, 0]} 
                name="Steps"
                className="drop-shadow-sm"
              />
              <Bar 
                dataKey="calories" 
                fill="url(#caloriesGradient)" 
                radius={[6, 6, 0, 0]} 
                name="Calories"
                className="drop-shadow-sm"
              />
              <defs>
                <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
            >
              {totalSteps.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Steps</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-orange-600 dark:text-orange-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.0, type: "spring", stiffness: 200 }}
            >
              {totalCalories.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Calories</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-gray-600 dark:text-slate-300"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
            >
              {avgSteps.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Daily Average</p>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div 
          className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-slate-300 font-medium">Weekly Goal Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">85%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ delay: 2.6, duration: 1.5, ease: "easeOut" }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActivitySummary;