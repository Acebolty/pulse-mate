const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const Appointment = require('../models/Appointment');

const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

/**
 * @desc    Admin login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find admin user
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is admin
    const isAdmin = user.email === 'admin@pulsemate.com' || user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: 'admin'
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = 'all',
      status = 'all' 
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      query.role = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ 
      message: 'Server error fetching users' 
    });
  }
};

/**
 * @desc    Get all patients with health data
 * @route   GET /api/admin/patients
 * @access  Private (Admin only)
 */
const getAllPatients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      healthStatus = 'all' 
    } = req.query;

    // Build query for patients only
    let query = { 
      $or: [
        { role: { $exists: false } }, // Users without role (default patients)
        { role: 'patient' }
      ]
    };
    
    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { patientId: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const patients = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get recent health data for each patient
    const patientsWithHealthData = await Promise.all(
      patients.map(async (patient) => {
        const recentHealthData = await HealthData.find({ userId: patient._id })
          .sort({ timestamp: -1 })
          .limit(5);
        
        return {
          ...patient.toObject(),
          recentHealthData
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      patients: patientsWithHealthData,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get all patients error:', error.message);
    res.status(500).json({ 
      message: 'Server error fetching patients' 
    });
  }
};

/**
 * @desc    Get all doctors with approval status
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
const getAllDoctors = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      approvalStatus = 'all',
      specialty = 'all' 
    } = req.query;

    // Build query for doctors only
    let query = { role: 'doctor' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } } // Using patientId as doctorId for now
      ];
    }

    if (approvalStatus !== 'all') {
      query['doctorInfo.approvalStatus'] = approvalStatus;
    }

    if (specialty !== 'all') {
      query['doctorInfo.specialty'] = specialty;
    }

    const doctors = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      doctors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get all doctors error:', error.message);
    res.status(500).json({ 
      message: 'Server error fetching doctors' 
    });
  }
};

// Export all functions
module.exports = {
  adminLogin,
  getAllUsers,
  getAllPatients,
  getAllDoctors,
  // Add other functions as we implement them
  updateUserStatus: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  deleteUser: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  approveDoctorRegistration: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  rejectDoctorRegistration: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getPendingDoctors: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getDashboardOverview: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemStats: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getUserAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getHealthDataAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemHealth: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  performSystemBackup: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemLogs: (req, res) => res.status(501).json({ message: 'Not implemented yet' })
};
