import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const staticData = [
  { time: "6:00", systolic: 118, diastolic: 78 },
  { time: "9:00", systolic: 120, diastolic: 80 },
  { time: "12:00", systolic: 122, diastolic: 82 },
  { time: "15:00", systolic: 125, diastolic: 85 },
  { time: "18:00", systolic: 119, diastolic: 79 },
  { time: "21:00", systolic: 116, diastolic: 76 },
];

const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-sm rounded-xl p-4 shadow-xl ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
        <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              {entry.name}: {entry.value} mmHg
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const BloodPressureChart = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ avgSystolic: 0, avgDiastolic: 0, readingsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchBloodPressureData = async () => {
      try {
        setLoading(true);
        
        // Get last 24 hours of blood pressure data
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        
        const response = await api.get('/health-data', { 
          params: { 
            dataType: 'bloodPressure', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString(),
            sortBy: 'timestamp',
            order: 'asc'
          } 
        });

        const bloodPressureData = response.data.data || [];

        if (bloodPressureData.length > 0) {
          setHasData(true);

          // Transform data for chart
          const transformedData = bloodPressureData.map(item => {
            const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const systolic = typeof item.value === 'object' ? item.value.systolic : item.value;
            const diastolic = typeof item.value === 'object' ? item.value.diastolic : item.value - 40; // Estimate if not available

            return {
              time,
              systolic,
              diastolic,
              date: new Date(item.timestamp).toLocaleDateString()
            };
          });

          setChartData(transformedData);

          // Calculate stats
          const avgSystolic = Math.round(
            transformedData.reduce((sum, item) => sum + item.systolic, 0) / transformedData.length
          );
          const avgDiastolic = Math.round(
            transformedData.reduce((sum, item) => sum + item.diastolic, 0) / transformedData.length
          );

          setStats({
            avgSystolic,
            avgDiastolic,
            readingsCount: transformedData.length
          });
        } else {
          setHasData(false);
          setChartData([]);
          setStats({ avgSystolic: 0, avgDiastolic: 0, readingsCount: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch blood pressure data:', error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchBloodPressureData();
  }, []);

  return (
    <motion.div 
      className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-slate-700/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Blood Pressure Trend
          </motion.h3>
          <motion.div 
            className="flex items-center space-x-4 text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Systolic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Diastolic</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f1f5f9"} strokeWidth={1} />
              <XAxis 
                dataKey="time" 
                stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                fontSize={12} 
                fontWeight="500"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ stroke: isDarkMode ? "#475569" : "#d1d5db", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="url(#systolicGradient)"
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))" }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#ef4444", 
                  strokeWidth: 3, 
                  fill: isDarkMode ? "#1e293b" : "white",
                  filter: "drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))"
                }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="url(#diastolicGradient)"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))" }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#3b82f6", 
                  strokeWidth: 3, 
                  fill: isDarkMode ? "#1e293b" : "white",
                  filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))"
                }}
                name="Diastolic"
              />
              <defs>
                <linearGradient id="systolicGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f87171" />
                </linearGradient>
                <linearGradient id="diastolicGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stats summary */}
        <motion.div 
          className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.avgSystolic}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Avg Systolic</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgDiastolic}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Avg Diastolic</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600 dark:text-slate-300">{stats.readingsCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Readings Today</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BloodPressureChart;
