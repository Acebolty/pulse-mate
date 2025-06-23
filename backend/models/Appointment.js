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
  type: { // e.g., 'Virtual Consultation', 'In-Person Checkup'
    type: String,
    enum: ['Virtual', 'In-Person', 'Follow-up', 'Checkup', 'Consultation', 'Other'],
    default: 'Consultation',
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Pending'],
    default: 'Scheduled'
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

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
