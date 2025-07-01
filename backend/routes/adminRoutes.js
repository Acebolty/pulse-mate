const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  // Auth controllers
  adminLogin,
  
  // User management controllers
  getAllUsers,
  getAllPatients,
  getAllDoctors,
  updateUserStatus,
  deleteUser,
  
  // Doctor approval controllers
  approveDoctorRegistration,
  rejectDoctorRegistration,
  getPendingDoctors,

  // Appointment approval controllers
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  
  // System analytics controllers
  getDashboardOverview,
  getSystemStats,
  getUserAnalytics,
  getHealthDataAnalytics,
  
  // System management controllers
  getSystemHealth,
  performSystemBackup,
  getSystemLogs
} = require('../controllers/adminController');

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

// @route   POST /api/admin/auth/login
// @desc    Admin login
// @access  Public
router.post('/auth/login', adminLogin);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

// @route   GET /api/admin/patients
// @desc    Get all patients with health data
// @access  Private (Admin only)
router.get('/patients', authMiddleware, adminMiddleware, getAllPatients);

// @route   GET /api/admin/doctors
// @desc    Get all doctors with approval status
// @access  Private (Admin only)
router.get('/doctors', authMiddleware, adminMiddleware, getAllDoctors);

// @route   PUT /api/admin/users/:userId/status
// @desc    Update user status (active/inactive)
// @access  Private (Admin only)
router.put('/users/:userId/status', authMiddleware, adminMiddleware, updateUserStatus);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user account
// @access  Private (Admin only)
router.delete('/users/:userId', authMiddleware, adminMiddleware, deleteUser);

// ==========================================
// DOCTOR APPROVAL ROUTES
// ==========================================

// @route   GET /api/admin/doctors/pending
// @desc    Get all pending doctor registrations
// @access  Private (Admin only)
router.get('/doctors/pending', authMiddleware, adminMiddleware, getPendingDoctors);

// @route   POST /api/admin/doctors/:doctorId/approve
// @desc    Approve doctor registration
// @access  Private (Admin only)
router.post('/doctors/:doctorId/approve', authMiddleware, adminMiddleware, approveDoctorRegistration);

// @route   POST /api/admin/doctors/:doctorId/reject
// @desc    Reject doctor registration
// @access  Private (Admin only)
router.post('/doctors/:doctorId/reject', authMiddleware, adminMiddleware, rejectDoctorRegistration);

// ==========================================
// APPOINTMENT APPROVAL ROUTES
// ==========================================

// @route   GET /api/admin/appointments/pending
// @desc    Get all pending appointments for approval
// @access  Private (Admin only)
router.get('/appointments/pending', authMiddleware, adminMiddleware, getPendingAppointments);

// @route   POST /api/admin/appointments/:appointmentId/approve
// @desc    Approve an appointment and create chat room
// @access  Private (Admin only)
router.post('/appointments/:appointmentId/approve', authMiddleware, adminMiddleware, approveAppointment);

// @route   POST /api/admin/appointments/:appointmentId/reject
// @desc    Reject an appointment
// @access  Private (Admin only)
router.post('/appointments/:appointmentId/reject', authMiddleware, adminMiddleware, rejectAppointment);

// ==========================================
// ANALYTICS & DASHBOARD ROUTES
// ==========================================

// @route   GET /api/admin/analytics/overview
// @desc    Get dashboard overview metrics
// @access  Private (Admin only)
router.get('/analytics/overview', authMiddleware, adminMiddleware, getDashboardOverview);

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics and statistics
// @access  Private (Admin only)
router.get('/analytics/users', authMiddleware, adminMiddleware, getUserAnalytics);

// @route   GET /api/admin/analytics/health-data
// @desc    Get health data analytics
// @access  Private (Admin only)
router.get('/analytics/health-data', authMiddleware, adminMiddleware, getHealthDataAnalytics);

// @route   GET /api/admin/system/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/system/stats', authMiddleware, adminMiddleware, getSystemStats);

// ==========================================
// SYSTEM MANAGEMENT ROUTES
// ==========================================

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private (Admin only)
router.get('/system/health', authMiddleware, adminMiddleware, getSystemHealth);

// @route   POST /api/admin/system/backup
// @desc    Trigger system backup
// @access  Private (Admin only)
router.post('/system/backup', authMiddleware, adminMiddleware, performSystemBackup);

// @route   GET /api/admin/system/logs
// @desc    Get system logs
// @access  Private (Admin only)
router.get('/system/logs', authMiddleware, adminMiddleware, getSystemLogs);

module.exports = router;
