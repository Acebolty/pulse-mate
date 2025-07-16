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
  },
  // Deduplication hash to prevent duplicate alerts
  // This will be a hash of userId + type + title + message + timestamp (rounded to minute)
  deduplicationHash: {
    type: String,
    unique: true,
    sparse: true // Allow null values, but enforce uniqueness when present
  }
  // Actions are part of the frontend display logic in Alerts.jsx,
  // but if actions need to trigger backend processes, they might be stored differently or handled via specific API calls.
  // For now, not storing 'actions' array directly in this schema.
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt

// Compound index for querying user's alerts, sorted by time
alertSchema.index({ userId: 1, timestamp: -1 });
// Optional: index for unread alerts
alertSchema.index({ userId: 1, isRead: 1, timestamp: -1 });

// Pre-save middleware to generate deduplication hash
alertSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('userId') || this.isModified('type') ||
      this.isModified('title') || this.isModified('message') || this.isModified('timestamp')) {

    // Round timestamp to nearest minute for deduplication
    const timestamp = this.timestamp || new Date();
    const roundedTimestamp = new Date(timestamp);
    roundedTimestamp.setSeconds(0, 0); // Remove seconds and milliseconds

    // Create a hash from the key fields
    const crypto = require('crypto');
    const hashInput = `${this.userId}-${this.type}-${this.title}-${this.message}-${roundedTimestamp.toISOString()}`;
    this.deduplicationHash = crypto.createHash('sha256').update(hashInput).digest('hex');
  }
  next();
});


const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
