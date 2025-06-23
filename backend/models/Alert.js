const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['critical', 'warning', 'info', 'success'], // Based on your Alerts.jsx
    trim: true
  },
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
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  source: { // e.g., 'Blood Pressure Monitor', 'System', 'Glucose Monitor'
    type: String,
    trim: true,
    default: 'System'
  }
  // Actions are part of the frontend display logic in Alerts.jsx, 
  // but if actions need to trigger backend processes, they might be stored differently or handled via specific API calls.
  // For now, not storing 'actions' array directly in this schema.
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt

// Compound index for querying user's alerts, sorted by time
alertSchema.index({ userId: 1, timestamp: -1 });
// Optional: index for unread alerts
alertSchema.index({ userId: 1, isRead: 1, timestamp: -1 });


const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
