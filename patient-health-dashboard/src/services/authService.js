import api from './api';

/**
 * Logs the user out by clearing stored authentication data and updating server.
 */
export const logout = async (navigate) => {
  try {
    // Call backend logout endpoint to update lastLogoutAt timestamp
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue with logout even if server call fails
  }

  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');

  // Dispatch a custom event to notify other parts of the app about the auth change
  // This is a simple way; a dedicated state management (Context, Redux, Zustand) is better for complex apps.
  window.dispatchEvent(new Event("authChange"));

  // Redirect to login page
  if (navigate) {
    navigate('/login');
  } else {
    // Fallback if navigate function isn't passed (e.g. called from outside a component)
    window.location.href = '/login';
  }
};

/**
 * Checks if a user is currently authenticated.
 * @returns {boolean} True if an auth token exists, false otherwise.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Gets the stored auth token.
 * @returns {string|null} The auth token or null if not found.
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Gets the stored user information.
 * @returns {object|null} The user object or null if not found/parsable.
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('authUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing authUser from localStorage", e);
      return null;
    }
  }
  return null;
};
