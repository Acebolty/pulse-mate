"use client"

import { useState } from "react"
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
  switch (status) {
    case "excellent":
      return "text-green-600 bg-green-100"
    case "good":
      return "text-green-600 bg-green-100"
    case "normal":
      return "text-blue-600 bg-blue-100"
    case "warning":
      return "text-yellow-600 bg-yellow-100"
    case "critical":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
}

const HealthMetrics = () => {
  const [timeRange, setTimeRange] = useState("7days")
  const [selectedMetric, setSelectedMetric] = useState("all")
  const [viewMode, setViewMode] = useState("overview")

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
          <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
          <p className="text-gray-500 mt-1">Comprehensive view of your health data and trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
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
        {currentMetrics.map((metric, i) => (
          <motion.div
            key={metric.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(16,185,129,0.10)" }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all hover:ring-2 hover:ring-green-100"
            onClick={() => setSelectedMetric(metric.name.toLowerCase())}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bgColor} shadow-sm`}>
                <metric.icon className={`w-7 h-7 ${metric.color}`} />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>{metric.status}</span>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 font-medium">{metric.name}</p>
              <p className="text-xs text-gray-400 mt-1">Normal: {metric.range}</p>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`flex items-center ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {metric.change} from yesterday
              </span>
              <div className="flex items-center space-x-1 text-gray-400">
                <ClockIcon className="w-3 h-3" />
                <span>{metric.lastReading}</span>
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vital Signs (24h)</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Heart Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Blood Pressure</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalSignsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Blood Glucose Levels</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Fasting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Post-Meal</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                <Area type="monotone" dataKey="fasting" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Fasting (mg/dL)" />
                <Area type="monotone" dataKey="postMeal" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Post-Meal (mg/dL)" />
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
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Activity Summary</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Steps</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Calories</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sleep Quality</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sleepBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sleepBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sleepBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.hours}h</span>
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weight & Body Composition Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                <Legend />
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Health Goals Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Daily Steps</span>
                <span className="text-sm text-gray-500">9,200 / 10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Weight Loss</span>
                <span className="text-sm text-gray-500">1.7 / 5.0 lbs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: "34%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Sleep Quality</span>
                <span className="text-sm text-gray-500">8.3 / 8.0 hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-300" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Blood Pressure Control</span>
                <span className="text-sm text-gray-500">120/80 mmHg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Glucose Management</span>
                <span className="text-sm text-gray-500">95 mg/dL avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
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
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Readings</h3>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Today, 2:30 PM</td>
                <td className="py-3 px-4 text-gray-600">Heart Rate</td>
                <td className="py-3 px-4 font-medium text-gray-900">72 bpm</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600">Apple Watch</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Today, 2:25 PM</td>
                <td className="py-3 px-4 text-gray-600">Blood Pressure</td>
                <td className="py-3 px-4 font-medium text-gray-900">120/80 mmHg</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600">BP Monitor</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Today, 1:45 PM</td>
                <td className="py-3 px-4 text-gray-600">Blood Glucose</td>
                <td className="py-3 px-4 font-medium text-gray-900">95 mg/dL</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Normal</span>
                </td>
                <td className="py-3 px-4 text-gray-600">Glucose Monitor</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Today, 8:00 AM</td>
                <td className="py-3 px-4 text-gray-600">Weight</td>
                <td className="py-3 px-4 font-medium text-gray-900">173.5 lbs</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">On Track</span>
                </td>
                <td className="py-3 px-4 text-gray-600">Smart Scale</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Yesterday, 11:30 PM</td>
                <td className="py-3 px-4 text-gray-600">Sleep Quality</td>
                <td className="py-3 px-4 font-medium text-gray-900">8.3 hours</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Excellent
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">Sleep Tracker</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default HealthMetrics
