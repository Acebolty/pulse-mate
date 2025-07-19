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
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<object>} Pending appointments data
 */
export const getPendingAppointments = async (page = 1, limit = 15) => {
  try {
    const response = await api.get(`/admin/appointments/pending?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending appointments:', error);
    throw error;
  }
};

/**
 * Get all past appointments for history view
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} status - Filter by status (optional)
 * @param {string} search - Search term (optional)
 * @returns {Promise<object>} Past appointments data
 */
export const getPastAppointments = async (page = 1, limit = 15, status = 'all', search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/admin/appointments/history?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching past appointments:', error);
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

/**
 * Update doctor approval status (general function)
 * @param {string} doctorId - Doctor ID
 * @param {string} status - New approval status (approved, rejected, pending_review, suspended)
 * @param {string} reason - Reason for status change (optional)
 * @param {string} adminNotes - Admin notes (optional)
 * @returns {Promise<object>} Update result
 */
export const updateDoctorApprovalStatus = async (doctorId, status, reason = '', adminNotes = '') => {
  try {
    const response = await api.put(`/admin/doctors/${doctorId}/approval-status`, {
      status,
      reason,
      adminNotes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating doctor approval status:', error);
    throw error;
  }
};

/**
 * Get detailed doctor information
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<object>} Detailed doctor data
 */
export const getDoctorDetails = async (doctorId) => {
  try {
    const response = await api.get(`/admin/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    throw error;
  }
};

/**
 * Update doctor availability status
 * @param {string} doctorId - Doctor ID
 * @param {boolean} isAcceptingPatients - Availability status
 * @returns {Promise<object>} Update result
 */
export const updateDoctorAvailability = async (doctorId, isAcceptingPatients) => {
  try {
    const response = await api.put(`/admin/doctors/${doctorId}/availability`, {
      isAcceptingPatients
    });
    return response.data;
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    throw error;
  }
};

/**
 * Delete doctor account
 * @param {string} doctorId - Doctor ID to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteDoctorAccount = async (doctorId) => {
  try {
    const response = await api.delete(`/admin/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting doctor account:', error);
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
 * Get recent system activities
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<object>} Recent activities data
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await api.get('/admin/analytics/recent-activities', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
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
