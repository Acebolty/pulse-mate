"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  BellIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
  CalendarDaysIcon,
  HeartIcon, // For health metrics
  DocumentArrowDownIcon, // For document uploads
  UserIcon, // Fallback or general patient icon
  EnvelopeIcon, // For new message
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import api from '../services/api'

// Real notifications will be fetched from API
const dummyNotificationsData = [
  {
    id: 1,
    type: "critical_alert", // health_metric, appointment, message, critical_alert, document_upload
    patientName: "Alice Wonderland",
    title: "Critical: High Blood Pressure",
    message: "Alice Wonderland's BP reading: 180/110 mmHg. Immediate review suggested.",
    timestamp: "2024-01-22T14:30:00Z",
    isRead: false,
    source: "Remote BP Monitor",
    actions: ["View Chart", "Contact Patient", "Acknowledge"],
  },
  {
    id: 2,
    type: "appointment_request",
    patientName: "Robert Smith",
    title: "New Appointment Request",
    message: "Robert Smith has requested a virtual consultation for 'Health Check-up'. Preferred date: Jan 25.",
    timestamp: "2024-01-22T13:45:00Z",
    isRead: false,
    source: "Patient Portal",
    actions: ["Accept", "Suggest New Time", "Decline"],
  },
  {
    id: 3,
    type: "new_message",
    patientName: "Maria Garcia",
    title: "New Message Received",
    message: "Maria Garcia: 'Hi Dr. Eve, I wanted to follow up on our last consultation and discuss my recent symptoms...'",
    timestamp: "2024-01-22T19:00:00Z",
    isRead: true,
    source: "Secure Messaging",
    actions: ["Reply", "View Chat", "Mark Unread"],
  },
  {
    id: 4,
    type: "health_metric_update",
    patientName: "John Doe",
    title: "Health Metric Update: Sleep Quality",
    message: "John Doe's sleep quality was 4.5/10 last night (Poor). Average for last 7 days: 6.2/10.",
    timestamp: "2024-01-22T16:20:00Z",
    isRead: true,
    source: "Wearable Device",
    actions: ["View Sleep Report", "Message Patient"],
  },
  {
    id: 5,
    type: "document_upload",
    patientName: "Charles Brown",
    title: "Document Uploaded: Lab Results",
    message: "Charles Brown uploaded 'External Lab Results - Jan 2024.pdf'.",
    timestamp: "2024-01-21T11:15:00Z",
    isRead: false,
    source: "Patient Portal",
    actions: ["View Document", "Add to Chart"],
  },
  {
    id: 6,
    type: "appointment_confirmation",
    patientName: "Linda Green",
    title: "Appointment Confirmed",
    message: "Your appointment with Linda Green for 'Annual Physical' on Jan 28, 10:00 AM is confirmed.",
    timestamp: "2024-01-21T08:00:00Z",
    isRead: true,
    source: "Scheduling System",
    actions: ["View Calendar", "Send Reminder"],
  },
   {
    id: 7,
    type: "health_metric_warning",
    patientName: "Alice Wonderland",
    title: "Warning: Irregular Heart Rate",
    message: "Alice Wonderland's heart rate has shown frequent irregularities over the past 2 hours.",
    timestamp: "2024-01-22T15:00:00Z",
    isRead: false,
    source: "ECG Monitor",
    actions: ["View ECG Trace", "Contact Patient"],
  },
  {
    id: 8,
    type: "appointment_cancelled_patient",
    patientName: "Kevin White",
    title: "Appointment Cancelled by Patient",
    message: "Kevin White has cancelled their appointment scheduled for Jan 24, 03:00 PM.",
    timestamp: "2024-01-22T09:00:00Z",
    isRead: true,
    source: "Patient Portal",
    actions: ["Acknowledge", "Offer Reschedule"],
  },
];

const getNotificationIconAndColor = (type) => {
  switch (type) {
    case "critical_alert":
      return { icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />, color: "red" };
    case "health_metric_warning":
      return { icon: <HeartIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />, color: "orange" };
    case "appointment_request":
    case "appointment_confirmation":
    case "appointment_cancelled_patient":
      return { icon: <CalendarDaysIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: "blue" };
    case "appointment_reminder":
      return { icon: <CalendarDaysIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />, color: "purple" };
    case "new_message":
      return { icon: <EnvelopeIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />, color: "purple" };
    case "health_metric_update":
      return { icon: <HeartIcon className="w-5 h-5 text-green-500 dark:text-green-400" />, color: "green" };
    case "document_upload":
      return { icon: <DocumentArrowDownIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, color: "indigo" };
    default:
      return { icon: <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />, color: "gray" };
  }
};

const getNotificationBgColor = (type, isRead, isDarkMode) => {
  const { color } = getNotificationIconAndColor(type);
  if (!isRead) {
    return isDarkMode ? `bg-sky-800/40 border-sky-700/60` : `bg-sky-50 border-sky-200`;
  }
  // Subtle background tints for read notifications based on type
  if (isDarkMode) {
    return `bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/70`;
  }
  switch (color) {
    case "red": return "bg-red-50/50 border-red-100 hover:bg-red-100/70 dark:bg-red-700/10 dark:border-red-600/30 dark:hover:bg-red-700/20";
    case "orange": return "bg-orange-50/50 border-orange-100 hover:bg-orange-100/70 dark:bg-orange-700/10 dark:border-orange-600/30 dark:hover:bg-orange-700/20";
    case "blue": return "bg-blue-50/50 border-blue-100 hover:bg-blue-100/70 dark:bg-blue-700/10 dark:border-blue-600/30 dark:hover:bg-blue-700/20";
    case "purple": return "bg-purple-50/50 border-purple-100 hover:bg-purple-100/70 dark:bg-purple-700/10 dark:border-purple-600/30 dark:hover:bg-purple-700/20";
    case "green": return "bg-green-50/50 border-green-100 hover:bg-green-100/70 dark:bg-green-700/10 dark:border-green-600/30 dark:hover:bg-green-700/20";
    case "indigo": return "bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/70 dark:bg-indigo-700/10 dark:border-indigo-600/30 dark:hover:bg-indigo-700/20";
    default: return "bg-gray-50/50 border-gray-100 hover:bg-gray-100/70 dark:bg-gray-700/10 dark:border-gray-600/30 dark:hover:bg-gray-700/20";
  }
};


const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Yesterday`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } })
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread, critical_alert, appointment, message, health_metric
  const [showSettings, setShowSettings] = useState(false); // Placeholder for future settings
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false); // Loading state for Mark All Read button
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle notification action clicks
  const handleNotificationAction = (action, notification) => {
    switch (action) {
      case 'View Appointment':
        // Navigate to appointments page with appointment data if available
        const appointmentId = notification.originalData?.relatedId || notification.originalData?.data?.appointmentId;
        if (appointmentId) {
          // Navigate with state to potentially highlight the specific appointment
          navigate('/your_appointments', {
            state: {
              highlightAppointmentId: appointmentId,
              fromNotification: true
            }
          });
        } else {
          navigate('/your_appointments');
        }
        // Note: User can manually mark as read using the "Mark as Read" button if needed
        break;
      case 'Mark as Read':
        markAsRead(notification.id);
        break;
      case 'Contact Patient':
        // Navigate to messages page with patient context
        console.log('Contacting patient:', notification.patientName);
        navigate('/messages', {
          state: {
            patientName: notification.patientName,
            patientEmail: notification.patientEmail,
            fromNotification: true
          }
        });
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  // Fetch real notifications/alerts from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        console.log('🔔 Fetching notifications/alerts...');

        // Fetch doctor notifications (both appointment and health alerts) and appointments
        const [notificationsRes, alertsRes, appointmentsRes] = await Promise.allSettled([
          api.get('/notifications/doctor?limit=50'),
          api.get('/alerts/doctor/notifications?limit=50'),
          api.get('/appointments/doctor')
        ]);

        // Process notifications (appointment requests, etc.)
        const notificationsData = notificationsRes.status === 'fulfilled' ? notificationsRes.value.data : {};
        const appointmentNotifications = Array.isArray(notificationsData.data) ? notificationsData.data : Array.isArray(notificationsData) ? notificationsData : [];

        // Process health alerts
        const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value.data : {};
        const alerts = Array.isArray(alertsData.data) ? alertsData.data : Array.isArray(alertsData) ? alertsData : [];

        // Process appointments for notifications
        const appointmentsData = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : {};
        const appointments = Array.isArray(appointmentsData.data) ? appointmentsData.data : Array.isArray(appointmentsData) ? appointmentsData : [];

        console.log('📧 Appointment notifications fetched:', appointmentNotifications.length);
        console.log('🚨 Health alerts fetched:', alerts.length);
        console.log('📅 Appointments fetched:', appointments.length);

        // Convert appointment notifications to notification format
        const formattedAppointmentNotifications = appointmentNotifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          patientName: notification.patientName || 'Unknown Patient',
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt,
          isRead: notification.isRead || false,
          source: notification.source || 'Appointment System',
          actions: ["View Appointment", "Mark as Read"],
          priority: notification.priority || 'normal',
          originalData: notification
        }));

        // Convert health alerts to notification format (now with patient names from backend)
        const alertNotifications = alerts.map(alert => ({
          id: alert._id,
          type: alert.type === 'critical' ? 'critical_alert' : 'health_metric_warning',
          patientName: alert.patientName || 'Unknown Patient', // Now comes from backend with patient info
          title: alert.type === 'critical' ? `Critical: ${alert.title || 'Health Alert'}` : `Warning: ${alert.title || 'Health Alert'}`,
          message: alert.message || alert.description || 'Health data requires review',
          timestamp: alert.createdAt || alert.timestamp,
          isRead: alert.isRead || false,
          source: alert.source || 'Health Monitor',
          actions: ["Mark as Read", "Contact Patient"],
          priority: alert.priority || (alert.type === 'critical' ? 'high' : 'medium'),
          patientEmail: alert.patientEmail || '',
          patientProfilePicture: alert.patientProfilePicture || null
        }));

        // Convert upcoming appointments to notifications
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentReminders = appointments
          .filter(apt => {
            const aptDate = new Date(apt.dateTime);
            return aptDate >= today && aptDate <= tomorrow && (apt.status === 'Approved' || apt.status === 'Confirmed');
          })
          .map(apt => {
            const aptDate = new Date(apt.dateTime);
            const patientName = apt.userId?.firstName && apt.userId?.lastName
              ? `${apt.userId.firstName} ${apt.userId.lastName}`
              : 'Unknown Patient';

            const isToday = aptDate.toDateString() === today.toDateString();
            const timeStr = aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            return {
              id: `apt-${apt._id}`,
              type: 'appointment_reminder',
              patientName: patientName,
              title: isToday ? `Today's Appointment` : `Tomorrow's Appointment`,
              message: `${patientName} - ${apt.reason || apt.reasonForVisit || 'Consultation'} at ${timeStr}`,
              timestamp: apt.dateTime,
              isRead: false, // Appointment reminders are always unread initially
              source: 'Appointment System',
              actions: ["Reschedule", "Contact Patient"],
              priority: 'medium'
            };
          });

        // Combine all notifications (appointment requests + health alerts + appointment reminders)
        const formattedNotifications = [...formattedAppointmentNotifications, ...alertNotifications, ...appointmentReminders];

        // Sort by most recent first
        formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log('✅ Formatted notifications:', formattedNotifications.length);
        setNotifications(formattedNotifications);

      } catch (err) {
        console.error('❌ Error fetching notifications:', err);
        setError('Failed to load notifications');
        // Fallback to dummy data if API fails
        setNotifications(dummyNotificationsData);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

   useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(document.documentElement.classList.contains('dark') || (!('theme' in localStorage) && prefersDarkMode));

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);


  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "critical_only") return notification.type === "critical_alert" || notification.type === "health_metric_warning";
    // For specific types, match if the type includes the filter string (e.g. "appointment" matches "appointment_request", "appointment_confirmation")
    return notification.type.includes(filter);
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalUnreadCount = notifications.filter((n) => (n.type === "critical_alert" || n.type === "health_metric_warning") && !n.isRead).length;

  const markAsRead = async (notificationId) => {
    try {
      // Find the notification to determine its type
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        console.error('Notification not found:', notificationId);
        return;
      }

      console.log('🩺 Doctor marking notification as read:', notificationId, 'Type:', notification.type);

      let response;

      // Use different endpoints based on notification type
      if (notification.type.includes('appointment')) {
        // For appointment notifications, use the general notifications endpoint
        response = await api.put(`/notifications/${notificationId}/read`);
      } else {
        // For health alerts, use the alerts endpoint
        response = await api.put(`/alerts/doctor/${notificationId}/read`);
      }

      if (response.data.success) {
        // Update in frontend
        setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
        console.log('✅ Notification marked as read by doctor:', notificationId);
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);

      // Check if it's an authorization error
      if (err.response?.status === 403) {
        alert('You do not have permission to mark this notification as read.');
      } else if (err.response?.status === 404) {
        // For 404 errors, just update the frontend state since the notification might already be processed
        console.warn('⚠️ Notification not found on server, updating frontend state');
        setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
      } else {
        // Still update frontend for better UX, but show warning
        setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
        console.warn('⚠️ Updated frontend but backend update failed');
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true); // Show loading state
      console.log('🩺 Doctor marking all notifications as read...');

      // Mark both notification types as read (doctor-specific endpoints)
      const [notificationsRes, alertsRes] = await Promise.allSettled([
        api.put('/notifications/read-all'),
        api.put('/alerts/doctor/read-all')
      ]);

      // Check if at least one succeeded
      const notificationsSuccess = notificationsRes.status === 'fulfilled' && notificationsRes.value.data.success;
      const alertsSuccess = alertsRes.status === 'fulfilled' && alertsRes.value.data.success;

      if (notificationsSuccess || alertsSuccess) {
        // Update frontend state immediately
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));

        console.log('✅ Marked all notifications as read');
        console.log('📧 Notifications:', notificationsSuccess ? 'Success' : 'Failed');
        console.log('🚨 Alerts:', alertsSuccess ? 'Success' : 'Failed');

        // Silent refresh: Trigger updates in other components after a small delay
        // This ensures backend has processed the request
        setTimeout(() => {
          console.log('🔄 Triggering silent refresh of sidebar and header...');
          window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
          setMarkingAllAsRead(false); // Reset loading state after silent refresh
        }, 500); // 500ms delay to ensure backend processing

      } else {
        setMarkingAllAsRead(false); // Reset loading state on failure
        throw new Error('Failed to mark notifications as read');
      }
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);

      // Still update frontend for better UX, but show warning
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));

      // Still trigger the silent refresh for UI updates
      setTimeout(() => {
        console.log('🔄 Triggering silent refresh (fallback after error)...');
        window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
        setMarkingAllAsRead(false); // Reset loading state after silent refresh
      }, 500);

      console.warn('⚠️ Updated frontend but backend update may have failed');
    }
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };
  
  const getFilterButtonClass = (filterKey) => {
    return `py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
      filter === filterKey
        ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500"
        : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
    }`;
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mt-1">
            {unreadCount > 0 ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''}` : 'No new updates'}
            {criticalUnreadCount > 0 && <span className="text-red-500 dark:text-red-400"> • {criticalUnreadCount} patient alerts</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markingAllAsRead}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-700/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {markingAllAsRead && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            )}
            <span>{markingAllAsRead ? 'Marking as Read...' : 'Mark All Read'}</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)} // Placeholder action
            className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Notification Settings"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-6 px-2 sm:px-4">
            <button onClick={() => setFilter("all")} className={getFilterButtonClass("all")}>All ({notifications.length})</button>
            <button onClick={() => setFilter("unread")} className={getFilterButtonClass("unread")}>Unread ({unreadCount})</button>
            <button onClick={() => setFilter("critical_only")} className={getFilterButtonClass("critical_only")}>Patient Alerts ({notifications.filter(n=>(n.type === "critical_alert" || n.type === "health_metric_warning")).length})</button>
            <button onClick={() => setFilter("appointment")} className={getFilterButtonClass("appointment")}>Appointments ({notifications.filter(n=>n.type.includes("appointment")).length})</button>
          </nav>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50 max-h-[calc(100vh-250px)] overflow-y-auto"> {/* Adjust max-h as needed */}
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center">
              <BellIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400">No notifications for this filter.</p>
            </div>
          ) : (
            filteredNotifications.map((notification, i) => {
              const { icon: NotifIcon, color: iconColor } = getNotificationIconAndColor(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className={`p-3 sm:p-4 md:p-5 border-l-4 ${!notification.isRead ? `border-${iconColor}-500 dark:border-${iconColor}-400` : 'border-transparent'} ${getNotificationBgColor(notification.type, notification.isRead, isDarkMode)}`}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`flex-shrink-0 mt-1 p-2 rounded-full bg-${iconColor}-100 dark:bg-${iconColor}-700/30`}>
                        {NotifIcon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <h3 className={`text-sm font-semibold ${!notification.isRead ? "text-gray-900 dark:text-slate-50" : "text-gray-700 dark:text-slate-200"}`}>
                          {notification.title}
                          {!notification.isRead && <span className={`ml-2 inline-block w-2 h-2 bg-${iconColor}-500 dark:bg-${iconColor}-400 rounded-full animate-pulse`}></span>}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-0">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-2 sm:mb-3 leading-relaxed">{notification.message}</p>
                      
                      {notification.patientName && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Patient: <span className="font-medium text-gray-700 dark:text-slate-200">{notification.patientName}</span></p>}

                      <div className="flex flex-col items-start space-y-2 mt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:mt-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleNotificationAction(action, notification)}
                              className={`text-xs font-semibold text-${iconColor}-600 dark:text-${iconColor}-400 hover:underline hover:text-${iconColor}-700 dark:hover:text-${iconColor}-300 transition-colors`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          {!notification.isRead && (
                            <button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark Read</button>
                          )}
                          <button onClick={() => deleteNotification(notification.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

        {/* Settings Modal (Placeholder) */}
        {showSettings && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Notification Settings</h3>
                        <button onClick={() => setShowSettings(false)}><XCircleIcon className="w-6 h-6 text-gray-500 hover:text-gray-700"/></button>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300">Detailed notification preferences will be available here soon.</p>
                    {/* Add actual settings form later */}
                     <div className="mt-6 text-right">
                        <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Close</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default Notifications;
