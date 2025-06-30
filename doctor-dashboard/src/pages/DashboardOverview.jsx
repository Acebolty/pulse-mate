import { useState, useEffect } from "react";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import PatientMetricsGrid from "../components/dashboard/PatientMetricsGrid";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import RecentPatientActivity from "../components/dashboard/RecentPatientActivity";
import { ExclamationTriangleIcon, UserGroupIcon, ChatBubbleLeftIcon, ClipboardDocumentListIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import api from "../services/api";

const DashboardOverview = () => {
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

  // Fetch real dashboard data
  useEffect(() => {
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

        // Fetch multiple data sources in parallel
        const [appointmentsRes, alertsRes] = await Promise.allSettled([
          api.get('/appointments/doctor'),
          api.get('/alerts?limit=100') // Get recent alerts to count critical ones
        ]);

        // Process appointments data with validation
        const appointmentsData = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : {};
        const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value.data : {};

        // The backend returns { data: [...], totalPages, currentPage, totalAppointments }
        const appointments = Array.isArray(appointmentsData.data) ? appointmentsData.data :
                           Array.isArray(appointmentsData) ? appointmentsData : [];
        const alerts = Array.isArray(alertsData.data) ? alertsData.data : Array.isArray(alertsData) ? alertsData : [];

        console.log('Appointments data:', appointments);
        console.log('Alerts data:', alerts);

        // Calculate real statistics
        const today = new Date().toDateString();

        // Get unique patients under doctor's care (count unique patient IDs, not appointments)
        const patientIds = appointments.map(apt => {
          // Extract patient ID from different possible locations
          const patientId = apt.userId?._id || apt.userId || apt.patient?.id || apt.patientId;
          console.log('🔍 Extracting patient ID from appointment:', {
            appointmentId: apt._id,
            userId: apt.userId,
            patientId: patientId,
            patientName: apt.userId?.firstName ? `${apt.userId.firstName} ${apt.userId.lastName}` : 'Unknown'
          });
          return patientId;
        }).filter(Boolean); // Remove null/undefined values

        const uniquePatients = new Set(patientIds).size;
        console.log('👥 Unique patient IDs:', Array.from(new Set(patientIds)));
        console.log('👥 Total unique patients:', uniquePatients);

        // Today's appointments with safe date handling
        const todayAppointments = appointments.filter(apt => {
          try {
            const aptDate = apt.dateTime || apt.date;
            return aptDate && new Date(aptDate).toDateString() === today && apt.status === 'Confirmed';
          } catch (e) {
            return false;
          }
        });

        // Completed today with safe date handling
        const completedToday = appointments.filter(apt => {
          try {
            const aptDate = apt.dateTime || apt.date;
            return (apt.status === 'completed' || apt.status === 'cancelled') &&
                   aptDate && new Date(aptDate).toDateString() === today;
          } catch (e) {
            console.warn('Invalid date in completed appointment:', apt);
            return false;
          }
        }).length;

        // Critical alerts (high priority health alerts)
        const criticalAlerts = alerts.filter(alert =>
          alert && alert.type === 'critical' && !alert.isRead
        ).length;

        // Pending reviews: Critical health alerts + unread health data requiring medical attention
        const pendingReviews = alerts.filter(alert =>
          alert && (alert.type === 'critical' || alert.priority === 'high') && !alert.isRead
        ).length;

        const dashboardStats = {
          totalPatients: uniquePatients || 0,
          messagesToday: 0, // Will be updated when messaging system is implemented
          newMessages: 0,
          pendingLabReviews: pendingReviews || 0, // Critical health alerts requiring doctor review
          systemStatus: appointments.length > 0 ? 'All Systems Operational' : 'No Data Available',
          criticalAlertsCount: criticalAlerts || 0,
          appointmentsToday: todayAppointments.length || 0,
          completedToday: completedToday || 0
        };

        setDashboardData(dashboardStats);

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

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6"> {/* Added padding to the main container */}
      
      {/* Welcome Section - Real Data */}
      <WelcomeCard dashboardData={dashboardData} loading={loading} />

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
              <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Pending Reviews</h4>
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
      {!loading && dashboardData.criticalAlertsCount > 0 && (
        <div className="bg-red-50 dark:bg-red-700/20 border border-red-200 dark:border-red-600/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-red-800 dark:text-red-200">
                {dashboardData.criticalAlertsCount} Critical Patient Alert{dashboardData.criticalAlertsCount > 1 ? 's' : ''}
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
