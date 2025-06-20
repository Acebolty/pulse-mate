import WelcomeCard from "../components/dashboard/WelcomeCard"
import HealthMetricsGrid from "../components/dashboard/HealthMetricsGrid"
import VitalSignsChart from "../components/dashboard/VitalSignsChart"
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments"
import RecentAlerts from "../components/dashboard/RecentAlerts"
import ActivitySummary from "../components/dashboard/ActivitySummary"

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Health Metrics Grid */}
      <HealthMetricsGrid />

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalSignsChart />
        <ActivitySummary />
      </div>

      {/* Appointments and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentAlerts />
      </div>
    </div>
  )
}

export default DashboardOverview
