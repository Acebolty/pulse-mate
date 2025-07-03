import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import PatientMetricsGrid from "../components/dashboard/PatientMetricsGrid";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import RecentPatientActivity from "../components/dashboard/RecentPatientActivity";
import { ExclamationTriangleIcon, UserGroupIcon, ChatBubbleLeftIcon, ClipboardDocumentListIcon, CheckCircleIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import api from "../services/api";

const DashboardOverview = () => {
  const navigate = useNavigate();

  // State for real dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    messagesToday: 0,
    newMessages: 0,
    pendingLabReviews: 0,
    systemStatus: 'Loading...',
    criticalAlertsCount: 0,
    appointmentsToday: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertsBannerDismissed, setAlertsBannerDismissed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Check authentication first
        const token = localStorage.getItem('doctorAuthToken');
        if (!token) {
          setError('Please log in to access the dashboard');
          setLoading(false);
          return;
        }

        // Fetch doctor dashboard analytics from the new dedicated endpoint
        console.log('📊 Fetching doctor dashboard analytics...');
        const analyticsRes = await api.get('/appointments/doctor/analytics');

        if (analyticsRes.status === 200 && analyticsRes.data.success) {
          const analytics = analyticsRes.data.data;
          console.log('📊 Doctor dashboard analytics fetched:', analytics);

          const dashboardStats = {
            totalPatients: analytics.totalPatients || 0,
            messagesToday: 0, // Will be updated when messaging system is implemented
            newMessages: 0,
            pendingLabReviews: analytics.pendingReviews || 0,
            systemStatus: analytics.systemStatus || 'No Data Available',
            criticalAlertsCount: analytics.criticalAlerts || 0,
            appointmentsToday: analytics.appointmentsToday || 0,
            completedToday: analytics.completedToday || 0,
            approvedToday: analytics.approvedToday || 0,
            totalApproved: analytics.totalApproved || 0,
            totalAppointments: analytics.totalAppointments || 0
          };

          setDashboardData(dashboardStats);
          setLastUpdated(new Date());
        } else {
          throw new Error('Failed to fetch analytics data');
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);

        // Check if it's an authentication error
        if (err.response?.status === 401) {
          setError('Please log in to access the dashboard');
          // Redirect to login if not authenticated
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        } else {
          setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
        }

        // Set fallback data
        setDashboardData({
          totalPatients: 0,
          messagesToday: 0,
          newMessages: 0,
          pendingLabReviews: 0,
          systemStatus: 'System Error',
          criticalAlertsCount: 0,
          appointmentsToday: 0,
          completedToday: 0
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when returning to dashboard (e.g., from notifications)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Dashboard focused - refreshing data...');
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Auto-refresh dashboard data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add visibility change listener for when user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible - refreshing data...');
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6"> {/* Added padding to the main container */}

      {/* Welcome Section - Clean Layout */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <WelcomeCard dashboardData={dashboardData} loading={loading} />
        </div>

        {/* Refresh Button - Clean and Simple */}
        <div className="ml-4">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchDashboardData();
            }}
            disabled={loading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
            title="Refresh dashboard data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid - Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Patients</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.totalPatients}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Appointments Today</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.appointmentsToday}
                {!loading && dashboardData.completedToday > 0 && (
                  <span className="text-sm text-green-500 ml-2">({dashboardData.completedToday} completed)</span>
                )}
              </p>
            </div>
            <ChatBubbleLeftIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Pending Alerts</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.pendingLabReviews}
              </p>
            </div>
            <ClipboardDocumentListIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">System Status</h4>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {loading ? 'Loading...' : dashboardData.systemStatus}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>
      
      {/* Critical Alerts Summary - Real Data */}
      {!loading && dashboardData.criticalAlertsCount > 0 && !alertsBannerDismissed && (
        <div className="bg-red-50 dark:bg-red-700/20 border border-red-200 dark:border-red-600/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-red-800 dark:text-red-200">
                {dashboardData.criticalAlertsCount} Critical Patient Alert{dashboardData.criticalAlertsCount > 1 ? 's' : ''}
              </h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                Please review immediately in the notifications page or individual patient dashboards.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/notifications')}
                className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                View Alerts
              </button>
              <button
                onClick={() => setAlertsBannerDismissed(true)}
                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-lg transition-colors"
                title="Dismiss alerts banner"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismissed Alerts Summary - Minimized State */}
      {!loading && dashboardData.criticalAlertsCount > 0 && alertsBannerDismissed && (
        <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {dashboardData.criticalAlertsCount} critical alert{dashboardData.criticalAlertsCount > 1 ? 's' : ''} (dismissed)
              </span>
            </div>
            <button
              onClick={() => setAlertsBannerDismissed(false)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Show again
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Dashboard Error
            </h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error}. Please refresh the page or contact support if the issue persists.
          </p>
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
