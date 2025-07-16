const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model to track which doctors have read which patient alerts
// This keeps patient and doctor read status separate
const doctorAlertReadSchema = new Schema({
  // The doctor who read the alert
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // The alert that was read
  alertId: {
    type: Schema.Types.ObjectId,
    ref: 'Alert',
    required: true,
    index: true
  },
  
  // The patient who owns the alert (for easier querying)
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // When the doctor marked it as read
  readAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });

// Compound indexes for efficient queries
doctorAlertReadSchema.index({ doctorId: 1, alertId: 1 }, { unique: true }); // Prevent duplicate reads
doctorAlertReadSchema.index({ doctorId: 1, patientId: 1 }); // For doctor's patient alerts
doctorAlertReadSchema.index({ alertId: 1 }); // For checking if alert is read by any doctor

const DoctorAlertRead = mongoose.model('DoctorAlertRead', doctorAlertReadSchema);

module.exports = DoctorAlertRead;
