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
  updateDoctorApprovalStatus,
  getPendingDoctors,
  getDoctorDetails,
  updateDoctorAvailability,
  deleteDoctorAccount,

  // Appointment approval controllers
  getPendingAppointments,
  getPastAppointments,
  approveAppointment,
  rejectAppointment,
  
  // System analytics controllers
  getDashboardOverview,
  getRecentActivities,
  getSystemStats,
  getUserAnalytics,
  getHealthDataAnalytics,
  
  // System management controllers
  getSystemHealth,
  performSystemBackup,
  getSystemLogs,

  // Debug controllers
  debugHealthData
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

// Test route to verify patient routes are working
router.get('/patients/test', (req, res) => {
  console.log('🧪 Test route called');
  res.json({ message: 'Patient routes are working!' });
});

// Debug route to check health data
router.get('/debug-health', debugHealthData);

// @route   GET /api/admin/patients/:patientId
// @desc    Get detailed patient information for admin
// @access  Private (Admin only)
router.get('/patients/:patientId', authMiddleware, adminMiddleware, require('../controllers/adminController').getPatientDetails);

// @route   GET /api/admin/patients/:patientId/health-data
// @desc    Get patient health data for admin
// @access  Private (Admin only)
router.get('/patients/:patientId/health-data', authMiddleware, adminMiddleware, require('../controllers/adminController').getPatientHealthData);

// @route   GET /api/admin/patients/:patientId/alerts
// @desc    Get patient alerts for admin
// @access  Private (Admin only)
router.get('/patients/:patientId/alerts', authMiddleware, adminMiddleware, require('../controllers/adminController').getPatientAlerts);

// @route   DELETE /api/admin/patients/:patientId
// @desc    Delete patient account and all associated data
// @access  Private (Admin only)
router.delete('/patients/:patientId', (req, res, next) => {
  console.log('🗑️ DELETE /api/admin/patients/:patientId route called with patientId:', req.params.patientId);
  next();
}, authMiddleware, adminMiddleware, deleteUser);

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

// @route   PUT /api/admin/doctors/:doctorId/approval-status
// @desc    Update doctor approval status (general)
// @access  Private (Admin only)
router.put('/doctors/:doctorId/approval-status', authMiddleware, adminMiddleware, updateDoctorApprovalStatus);

// @route   GET /api/admin/doctors/:doctorId
// @desc    Get detailed doctor information
// @access  Private (Admin only)
router.get('/doctors/:doctorId', authMiddleware, adminMiddleware, getDoctorDetails);

// @route   PUT /api/admin/doctors/:doctorId/availability
// @desc    Update doctor availability status
// @access  Private (Admin only)
router.put('/doctors/:doctorId/availability', authMiddleware, adminMiddleware, updateDoctorAvailability);

// @route   DELETE /api/admin/doctors/:doctorId
// @desc    Delete doctor account
// @access  Private (Admin only)
router.delete('/doctors/:doctorId', authMiddleware, adminMiddleware, deleteDoctorAccount);

// ==========================================
// APPOINTMENT APPROVAL ROUTES
// ==========================================

// @route   GET /api/admin/appointments/pending
// @desc    Get all pending appointments for approval
// @access  Private (Admin only)
router.get('/appointments/pending', authMiddleware, adminMiddleware, getPendingAppointments);

// @route   GET /api/admin/appointments/history
// @desc    Get all past appointments (approved/cancelled/completed) for admin history
// @access  Private (Admin only)
router.get('/appointments/history', authMiddleware, adminMiddleware, getPastAppointments);

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ message: 'Admin routes are working!' });
});

// @route   POST /api/admin/appointments/:appointmentId/approve
// @desc    Approve an appointment and create chat room
// @access  Private (Admin only)
router.post('/appointments/:appointmentId/approve', authMiddleware, adminMiddleware, approveAppointment);
console.log('📋 Registered route: POST /api/admin/appointments/:appointmentId/approve');

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

// @route   GET /api/admin/analytics/recent-activities
// @desc    Get recent system activities for dashboard
// @access  Private (Admin only)
router.get('/analytics/recent-activities', authMiddleware, adminMiddleware, getRecentActivities);

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
