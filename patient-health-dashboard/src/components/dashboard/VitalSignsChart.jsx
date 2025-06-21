import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "6:00", heartRate: 68, bloodPressure: 120 },
  { time: "9:00", heartRate: 72, bloodPressure: 118 },
  { time: "12:00", heartRate: 75, bloodPressure: 122 },
  { time: "15:00", heartRate: 78, bloodPressure: 125 },
  { time: "18:00", heartRate: 74, bloodPressure: 119 },
  { time: "21:00", heartRate: 70, bloodPressure: 116 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
        <p className="text-sm font-semibold text-gray-800 mb-2">{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="font-medium text-gray-700">
              {entry.name}: {entry.value}
              {entry.name === "Heart Rate" ? " bpm" : " mmHg"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const VitalSignsChart = () => {
  return (
    <motion.div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Vital Signs Trend
          </motion.h3>
          <motion.div 
            className="flex items-center space-x-4 text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="text-gray-600 font-medium">Heart Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="text-gray-600 font-medium">Blood Pressure</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="time" 
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
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="url(#heartRateGradient)"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))" }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#10b981", 
                  strokeWidth: 3, 
                  fill: "white",
                  filter: "drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))"
                }}
                name="Heart Rate"
              />
              <Line
                type="monotone"
                dataKey="bloodPressure"
                stroke="url(#bloodPressureGradient)"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))" }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#3b82f6", 
                  strokeWidth: 3, 
                  fill: "white",
                  filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))"
                }}
                name="Blood Pressure"
              />
              <defs>
                <linearGradient id="heartRateGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="bloodPressureGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stats summary */}
        <motion.div 
          className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">72</p>
            <p className="text-xs text-gray-500 font-medium">Avg Heart Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">120</p>
            <p className="text-xs text-gray-500 font-medium">Avg Blood Pressure</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">6</p>
            <p className="text-xs text-gray-500 font-medium">Readings Today</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VitalSignsChart;