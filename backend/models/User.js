const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'USA' }
}, { _id: false }); // _id: false because this is a subdocument

const emergencyContactSchema = new Schema({
  name: { type: String, trim: true },
  relationship: { type: String, trim: true },
  phone: { type: String, trim: true }
}, { _id: false });

const userSchema = new Schema({
  patientId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email validation
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  profilePicture: { // URL to the profile picture
    type: String,
    trim: true,
    default: null 
  },
  profilePicturePublicId: { // Cloudinary public_id for managing the image
    type: String,
    trim: true,
    default: null
  },
  timezone: {
    type: String,
    default: 'America/New_York' // Default timezone
  },
  language: {
    type: String,
    default: 'English' // Default language
  },

  medicalInfo: {
    bloodType: { type: String, trim: true },
    height: { type: String, trim: true }, // e.g., "5'10\"" or "178cm"
    weight: { type: String, trim: true }, // e.g., "175 lbs" or "79 kg"
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    medications: [{
      name: { type: String, trim: true },
      dosage: { type: String, trim: true },
      frequency: { type: String, trim: true },
      _id: false // Don't create separate _id for each medication entry
    }],
    primaryDoctor: {
      name: { type: String, trim: true },
      specialty: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true }
    }
  },

  // Health targets for monitoring and alerts
  healthTargets: {
    heartRate: {
      min: { type: Number, default: 60 },
      max: { type: Number, default: 100 },
      unit: { type: String, default: 'bpm' }
    },
    bloodPressure: {
      systolic: {
        min: { type: Number, default: 90 },
        max: { type: Number, default: 120 }
      },
      diastolic: {
        min: { type: Number, default: 60 },
        max: { type: Number, default: 80 }
      },
      unit: { type: String, default: 'mmHg' }
    },
    bodyTemperature: {
      min: { type: Number, default: 97.0 },
      max: { type: Number, default: 99.5 },
      unit: { type: String, default: '°F' }
    },
    glucoseLevel: {
      min: { type: Number, default: 70 },
      max: { type: Number, default: 140 },
      unit: { type: String, default: 'mg/dL' }
    },
    weight: {
      target: { type: Number, default: 175 },
      unit: { type: String, default: 'lbs' }
    }
  },

  // Settings - directly embedded as per plan for simplicity
  settings: {
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'healthcare-providers', 'private'], default: 'healthcare-providers' },
      dataSharing: { type: Boolean, default: true }, // Allow healthcare providers to access your health data
      researchParticipation: { type: Boolean, default: false }, // Allow anonymized data for medical research
      marketingEmails: { type: Boolean, default: false },
      anonymousAnalytics: { type: Boolean, default: true }
    },
    notifications: {
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      appointmentReminders: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
      healthAlerts: { type: Boolean, default: true }, // For critical health notifications and warnings
      labResults: { type: Boolean, default: true }, // Notifications for new lab results
      messageNotifications: { type: Boolean, default: true }, // Notifications for new messages
      quietHoursEnabled: { type: Boolean, default: false },
      quietHoursStart: { type: String, default: '22:00' }, // Store as HH:MM string
      quietHoursEnd: { type: String, default: '07:00' }   // Store as HH:MM string
    },
    health: { // Some health settings might overlap with Profile.jsx's medicalInfo but these are preferences
      units: { type: String, enum: ['imperial', 'metric'], default: 'imperial' },
      glucoseUnit: { type: String, enum: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
      temperatureUnit: { type: String, enum: ['fahrenheit', 'celsius'], default: 'fahrenheit' },
      autoSync: { type: Boolean, default: true }, // Auto sync data from connected devices
      dataRetention: { type: String, enum: ['1-year', '3-years', '5-years', 'forever'], default: '5-years' },
      // Emergency contact is already at the top level of User schema
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      colorScheme: { type: String, enum: ['green', 'blue', 'purple'], default: 'green' }
    },
    // Security settings like 2FA status, session timeout are usually handled differently
    // e.g., 2FA status might be a flag, session timeout often a server/client config
    // For now, adding some as simple booleans/strings if they were in settings UI
    security: {
        twoFactorEnabled: { type: Boolean, default: false }, // This usually involves more setup
        // biometricLogin is a client-side preference, not typically stored on backend user model directly
        sessionTimeout: { type: String, default: '30-minutes' }, // Informational, actual timeout is server/token config
        loginAlerts: { type: Boolean, default: true } // Notify of new logins
    }
  }

}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt fields automatically

// Pre-save middleware to generate patient ID
userSchema.pre('save', async function(next) {
  // Generate patient ID only for new users
  if (this.isNew && !this.patientId) {
    try {
      // Generate a unique patient ID with format: PM-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.getFullYear().toString() +
                     (today.getMonth() + 1).toString().padStart(2, '0') +
                     today.getDate().toString().padStart(2, '0');

      // Find the highest patient ID for today to increment
      const lastPatient = await this.constructor.findOne({
        patientId: { $regex: `^PM-${dateStr}-` }
      }).sort({ patientId: -1 });

      let sequence = 1;
      if (lastPatient) {
        const lastSequence = parseInt(lastPatient.patientId.split('-')[2]);
        sequence = lastSequence + 1;
      }

      this.patientId = `PM-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Initialize settings and medicalInfo with defaults when a new user is created
userSchema.pre('save', function(next) {
  if (this.isNew) {
    // Initialize settings if not already present (e.g. if somehow set during construction before save)
    if (this.settings === undefined || Object.keys(this.settings).length === 0) { // Check if settings is undefined or an empty object
      this.settings = {
        privacy: {
          profileVisibility: 'healthcare-providers',
          dataSharing: true,
          researchParticipation: false,
          marketingEmails: false,
          anonymousAnalytics: true
        },
        notifications: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: true,
          medicationReminders: true,
          healthAlerts: true,
          labResults: true,
          messageNotifications: true,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00'
        },
        health: { // Health preferences
          units: 'imperial',
          glucoseUnit: 'mg/dL',
          temperatureUnit: 'fahrenheit',
          autoSync: true,
          dataRetention: '5-years'
        },
        appearance: {
          theme: 'system',
          fontSize: 'medium',
          colorScheme: 'green'
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: '30-minutes',
          loginAlerts: true
        }
      };
    }

    // Initialize medicalInfo if not already present
    if (this.medicalInfo === undefined || Object.keys(this.medicalInfo).length === 0) {
      this.medicalInfo = {
        allergies: [],
        chronicConditions: [],
        medications: [],
        primaryDoctor: { 
          // Ensure primaryDoctor sub-fields also have defaults or are explicitly empty if desired
          name: '', 
          specialty: '', 
          phone: '', 
          email: '' 
        }
      };
    } else { 
      // Ensure nested structures within medicalInfo exist if medicalInfo is partially provided
      if (this.medicalInfo.allergies === undefined) this.medicalInfo.allergies = [];
      if (this.medicalInfo.chronicConditions === undefined) this.medicalInfo.chronicConditions = [];
      if (this.medicalInfo.medications === undefined) this.medicalInfo.medications = [];
      if (this.medicalInfo.primaryDoctor === undefined) {
        this.medicalInfo.primaryDoctor = { name: '', specialty: '', phone: '', email: '' };
      }
    }
  }
  next();
});

// Methods for the User model could be added here later (e.g., for password comparison)

const User = mongoose.model('User', userSchema);

module.exports = User;