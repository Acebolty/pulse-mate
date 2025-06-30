import api from './api';

/**
 * Checks if a user is currently authenticated as admin.
 * @returns {boolean} True if an admin auth token exists, false otherwise.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
}

/**
 * Logs in an admin user with email and password.
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<object>} Login result with success status and error message if failed
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/admin/auth/login', { email, password });

    if (response.data && response.data.success && response.data.token) {
      // Store the token and user info
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));

      // Dispatch event to notify other parts of the app about auth change
      window.dispatchEvent(new Event("adminAuthChange"));

      return { success: true };
    } else {
      return {
        success: false,
        error: response.data?.message || 'Login failed: No token received.'
      };
    }
  } catch (error) {
    console.error('Admin login error:', error);

    if (error.response && error.response.data && error.response.data.message) {
      return { success: false, error: error.response.data.message };
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'Cannot connect to server. Please make sure the backend is running on port 5000.'
      };
    } else {
      return { success: false, error: 'An error occurred during login' };
    }
  }
}

/**
 * Logs the admin user out by clearing stored authentication data.
 * @param {function} navigate - React Router navigate function
 */
export const logout = (navigate) => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');

  // Dispatch a custom event to notify other parts of the app about the auth change
  window.dispatchEvent(new Event("adminAuthChange"));

  // Redirect to login page
  if (navigate) {
    navigate('/login');
  } else {
    // Fallback if navigate function isn't passed
    window.location.href = '/login';
  }
}

/**
 * Gets the stored admin user information.
 * @returns {object|null} The admin user object or null if not found/parsable.
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('adminUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing adminUser from localStorage", e);
      return null;
    }
  }
  return null;
}

/**
 * Gets the stored admin auth token.
 * @returns {string|null} The admin auth token or null if not found.
 */
export const getToken = () => {
  return localStorage.getItem('adminToken');
}
