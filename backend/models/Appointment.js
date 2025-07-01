const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // For simplicity in a school project, we're using providerName directly.
  // In a more complex system, providerId might reference a separate Providers collection.
  providerName: { 
    type: String,
    required: [true, 'Provider name is required.'],
    trim: true
  },
  providerId: { // Optional, could be an external ID or reference if you had a providers list
    type: String,
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Appointment date and time are required.'],
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required.'],
    trim: true
  },
  type: { // Only chat sessions for school project
    type: String,
    enum: ['Chat'],
    default: 'Chat',
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Active', 'Completed', 'Cancelled', 'Expired'],
    default: 'Pending'
  },

  // Chat session specific fields
  sessionDuration: { // Duration in minutes
    type: Number,
    default: 30,
    min: 15,
    max: 60
  },
  sessionStartTime: {
    type: Date,
    default: null
  },
  sessionEndTime: {
    type: Date,
    default: null
  },
  chatRoomId: { // Links to Chat model
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    default: null
  },
  chatEnabled: {
    type: Boolean,
    default: false
  },

  // Approval workflow fields
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Admin who approved
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  },
  notes: { // Patient notes for the appointment, or post-appointment summary by provider
    type: String,
    trim: true
  },
  // If you implement virtual consultation links (e.g., for a mock Jitsi/Zoom link)
  virtualLink: {
    type: String,
    trim: true
  }
}, { timestamps: true }); // createdAt, updatedAt

// Index to quickly find appointments for a user sorted by date
appointmentSchema.index({ userId: 1, dateTime: -1 });
// Index for admin to find pending appointments
appointmentSchema.index({ status: 1, createdAt: -1 });

// Instance methods
appointmentSchema.methods.startSession = function() {
  this.status = 'Active';
  this.sessionStartTime = new Date();
  this.sessionEndTime = new Date(Date.now() + this.sessionDuration * 60 * 1000);
  this.chatEnabled = true;
  return this.save();
};

appointmentSchema.methods.endSession = function() {
  this.status = 'Completed';
  this.chatEnabled = false;
  return this.save();
};

appointmentSchema.methods.isSessionExpired = function() {
  if (!this.sessionEndTime) return false;
  return new Date() > this.sessionEndTime;
};

appointmentSchema.methods.getRemainingTime = function() {
  if (!this.sessionEndTime || this.isSessionExpired()) return 0;
  return Math.max(0, Math.floor((this.sessionEndTime - new Date()) / 1000 / 60)); // minutes
};

// Static methods
appointmentSchema.statics.getPendingAppointments = function() {
  return this.find({ status: 'Pending' })
    .populate('userId', 'firstName lastName email patientId')
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getActiveAppointments = function() {
  return this.find({ status: 'Active', chatEnabled: true })
    .populate('userId', 'firstName lastName email')
    .populate('chatRoomId');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
