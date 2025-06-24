"use client"

import { useState, useEffect } from "react"
import api from '../services/api'; // Import API service
import {
  HeartIcon,
  BeakerIcon,
  FireIcon,
  MoonIcon,
  ScaleIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { motion } from "framer-motion"

// Dummy data for health metrics
const vitalSignsData = [
  { time: "00:00", heartRate: 65, systolic: 115, diastolic: 75, temperature: 98.2 },
  { time: "04:00", heartRate: 62, systolic: 112, diastolic: 72, temperature: 97.8 },
  { time: "08:00", heartRate: 72, systolic: 118, diastolic: 78, temperature: 98.6 },
  { time: "12:00", heartRate: 78, systolic: 125, diastolic: 82, temperature: 99.1 },
  { time: "16:00", heartRate: 82, systolic: 128, diastolic: 85, temperature: 99.3 },
  { time: "20:00", heartRate: 75, systolic: 122, diastolic: 80, temperature: 98.8 },
]

const glucoseData = [
  { date: "Mon", fasting: 95, postMeal: 140, bedtime: 110 },
  { date: "Tue", fasting: 92, postMeal: 135, bedtime: 108 },
  { date: "Wed", fasting: 98, postMeal: 145, bedtime: 115 },
  { date: "Thu", fasting: 90, postMeal: 132, bedtime: 105 },
  { date: "Fri", fasting: 94, postMeal: 138, bedtime: 112 },
  { date: "Sat", fasting: 96, postMeal: 142, bedtime: 118 },
  { date: "Sun", fasting: 93, postMeal: 136, bedtime: 109 },
]

const activityData = [
  { day: "Mon", steps: 8500, calories: 1200, activeMinutes: 45, distance: 4.2 },
  { day: "Tue", steps: 9200, calories: 1350, activeMinutes: 52, distance: 4.8 },
  { day: "Wed", steps: 7800, calories: 1100, activeMinutes: 38, distance: 3.9 },
  { day: "Thu", steps: 10500, calories: 1450, activeMinutes: 58, distance: 5.2 },
  { day: "Fri", steps: 9800, calories: 1380, activeMinutes: 55, distance: 4.9 },
  { day: "Sat", steps: 12000, calories: 1600, activeMinutes: 72, distance: 6.0 },
  { day: "Sun", steps: 6500, calories: 950, activeMinutes: 32, distance: 3.2 },
]

const sleepData = [
  { date: "Mon", deep: 1.5, light: 4.2, rem: 1.8, awake: 0.5, total: 8.0 },
  { date: "Tue", deep: 1.8, light: 4.5, rem: 2.0, awake: 0.3, total: 8.6 },
  { date: "Wed", deep: 1.2, light: 3.8, rem: 1.5, awake: 0.8, total: 7.3 },
  { date: "Thu", deep: 1.6, light: 4.1, rem: 1.9, awake: 0.4, total: 8.0 },
  { date: "Fri", deep: 1.4, light: 3.9, rem: 1.7, awake: 0.6, total: 7.6 },
  { date: "Sat", deep: 2.0, light: 4.8, rem: 2.2, awake: 0.2, total: 9.2 },
  { date: "Sun", deep: 1.7, light: 4.3, rem: 1.9, awake: 0.4, total: 8.3 },
]

const weightData = [
  { week: "Week 1", weight: 175.2, bodyFat: 18.5, muscle: 142.3 },
  { week: "Week 2", weight: 174.8, bodyFat: 18.3, muscle: 142.5 },
  { week: "Week 3", weight: 174.5, bodyFat: 18.1, muscle: 142.8 },
  { week: "Week 4", weight: 174.1, bodyFat: 17.9, muscle: 143.0 },
  { week: "Week 5", weight: 173.8, bodyFat: 17.7, muscle: 143.2 },
  { week: "Week 6", weight: 173.5, bodyFat: 17.5, muscle: 143.5 },
]

const currentMetrics = [
  {
    id: 1,
    name: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    change: "+2",
    icon: HeartIcon,
    color: "text-red-500",
    bgColor: "bg-red-50",
    bgColorDark: "dark:bg-red-700/30",
    range: "60-100 bpm",
    lastReading: "2 min ago",
  },
  {
    id: 2,
    name: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "normal",
    change: "-2",
    icon: HeartIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    bgColorDark: "dark:bg-blue-700/30",
    range: "<120/80 mmHg",
    lastReading: "5 min ago",
  },
  {
    id: 3,
    name: "Blood Glucose",
    value: "95",
    unit: "mg/dL",
    status: "normal",
    change: "-3",
    icon: BeakerIcon,
    color: "text-green-500",
    bgColor: "bg-green-50",
    bgColorDark: "dark:bg-green-700/30",
    range: "70-100 mg/dL",
    lastReading: "15 min ago",
  },
  {
    id: 4,
    name: "Body Temperature",
    value: "98.6",
    unit: "°F",
    status: "normal",
    change: "+0.2",
    icon: FireIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    bgColorDark: "dark:bg-orange-600/30",
    range: "97.8-99.1 °F",
    lastReading: "30 min ago",
  },
  {
    id: 5,
    name: "Weight",
    value: "173.5",
    unit: "lbs",
    status: "good",
    change: "-1.7",
    icon: ScaleIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    bgColorDark: "dark:bg-purple-700/30",
    range: "Goal: 170 lbs",
    lastReading: "This morning",
  },
  {
    id: 6,
    name: "Sleep Quality",
    value: "8.3",
    unit: "/10",
    status: "excellent",
    change: "+0.5",
    icon: MoonIcon,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    bgColorDark: "dark:bg-indigo-700/30",
    range: "Goal: >7.5",
    lastReading: "Last night",
  },
]

const sleepBreakdown = [
  { name: "Deep Sleep", value: 20, color: "#10b981", hours: 1.7 },
  { name: "Light Sleep", value: 52, color: "#3b82f6", hours: 4.3 },
  { name: "REM Sleep", value: 23, color: "#8b5cf6", hours: 1.9 },
  { name: "Awake", value: 5, color: "#f59e0b", hours: 0.4 },
]

const getStatusColor = (status) => {
  // Base classes are for light mode
  // Dark mode classes are appended with dark: prefix
  switch (status) {
    case "excellent":
      return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-700/30"
    case "good":
      return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-700/30"
    case "normal":
      return "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30"
    case "warning":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-600/30"
    case "critical":
      return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-700/30"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50"
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
}

const HealthMetrics = () => {
  const [timeRange, setTimeRange] = useState("7days");
  // const [selectedMetric, setSelectedMetric] = useState("all"); // We'll use this for filtering later
  // const [viewMode, setViewMode] = useState("overview"); // For switching between overview/detailed views

  // State for fetched data
  const [fetchedVitalSigns, setFetchedVitalSigns] = useState([]);
  const [fetchedGlucose, setFetchedGlucose] = useState([]);
  const [fetchedActivity, setFetchedActivity] = useState([]);
  const [fetchedSleep, setFetchedSleep] = useState([]);
  const [fetchedWeight, setFetchedWeight] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState(currentMetrics); // Initialize with dummy, update with fetched

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);


  useEffect(() => {
    // Dark mode listener
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchAllMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Calculate date range based on timeRange state
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
          case "90days":
            startDate.setDate(endDate.getDate() - 90);
            break;
          default:
            startDate.setDate(endDate.getDate() - 7); // Default to 7 days
        }

        const commonParams = { 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString(),
            limit: 100 // Fetch enough data for charts, adjust as needed
        };

        // Fetch data for each type
        const vitalSignsPromise = api.get('/health-data', { params: { ...commonParams, dataType: 'heartRate' } }); // Example, refine for BP etc.
        const glucosePromise = api.get('/health-data', { params: { ...commonParams, dataType: 'glucoseLevel' } });
        const activityPromise = api.get('/health-data', { params: { ...commonParams, dataType: 'stepsTaken' } }); // Example
        const sleepPromise = api.get('/health-data', { params: { ...commonParams, dataType: 'sleepDuration' } });
        const weightPromise = api.get('/health-data', { params: { ...commonParams, dataType: 'weight' } });
        
        // Fetch latest for summary cards (example for heart rate)
        const latestHeartRatePromise = api.get('/health-data', { params: { dataType: 'heartRate', limit: 1, page: 1, sortBy: 'timestamp', order: 'desc' } });
        const latestBloodPressurePromise = api.get('/health-data', { params: { dataType: 'bloodPressure', limit: 1, page: 1, sortBy: 'timestamp', order: 'desc' } });
        // ... fetch latest for other summary metrics

        const [
            vitalsRes, glucoseRes, activityRes, sleepRes, weightRes,
            latestHeartRateRes, latestBloodPressureRes 
            /* ... other latest responses */
        ] = await Promise.allSettled([
            vitalSignsPromise, glucosePromise, activityPromise, sleepPromise, weightRes,
            latestHeartRatePromise, latestBloodPressurePromise 
            /* ... other latest promises */
        ]);

        // Process and set data for charts
        if (vitalsRes.status === 'fulfilled') setFetchedVitalSigns(vitalsRes.value.data.data); // Assuming .data.data is the array
        if (glucoseRes.status === 'fulfilled') setFetchedGlucose(glucoseRes.value.data.data);
        if (activityRes.status === 'fulfilled') setFetchedActivity(activityRes.value.data.data);
        if (sleepRes.status === 'fulfilled') setFetchedSleep(sleepRes.value.data.data);
        if (weightRes.status === 'fulfilled') setFetchedWeight(weightRes.value.data.data);

        // Process and update liveMetrics for summary cards
        const newLiveMetrics = [...currentMetrics]; // Start with dummy structure
        if (latestHeartRateRes.status === 'fulfilled' && latestHeartRateRes.value.data.data.length > 0) {
            const hrData = latestHeartRateRes.value.data.data[0];
            const hrMetric = newLiveMetrics.find(m => m.name === "Heart Rate");
            if (hrMetric) {
                hrMetric.value = hrData.value.toString();
                hrMetric.lastReading = formatTimestamp(hrData.timestamp); // You'll need a formatTimestamp function
                // TODO: Calculate status and change for hrMetric
            }
        }
        if (latestBloodPressureRes.status === 'fulfilled' && latestBloodPressureRes.value.data.data.length > 0) {
            const bpData = latestBloodPressureRes.value.data.data[0];
            const bpMetric = newLiveMetrics.find(m => m.name === "Blood Pressure");
            if (bpMetric && bpData.value.systolic && bpData.value.diastolic) {
                bpMetric.value = `${bpData.value.systolic}/${bpData.value.diastolic}`;
                bpMetric.lastReading = formatTimestamp(bpData.timestamp);
                 // TODO: Calculate status and change for bpMetric
            }
        }
        // ... update other live metrics similarly ...
        setLiveMetrics(newLiveMetrics);

      } catch (err) {
        console.error("Failed to fetch health metrics:", err);
        setError("Could not load health data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMetrics();
  }, [timeRange]); // Re-fetch when timeRange changes

  // Helper function (you might want to move this to a utils file)
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    // Simple formatting, can be improved with date-fns or moment.js
    const diffMinutes = Math.round((new Date() - date) / (1000 * 60));
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return date.toLocaleDateString();
  };


  // TODO: Transform fetched data for Recharts if needed
  // Example:
  const transformedVitalSignsData = fetchedVitalSigns.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: d.dataType === 'heartRate' ? d.value : null, // This needs more sophisticated merging if fetching BP separately
    // systolic: d.dataType === 'bloodPressure' ? d.value.systolic : null,
    // diastolic: d.dataType === 'bloodPressure' ? d.value.diastolic : null,
  })).filter(d => d.heartRate !== null); // Filter out entries not relevant for this specific chart transformation


  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-gray-700 dark:text-slate-300">Loading health metrics...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500 dark:text-red-400 p-4 bg-red-100 dark:bg-red-700/30 rounded-md">{error}</p></div>;
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
            className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 shadow-sm"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <FunnelIcon className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveMetrics.map((metric, i) => (
          <motion.div
            key={metric.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(16,185,129,0.10)" }}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700 cursor-pointer transition-all hover:ring-2 hover:ring-green-100 dark:hover:ring-green-600/50 overflow-hidden" // Added group and overflow-hidden
            onClick={() => setSelectedMetric(metric.name.toLowerCase())}
          >
            {/* Glare effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-700/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            {/* Content wrapper for z-index */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? metric.bgColorDark : metric.bgColor} shadow-sm`}>
                  <metric.icon className={`w-7 h-7 ${metric.color}`} />
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>{metric.status}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">{metric.value}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-400">{metric.unit}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 font-medium">{metric.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Normal: {metric.range}</p>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className={`flex items-center ${metric.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {metric.change} from yesterday
                </span>
                <div className="flex items-center space-x-1 text-gray-400 dark:text-slate-500">
                  <ClockIcon className="w-3 h-3" />
                  <span>{metric.lastReading}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Vital Signs (24h)</h3>
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
            <ResponsiveContainer width="100%" height="100%">
              {/* Using transformedVitalSignsData which is derived from fetchedVitalSigns */}
              <LineChart data={transformedVitalSignsData}> 
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} /> {/* slate-700 for dark */}
                <XAxis dataKey="time" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} /> {/* slate-400 for dark */}
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} /> {/* slate-400 for dark */}
                <Tooltip 
                  contentStyle={isDarkMode ? 
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }} // slate-300 for dark text
                  cursor={{ fill: isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(200, 200, 200, 0.3)' }} // slate-500 with opacity
                />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} name="Heart Rate (bpm)" />
                <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} name="Systolic BP" />
              </LineChart>
            </ResponsiveContainer>
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
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Fasting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Post-Meal</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                <XAxis dataKey="date" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <Tooltip 
                  contentStyle={isDarkMode ? 
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                  cursor={{ fill: isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(200, 200, 200, 0.3)' }}
                />
                <Area type="monotone" dataKey="fasting" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={isDarkMode ? 0.4 : 0.6} name="Fasting (mg/dL)" />
                <Area type="monotone" dataKey="postMeal" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={isDarkMode ? 0.4 : 0.6} name="Post-Meal (mg/dL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Activity and Sleep Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Weekly Activity Summary</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Steps</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-slate-300">Calories</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                <XAxis dataKey="day" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <Tooltip 
                  contentStyle={isDarkMode ? 
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                  cursor={{ fill: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(200, 200, 200, 0.2)' }} // Lighter cursor for BarChart
                />
                <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} name="Steps" />
                <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        {/* Sleep Quality */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Sleep Quality</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sleepBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sleepBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={isDarkMode ? '#1e293b' : '#fff'} strokeWidth={entry.name === "Awake" && isDarkMode ? 1 : 0} /> // Add stroke for contrast, especially for 'Awake' slice
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={isDarkMode ? 
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sleepBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-slate-100">{item.hours}h</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weight and Body Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Weight & Body Composition Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f0f0f0"} />
                <XAxis dataKey="week" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#6b7280"} fontSize={12} />
                <Tooltip 
                  contentStyle={isDarkMode ? 
                    { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" } :
                    { backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  itemStyle={isDarkMode ? { color: "#cbd5e1" } : { color: "#000" }}
                  cursor={{ fill: isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(200, 200, 200, 0.3)' }}
                />
                <Legend wrapperStyle={isDarkMode ? { color: "#94a3b8" } : {}} />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }} name="Weight (lbs)" />
                <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }} name="Body Fat (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        {/* Health Goals Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Health Goals Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Daily Steps</span>
                <span className="text-sm text-gray-500 dark:text-slate-400">9,200 / 10,000</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Weight Loss</span>
                <span className="text-sm text-gray-500 dark:text-slate-400">1.7 / 5.0 lbs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: "34%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Sleep Quality</span>
                <span className="text-sm text-gray-500 dark:text-slate-400">8.3 / 8.0 hours</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-300" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Blood Pressure Control</span>
                <span className="text-sm text-gray-500 dark:text-slate-400">120/80 mmHg</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Glucose Management</span>
                <span className="text-sm text-gray-500 dark:text-slate-400">95 mg/dL avg</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: "78%" }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Readings Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-slate-700/50 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Readings</h3>
          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Metric</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-gray-900 dark:text-slate-200">Today, 2:30 PM</td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Heart Rate</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">72 bpm</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Apple Watch</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-gray-900 dark:text-slate-200">Today, 2:25 PM</td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Blood Pressure</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">120/80 mmHg</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">BP Monitor</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-gray-900 dark:text-slate-200">Today, 1:45 PM</td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Blood Glucose</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">95 mg/dL</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Glucose Monitor</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-gray-900 dark:text-slate-200">Today, 8:00 AM</td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Weight</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">173.5 lbs</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300">On Track</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Smart Scale</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-gray-900 dark:text-slate-200">Yesterday, 11:30 PM</td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Sleep Quality</td>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">8.3 hours</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300">
                    Excellent
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Sleep Tracker</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default HealthMetrics
