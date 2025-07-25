const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  // In a real app, you might want to prevent the app from starting or throw a more specific error.
  // For now, this will cause JWT operations to fail if not set.
  // Consider process.exit(1) in server.js if critical env vars are missing.
}

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address, // Expects an object
      emergencyContact, // Expects an object
      medicalInfo, // Medical information object
      // Doctor-specific fields
      userType,
      specialization,
      licenseNumber
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide first name, last name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Build user data based on user type
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      dateOfBirth,
      gender,
      address, // Mongoose will use subschema defaults if parts are missing
      emergencyContact, // Mongoose will use subschema defaults if parts are missing
      medicalInfo, // Medical information from sign-up form
      // Settings will be initialized by the pre-save hook in User.js
    };

    // Add doctor-specific fields if this is a doctor registration
    if (userType === 'doctor') {
      console.log('👨‍⚕️ Creating doctor account with specialty:', specialization);
      userData.role = 'doctor';
      userData.doctorInfo = {
        specialty: specialization,
        licenseNumber: licenseNumber,
        approvalStatus: 'pending' // Doctors need admin approval
      };
    }

    const newUser = new User(userData);

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully!',
      userId: newUser._id 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message
    }

    // Check if doctor is approved (only for doctors)
    if (user.role === 'doctor') {
      const approvalStatus = user.doctorInfo?.approvalStatus;

      if (!approvalStatus || approvalStatus === 'pending_review' || approvalStatus === 'rejected') {
        console.log(`🚫 Doctor login blocked - Status: ${approvalStatus}`, {
          email: user.email,
          status: approvalStatus
        });

        return res.status(403).json({
          message: 'Your doctor account is pending approval. Please wait for admin verification.',
          status: approvalStatus || 'pending_review',
          accountType: 'doctor_pending'
        });
      }

      if (approvalStatus !== 'approved') {
        console.log(`🚫 Doctor login blocked - Invalid status: ${approvalStatus}`, {
          email: user.email,
          status: approvalStatus
        });

        return res.status(403).json({
          message: 'Your doctor account access has been restricted. Please contact support.',
          status: approvalStatus,
          accountType: 'doctor_restricted'
        });
      }

      console.log('✅ Approved doctor login successful:', {
        email: user.email,
        status: approvalStatus
      });
    }

    // Update last login time for online/offline tracking
    user.lastLoginAt = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { // Send back some user info for the frontend
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            approvalStatus: user.role === 'doctor' ? user.doctorInfo?.approvalStatus : null
          }
        });
      }
    );

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Register a new doctor with comprehensive verification
// @route   POST /api/auth/doctor-signup
// @access  Public
const doctorSignup = async (req, res) => {
  try {
    const {
      // Personal Information
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,

      // Professional Credentials
      title,
      licenseNumber,
      licenseState,
      licenseExpirationDate,
      deaNumber,
      npiNumber,
      specialization,
      subSpecialty,
      yearsOfExperience,

      // Practice & Education
      medicalSchool,
      residency,
      fellowship,
      graduationYear,
      affiliatedHospitals,
      officeAddress,
      telemedicineExperience,
      malpracticeInsuranceProvider,
      malpracticeInsuranceExpiration,

      // References
      references,

      // Documents
      applicationDocuments
    } = req.body;

    console.log('📋 Doctor registration attempt:', { email, firstName, lastName, specialization });

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required personal information' });
    }

    if (!licenseNumber || !licenseState || !specialization) {
      return res.status(400).json({ message: 'Please provide all required professional credentials' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new doctor user
    const newDoctor = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      phone: phone?.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      role: 'doctor',
      doctorInfo: {
        title: title?.trim() || 'Dr.',
        licenseNumber: licenseNumber?.trim(),
        licenseState: licenseState?.trim(),
        licenseExpirationDate: licenseExpirationDate ? new Date(licenseExpirationDate) : undefined,
        specialization: specialization?.trim(),
        subSpecialty: subSpecialty?.trim(),
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        medicalSchool: medicalSchool?.trim(),
        residency: residency?.trim(),
        fellowship: fellowship?.trim(),
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        affiliatedHospitals: affiliatedHospitals?.filter(h => h?.trim()) || [],
        officeAddress: officeAddress?.trim(),
        telemedicineExperience: telemedicineExperience?.trim(),
        references: references?.filter(ref => ref?.name?.trim()) || [],
        applicationDocuments: applicationDocuments || [],
        approvalStatus: 'pending_review',
        applicationSubmittedAt: new Date()
      }
    });

    await newDoctor.save();

    console.log('✅ Doctor registration successful:', {
      id: newDoctor._id,
      email: newDoctor.email,
      status: newDoctor.doctorInfo.approvalStatus
    });

    res.status(201).json({
      message: 'Doctor registration submitted successfully! Your application is under review.',
      doctorId: newDoctor._id,
      status: newDoctor.doctorInfo.approvalStatus,
      email: newDoctor.email
    });

  } catch (error) {
    console.error('❌ Doctor registration error:', error);
    res.status(500).json({
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user and update last logout time
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (userId) {
      // Update last logout timestamp for online/offline status tracking
      await User.findByIdAndUpdate(userId, {
        lastLogoutAt: new Date()
      });

      console.log(`✅ User ${userId} logged out successfully`);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide both current and new password.'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await User.findByIdAndUpdate(req.user.id, {
      passwordHash: newPasswordHash
    });

    console.log(`✅ Password changed successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error while changing password.'
    });
  }
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      email: email.toLowerCase(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };

    otpStore.set(email.toLowerCase(), otpData);

    // Send OTP via email
    const emailResult = await emailService.sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    console.log(`📧 OTP sent to ${email}: ${otp}`); // Remove in production

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedOtpData = otpStore.get(email.toLowerCase());

    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check attempts limit
    if (storedOtpData.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP' });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      otpStore.set(email.toLowerCase(), storedOtpData);
      return res.status(400).json({
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedOtpData.attempts
      });
    }

    // OTP is valid - remove from store
    otpStore.delete(email.toLowerCase());

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  doctorSignup,
  logoutUser,
  changePassword,
  sendOTP,
  verifyOTP
};
