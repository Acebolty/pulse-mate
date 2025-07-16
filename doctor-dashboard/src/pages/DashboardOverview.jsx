import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import PatientMetricsGrid from "../components/dashboard/PatientMetricsGrid";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import RecentPatientActivity from "../components/dashboard/RecentPatientActivity";
import { ExclamationTriangleIcon, UserGroupIcon, ChatBubbleLeftIcon, ClipboardDocumentListIcon, CheckCircleIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import api from "../services/api";

const DashboardOverview = () => {
  const navigate = useNavigate();

  // State for real dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    openAppointments: 0,
    appointmentsWaiting: 0,
    recentAlerts: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
    systemStatus: 'Loading...'
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

        // Fetch doctor dashboard analytics and detailed alerts
        console.log('📊 Fetching doctor dashboard analytics...');
        const [analyticsRes, alertsRes] = await Promise.allSettled([
          api.get('/appointments/doctor/analytics'),
          api.get('/alerts/doctor/notifications?limit=100')
        ]);

        let dashboardStats = {
          totalPatients: 0,
          openAppointments: 0,
          appointmentsWaiting: 0,
          recentAlerts: 0,
          criticalAlerts: 0,
          warningAlerts: 0,
          systemStatus: 'Loading...'
        };

        // Process analytics data
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.status === 200 && analyticsRes.value.data.success) {
          const analytics = analyticsRes.value.data.data;
          console.log('📊 Doctor dashboard analytics fetched:', analytics);

          dashboardStats = {
            ...dashboardStats,
            totalPatients: analytics.totalPatients || 0,
            openAppointments: analytics.openAppointments || 0,
            appointmentsWaiting: analytics.appointmentsWaiting || 0,
            recentAlerts: analytics.recentAlerts || 0,
            systemStatus: analytics.systemStatus || 'No Data Available'
          };
        }

        // Process detailed alerts to get critical vs warning breakdown
        if (alertsRes.status === 'fulfilled' && alertsRes.value.status === 200) {
          const alertsData = alertsRes.value.data;
          console.log('🚨 Doctor alerts fetched:', alertsData);

          if (alertsData.data && Array.isArray(alertsData.data)) {
            const unreadAlerts = alertsData.data.filter(alert => !alert.isRead);
            const criticalAlerts = unreadAlerts.filter(alert => alert.type === 'critical').length;
            const warningAlerts = unreadAlerts.filter(alert => alert.type === 'warning').length;

            dashboardStats = {
              ...dashboardStats,
              criticalAlerts,
              warningAlerts,
              recentAlerts: criticalAlerts + warningAlerts // Total unread alerts
            };

            console.log('🚨 Alert breakdown:', { criticalAlerts, warningAlerts, total: dashboardStats.recentAlerts });
          }
        }

        setDashboardData(dashboardStats);
        setLastUpdated(new Date());

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
          openAppointments: 0,
          appointmentsWaiting: 0,
          recentAlerts: 0,
          criticalAlerts: 0,
          warningAlerts: 0,
          systemStatus: 'System Error'
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();

    // Listen for notifications marked as read events to refresh dashboard
    const handleNotificationsMarkedAsRead = () => {
      console.log('📊 Dashboard: Received notifications marked as read event, refreshing dashboard data...');
      fetchDashboardData();
    };

    window.addEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);

    return () => {
      window.removeEventListener('notificationsMarkedAsRead', handleNotificationsMarkedAsRead);
    };
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

  // Auto-refresh dashboard data every 1 minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 60000); // 1 minute (60 seconds)

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
      <div>
        <WelcomeCard dashboardData={dashboardData} loading={loading} />
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
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Unique patients with appointments
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Open Appointments</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.openAppointments}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Currently in chat session
              </p>
            </div>
            <ChatBubbleLeftIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Appointments in Waiting</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.appointmentsWaiting}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Approved, waiting to open
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Recent Alerts</h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                {loading ? '...' : dashboardData.recentAlerts}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                From active chat patients
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>
      
      {/* Patient Alerts Summary - Real Data */}
      {!loading && dashboardData.recentAlerts > 0 && !alertsBannerDismissed && (
        <div className={`${dashboardData.criticalAlerts > 0 ? 'bg-red-50 dark:bg-red-700/20 border-red-200 dark:border-red-600/40' : 'bg-orange-50 dark:bg-orange-700/20 border-orange-200 dark:border-orange-600/40'} border rounded-xl p-4 shadow-md`}>
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className={`w-6 h-6 ${dashboardData.criticalAlerts > 0 ? 'text-red-500 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`} />
            <div className="flex-1">
              <h3 className={`text-sm sm:text-base font-semibold ${dashboardData.criticalAlerts > 0 ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                {dashboardData.criticalAlerts > 0 && (
                  <>
                    {dashboardData.criticalAlerts} Critical Patient Alert{dashboardData.criticalAlerts > 1 ? 's' : ''}
                    {dashboardData.warningAlerts > 0 && ` + ${dashboardData.warningAlerts} Warning${dashboardData.warningAlerts > 1 ? 's' : ''}`}
                  </>
                )}
                {dashboardData.criticalAlerts === 0 && dashboardData.warningAlerts > 0 && (
                  <>
                    {dashboardData.warningAlerts} Warning Patient Alert{dashboardData.warningAlerts > 1 ? 's' : ''}
                  </>
                )}
              </h3>
              <p className={`text-xs sm:text-sm ${dashboardData.criticalAlerts > 0 ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}`}>
                From patients currently in active chat sessions. Please review {dashboardData.criticalAlerts > 0 ? 'immediately' : 'when convenient'}.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/notifications')}
                className={`px-3 py-1.5 text-xs sm:text-sm ${dashboardData.criticalAlerts > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-lg transition-colors`}
              >
                View Alerts
              </button>
              <button
                onClick={() => setAlertsBannerDismissed(true)}
                className={`p-1.5 ${dashboardData.criticalAlerts > 0 ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30' : 'text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/30'} rounded-lg transition-colors`}
                title="Dismiss alerts banner"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismissed Alerts Summary - Minimized State */}
      {!loading && dashboardData.recentAlerts > 0 && alertsBannerDismissed && (
        <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {dashboardData.criticalAlerts > 0 && `${dashboardData.criticalAlerts} critical`}
                {dashboardData.criticalAlerts > 0 && dashboardData.warningAlerts > 0 && ', '}
                {dashboardData.warningAlerts > 0 && `${dashboardData.warningAlerts} warning`}
                {' alert'}
                {dashboardData.recentAlerts > 1 ? 's' : ''} (dismissed)
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
