const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  // Who should receive this notification
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Who triggered this notification (optional)
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      'appointment_request',
      'appointment_approved', 
      'appointment_cancelled',
      'appointment_reminder',
      'health_alert',
      'message_received',
      'system_notification'
    ],
    trim: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  
  // Related data
  relatedId: {
    type: Schema.Types.ObjectId,
    default: null // Could reference appointment, alert, message, etc.
  },
  
  relatedType: {
    type: String,
    enum: ['appointment', 'alert', 'message', 'health_data'],
    default: null
  },
  
  // Additional data
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Source of notification
  source: {
    type: String,
    default: 'System'
  }
  
}, { timestamps: true });

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Static methods
notificationSchema.statics.createAppointmentNotification = async function(appointmentData, recipientId, type = 'appointment_request') {
  const notification = new this({
    recipientId,
    senderId: appointmentData.userId,
    type,
    title: this.getAppointmentNotificationTitle(type, appointmentData),
    message: this.getAppointmentNotificationMessage(type, appointmentData),
    priority: type === 'appointment_request' ? 'normal' : 'normal',
    relatedId: appointmentData._id,
    relatedType: 'appointment',
    data: {
      appointmentId: appointmentData._id,
      patientName: appointmentData.patientName,
      providerName: appointmentData.providerName,
      dateTime: appointmentData.dateTime,
      reason: appointmentData.reason
    },
    source: 'Appointment System'
  });
  
  return await notification.save();
};

notificationSchema.statics.getAppointmentNotificationTitle = function(type, appointmentData) {
  switch (type) {
    case 'appointment_request':
      return 'New Appointment Request';
    case 'appointment_approved':
      return 'Appointment Approved';
    case 'appointment_cancelled':
      return 'Appointment Cancelled';
    case 'appointment_reminder':
      return 'Appointment Reminder';
    default:
      return 'Appointment Update';
  }
};

notificationSchema.statics.getAppointmentNotificationMessage = function(type, appointmentData) {
  const patientName = appointmentData.patientName || 'A patient';
  const dateTime = new Date(appointmentData.dateTime).toLocaleString();
  
  switch (type) {
    case 'appointment_request':
      return `${patientName} has requested an appointment for ${appointmentData.reason} on ${dateTime}`;
    case 'appointment_approved':
      return `Your appointment with ${appointmentData.providerName} has been approved for ${dateTime}`;
    case 'appointment_cancelled':
      return `Your appointment with ${appointmentData.providerName} on ${dateTime} has been cancelled`;
    case 'appointment_reminder':
      return `Reminder: You have an appointment with ${appointmentData.providerName} tomorrow at ${dateTime}`;
    default:
      return `Appointment update for ${dateTime}`;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
