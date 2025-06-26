"use client"

import { useState, useEffect } from "react"
import api from '../services/api'
import {
  HeartIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  SunIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { motion } from "framer-motion"

// Default health targets (same as ProfileNew.jsx)
const defaultHealthTargets = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 }, unit: 'mmHg' },
  bodyTemperature: { min: 97.0, max: 99.5, unit: '°F' },
  glucoseLevel: { min: 70, max: 140, unit: 'mg/dL' },
  weight: { target: 175, unit: 'lbs' },
}

// Helper functions for status calculation
const getHeartRateStatus = (heartRate) => {
  if (heartRate < 50) return "critical";
  if (heartRate < 60) return "warning";
  if (heartRate >= 60 && heartRate <= 100) return "good";
  if (heartRate > 100 && heartRate <= 120) return "warning";
  return "critical";
};

const getBloodPressureStatus = (systolic, diastolic) => {
  if (systolic >= 180 || diastolic >= 110) return "critical";
  if (systolic >= 140 || diastolic >= 90) return "warning";
  if (systolic >= 120 || diastolic >= 80) return "normal";
  return "good";
};

const getGlucoseStatus = (glucose) => {
  if (glucose < 70) return "critical";
  if (glucose >= 70 && glucose <= 100) return "good";
  if (glucose > 100 && glucose <= 140) return "warning";
  return "critical";
};

const getTemperatureStatus = (temp) => {
  if (temp < 97.0) return "warning";
  if (temp >= 97.0 && temp <= 99.0) return "normal";
  if (temp > 99.0 && temp <= 100.4) return "warning";
  return "critical";
};

const HealthMetrics = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [healthData, setHealthData] = useState({
    heartRate: [],
    bloodPressure: [],
    bodyTemperature: [],
    glucoseLevel: []
  });
  const [latestMetrics, setLatestMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple change calculation function
  const calculateChange = (readings, dataType = null) => {
    if (readings.length < 2) return "First reading";

    const current = readings[0].value;
    const previous = readings[1].value;

    let currentVal, previousVal;
    if (dataType === 'bloodPressure') {
      currentVal = typeof current === 'object' ? current.systolic : current;
      previousVal = typeof previous === 'object' ? previous.systolic : previous;
    } else {
      currentVal = current;
      previousVal = previous;
    }

    const difference = Math.round((currentVal - previousVal) * 10) / 10;
    return difference > 0 ? `+${difference} from previous` : `${difference} from previous`;
  };
  const [isDarkMode, setIsDarkMode] = useState(false);

  // New state for advanced features
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({ dataType: 'all', status: 'all', source: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [healthScore, setHealthScore] = useState({ score: 0, label: 'No Data', factors: [] });
  const [healthTargets, setHealthTargets] = useState(defaultHealthTargets);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchHealthData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate date range
        const endDate = new Date();
        let startDate = new Date();
        switch (timeRange) {
          case "24hours":
            startDate.setDate(endDate.getDate() - 1);
            break;
          case "7days":
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(endDate.getDate() - 30);
            break;
          default:
            startDate.setDate(endDate.getDate() - 7);
        }

        const commonParams = { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString(),
          limit: 100,
          sortBy: 'timestamp',
          order: 'desc'
        };

        // Fetch data for the 4 main health metrics and user profile (for health targets)
        const [heartRateRes, bloodPressureRes, temperatureRes, glucoseRes, profileRes] = await Promise.allSettled([
          api.get('/health-data', { params: { ...commonParams, dataType: 'heartRate' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'bloodPressure' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'bodyTemperature' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'glucoseLevel' } }),
          api.get('/profile/me')
        ]);

        // Process the data
        const newHealthData = {
          heartRate: heartRateRes.status === 'fulfilled' ? heartRateRes.value.data.data : [],
          bloodPressure: bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data.data : [],
          bodyTemperature: temperatureRes.status === 'fulfilled' ? temperatureRes.value.data.data : [],
          glucoseLevel: glucoseRes.status === 'fulfilled' ? glucoseRes.value.data.data : []
        };

        setHealthData(newHealthData);

        // Get latest metrics for summary cards
        const newLatestMetrics = {};
        if (newHealthData.heartRate.length > 0) {
          const latest = newHealthData.heartRate[0];
          newLatestMetrics.heartRate = {
            ...latest,
            status: getHeartRateStatus(latest.value),
            change: calculateChange(newHealthData.heartRate, 'heartRate')
          };
        }
        if (newHealthData.bloodPressure.length > 0) {
          const latest = newHealthData.bloodPressure[0];
          const systolic = typeof latest.value === 'object' ? latest.value.systolic : latest.value;
          const diastolic = typeof latest.value === 'object' ? latest.value.diastolic : latest.value - 40;
          newLatestMetrics.bloodPressure = {
            ...latest,
            status: getBloodPressureStatus(systolic, diastolic),
            change: calculateChange(newHealthData.bloodPressure, 'bloodPressure')
          };
        }
        if (newHealthData.bodyTemperature.length > 0) {
          const latest = newHealthData.bodyTemperature[0];
          newLatestMetrics.bodyTemperature = {
            ...latest,
            status: getTemperatureStatus(latest.value),
            change: calculateChange(newHealthData.bodyTemperature, 'bodyTemperature')
          };
        }
        if (newHealthData.glucoseLevel.length > 0) {
          const latest = newHealthData.glucoseLevel[0];
          newLatestMetrics.glucoseLevel = {
            ...latest,
            status: getGlucoseStatus(latest.value),
            change: calculateChange(newHealthData.glucoseLevel, 'glucoseLevel')
          };
        }

        setLatestMetrics(newLatestMetrics);

        // Load health targets from profile
        if (profileRes.status === 'fulfilled' && profileRes.value.data?.healthTargets) {
          setHealthTargets(profileRes.value.data.healthTargets);
        }

      } catch (err) {
        console.error("Failed to fetch health data:", err);
        setError("Could not load health data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [timeRange]);



  // Separate useEffect for calculating stats after data is set
  useEffect(() => {
    if (hasAnyData && Object.keys(latestMetrics).length > 0) {
      setWeeklyStats(calculateWeeklyStats());
      setMonthlyStats(calculateMonthlyStats());
      setHealthScore(calculateHealthScore());
    }
  }, [healthData, latestMetrics, healthTargets]);

  // Helper functions
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };



  // Check if we have any data
  const hasAnyData = Object.values(healthData).some(data => data.length > 0);

  // Advanced calculation functions
  const calculateWeeklyStats = () => {
    console.log('Calculating weekly stats...', healthData);
    const stats = {};
    Object.entries(healthData).forEach(([dataType, readings]) => {
      if (readings.length > 0) {
        const values = readings.map(r => {
          if (dataType === 'bloodPressure') {
            return typeof r.value === 'object' ? r.value.systolic : r.value;
          }
          return r.value;
        });

        stats[dataType] = {
          average: Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10,
          min: Math.min(...values),
          max: Math.max(...values),
          count: readings.length,
          trend: calculateTrendDirection(values)
        };
        console.log(`Weekly stats for ${dataType}:`, stats[dataType]);
      }
    });
    console.log('Final weekly stats:', stats);
    return stats;
  };

  const calculateMonthlyStats = () => {
    console.log('Calculating monthly stats...', healthData);
    // Similar to weekly but for longer period
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = {};
    Object.entries(healthData).forEach(([dataType, readings]) => {
      const monthlyReadings = readings.filter(r => new Date(r.timestamp) >= thirtyDaysAgo);
      if (monthlyReadings.length > 0) {
        const values = monthlyReadings.map(r => {
          if (dataType === 'bloodPressure') {
            return typeof r.value === 'object' ? r.value.systolic : r.value;
          }
          return r.value;
        });

        stats[dataType] = {
          average: Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10,
          min: Math.min(...values),
          max: Math.max(...values),
          count: monthlyReadings.length,
          trend: calculateTrendDirection(values)
        };
        console.log(`Monthly stats for ${dataType}:`, stats[dataType]);
      }
    });
    console.log('Final monthly stats:', stats);
    return stats;
  };

  const calculateTrendDirection = (values) => {
    if (values.length < 3) return 'stable';
    const firstThird = values.slice(0, Math.floor(values.length / 3));
    const lastThird = values.slice(-Math.floor(values.length / 3));
    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
    const percentChange = ((lastAvg - firstAvg) / firstAvg) * 100;

    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  };

  const calculateHealthScore = () => {
    console.log('Calculating health score...', { hasAnyData, latestMetrics, healthTargets });

    if (!hasAnyData || Object.keys(latestMetrics).length === 0) {
      console.log('No data available for health score');
      return { score: 0, label: 'No Data', factors: [] };
    }

    let score = 100;
    let factors = [];

    // Check heart rate against user's targets (using most recent reading)
    if (latestMetrics.heartRate && latestMetrics.heartRate.value) {
      const currentHR = latestMetrics.heartRate.value;
      const hrMin = healthTargets.heartRate.min;
      const hrMax = healthTargets.heartRate.max;

      console.log('Heart Rate Check:', { currentHR, hrMin, hrMax });

      if (currentHR < hrMin - 10 || currentHR > hrMax + 20) {
        score -= 20;
        factors.push(`Heart rate (${currentHR} bpm) outside optimal range (${hrMin}-${hrMax} bpm)`);
      } else if (currentHR < hrMin || currentHR > hrMax) {
        score -= 10;
        factors.push(`Heart rate (${currentHR} bpm) outside target range (${hrMin}-${hrMax} bpm)`);
      }
    }

    // Check blood pressure against user's targets
    if (latestMetrics.bloodPressure && latestMetrics.bloodPressure.value) {
      const systolic = typeof latestMetrics.bloodPressure.value === 'object'
        ? latestMetrics.bloodPressure.value.systolic
        : latestMetrics.bloodPressure.value;
      const diastolic = typeof latestMetrics.bloodPressure.value === 'object'
        ? latestMetrics.bloodPressure.value.diastolic
        : latestMetrics.bloodPressure.value - 40;

      const sysMin = healthTargets.bloodPressure.systolic.min;
      const sysMax = healthTargets.bloodPressure.systolic.max;
      const diaMin = healthTargets.bloodPressure.diastolic.min;
      const diaMax = healthTargets.bloodPressure.diastolic.max;

      if (systolic > sysMax + 20 || diastolic > diaMax + 10) {
        score -= 20;
        factors.push(`Blood pressure (${systolic}/${diastolic}) critically elevated`);
      } else if (systolic > sysMax || diastolic > diaMax || systolic < sysMin || diastolic < diaMin) {
        score -= 10;
        factors.push(`Blood pressure (${systolic}/${diastolic}) outside target range (${sysMin}-${sysMax}/${diaMin}-${diaMax})`);
      }
    }

    // Check body temperature against user's targets
    if (latestMetrics.bodyTemperature && latestMetrics.bodyTemperature.value) {
      const currentTemp = latestMetrics.bodyTemperature.value;
      const tempMin = healthTargets.bodyTemperature.min;
      const tempMax = healthTargets.bodyTemperature.max;

      if (currentTemp > tempMax + 1 || currentTemp < tempMin - 1) {
        score -= 15;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside safe range`);
      } else if (currentTemp > tempMax || currentTemp < tempMin) {
        score -= 5;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside target range (${tempMin}-${tempMax}°F)`);
      }
    }

    // Check glucose levels against user's targets
    if (latestMetrics.glucoseLevel && latestMetrics.glucoseLevel.value) {
      const currentGlucose = latestMetrics.glucoseLevel.value;
      const glucoseMin = healthTargets.glucoseLevel.min;
      const glucoseMax = healthTargets.glucoseLevel.max;

      if (currentGlucose > glucoseMax + 40 || currentGlucose < glucoseMin - 20) {
        score -= 20;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) critically outside range`);
      } else if (currentGlucose > glucoseMax || currentGlucose < glucoseMin) {
        score -= 10;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) outside target range (${glucoseMin}-${glucoseMax} mg/dL)`);
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const getScoreLabel = (score) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Attention';
    };

    const result = { score: Math.round(score), label: getScoreLabel(score), factors };
    console.log('Final Health Score Result:', result);

    return result;
  };

  // Data table functions
  const getAllReadingsForTable = () => {
    const allReadings = [];

    Object.entries(healthData).forEach(([dataType, readings]) => {
      readings.forEach(reading => {
        let displayValue = reading.value;
        let status = 'normal';

        // Format value and calculate status
        switch (dataType) {
          case 'heartRate':
            status = getHeartRateStatus(reading.value);
            displayValue = `${reading.value} bpm`;
            break;
          case 'bloodPressure':
            const systolic = typeof reading.value === 'object' ? reading.value.systolic : reading.value;
            const diastolic = typeof reading.value === 'object' ? reading.value.diastolic : reading.value - 40;
            status = getBloodPressureStatus(systolic, diastolic);
            displayValue = `${systolic}/${diastolic} mmHg`;
            break;
          case 'bodyTemperature':
            status = getTemperatureStatus(reading.value);
            displayValue = `${reading.value.toFixed(1)}°F`;
            break;
          case 'glucoseLevel':
            status = getGlucoseStatus(reading.value);
            displayValue = `${reading.value} mg/dL`;
            break;
        }

        allReadings.push({
          ...reading,
          dataType,
          displayValue,
          status,
          formattedTime: formatTimestamp(reading.timestamp),
          sortableTime: new Date(reading.timestamp).getTime()
        });
      });
    });

    return allReadings;
  };

  const getFilteredAndSortedReadings = () => {
    let readings = getAllReadingsForTable();

    // Apply filters
    if (filterConfig.dataType !== 'all') {
      readings = readings.filter(r => r.dataType === filterConfig.dataType);
    }
    if (filterConfig.status !== 'all') {
      readings = readings.filter(r => r.status === filterConfig.status);
    }
    if (filterConfig.source !== 'all') {
      readings = readings.filter(r => r.source === filterConfig.source);
    }
    if (searchTerm) {
      readings = readings.filter(r =>
        r.displayValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    readings.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        aVal = a.sortableTime;
        bVal = b.sortableTime;
      }

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return readings;
  };

  // Transform data for charts with smart time granularity
  const transformVitalSignsData = () => {
    if (timeRange === '24hours') {
      // For 24 hours: show individual readings by time
      const timeMap = new Map();

      // Process heart rate data
      healthData.heartRate.forEach(item => {
        const time = new Date(item.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        timeMap.set(time, { ...timeMap.get(time), time, heartRate: item.value });
      });

      // Process blood pressure data
      healthData.bloodPressure.forEach(item => {
        const time = new Date(item.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        const systolic = typeof item.value === 'object' ? item.value.systolic : item.value;
        timeMap.set(time, { ...timeMap.get(time), time, bloodPressure: systolic });
      });

      return Array.from(timeMap.values()).sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeA - timeB;
      });
    } else {
      // For 7 days, 30 days, 90 days: show daily averages
      const dailyMap = new Map();

      // Process heart rate data
      healthData.heartRate.forEach(item => {
        const date = new Date(item.timestamp);
        const dayKey = timeRange === '7days'
          ? date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue, Wed
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Dec 1, Dec 2

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            time: dayKey,
            heartRateValues: [],
            bloodPressureValues: [],
            date: date.toDateString() // For sorting
          });
        }
        dailyMap.get(dayKey).heartRateValues.push(item.value);
      });

      // Process blood pressure data
      healthData.bloodPressure.forEach(item => {
        const date = new Date(item.timestamp);
        const dayKey = timeRange === '7days'
          ? date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue, Wed
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Dec 1, Dec 2

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            time: dayKey,
            heartRateValues: [],
            bloodPressureValues: [],
            date: date.toDateString() // For sorting
          });
        }
        const systolic = typeof item.value === 'object' ? item.value.systolic : item.value;
        dailyMap.get(dayKey).bloodPressureValues.push(systolic);
      });

      // Calculate daily averages
      const dailyAverages = Array.from(dailyMap.values()).map(day => ({
        time: day.time,
        heartRate: day.heartRateValues.length > 0
          ? Math.round(day.heartRateValues.reduce((sum, val) => sum + val, 0) / day.heartRateValues.length)
          : undefined,
        bloodPressure: day.bloodPressureValues.length > 0
          ? Math.round(day.bloodPressureValues.reduce((sum, val) => sum + val, 0) / day.bloodPressureValues.length)
          : undefined,
        date: day.date
      }));

      // Sort by date
      return dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const transformGlucoseData = () => {
    if (timeRange === '24hours') {
      // For 24 hours: show individual readings by time
      return healthData.glucoseLevel.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        glucose: item.value,
        date: new Date(item.timestamp).toLocaleDateString()
      })).reverse(); // Reverse to show chronological order
    } else {
      // For 7 days, 30 days, 90 days: show daily averages
      const dailyMap = new Map();

      healthData.glucoseLevel.forEach(item => {
        const date = new Date(item.timestamp);
        const dayKey = timeRange === '7days'
          ? date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue, Wed
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Dec 1, Dec 2

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            time: dayKey,
            values: [],
            date: date.toDateString() // For sorting
          });
        }
        dailyMap.get(dayKey).values.push(item.value);
      });

      // Calculate daily averages
      const dailyAverages = Array.from(dailyMap.values()).map(day => ({
        time: day.time,
        glucose: day.values.length > 0
          ? Math.round(day.values.reduce((sum, val) => sum + val, 0) / day.values.length)
          : 0,
        date: day.date
      }));

      // Sort by date
      return dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const transformTemperatureData = () => {
    if (timeRange === '24hours') {
      // For 24 hours: show individual readings by time
      return healthData.bodyTemperature.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        temperature: parseFloat(item.value.toFixed(1)),
        date: new Date(item.timestamp).toLocaleDateString()
      })).reverse(); // Reverse to show chronological order
    } else {
      // For 7 days, 30 days, 90 days: show daily averages
      const dailyMap = new Map();

      healthData.bodyTemperature.forEach(item => {
        const date = new Date(item.timestamp);
        const dayKey = timeRange === '7days'
          ? date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue, Wed
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Dec 1, Dec 2

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            time: dayKey,
            values: [],
            date: date.toDateString() // For sorting
          });
        }
        dailyMap.get(dayKey).values.push(item.value);
      });

      // Calculate daily averages
      const dailyAverages = Array.from(dailyMap.values()).map(day => ({
        time: day.time,
        temperature: day.values.length > 0
          ? parseFloat((day.values.reduce((sum, val) => sum + val, 0) / day.values.length).toFixed(1))
          : 0,
        date: day.date
      }));

      // Sort by date
      return dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full"
    >
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl p-12 border-2 border-dashed border-blue-200 dark:border-slate-600 text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            No Health Data Available
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-lg">
            Start recording your health metrics to see detailed analytics, trends, and insights about your wellness journey.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            {[
              { icon: HeartIcon, name: "Heart Rate", color: "text-red-500" },
              { icon: ArrowTrendingUpIcon, name: "Blood Pressure", color: "text-blue-500" },
              { icon: BeakerIcon, name: "Blood Glucose", color: "text-green-500" },
              { icon: SunIcon, name: "Body Temperature", color: "text-orange-500" }
            ].map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                className="flex flex-col items-center p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600"
              >
                <metric.icon className={`w-8 h-8 ${metric.color} mb-3`} />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 text-center">
                  {metric.name}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-6 py-3 rounded-xl">
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">Use the simulation panel to generate sample data</span>
            </div>
            <div className="text-gray-500 dark:text-slate-400 font-medium">
              or manually enter your readings
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-slate-300">Loading health metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <p className="text-xl text-red-600 dark:text-red-400 font-semibold mb-2">Error Loading Data</p>
          <p className="text-red-500 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!hasAnyData) {
    return (
      <div className="space-y-10 px-2 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Health Metrics</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Comprehensive view of your health data and trends</p>
          </div>
        </motion.div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-10 px-2 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Health Metrics</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Comprehensive view of your health data and trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 shadow-sm"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Heart Rate Card */}
        {latestMetrics.heartRate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
                <HeartIcon className="w-7 h-7 text-red-500" />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(latestMetrics.heartRate.status)}`}>
                {latestMetrics.heartRate.status}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {latestMetrics.heartRate.value}
                  <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">bpm</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">Heart Rate</p>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`flex items-center ${latestMetrics.heartRate.change.startsWith("+") ? "text-green-600 dark:text-green-400" : latestMetrics.heartRate.change.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {latestMetrics.heartRate.change.startsWith("+") ? "↗" : latestMetrics.heartRate.change.startsWith("-") ? "↘" : ""} {latestMetrics.heartRate.change}
              </span>
              <span className="text-gray-400 dark:text-slate-500">{formatTimestamp(latestMetrics.heartRate.timestamp)}</span>
            </div>
          </motion.div>
        )}

        {/* Blood Pressure Card */}
        {latestMetrics.bloodPressure && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <ArrowTrendingUpIcon className="w-7 h-7 text-blue-500" />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(latestMetrics.bloodPressure.status)}`}>
                {latestMetrics.bloodPressure.status}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {typeof latestMetrics.bloodPressure.value === 'object'
                    ? `${latestMetrics.bloodPressure.value.systolic}/${latestMetrics.bloodPressure.value.diastolic}`
                    : latestMetrics.bloodPressure.value}
                  <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">mmHg</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">Blood Pressure</p>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`flex items-center ${latestMetrics.bloodPressure.change.startsWith("+") ? "text-green-600 dark:text-green-400" : latestMetrics.bloodPressure.change.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {latestMetrics.bloodPressure.change.startsWith("+") ? "↗" : latestMetrics.bloodPressure.change.startsWith("-") ? "↘" : ""} {latestMetrics.bloodPressure.change}
              </span>
              <span className="text-gray-400 dark:text-slate-500">{formatTimestamp(latestMetrics.bloodPressure.timestamp)}</span>
            </div>
          </motion.div>
        )}

        {/* Body Temperature Card */}
        {latestMetrics.bodyTemperature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                <SunIcon className="w-7 h-7 text-orange-500" />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(latestMetrics.bodyTemperature.status)}`}>
                {latestMetrics.bodyTemperature.status}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {latestMetrics.bodyTemperature.value.toFixed(1)}
                  <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">°F</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">Body Temperature</p>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`flex items-center ${latestMetrics.bodyTemperature.change.startsWith("+") ? "text-green-600 dark:text-green-400" : latestMetrics.bodyTemperature.change.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {latestMetrics.bodyTemperature.change.startsWith("+") ? "↗" : latestMetrics.bodyTemperature.change.startsWith("-") ? "↘" : ""} {latestMetrics.bodyTemperature.change}
              </span>
              <span className="text-gray-400 dark:text-slate-500">{formatTimestamp(latestMetrics.bodyTemperature.timestamp)}</span>
            </div>
          </motion.div>
        )}

        {/* Glucose Level Card */}
        {latestMetrics.glucoseLevel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
                <BeakerIcon className="w-7 h-7 text-green-500" />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(latestMetrics.glucoseLevel.status)}`}>
                {latestMetrics.glucoseLevel.status}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {latestMetrics.glucoseLevel.value}
                  <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">mg/dL</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">Blood Glucose</p>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`flex items-center ${latestMetrics.glucoseLevel.change.startsWith("+") ? "text-green-600 dark:text-green-400" : latestMetrics.glucoseLevel.change.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                {latestMetrics.glucoseLevel.change.startsWith("+") ? "↗" : latestMetrics.glucoseLevel.change.startsWith("-") ? "↘" : ""} {latestMetrics.glucoseLevel.change}
              </span>
              <span className="text-gray-400 dark:text-slate-500">{formatTimestamp(latestMetrics.glucoseLevel.timestamp)}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Weekly/Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Overall Health Score</h3>
            <div className="p-2 bg-white/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{healthScore.score}%</div>
            <div className="text-sm opacity-90">
              {healthScore.label}
            </div>
          </div>
          <div className="mt-4 text-xs opacity-75">
            {healthScore.factors.length > 0 ? (
              <div>
                <div className="mb-1">Health Score Breakdown:</div>
                {healthScore.factors.map((factor, index) => (
                  <div key={index} className="text-xs opacity-60">• {factor}</div>
                ))}
              </div>
            ) : (
              <div>All health metrics are within target ranges</div>
            )}
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Weekly Summary</h3>
            <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-3">
            {Object.keys(weeklyStats).length > 0 ? (
              Object.entries(weeklyStats).map(([dataType, stats]) => (
                <div key={dataType} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400 capitalize">
                    {dataType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Avg: {stats.average}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {stats.count} readings
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No weekly data available</p>
                <p className="text-xs">Generate some health readings to see weekly statistics</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Monthly Trends</h3>
            <CalendarDaysIcon className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            {Object.keys(monthlyStats).length > 0 ? (
              Object.entries(monthlyStats).map(([dataType, stats]) => (
                <div key={dataType} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400 capitalize">
                    {dataType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {stats.trend === 'improving' ? '↗️' : stats.trend === 'declining' ? '↘️' : '➡️'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-slate-400 capitalize">
                        {stats.trend}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {stats.count} readings
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No monthly data available</p>
                <p className="text-xs">Generate some health readings to see monthly trends</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vital Signs Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Vital Signs Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Heart Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Blood Pressure</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            {transformVitalSignsData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transformVitalSignsData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                  <XAxis dataKey="time" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                  <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                  <Tooltip
                    contentStyle={isDarkMode ?
                      { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" } :
                      { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} name="Heart Rate (bpm)" />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} name="Blood Pressure (mmHg)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No vital signs data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Blood Glucose Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Blood Glucose Levels</h3>
          </div>
          <div className="h-64">
            {transformGlucoseData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transformGlucoseData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                  <XAxis dataKey="time" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                  <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                  <Tooltip
                    contentStyle={isDarkMode ?
                      { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" } :
                      { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                  />
                  <Area type="monotone" dataKey="glucose" stroke="#10b981" fill="#10b981" fillOpacity={isDarkMode ? 0.4 : 0.6} name="Glucose (mg/dL)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No glucose data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Body Temperature Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Body Temperature Trend</h3>
        </div>
        <div className="h-64">
          {transformTemperatureData().length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformTemperatureData()}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip
                  contentStyle={isDarkMode ?
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                />
                <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="#f97316" fillOpacity={isDarkMode ? 0.4 : 0.6} name="Temperature (°F)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No temperature data available</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <TableCellsIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Detailed Reading History</h3>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search readings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
              />
            </div>

            {/* Data Type Filter */}
            <select
              value={filterConfig.dataType}
              onChange={(e) => setFilterConfig(prev => ({ ...prev, dataType: e.target.value }))}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
            >
              <option value="all">All Metrics</option>
              <option value="heartRate">Heart Rate</option>
              <option value="bloodPressure">Blood Pressure</option>
              <option value="bodyTemperature">Body Temperature</option>
              <option value="glucoseLevel">Blood Glucose</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterConfig.status}
              onChange={(e) => setFilterConfig(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
            >
              <option value="all">All Status</option>
              <option value="good">Good</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600">
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setSortConfig({
                    key: 'timestamp',
                    direction: sortConfig.key === 'timestamp' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                  })}
                >
                  <div className="flex items-center space-x-1">
                    <span>Time</span>
                    <ChevronUpDownIcon className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setSortConfig({
                    key: 'dataType',
                    direction: sortConfig.key === 'dataType' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                  })}
                >
                  <div className="flex items-center space-x-1">
                    <span>Metric</span>
                    <ChevronUpDownIcon className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-slate-100">Value</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-slate-100">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-slate-100">Source</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedReadings().slice(0, 50).map((reading, index) => (
                <tr
                  key={`${reading.dataType}-${reading.timestamp}-${index}`}
                  className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                    {reading.formattedTime}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-slate-100 capitalize">
                    {reading.dataType.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                    {reading.displayValue}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reading.status)}`}>
                      {reading.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                    {reading.source || 'Health Monitor'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredAndSortedReadings().length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <TableCellsIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No readings found matching your filters</p>
            </div>
          )}

          {getFilteredAndSortedReadings().length > 50 && (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-slate-400">
              Showing first 50 of {getFilteredAndSortedReadings().length} readings
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HealthMetrics;
