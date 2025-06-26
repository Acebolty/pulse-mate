import WelcomeCard from "../components/dashboard/WelcomeCard";
import PatientMetricsGrid from "../components/dashboard/PatientMetricsGrid";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import RecentPatientActivity from "../components/dashboard/RecentPatientActivity";
// Placeholder for a potential future chart component
// import PatientTrendsChart from "../components/dashboard/PatientTrendsChart"; 
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const DashboardOverview = () => {
  // Placeholder for overall stats or alerts that might be displayed at the top
  const criticalAlertsCount = 1; // Example: number of unaddressed critical patient alerts

  return (
    <div className="space-y-6 p-4 sm:p-6"> {/* Added padding to the main container */}
      
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Quick Actions or Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Patients</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">128</p> {/* Placeholder */}
        </div>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Messages Today</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">12 <span className="text-sm text-green-500">(+3 new)</span></p> {/* Placeholder */}
        </div>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Pending Lab Reviews</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">7</p> {/* Placeholder */}
        </div>
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">System Status</h4>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">All Systems Go</p> {/* Placeholder */}
        </div>
      </div>
      
      {/* Optional: High-level alerts summary for the doctor */}
      {criticalAlertsCount > 0 && (
        <div className="bg-red-50 dark:bg-red-700/20 border border-red-200 dark:border-red-600/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-red-800 dark:text-red-200">
                {criticalAlertsCount} Critical Patient Alert{criticalAlertsCount > 1 ? 's' : ''}
              </h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                Please review immediately in the Patient Activity Feed or individual patient dashboards.
              </p>
            </div>
             <button className="ml-auto px-3 py-1.5 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                View Alerts
            </button>
          </div>
        </div>
      )}

      {/* Patient Metrics Overview Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Patient Snapshot</h2>
        <PatientMetricsGrid />
      </div>
      

      {/* Main Dashboard Layout: Appointments and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentPatientActivity />
      </div>

      {/* Placeholder for future charts or summaries */}
      {/* 
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Patient Adherence Trends</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="text-center text-gray-500 dark:text-slate-400">Patient adherence chart will be displayed here.</p>
          {/* <PatientTrendsChart /> Placeholder for actual chart component * / }
        </div>
      </div>
      */}

       

    </div>
  );
};

export default DashboardOverview;
