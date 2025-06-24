const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const healthDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true // Index for faster queries by userId
  },
  dataType: {
    type: String,
    required: true,
    enum: [ // Define possible types of health data
      'heartRate',
      'bloodPressure', // Could be an object: { systolic: Number, diastolic: Number }
      'glucoseLevel',
      'caloriesBurned',
      'stepsTaken',
      'sleepDuration',
      'bodyTemperature',
      'weight',
      'bodyFat',
      'muscleMass',
      // Add other types as needed
    ],
    trim: true
  },
  value: {
    // Using Schema.Types.Mixed for flexibility, especially for bloodPressure.
    // Alternatively, you could have separate fields or sub-schemas for complex values.
    type: Schema.Types.Mixed, 
    required: true
  },
  // Example structure if value was specific for bloodPressure:
  // value: {
  //   systolic: { type: Number, required: function() { return this.dataType === 'bloodPressure'; } },
  //   diastolic: { type: Number, required: function() { return this.dataType === 'bloodPressure'; } }
  // },
  unit: {
    type: String,
    required: true,
    trim: true
    // e.g., 'bpm' for heartRate, 'mmHg' for bloodPressure, 'mg/dL' or 'mmol/L' for glucose, 'kcal', 'steps', 'hours'
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set to current date and time
    index: true // Index for sorting/querying by time
  },
  source: { // Where the data came from, e.g., 'Wearable Device', 'Manual Entry', 'Apple Health'
    type: String,
    trim: true,
    default: 'System'
  }
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt

// Compound index for common queries
healthDataSchema.index({ userId: 1, dataType: 1, timestamp: -1 });

const HealthData = mongoose.model('HealthData', healthDataSchema);

module.exports = HealthData;
