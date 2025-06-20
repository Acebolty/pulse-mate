"use client"

import { useState } from "react"
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Dummy data for analytics
const healthTrends = [
  { month: "Jan", heartRate: 72, bloodPressure: 120, glucose: 95, weight: 75 },
  { month: "Feb", heartRate: 74, bloodPressure: 118, glucose: 92, weight: 74.5 },
  { month: "Mar", heartRate: 71, bloodPressure: 122, glucose: 98, weight: 74.2 },
  { month: "Apr", heartRate: 73, bloodPressure: 119, glucose: 94, weight: 73.8 },
  { month: "May", heartRate: 70, bloodPressure: 117, glucose: 91, weight: 73.5 },
  { month: "Jun", heartRate: 72, bloodPressure: 120, glucose: 96, weight: 73.2 },
]

const activityData = [
  { day: "Mon", steps: 8500, calories: 1200, activeMinutes: 45 },
  { day: "Tue", steps: 9200, calories: 1350, activeMinutes: 52 },
  { day: "Wed", steps: 7800, calories: 1100, activeMinutes: 38 },
  { day: "Thu", steps: 10500, calories: 1450, activeMinutes: 58 },
  { day: "Fri", steps: 9800, calories: 1380, activeMinutes: 55 },
  { day: "Sat", steps: 12000, calories: 1600, activeMinutes: 72 },
  { day: "Sun", steps: 6500, calories: 950, activeMinutes: 32 },
]

const sleepData = [
  { name: "Deep Sleep", value: 25, color: "#10b981" },
  { name: "Light Sleep", value: 45, color: "#3b82f6" },
  { name: "REM Sleep", value: 20, color: "#8b5cf6" },
  { name: "Awake", value: 10, color: "#f59e0b" },
]

const healthScores = [
  {
    title: "Overall Health Score",
    score: 87,
    change: "+5",
    trend: "up",
    description: "Excellent progress this month",
  },
  {
    title: "Cardiovascular Health",
    score: 92,
    change: "+3",
    trend: "up",
    description: "Heart rate and BP improving",
  },
  {
    title: "Metabolic Health",
    score: 78,
    change: "-2",
    trend: "down",
    description: "Focus on glucose management",
  },
  {
    title: "Sleep Quality",
    score: 85,
    change: "+8",
    trend: "up",
    description: "Much better sleep patterns",
  },
]

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your health trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Health Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthScores.map((score, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-green-500" />
              <div
                className={`flex items-center space-x-1 text-sm ${
                  score.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {score.trend === "up" ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                <span>{score.change}</span>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{score.score}</div>
              <div className="text-sm text-gray-600">{score.title}</div>
            </div>
            <p className="text-xs text-gray-500">{score.description}</p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${score.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Health Trends Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} name="Blood Pressure" />
                <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} name="Glucose" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area type="monotone" dataKey="steps" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stackId="2"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sleep Analysis and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Pattern Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sleep Pattern Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sleepData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sleepData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Goals Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Health Goals Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Daily Steps Goal</span>
                <span className="text-sm text-gray-500">9,200 / 10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Weight Loss Goal</span>
                <span className="text-sm text-gray-500">1.8 / 5.0 kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: "36%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Sleep Quality Goal</span>
                <span className="text-sm text-gray-500">8.2 / 8.0 hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Blood Pressure Control</span>
                <span className="text-sm text-gray-500">120/80 mmHg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Positive Trend</span>
            </div>
            <p className="text-sm text-green-700">
              Your cardiovascular health has improved by 12% this month. Keep up the great work!
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Recommendation</span>
            </div>
            <p className="text-sm text-yellow-700">
              Consider increasing your daily water intake to improve metabolic health scores.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Schedule</span>
            </div>
            <p className="text-sm text-blue-700">
              Your next health checkup is due in 2 weeks. Book an appointment with Dr. Wilson.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
