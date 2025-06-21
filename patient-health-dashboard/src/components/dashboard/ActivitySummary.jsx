import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", steps: 8500, calories: 1200 },
  { day: "Tue", steps: 9200, calories: 1350 },
  { day: "Wed", steps: 7800, calories: 1100 },
  { day: "Thu", steps: 10500, calories: 1450 },
  { day: "Fri", steps: 9800, calories: 1380 },
  { day: "Sat", steps: 12000, calories: 1600 },
  { day: "Sun", steps: 6500, calories: 950 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
        <p className="text-sm font-semibold text-gray-800 mb-2">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="font-medium text-gray-700">
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
  // Calculate weekly totals
  const totalSteps = data.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = data.reduce((sum, day) => sum + day.calories, 0);
  const avgSteps = Math.round(totalSteps / data.length);

  return (
    <motion.div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text"
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
              <span className="text-gray-600 font-medium">Steps</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
              <span className="text-gray-600 font-medium">Calories</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
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
          className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-emerald-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
            >
              {totalSteps.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 font-medium">Total Steps</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-orange-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.0, type: "spring", stiffness: 200 }}
            >
              {totalCalories.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 font-medium">Total Calories</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-2xl font-bold text-gray-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
            >
              {avgSteps.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 font-medium">Daily Average</p>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div 
          className="mt-4 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Weekly Goal Progress</span>
            <span className="text-emerald-600 font-semibold">85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
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