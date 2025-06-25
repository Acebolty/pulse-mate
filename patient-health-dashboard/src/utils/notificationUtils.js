/**
 * Notification utilities that respect user preferences
 */

/**
 * Check if a specific type of notification should be shown
 */
export const shouldShowNotification = (notificationType, userSettings) => {
  const notificationSettings = userSettings?.notifications || {};
  
  switch (notificationType) {
    case 'health_alert':
      return notificationSettings.healthAlerts !== false;
    case 'appointment_reminder':
      return notificationSettings.appointmentReminders !== false;
    case 'medication_reminder':
      return notificationSettings.medicationReminders !== false;
    case 'message_notification':
      return notificationSettings.messageNotifications !== false;
    case 'anomaly_detection':
      return notificationSettings.anomalyDetection === true;
    case 'health_task_reminder':
      return notificationSettings.healthTaskReminders === true;
    case 'emergency':
      return true; // Always show emergency notifications
    default:
      return true; // Default to showing notifications
  }
};

/**
 * Get notification preferences for display
 */
export const getNotificationPreferences = (userSettings) => {
  const notificationSettings = userSettings?.notifications || {};
  
  return {
    healthAlerts: notificationSettings.healthAlerts !== false,
    appointmentReminders: notificationSettings.appointmentReminders !== false,
    medicationReminders: notificationSettings.medicationReminders !== false,
    messageNotifications: notificationSettings.messageNotifications !== false,
    anomalyDetection: notificationSettings.anomalyDetection === true,
    healthTaskReminders: notificationSettings.healthTaskReminders === true,
    emailNotifications: notificationSettings.emailNotifications !== false
  };
};

/**
 * Filter notifications based on user preferences
 */
export const filterNotifications = (notifications, userSettings) => {
  if (!Array.isArray(notifications)) return [];
  
  return notifications.filter(notification => {
    const type = notification.type || notification.category || 'default';
    
    // Map notification types to preference keys
    switch (type) {
      case 'health':
      case 'alert':
      case 'critical':
      case 'warning':
        return shouldShowNotification('health_alert', userSettings);
      case 'appointment':
        return shouldShowNotification('appointment_reminder', userSettings);
      case 'medication':
        return shouldShowNotification('medication_reminder', userSettings);
      case 'message':
        return shouldShowNotification('message_notification', userSettings);
      case 'anomaly':
        return shouldShowNotification('anomaly_detection', userSettings);
      case 'task':
        return shouldShowNotification('health_task_reminder', userSettings);
      case 'emergency':
        return shouldShowNotification('emergency', userSettings);
      default:
        return true;
    }
  });
};

/**
 * Create a notification object with proper categorization
 */
export const createNotification = (type, title, message, options = {}) => {
  return {
    id: options.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: options.timestamp || new Date().toISOString(),
    isRead: false,
    priority: options.priority || 'normal', // low, normal, high, critical
    category: options.category || type,
    actions: options.actions || [],
    data: options.data || {},
    ...options
  };
};

/**
 * Show browser notification if permissions are granted and user preferences allow
 */
export const showBrowserNotification = async (title, message, userSettings, options = {}) => {
  // Check if user has enabled notifications
  if (!shouldShowNotification(options.type || 'health_alert', userSettings)) {
    return false;
  }
  
  // Check browser notification permission
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  let permission = Notification.permission;
  
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  
  if (permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'health-monitor',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      ...options.notificationOptions
    });
    
    // Auto-close after 5 seconds unless it's critical
    if (options.priority !== 'critical' && !options.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }
    
    return notification;
  }
  
  return false;
};

/**
 * Get notification sound based on priority and user preferences
 */
export const getNotificationSound = (priority, userSettings) => {
  const notificationSettings = userSettings?.notifications || {};
  
  // If user has disabled sounds, return null
  if (notificationSettings.soundEnabled === false) {
    return null;
  }
  
  switch (priority) {
    case 'critical':
      return '/sounds/critical-alert.mp3';
    case 'high':
      return '/sounds/high-priority.mp3';
    case 'normal':
      return '/sounds/notification.mp3';
    case 'low':
      return '/sounds/soft-notification.mp3';
    default:
      return '/sounds/notification.mp3';
  }
};

/**
 * Play notification sound if enabled
 */
export const playNotificationSound = (priority, userSettings) => {
  const soundFile = getNotificationSound(priority, userSettings);
  
  if (soundFile) {
    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error creating audio for notification:', error);
    }
  }
};

/**
 * Format notification for display based on user preferences
 */
export const formatNotificationForDisplay = (notification, userSettings) => {
  const preferences = getNotificationPreferences(userSettings);
  
  return {
    ...notification,
    shouldShow: shouldShowNotification(notification.type, userSettings),
    formattedTimestamp: new Date(notification.timestamp).toLocaleString(),
    priorityColor: getPriorityColor(notification.priority),
    typeIcon: getTypeIcon(notification.type),
    canDismiss: notification.priority !== 'critical'
  };
};

/**
 * Get color class for notification priority
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

/**
 * Get icon for notification type
 */
export const getTypeIcon = (type) => {
  switch (type) {
    case 'health':
    case 'alert':
      return '🏥';
    case 'appointment':
      return '📅';
    case 'medication':
      return '💊';
    case 'message':
      return '💬';
    case 'emergency':
      return '🚨';
    case 'task':
      return '✅';
    case 'anomaly':
      return '⚠️';
    default:
      return '🔔';
  }
};
