const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');

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

/**
 * @desc    Get dashboard overview metrics
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin only)
 */
const getDashboardOverview = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({
      $or: [
        { role: { $exists: false } }, // Users without role (default patients)
        { role: 'patient' }
      ]
    });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get pending doctors (assuming we'll add approval status later)
    const pendingDoctors = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'pending'
    });

    // Get recent health data count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHealthData = await HealthData.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    // Get total health data points
    const totalHealthData = await HealthData.countDocuments();

    // Get recent alerts count (last 7 days)
    const recentAlerts = await Alert.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Get recent appointments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate growth percentages (simplified for demo)
    const patientGrowth = totalPatients > 0 ? Math.round((recentHealthData / totalPatients) * 10) : 0;
    const doctorGrowth = totalDoctors > 0 ? Math.round((totalDoctors / 10) * 5) : 0;
    const appointmentGrowth = totalAppointments > 0 ? Math.round((recentAppointments / totalAppointments) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalPatients,
          totalDoctors,
          totalAdmins,
          pendingDoctors,
          totalAppointments,
          recentAppointments,
          totalHealthData,
          recentHealthData,
          recentAlerts
        },
        growth: {
          patients: patientGrowth,
          doctors: doctorGrowth,
          appointments: appointmentGrowth
        },
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error.message);
    res.status(500).json({
      message: 'Server error fetching dashboard overview'
    });
  }
};

// ==========================================
// APPOINTMENT APPROVAL MANAGEMENT
// ==========================================

/**
 * @desc    Get all pending appointments for admin approval
 * @route   GET /api/admin/appointments/pending
 * @access  Private (Admin only)
 */
const getPendingAppointments = async (req, res) => {
  try {
    const pendingAppointments = await Appointment.getPendingAppointments();

    res.json({
      success: true,
      appointments: pendingAppointments,
      count: pendingAppointments.length
    });

  } catch (error) {
    console.error('Get pending appointments error:', error.message);
    res.status(500).json({
      message: 'Server error fetching pending appointments'
    });
  }
};

/**
 * @desc    Approve an appointment and create chat room
 * @route   POST /api/admin/appointments/:appointmentId/approve
 * @access  Private (Admin only)
 */
const approveAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const adminId = req.adminUser._id;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId).populate('userId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({ message: 'Appointment is not pending approval' });
    }

    // Find the doctor (assuming providerName matches doctor's name)
    const doctor = await User.findOne({
      role: 'doctor',
      $or: [
        { firstName: { $regex: appointment.providerName, $options: 'i' } },
        { lastName: { $regex: appointment.providerName, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: appointment.providerName, options: 'i' } } }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found for this appointment' });
    }

    // Create chat room between patient and doctor
    const chatRoom = await Chat.findOrCreateChat(appointment.userId._id, doctor._id);

    // Update appointment status
    appointment.status = 'Approved';
    appointment.approvedBy = adminId;
    appointment.approvedAt = new Date();
    appointment.chatRoomId = chatRoom._id;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      appointment: appointment,
      chatRoomId: chatRoom._id
    });

  } catch (error) {
    console.error('Approve appointment error:', error.message);
    res.status(500).json({
      message: 'Server error approving appointment'
    });
  }
};

/**
 * @desc    Reject an appointment
 * @route   POST /api/admin/appointments/:appointmentId/reject
 * @access  Private (Admin only)
 */
const rejectAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const adminId = req.adminUser._id;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({ message: 'Appointment is not pending approval' });
    }

    // Update appointment status
    appointment.status = 'Cancelled';
    appointment.approvedBy = adminId;
    appointment.rejectedAt = new Date();
    appointment.rejectionReason = reason || 'Rejected by admin';

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rejected successfully',
      appointment: appointment
    });

  } catch (error) {
    console.error('Reject appointment error:', error.message);
    res.status(500).json({
      message: 'Server error rejecting appointment'
    });
  }
};

// Export all functions
module.exports = {
  adminLogin,
  getAllUsers,
  getAllPatients,
  getAllDoctors,
  getDashboardOverview,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  // Add other functions as we implement them
  updateUserStatus: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  deleteUser: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  approveDoctorRegistration: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  rejectDoctorRegistration: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getPendingDoctors: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemStats: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getUserAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getHealthDataAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemHealth: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  performSystemBackup: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemLogs: (req, res) => res.status(501).json({ message: 'Not implemented yet' })
};
