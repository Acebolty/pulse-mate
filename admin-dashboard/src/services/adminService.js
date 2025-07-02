import api from './api';

/**
 * Admin API service functions
 * These functions handle all admin-related API calls
 */

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get all users with pagination and filters
 * @param {object} params - Query parameters (page, limit, search, role, status)
 * @returns {Promise<object>} Users data with pagination info
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get all patients with health data
 * @param {object} params - Query parameters (page, limit, search, healthStatus)
 * @returns {Promise<object>} Patients data with health information
 */
export const getAllPatients = async (params = {}) => {
  try {
    const response = await api.get('/admin/patients', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

/**
 * Get all doctors with approval status
 * @param {object} params - Query parameters (page, limit, search, approvalStatus, specialty)
 * @returns {Promise<object>} Doctors data with approval information
 */
export const getAllDoctors = async (params = {}) => {
  try {
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

/**
 * Update user status (active/inactive)
 * @param {string} userId - User ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated user data
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param {string} userId - User ID to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==========================================
// APPOINTMENT APPROVAL MANAGEMENT
// ==========================================

/**
 * Get all pending appointments for approval
 * @returns {Promise<object>} Pending appointments data
 */
export const getPendingAppointments = async () => {
  try {
    const response = await api.get('/admin/appointments/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending appointments:', error);
    throw error;
  }
};

/**
 * Approve an appointment
 * @param {string} appointmentId - Appointment ID to approve
 * @returns {Promise<object>} Approval result
 */
export const approveAppointment = async (appointmentId) => {
  try {
    // Temporary: Use appointment route instead of admin route
    const response = await api.post(`/appointments/${appointmentId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving appointment:', error);
    throw error;
  }
};

/**
 * Reject an appointment
 * @param {string} appointmentId - Appointment ID to reject
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<object>} Rejection result
 */
export const rejectAppointment = async (appointmentId, reason = '') => {
  try {
    const response = await api.post(`/admin/appointments/${appointmentId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    throw error;
  }
};

// ==========================================
// DOCTOR APPROVAL MANAGEMENT
// ==========================================

/**
 * Get all pending doctor registrations
 * @returns {Promise<object>} Pending doctors data
 */
export const getPendingDoctors = async () => {
  try {
    const response = await api.get('/admin/doctors/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    throw error;
  }
};

/**
 * Approve doctor registration
 * @param {string} doctorId - Doctor ID to approve
 * @returns {Promise<object>} Approval result
 */
export const approveDoctorRegistration = async (doctorId) => {
  try {
    const response = await api.post(`/admin/doctors/${doctorId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving doctor:', error);
    throw error;
  }
};

/**
 * Reject doctor registration
 * @param {string} doctorId - Doctor ID to reject
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<object>} Rejection result
 */
export const rejectDoctorRegistration = async (doctorId, reason = '') => {
  try {
    const response = await api.post(`/admin/doctors/${doctorId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    throw error;
  }
};

// ==========================================
// ANALYTICS & DASHBOARD
// ==========================================

/**
 * Get dashboard overview metrics
 * @returns {Promise<object>} Dashboard metrics data
 */
export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

/**
 * Get user analytics and statistics
 * @returns {Promise<object>} User analytics data
 */
export const getUserAnalytics = async () => {
  try {
    const response = await api.get('/admin/analytics/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

/**
 * Get health data analytics
 * @returns {Promise<object>} Health data analytics
 */
export const getHealthDataAnalytics = async () => {
  try {
    const response = await api.get('/admin/analytics/health-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching health data analytics:', error);
    throw error;
  }
};

/**
 * Get system statistics
 * @returns {Promise<object>} System stats data
 */
export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/system/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// ==========================================
// SYSTEM MANAGEMENT
// ==========================================

/**
 * Get system health status
 * @returns {Promise<object>} System health data
 */
export const getSystemHealth = async () => {
  try {
    const response = await api.get('/admin/system/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching system health:', error);
    throw error;
  }
};

/**
 * Trigger system backup
 * @returns {Promise<object>} Backup result
 */
export const performSystemBackup = async () => {
  try {
    const response = await api.post('/admin/system/backup');
    return response.data;
  } catch (error) {
    console.error('Error performing system backup:', error);
    throw error;
  }
};

/**
 * Get system logs
 * @param {object} params - Query parameters (page, limit, level)
 * @returns {Promise<object>} System logs data
 */
export const getSystemLogs = async (params = {}) => {
  try {
    const response = await api.get('/admin/system/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw error;
  }
};
