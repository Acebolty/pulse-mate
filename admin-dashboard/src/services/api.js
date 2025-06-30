import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend API base URL
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors - clear token and redirect to login
      console.error('Unauthorized request - 401. Clearing token and redirecting to login.');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.dispatchEvent(new Event("adminAuthChange"));
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status === 403) {
      // Handle forbidden errors - user doesn't have admin privileges
      console.error('Forbidden request - 403. User does not have admin privileges.');
      alert('Access denied. Admin privileges required.');
    }
    return Promise.reject(error);
  }
);

export default api;
