import { useState, useEffect, useCallback } from 'react';

import { 
  shouldShowNotification, 
  filterNotifications, 
  createNotification,
  showBrowserNotification,
  playNotificationSound,
  formatNotificationForDisplay
} from '../utils/notificationUtils';

/**
 * Custom hook for managing notifications with user preferences
 */
export const useNotifications = () => {
  // Use default settings since we removed the settings context
  const settings = { notifications: { healthAlerts: true, emailNotifications: true } };
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((type, title, message, options = {}) => {
    // Check if this type of notification should be shown
    if (!shouldShowNotification(type, settings)) {
      return null;
    }

    const notification = createNotification(type, title, message, options);
    
    setNotifications(prev => {
      const updated = [notification, ...prev];
      // Keep only the last 50 notifications
      return updated.slice(0, 50);
    });

    // Show browser notification if enabled
    if (settings?.notifications?.browserNotifications !== false) {
      showBrowserNotification(title, message, settings, {
        type,
        priority: options.priority,
        ...options
      });
    }

    // Play sound if enabled
    if (settings?.notifications?.soundEnabled !== false) {
      playNotificationSound(options.priority || 'normal', settings);
    }

    return notification;
  }, [settings]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Get filtered notifications based on user preferences
   */
  const getFilteredNotifications = useCallback(() => {
    return filterNotifications(notifications, settings);
  }, [notifications, settings]);

  /**
   * Get formatted notifications for display
   */
  const getFormattedNotifications = useCallback(() => {
    const filtered = getFilteredNotifications();
    return filtered.map(notification => 
      formatNotificationForDisplay(notification, settings)
    );
  }, [getFilteredNotifications, settings]);

  /**
   * Add health alert notification
   */
  const addHealthAlert = useCallback((title, message, severity = 'normal', data = {}) => {
    return addNotification('health_alert', title, message, {
      priority: severity,
      category: 'health',
      data,
      actions: ['View Details', 'Dismiss']
    });
  }, [addNotification]);

  /**
   * Add appointment reminder
   */
  const addAppointmentReminder = useCallback((title, message, appointmentData = {}) => {
    return addNotification('appointment_reminder', title, message, {
      priority: 'normal',
      category: 'appointment',
      data: appointmentData,
      actions: ['View Appointment', 'Reschedule', 'Dismiss']
    });
  }, [addNotification]);



  /**
   * Add health task reminder
   */
  const addHealthTaskReminder = useCallback((title, message, taskData = {}) => {
    return addNotification('health_task_reminder', title, message, {
      priority: 'normal',
      category: 'task',
      data: taskData,
      actions: ['Complete Task', 'Remind Later', 'Dismiss']
    });
  }, [addNotification]);

  /**
   * Add emergency alert
   */
  const addEmergencyAlert = useCallback((title, message, emergencyData = {}) => {
    return addNotification('emergency', title, message, {
      priority: 'critical',
      category: 'emergency',
      data: emergencyData,
      requireInteraction: true,
      actions: ['Call Emergency', 'Contact Doctor', 'View Details']
    });
  }, [addNotification]);

  // Update unread count when notifications change
  useEffect(() => {
    const filtered = getFilteredNotifications();
    const unread = filtered.filter(notification => !notification.isRead).length;
    setUnreadCount(unread);
  }, [getFilteredNotifications]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('health-notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('health-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);

  return {
    // State
    notifications: getFormattedNotifications(),
    unreadCount,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Specific notification types
    addHealthAlert,
    addAppointmentReminder,
    addHealthTaskReminder,
    addEmergencyAlert,
    
    // Utilities
    getFilteredNotifications,
    getFormattedNotifications,
    
    // Settings
    settings
  };
};
