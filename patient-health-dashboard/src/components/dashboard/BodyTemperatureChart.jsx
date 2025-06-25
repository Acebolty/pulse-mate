import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from "../../services/api";

const staticData = [
  { time: "6:00", temperature: 98.2 },
  { time: "9:00", temperature: 98.6 },
  { time: "12:00", temperature: 98.8 },
  { time: "15:00", temperature: 99.1 },
  { time: "18:00", temperature: 98.9 },
  { time: "21:00", temperature: 98.4 },
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
              Temperature: {entry.value}°F
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const BodyTemperatureChart = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ avgTemp: 0, minTemp: 0, maxTemp: 0, readingsCount: 0 });
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
    const fetchTemperatureData = async () => {
      try {
        setLoading(true);
        
        // Get last 24 hours of body temperature data
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        
        const response = await api.get('/health-data', { 
          params: { 
            dataType: 'bodyTemperature', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString(),
            sortBy: 'timestamp',
            order: 'asc'
          } 
        });

        const temperatureData = response.data.data || [];

        if (temperatureData.length > 0) {
          setHasData(true);

          // Transform data for chart
          const transformedData = temperatureData.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: parseFloat(item.value.toFixed(1)),
            date: new Date(item.timestamp).toLocaleDateString(),
            timestamp: item.timestamp // Keep original timestamp for sorting
          })).sort((a, b) => {
            // Sort chronologically (oldest to newest)
            return new Date(a.timestamp) - new Date(b.timestamp);
          });

          setChartData(transformedData);

          // Calculate stats
          const temperatures = transformedData.map(item => item.temperature);
          const avgTemp = parseFloat((temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(1));
          const minTemp = Math.min(...temperatures);
          const maxTemp = Math.max(...temperatures);

          setStats({
            avgTemp,
            minTemp,
            maxTemp,
            readingsCount: transformedData.length
          });
        } else {
          setHasData(false);
          setChartData([]);
          setStats({ avgTemp: 0, minTemp: 0, maxTemp: 0, readingsCount: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch body temperature data:', error);
        // Keep static data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
  }, []);

  // Determine temperature status color
  const getTemperatureStatus = (temp) => {
    if (temp === 0) return { status: 'No Data', color: 'text-gray-500 dark:text-slate-400' };
    if (temp < 97.0) return { status: 'Low', color: 'text-blue-600 dark:text-blue-400' };
    if (temp >= 97.0 && temp <= 99.0) return { status: 'Normal', color: 'text-green-600 dark:text-green-400' };
    if (temp > 99.0 && temp <= 100.4) return { status: 'Elevated', color: 'text-yellow-600 dark:text-yellow-400' };
    return { status: 'Fever', color: 'text-red-600 dark:text-red-400' };
  };

  const currentStatus = getTemperatureStatus(stats.avgTemp);

  // Empty state component
  const EmptyState = () => (
    <div className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4 flex flex-col items-center justify-center">
      <ChartBarIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
      <h4 className="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-2">No Temperature Data</h4>
      <p className="text-sm text-gray-400 dark:text-slate-500 text-center">
        Record body temperature readings to see your temperature trend
      </p>
    </div>
  );

  return (
    <motion.div 
      className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-slate-700/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-xl font-bold text-gray-900 dark:text-slate-100 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            Body Temperature
          </motion.h3>
          <motion.div 
            className="flex items-center space-x-2 text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm animate-pulse"></div>
            <span className={`font-medium ${currentStatus.color}`}>{currentStatus.status}</span>
          </motion.div>
        </div>

        <motion.div
          className="h-64 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ stroke: isDarkMode ? "#475569" : "#d1d5db", strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="url(#temperatureGradient)"
                  strokeWidth={3}
                  fill="url(#temperatureAreaGradient)"
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 5, filter: "drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3))" }}
                  activeDot={{
                    r: 7,
                    stroke: "#f97316",
                    strokeWidth: 3,
                    fill: isDarkMode ? "#1e293b" : "white",
                    filter: "drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4))"
                  }}
                />
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                  <linearGradient id="temperatureAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
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
            transition={{ delay: 2.0, duration: 0.5 }}
          >
            <div className="text-center">
              <p className={`text-2xl font-bold ${currentStatus.color}`}>{stats.avgTemp}°F</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Average</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.minTemp}°F</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Minimum</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.maxTemp}°F</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Maximum</p>
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

export default BodyTemperatureChart;
