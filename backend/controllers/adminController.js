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
      limit = 50, // Increased for admin dashboard
      search = '',
      approvalStatus = 'all',
      specialty = 'all',
      availability = 'all',
      status = 'all' // online/offline status
    } = req.query;

    console.log('📋 Admin fetching doctors with filters:', {
      search, approvalStatus, specialty, availability, status
    });

    // Build query for doctors only
    let query = { role: 'doctor' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'doctorInfo.licenseNumber': { $regex: search, $options: 'i' } }
      ];
    }

    if (approvalStatus !== 'all') {
      query['doctorInfo.approvalStatus'] = approvalStatus;
    }

    if (specialty !== 'all') {
      query['doctorInfo.specialization'] = specialty;
    }

    if (availability !== 'all') {
      query['doctorInfo.isAcceptingPatients'] = availability === 'accepting';
    }

    // Fetch doctors with enhanced data
    const doctors = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get appointment statistics for each doctor
    const Appointment = require('../models/Appointment');
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        try {
          // Count unique patients who had appointments with this doctor
          // Note: Appointments use 'userId' for patient ID, not 'patientId'
          const uniquePatients = await Appointment.distinct('userId', {
            $or: [
              { providerId: doctor._id.toString() }, // providerId is stored as string
              { providerName: { $regex: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`, $options: 'i' } }
            ]
          });

          // Count total appointments
          const totalAppointments = await Appointment.countDocuments({
            $or: [
              { providerId: doctor._id.toString() }, // providerId is stored as string
              { providerName: { $regex: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`, $options: 'i' } }
            ]
          });

          // Determine online status with proper logout handling
          const now = new Date();
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

          let isOnline = false;

          if (doctor.lastLoginAt && doctor.lastLoginAt > thirtyMinutesAgo) {
            // Doctor logged in within last 30 minutes
            if (doctor.lastLogoutAt) {
              // If there's a logout time, check if login is more recent than logout
              if (doctor.lastLoginAt > doctor.lastLogoutAt) {
                // Login is more recent than logout - doctor is online
                isOnline = true;
              } else {
                // Logout is more recent than login - check 5-minute grace period
                isOnline = doctor.lastLogoutAt > fiveMinutesAgo;
              }
            } else {
              // No logout time recorded - doctor is online
              isOnline = true;
            }
          }

          return {
            id: doctor._id,
            name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            phone: doctor.phone,
            dateOfBirth: doctor.dateOfBirth,
            gender: doctor.gender,

            // Doctor-specific info
            specialty: doctor.doctorInfo?.specialization || 'Not specified',
            subSpecialty: doctor.doctorInfo?.subSpecialty,
            experience: doctor.doctorInfo?.yearsOfExperience || 0,
            licenseNumber: doctor.doctorInfo?.licenseNumber,
            licenseState: doctor.doctorInfo?.licenseState,
            licenseExpirationDate: doctor.doctorInfo?.licenseExpirationDate,

            // Status information
            approvalStatus: doctor.doctorInfo?.approvalStatus || 'pending_review',
            isAcceptingPatients: doctor.doctorInfo?.isAcceptingPatients !== false, // Default to true
            status: isOnline ? 'online' : 'offline',
            lastLoginAt: doctor.lastLoginAt,

            // Statistics
            patientCount: uniquePatients.length,
            totalAppointments: totalAppointments,

            // Additional info
            joinDate: doctor.createdAt,
            applicationSubmittedAt: doctor.doctorInfo?.applicationSubmittedAt,
            applicationDocuments: doctor.doctorInfo?.applicationDocuments || [],

            // Education & Practice
            medicalSchool: doctor.doctorInfo?.medicalSchool,
            residency: doctor.doctorInfo?.residency,
            fellowship: doctor.doctorInfo?.fellowship,
            graduationYear: doctor.doctorInfo?.graduationYear,
            telemedicineExperience: doctor.doctorInfo?.telemedicineExperience,
            officeAddress: doctor.doctorInfo?.officeAddress
          };
        } catch (error) {
          console.error(`Error processing doctor ${doctor._id}:`, error);
          return {
            id: doctor._id,
            name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
            email: doctor.email,
            specialty: doctor.doctorInfo?.specialization || 'Not specified',
            approvalStatus: doctor.doctorInfo?.approvalStatus || 'pending_review',
            patientCount: 0,
            totalAppointments: 0,
            status: 'offline',
            error: 'Failed to load statistics'
          };
        }
      })
    );

    const total = await User.countDocuments(query);

    console.log(`✅ Fetched ${doctorsWithStats.length} doctors with statistics`);

    res.json({
      success: true,
      doctors: doctorsWithStats,
      pagination: {
        current: parseInt(page),
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

    // Get doctor approval statistics
    const pendingDoctors = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'pending_review'
    });
    const approvedDoctors = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'approved'
    });
    const rejectedDoctors = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'rejected'
    });

    // Get active providers (doctors with isAcceptingPatients: true)
    const activeProviders = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.isAcceptingPatients': true
    });

    // Get online doctors with proper logout handling
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get all approved doctors and check their online status
    const approvedDoctorsList = await User.find({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'approved'
    });

    const onlineDoctors = approvedDoctorsList.filter(doctor => {
      if (doctor.lastLoginAt && doctor.lastLoginAt > thirtyMinutesAgo) {
        if (doctor.lastLogoutAt) {
          if (doctor.lastLoginAt > doctor.lastLogoutAt) {
            return true; // Login is more recent than logout
          } else {
            return doctor.lastLogoutAt > fiveMinutesAgo; // 5-minute grace period after logout
          }
        } else {
          return true; // No logout time recorded
        }
      }
      return false;
    }).length;

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
          totalProviders: totalDoctors, // Total providers (doctors)
          activeProviders, // Active providers (isAcceptingPatients: true)
          totalAdmins,
          pendingDoctors,
          approvedDoctors,
          rejectedDoctors,
          onlineDoctors,
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
        doctorStats: {
          total: totalDoctors,
          approved: approvedDoctors,
          pending: pendingDoctors,
          rejected: rejectedDoctors,
          active: activeProviders,
          online: onlineDoctors,
          approvalRate: totalDoctors > 0 ? Math.round((approvedDoctors / totalDoctors) * 100) : 0
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
    console.log('🎯 approveAppointment function called');
    console.log('📋 Request params:', req.params);
    console.log('👤 Admin user:', req.adminUser);

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

/**
 * @desc    Approve doctor registration
 * @route   POST /api/admin/doctors/:doctorId/approve
 * @access  Private (Admin only)
 */
const approveDoctorRegistration = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { adminNotes } = req.body;

    console.log(`📋 Admin approving doctor: ${doctorId}`);

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update approval status
    doctor.doctorInfo.approvalStatus = 'approved';
    doctor.doctorInfo.approvedAt = new Date();
    doctor.doctorInfo.approvedBy = req.user.id;
    if (adminNotes) {
      doctor.doctorInfo.adminNotes = adminNotes;
    }

    await doctor.save();

    console.log(`✅ Doctor ${doctorId} approved successfully`);

    res.json({
      success: true,
      message: 'Doctor registration approved successfully',
      doctor: {
        id: doctor._id,
        name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        approvalStatus: doctor.doctorInfo.approvalStatus,
        approvedAt: doctor.doctorInfo.approvedAt
      }
    });

  } catch (error) {
    console.error('❌ Error approving doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Reject doctor registration
 * @route   POST /api/admin/doctors/:doctorId/reject
 * @access  Private (Admin only)
 */
const rejectDoctorRegistration = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason, adminNotes } = req.body;

    console.log(`📋 Admin rejecting doctor: ${doctorId}`);

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update approval status
    doctor.doctorInfo.approvalStatus = 'rejected';
    doctor.doctorInfo.rejectedAt = new Date();
    doctor.doctorInfo.rejectedBy = req.user.id;
    doctor.doctorInfo.rejectionReason = reason;
    if (adminNotes) {
      doctor.doctorInfo.adminNotes = adminNotes;
    }

    await doctor.save();

    console.log(`❌ Doctor ${doctorId} rejected: ${reason}`);

    res.json({
      success: true,
      message: 'Doctor registration rejected',
      doctor: {
        id: doctor._id,
        name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        approvalStatus: doctor.doctorInfo.approvalStatus,
        rejectedAt: doctor.doctorInfo.rejectedAt,
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('❌ Error rejecting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update doctor approval status (general function)
 * @route   PUT /api/admin/doctors/:doctorId/approval-status
 * @access  Private (Admin only)
 */
const updateDoctorApprovalStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, reason, adminNotes } = req.body;

    console.log(`📋 Admin updating doctor ${doctorId} status to: ${status}`);

    if (!['approved', 'rejected', 'pending_review', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status'
      });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update approval status
    const previousStatus = doctor.doctorInfo.approvalStatus;
    doctor.doctorInfo.approvalStatus = status;
    doctor.doctorInfo.lastStatusUpdate = new Date();
    doctor.doctorInfo.lastUpdatedBy = req.user.id;

    if (status === 'approved') {
      doctor.doctorInfo.approvedAt = new Date();
      doctor.doctorInfo.approvedBy = req.user.id;
    } else if (status === 'rejected') {
      doctor.doctorInfo.rejectedAt = new Date();
      doctor.doctorInfo.rejectedBy = req.user.id;
      if (reason) doctor.doctorInfo.rejectionReason = reason;
    }

    if (adminNotes) {
      doctor.doctorInfo.adminNotes = adminNotes;
    }

    await doctor.save();

    console.log(`✅ Doctor ${doctorId} status updated: ${previousStatus} → ${status}`);

    res.json({
      success: true,
      message: `Doctor status updated to ${status}`,
      doctor: {
        id: doctor._id,
        name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        previousStatus,
        currentStatus: status,
        updatedAt: doctor.doctorInfo.lastStatusUpdate
      }
    });

  } catch (error) {
    console.error('❌ Error updating doctor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get pending doctors for approval
 * @route   GET /api/admin/doctors/pending
 * @access  Private (Admin only)
 */
const getPendingDoctors = async (req, res) => {
  try {
    console.log('📋 Admin fetching pending doctors');

    const pendingDoctors = await User.find({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'pending_review'
    })
    .select('-passwordHash')
    .sort({ 'doctorInfo.applicationSubmittedAt': 1 }); // Oldest first

    const doctorsWithDetails = pendingDoctors.map(doctor => ({
      id: doctor._id,
      name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialty: doctor.doctorInfo?.specialization,
      licenseNumber: doctor.doctorInfo?.licenseNumber,
      applicationSubmittedAt: doctor.doctorInfo?.applicationSubmittedAt,
      documentsCount: doctor.doctorInfo?.applicationDocuments?.length || 0,
      applicationDocuments: doctor.doctorInfo?.applicationDocuments || []
    }));

    console.log(`✅ Found ${doctorsWithDetails.length} pending doctors`);

    res.json({
      success: true,
      pendingDoctors: doctorsWithDetails,
      count: doctorsWithDetails.length
    });

  } catch (error) {
    console.error('❌ Error fetching pending doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get detailed doctor information
 * @route   GET /api/admin/doctors/:doctorId
 * @access  Private (Admin only)
 */
const getDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log(`📋 Admin fetching details for doctor: ${doctorId}`);

    const doctor = await User.findById(doctorId).select('-passwordHash');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get appointment statistics
    const Appointment = require('../models/Appointment');
    const uniquePatients = await Appointment.distinct('userId', {
      $or: [
        { providerId: doctor._id.toString() }, // providerId is stored as string
        { providerName: { $regex: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`, $options: 'i' } }
      ]
    });

    const totalAppointments = await Appointment.countDocuments({
      $or: [
        { providerId: doctor._id.toString() }, // providerId is stored as string
        { providerName: { $regex: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`, $options: 'i' } }
      ]
    });

    const doctorDetails = {
      // Basic Information
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      gender: doctor.gender,

      // Professional Information
      specialty: doctor.doctorInfo?.specialization,
      subSpecialty: doctor.doctorInfo?.subSpecialty,
      experience: doctor.doctorInfo?.yearsOfExperience,
      licenseNumber: doctor.doctorInfo?.licenseNumber,
      licenseState: doctor.doctorInfo?.licenseState,
      licenseExpirationDate: doctor.doctorInfo?.licenseExpirationDate,

      // Education & Training
      medicalSchool: doctor.doctorInfo?.medicalSchool,
      residency: doctor.doctorInfo?.residency,
      fellowship: doctor.doctorInfo?.fellowship,
      graduationYear: doctor.doctorInfo?.graduationYear,

      // Practice Information
      officeAddress: doctor.doctorInfo?.officeAddress,
      telemedicineExperience: doctor.doctorInfo?.telemedicineExperience,
      isAcceptingPatients: doctor.doctorInfo?.isAcceptingPatients,

      // Application Status
      approvalStatus: doctor.doctorInfo?.approvalStatus,
      applicationSubmittedAt: doctor.doctorInfo?.applicationSubmittedAt,
      approvedAt: doctor.doctorInfo?.approvedAt,
      rejectedAt: doctor.doctorInfo?.rejectedAt,
      rejectionReason: doctor.doctorInfo?.rejectionReason,
      adminNotes: doctor.doctorInfo?.adminNotes,

      // Documents
      applicationDocuments: doctor.doctorInfo?.applicationDocuments || [],

      // Statistics
      patientCount: uniquePatients.length,
      totalAppointments: totalAppointments,

      // Account Information
      joinDate: doctor.createdAt,
      lastLoginAt: doctor.lastLoginAt,
      lastLogoutAt: doctor.lastLogoutAt,
      isOnline: (() => {
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        if (doctor.lastLoginAt && doctor.lastLoginAt > thirtyMinutesAgo) {
          if (doctor.lastLogoutAt) {
            if (doctor.lastLoginAt > doctor.lastLogoutAt) {
              return true; // Login is more recent than logout
            } else {
              return doctor.lastLogoutAt > fiveMinutesAgo; // 5-minute grace period after logout
            }
          } else {
            return true; // No logout time recorded
          }
        }
        return false;
      })()
    };

    console.log(`✅ Fetched details for doctor: ${doctor.firstName} ${doctor.lastName}`);

    res.json({
      success: true,
      doctor: doctorDetails
    });

  } catch (error) {
    console.error('❌ Error fetching doctor details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update doctor availability status
 * @route   PUT /api/admin/doctors/:doctorId/availability
 * @access  Private (Admin only)
 */
const updateDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isAcceptingPatients } = req.body;

    console.log(`📋 Admin updating doctor ${doctorId} availability to: ${isAcceptingPatients}`);

    if (typeof isAcceptingPatients !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAcceptingPatients must be a boolean value'
      });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update availability status
    doctor.doctorInfo.isAcceptingPatients = isAcceptingPatients;
    doctor.doctorInfo.availabilityUpdatedAt = new Date();
    doctor.doctorInfo.availabilityUpdatedBy = req.user.id;

    await doctor.save();

    console.log(`✅ Doctor ${doctorId} availability updated: ${isAcceptingPatients ? 'Accepting' : 'Not Accepting'} patients`);

    res.json({
      success: true,
      message: `Doctor availability updated to ${isAcceptingPatients ? 'accepting' : 'not accepting'} patients`,
      doctor: {
        id: doctor._id,
        name: `${doctor.doctorInfo?.title || 'Dr.'} ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        isAcceptingPatients: doctor.doctorInfo.isAcceptingPatients,
        updatedAt: doctor.doctorInfo.availabilityUpdatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  approveDoctorRegistration,
  rejectDoctorRegistration,
  updateDoctorApprovalStatus,
  getPendingDoctors,
  getDoctorDetails,
  updateDoctorAvailability,
  deleteDoctorAccount: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemStats: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getUserAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getHealthDataAnalytics: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemHealth: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  performSystemBackup: (req, res) => res.status(501).json({ message: 'Not implemented yet' }),
  getSystemLogs: (req, res) => res.status(501).json({ message: 'Not implemented yet' })
};
