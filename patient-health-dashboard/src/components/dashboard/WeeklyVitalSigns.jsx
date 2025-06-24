import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const WeeklyVitalSigns = () => {
  const [vitalSignsData, setVitalSignsData] = useState({
    heartRate: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
    bloodPressure: { avgSystolic: 0, avgDiastolic: 0, minSystolic: 0, maxSystolic: 0, trend: 'stable', readings: 0 },
    bodyTemperature: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
    glucoseLevel: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
    totalReadings: 0,
    weeklyScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchWeeklyVitalSigns();
  }, []);

  const fetchWeeklyVitalSigns = async () => {
    try {
      setLoading(true);
      
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [heartRateRes, bloodPressureRes, temperatureRes, glucoseRes] = await Promise.allSettled([
        api.get('/health-data', { 
          params: { 
            dataType: 'heartRate', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          } 
        }),
        api.get('/health-data', { 
          params: { 
            dataType: 'bloodPressure', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          } 
        }),
        api.get('/health-data', { 
          params: { 
            dataType: 'bodyTemperature', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          } 
        }),
        api.get('/health-data', { 
          params: { 
            dataType: 'glucoseLevel', 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          } 
        })
      ]);

      const processedData = {
        heartRate: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
        bloodPressure: { avgSystolic: 0, avgDiastolic: 0, minSystolic: 0, maxSystolic: 0, trend: 'stable', readings: 0 },
        bodyTemperature: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
        glucoseLevel: { avg: 0, min: 0, max: 0, trend: 'stable', readings: 0 },
        totalReadings: 0,
        weeklyScore: 0
      };

      // Process Heart Rate
      if (heartRateRes.status === 'fulfilled' && heartRateRes.value.data.data.length > 0) {
        const hrData = heartRateRes.value.data.data.map(item => item.value);
        processedData.heartRate = {
          avg: Math.round(hrData.reduce((sum, val) => sum + val, 0) / hrData.length),
          min: Math.min(...hrData),
          max: Math.max(...hrData),
          trend: calculateTrend(hrData),
          readings: hrData.length
        };
      }

      // Process Blood Pressure
      if (bloodPressureRes.status === 'fulfilled' && bloodPressureRes.value.data.data.length > 0) {
        const bpData = bloodPressureRes.value.data.data.map(item => {
          if (typeof item.value === 'object') {
            return { systolic: item.value.systolic, diastolic: item.value.diastolic };
          }
          return { systolic: item.value, diastolic: item.value - 40 };
        });
        
        const systolicValues = bpData.map(bp => bp.systolic);
        const diastolicValues = bpData.map(bp => bp.diastolic);
        
        processedData.bloodPressure = {
          avgSystolic: Math.round(systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length),
          avgDiastolic: Math.round(diastolicValues.reduce((sum, val) => sum + val, 0) / diastolicValues.length),
          minSystolic: Math.min(...systolicValues),
          maxSystolic: Math.max(...systolicValues),
          trend: calculateTrend(systolicValues),
          readings: bpData.length
        };
      }

      // Process Body Temperature
      if (temperatureRes.status === 'fulfilled' && temperatureRes.value.data.data.length > 0) {
        const tempData = temperatureRes.value.data.data.map(item => item.value);
        processedData.bodyTemperature = {
          avg: Math.round(tempData.reduce((sum, val) => sum + val, 0) / tempData.length * 10) / 10,
          min: Math.round(Math.min(...tempData) * 10) / 10,
          max: Math.round(Math.max(...tempData) * 10) / 10,
          trend: calculateTrend(tempData),
          readings: tempData.length
        };
      }

      // Process Glucose Level
      if (glucoseRes.status === 'fulfilled' && glucoseRes.value.data.data.length > 0) {
        const glucoseData = glucoseRes.value.data.data.map(item => item.value);
        processedData.glucoseLevel = {
          avg: Math.round(glucoseData.reduce((sum, val) => sum + val, 0) / glucoseData.length),
          min: Math.min(...glucoseData),
          max: Math.max(...glucoseData),
          trend: calculateTrend(glucoseData),
          readings: glucoseData.length
        };
      }

      // Calculate total readings and weekly score
      processedData.totalReadings = processedData.heartRate.readings + 
                                   processedData.bloodPressure.readings + 
                                   processedData.bodyTemperature.readings + 
                                   processedData.glucoseLevel.readings;

      // Weekly score based on data completeness and health ranges
      const expectedReadings = 28; // 4 metrics × 7 days
      const completenessScore = (processedData.totalReadings / expectedReadings) * 100;
      processedData.weeklyScore = Math.round(completenessScore);

      setVitalSignsData(processedData);
    } catch (error) {
      console.error('Error fetching weekly vital signs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ArrowRightIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          Weekly Vital Signs Summary
        </h3>
        <div className="flex items-center space-x-2">
          {getScoreIcon(vitalSignsData.weeklyScore)}
          <span className={`text-sm font-semibold ${getScoreColor(vitalSignsData.weeklyScore)}`}>
            {vitalSignsData.weeklyScore}% Complete
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Heart Rate */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-slate-100">Heart Rate</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {vitalSignsData.heartRate.min}-{vitalSignsData.heartRate.max} bpm (avg: {vitalSignsData.heartRate.avg})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(vitalSignsData.heartRate.trend)}
            <span className={`text-sm font-medium ${getTrendColor(vitalSignsData.heartRate.trend)}`}>
              {vitalSignsData.heartRate.readings} readings
            </span>
          </div>
        </motion.div>

        {/* Blood Pressure */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-slate-100">Blood Pressure</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {vitalSignsData.bloodPressure.avgSystolic}/{vitalSignsData.bloodPressure.avgDiastolic} mmHg avg
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(vitalSignsData.bloodPressure.trend)}
            <span className={`text-sm font-medium ${getTrendColor(vitalSignsData.bloodPressure.trend)}`}>
              {vitalSignsData.bloodPressure.readings} readings
            </span>
          </div>
        </motion.div>

        {/* Body Temperature */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">°F</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-slate-100">Body Temperature</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {vitalSignsData.bodyTemperature.min}-{vitalSignsData.bodyTemperature.max}°F (avg: {vitalSignsData.bodyTemperature.avg})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(vitalSignsData.bodyTemperature.trend)}
            <span className={`text-sm font-medium ${getTrendColor(vitalSignsData.bodyTemperature.trend)}`}>
              {vitalSignsData.bodyTemperature.readings} readings
            </span>
          </div>
        </motion.div>

        {/* Glucose Level */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">GL</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-slate-100">Glucose Level</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {vitalSignsData.glucoseLevel.min}-{vitalSignsData.glucoseLevel.max} mg/dL (avg: {vitalSignsData.glucoseLevel.avg})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(vitalSignsData.glucoseLevel.trend)}
            <span className={`text-sm font-medium ${getTrendColor(vitalSignsData.glucoseLevel.trend)}`}>
              {vitalSignsData.glucoseLevel.readings} readings
            </span>
          </div>
        </motion.div>
      </div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-slate-400">
            Total readings this week: <span className="font-semibold">{vitalSignsData.totalReadings}</span>
          </span>
          <span className="text-gray-600 dark:text-slate-400">
            Last 7 days
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyVitalSigns;
