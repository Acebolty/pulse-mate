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
    sparse: true, // Only index documents that have this field (ignores null/undefined)
    required: false, // Make it optional for now, we'll handle it in pre-save
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
    enum: ['male', 'female', 'other', 'prefer_not_to_say', 'Male', 'Female', 'Other', 'Prefer not to say']
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

  // User role for access control and admin functionality
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
    trim: true
  },

  // Doctor-specific information (only used when role is 'doctor')
  doctorInfo: {
    // Basic Professional Info
    licenseNumber: { type: String, trim: true },
    licenseState: { type: String, trim: true }, // State/Country where licensed
    licenseExpirationDate: { type: Date },
    deaNumber: { type: String, trim: true }, // DEA number if applicable
    npiNumber: { type: String, trim: true }, // National Provider Identifier

    // Professional Details
    title: { type: String, trim: true, default: 'Dr.' }, // Dr., Prof., etc.
    specialty: { type: String, trim: true },
    specialization: { type: String, trim: true }, // Main specialization
    subSpecialty: { type: String, trim: true }, // Sub-specialization
    experience: { type: Number }, // Years of experience
    yearsOfExperience: { type: Number }, // Alias for experience
    department: { type: String, trim: true },
    qualifications: [{ type: String, trim: true }], // Array of qualifications
    biography: { type: String, trim: true }, // Doctor's bio
    languagesSpoken: [{ type: String, trim: true }], // Languages spoken
    affiliatedHospitals: [{ type: String, trim: true }], // Affiliated hospitals

    // Contact & Practice Info
    phone: { type: String, trim: true }, // Doctor's contact phone
    officeAddress: { type: String, trim: true }, // Office address
    generalHours: { type: String, trim: true, default: "Monday - Friday, 9:00 AM - 5:00 PM" }, // Working hours
    isAcceptingPatients: { type: Boolean, default: true }, // Availability toggle
    consultationFee: { type: String, trim: true, default: "$250 per consultation (approx.)" }, // Consultation fee

    // Education & Training
    medicalSchool: { type: String, trim: true },
    residency: { type: String, trim: true },
    fellowship: { type: String, trim: true },
    graduationYear: { type: Number },

    // Professional References
    references: [{
      name: { type: String, trim: true },
      title: { type: String, trim: true },
      institution: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      relationship: { type: String, trim: true } // Colleague, Supervisor, etc.
    }],

    // Document Uploads for Verification
    applicationDocuments: [{
      documentType: {
        type: String,
        enum: [
          'medical_license',
          'board_certification',
          'dea_certificate',
          'cv_resume',
          'malpractice_insurance',
          'government_id',
          'professional_headshot',
          'diploma',
          'other'
        ],
        required: true
      },
      fileName: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      cloudinaryPublicId: { type: String, trim: true },
      uploadedAt: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date },
      notes: { type: String, trim: true }
    }],

    // Approval Status & Review
    approvalStatus: {
      type: String,
      enum: ['pending_review', 'under_review', 'approved', 'rejected', 'suspended', 'needs_more_info'],
      default: 'pending_review'
    },
    applicationSubmittedAt: { type: Date, default: Date.now },
    reviewStartedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true }, // Internal notes for admin review

    // Additional Info
    telemedicineExperience: { type: String, trim: true }, // Experience with telemedicine
    malpracticeInsuranceProvider: { type: String, trim: true },
    malpracticeInsuranceExpiration: { type: Date }
  },

  medicalInfo: {
    bloodType: { type: String, trim: true },
    height: { type: String, trim: true }, // e.g., "5'10\"" or "178cm"
    weight: { type: String, trim: true }, // e.g., "175 lbs" or "79 kg"
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }]
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

      healthAlerts: { type: Boolean, default: true }, // For critical health notifications and warnings
      labResults: { type: Boolean, default: true }, // Notifications for new lab results
      messageNotifications: { type: Boolean, default: true }, // Notifications for new messages
      weeklyHealthSummary: { type: Boolean, default: true }, // Weekly health summary emails
      // Email alert type preferences - which alert types should trigger emails
      emailAlertTypes: {
        critical: { type: Boolean, default: true },  // Always email for critical alerts
        warning: { type: Boolean, default: true },   // Email for warning alerts
        info: { type: Boolean, default: false },     // Don't email for info alerts
        success: { type: Boolean, default: false }   // Don't email for success alerts
      },
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
  },

  // Login tracking for online/offline status
  lastLoginAt: {
    type: Date
  },
  lastLogoutAt: {
    type: Date
  }

}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt fields automatically

// Pre-save middleware to generate patient ID
userSchema.pre('save', async function(next) {
  // Generate patient ID only for new patients (not doctors)
  if (this.isNew && !this.patientId && this.role === 'patient') {
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
          healthAlerts: true,
          labResults: true,
          messageNotifications: true,
          weeklyHealthSummary: true,
          emailAlertTypes: {
            critical: true,  // Always email for critical alerts
            warning: true,   // Email for warning alerts
            info: false,     // Don't email for info alerts
            success: false   // Don't email for success alerts
          },
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

      };
    } else { 
      // Ensure nested structures within medicalInfo exist if medicalInfo is partially provided
      if (this.medicalInfo.allergies === undefined) this.medicalInfo.allergies = [];
      if (this.medicalInfo.chronicConditions === undefined) this.medicalInfo.chronicConditions = [];
    }
  }
  next();
});

// Methods for the User model could be added here later (e.g., for password comparison)

const User = mongoose.model('User', userSchema);

module.exports = User;