import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBarIcon, HeartIcon } from '@heroicons/react/24/outline';
import api from "../../services/api";

const staticData = [
  { time: "6:00", heartRate: 68, bloodPressure: 120 },
  { time: "9:00", heartRate: 72, bloodPressure: 118 },
  { time: "12:00", heartRate: 75, bloodPressure: 122 },
  { time: "15:00", heartRate: 78, bloodPressure: 125 },
  { time: "18:00", heartRate: 74, bloodPressure: 119 },
  { time: "21:00", heartRate: 70, bloodPressure: 116 },
];

const CustomTooltip = ({ active, payload, label, isDarkMode }) => { // Added isDarkMode
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ avgHeartRate: 0, avgBloodPressure: 0, readingsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark')); // Initial check
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchVitalSigns = async () => {
      try {
        setLoading(true);

        // Get last 24 hours of data
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        const [heartRateRes, bloodPressureRes] = await Promise.allSettled([
          api.get('/health-data', {
            params: {
              dataType: 'heartRate',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              sortBy: 'timestamp',
              order: 'asc'
            }
          }),
          api.get('/health-data', {
            params: {
              dataType: 'bloodPressure',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              sortBy: 'timestamp',
              order: 'asc'
            }
          })
        ]);

        const heartRateData = heartRateRes.status === 'fulfilled' ? heartRateRes.value.data.data : [];
        const bloodPressureData = bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data.data : [];

        if (heartRateData.length > 0 || bloodPressureData.length > 0) {
          setHasData(true);

          // Transform data for chart
          const transformedData = [];
          const timeMap = new Map();

          // Process heart rate data
          heartRateData.forEach(item => {
            const time = new Date(item.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            timeMap.set(time, { ...timeMap.get(time), time, heartRate: item.value });
          });

          // Process blood pressure data
          bloodPressureData.forEach(item => {
            const time = new Date(item.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            const systolic = typeof item.value === 'object' ? item.value.systolic : item.value;
            timeMap.set(time, { ...timeMap.get(time), time, bloodPressure: systolic });
          });

          const chartArray = Array.from(timeMap.values()).sort((a, b) => {
            // Convert 12-hour format to 24-hour for proper sorting
            const timeA = new Date(`1970/01/01 ${a.time}`);
            const timeB = new Date(`1970/01/01 ${b.time}`);
            return timeA - timeB;
          });

          if (chartArray.length > 0) {
            setChartData(chartArray);

            // Calculate stats
            const avgHeartRate = heartRateData.length > 0
              ? Math.round(heartRateData.reduce((sum, item) => sum + item.value, 0) / heartRateData.length)
              : 0;

            const avgBloodPressure = bloodPressureData.length > 0
              ? Math.round(bloodPressureData.reduce((sum, item) => {
                  const systolic = typeof item.value === 'object' ? item.value.systolic : item.value;
                  return sum + systolic;
                }, 0) / bloodPressureData.length)
              : 0;

            setStats({
              avgHeartRate,
              avgBloodPressure,
              readingsCount: heartRateData.length + bloodPressureData.length
            });
          }
        } else {
          setHasData(false);
          setChartData([]);
          setStats({ avgHeartRate: 0, avgBloodPressure: 0, readingsCount: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch vital signs data:', error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchVitalSigns();
  }, []);

  // Empty state component
  const EmptyState = () => (
    <div className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4 flex flex-col items-center justify-center">
      <ChartBarIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
      <h4 className="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-2">No Vital Signs Data</h4>
      <p className="text-sm text-gray-400 dark:text-slate-500 text-center">
        Record heart rate and blood pressure readings to see your vital signs trend
      </p>
    </div>
  );

  return (
    <motion.div 
      className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-slate-700/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text"
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
              <span className="text-gray-600 dark:text-slate-300 font-medium">Heart Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Blood Pressure</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {hasData ? (
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
                  dataKey="heartRate"
                  stroke="url(#heartRateGradient)"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))" }}
                  activeDot={{
                    r: 7,
                    stroke: "#10b981",
                    strokeWidth: 3,
                    fill: isDarkMode ? "#1e293b" : "white",
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
                    fill: isDarkMode ? "#1e293b" : "white",
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
          ) : (
            <EmptyState />
          )}
        </motion.div>

        {/* Stats summary */}
        {hasData && (
          <motion.div
            className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgHeartRate}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Avg Heart Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgBloodPressure}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Avg Blood Pressure</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-slate-300">{stats.readingsCount}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Readings</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VitalSignsChart;