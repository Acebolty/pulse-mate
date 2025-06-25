import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CogIcon } from "@heroicons/react/24/outline"
import api from "../services/api"
import WelcomeCard from "../components/dashboard/WelcomeCard"
import HealthMetricsGrid from "../components/dashboard/HealthMetricsGrid"
import VitalSignsChart from "../components/dashboard/VitalSignsChart"
import BloodPressureChart from "../components/dashboard/BloodPressureChart"
import BodyTemperatureChart from "../components/dashboard/BodyTemperatureChart"
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments"
import RecentAlerts from "../components/dashboard/RecentAlerts"
import WeeklyVitalSigns from "../components/dashboard/WeeklyVitalSigns"
import SimulationPanel from "../components/simulation/SimulationPanel"
import { useAlerts } from "../contexts/AlertContext"

const DashboardOverview = () => {
  const { fetchAndGenerateAlerts } = useAlerts()
  const [dashboardData, setDashboardData] = useState({
    user: null,
    latestMetrics: {},
    recentAlerts: [],
    upcomingAppointments: [],
    healthSummary: {}
  })
  const [showSimulation, setShowSimulation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Simple helper function to calculate change
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

    const difference = Math.round((currentVal - previousVal) * 10) / 10; // Round to 1 decimal
    return difference > 0 ? `+${difference} from previous` : `${difference} from previous`;
  };

  const fetchDashboardData = async () => {
      try {
        console.log('🔄 Fetching dashboard data...');
        setLoading(true)

        // Fetch all dashboard data in parallel (get last 2 readings for change calculation)
        const [
          userRes,
          latestHeartRateRes,
          latestBloodPressureRes,
          latestGlucoseRes,
          latestWeightRes,

          latestBodyTempRes,
          recentAlertsRes,
          recentActivityRes
        ] = await Promise.allSettled([
          api.get('/profile/me'),
          api.get('/health-data', { params: { dataType: 'heartRate', limit: 2, sortBy: 'timestamp', order: 'desc' } }),
          api.get('/health-data', { params: { dataType: 'bloodPressure', limit: 2, sortBy: 'timestamp', order: 'desc' } }),
          api.get('/health-data', { params: { dataType: 'glucoseLevel', limit: 2, sortBy: 'timestamp', order: 'desc' } }),
          api.get('/health-data', { params: { dataType: 'weight', limit: 2, sortBy: 'timestamp', order: 'desc' } }),

          api.get('/health-data', { params: { dataType: 'bodyTemperature', limit: 2, sortBy: 'timestamp', order: 'desc' } }),
          api.get('/alerts', { params: { limit: 3, sortBy: 'createdAt', order: 'desc' } }),
          api.get('/health-data', { params: { dataType: 'stepsTaken', limit: 2, sortBy: 'timestamp', order: 'desc' } })
        ])

        // Process the results
        const newDashboardData = {
          user: userRes.status === 'fulfilled' ? userRes.value.data : null,
          latestMetrics: {},
          recentAlerts: recentAlertsRes.status === 'fulfilled' ? recentAlertsRes.value.data.data : [],
          upcomingAppointments: [], // We'll add this when appointments are integrated
          healthSummary: {}
        }



        // Process latest metrics
        if (latestHeartRateRes.status === 'fulfilled' && latestHeartRateRes.value.data.data.length > 0) {
          const hrReadings = latestHeartRateRes.value.data.data;
          console.log('💓 Heart rate readings:', hrReadings.length, 'readings available');
          newDashboardData.latestMetrics.heartRate = {
            ...hrReadings[0],
            change: calculateChange(hrReadings, 'heartRate')
          };
          console.log('💓 Latest heart rate:', newDashboardData.latestMetrics.heartRate.value, 'bpm, change:', newDashboardData.latestMetrics.heartRate.change);
        }
        if (latestBloodPressureRes.status === 'fulfilled' && latestBloodPressureRes.value.data.data.length > 0) {
          const bpReadings = latestBloodPressureRes.value.data.data;
          newDashboardData.latestMetrics.bloodPressure = {
            ...bpReadings[0],
            change: calculateChange(bpReadings, 'bloodPressure')
          };
        }
        if (latestGlucoseRes.status === 'fulfilled' && latestGlucoseRes.value.data.data.length > 0) {
          const glucoseReadings = latestGlucoseRes.value.data.data;
          console.log('🩸 Glucose readings:', glucoseReadings.length, 'readings available');
          newDashboardData.latestMetrics.glucose = {
            ...glucoseReadings[0],
            change: calculateChange(glucoseReadings, 'glucoseLevel')
          };
          console.log('🩸 Latest glucose:', newDashboardData.latestMetrics.glucose.value, 'mg/dL, change:', newDashboardData.latestMetrics.glucose.change);
        }
        if (latestWeightRes.status === 'fulfilled' && latestWeightRes.value.data.data.length > 0) {
          const weightReadings = latestWeightRes.value.data.data;
          newDashboardData.latestMetrics.weight = {
            ...weightReadings[0],
            change: calculateChange(weightReadings)
          };
        }

        if (latestBodyTempRes.status === 'fulfilled' && latestBodyTempRes.value.data.data.length > 0) {
          const tempReadings = latestBodyTempRes.value.data.data;
          console.log('🌡️ Temperature readings:', tempReadings.length, 'readings available');
          newDashboardData.latestMetrics.bodyTemperature = {
            ...tempReadings[0],
            change: calculateChange(tempReadings, 'bodyTemperature')
          };
          console.log('🌡️ Latest temperature:', newDashboardData.latestMetrics.bodyTemperature.value, '°F, change:', newDashboardData.latestMetrics.bodyTemperature.change);
        }
        if (recentActivityRes.status === 'fulfilled' && recentActivityRes.value.data.data.length > 0) {
          newDashboardData.latestMetrics.steps = recentActivityRes.value.data.data[0]
        }

        console.log('✅ Dashboard data updated:', newDashboardData.latestMetrics);
        setDashboardData(newDashboardData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchDashboardData()
  }, [])



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">⚠️ {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard user={dashboardData.user} latestMetrics={dashboardData.latestMetrics} />

      {/* Health Metrics Grid */}
      <HealthMetricsGrid latestMetrics={dashboardData.latestMetrics} />

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalSignsChart />
        <WeeklyVitalSigns />
      </div>

      {/* Additional Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BloodPressureChart />
        <BodyTemperatureChart />
      </div>

      {/* Appointments and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments appointments={dashboardData.upcomingAppointments} />
        <RecentAlerts alerts={dashboardData.recentAlerts} />
      </div>

      {/* Simulation Control Button */}
      <motion.button
        onClick={() => setShowSimulation(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        title="Health Data Simulation"
      >
        <CogIcon className="w-6 h-6" />
      </motion.button>

      {/* Simulation Panel */}
      {showSimulation && (
        <SimulationPanel
          onClose={() => setShowSimulation(false)}
          onDataGenerated={() => {
            setShowSimulation(false);
            fetchDashboardData(); // Immediate refresh
            fetchAndGenerateAlerts(); // Refresh alerts
          }}
        />
      )}


    </div>
  )
}

export default DashboardOverview
