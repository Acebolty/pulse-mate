"use client"

import { useState, useEffect } from "react" // Added useEffect
import api from '../services/api'; // Import API service
import { useNavigate } from 'react-router-dom'; // For potential redirects
import { logout } from '../services/authService'; // Import logout function
import {
  BellIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"





// Default structure for health monitoring settings
const initialSettingsData = {
  // These directly map to the `settings` object in the User model
  notifications: {
    emailNotifications: true,
    appointmentReminders: true,
    healthAlerts: true,
    messageNotifications: true,
    weeklyHealthSummary: true,
    healthTaskReminders: false,
  },
  security: { // Some basic security flags
  }
};


const Settings = () => {
  const [activeTab, setActiveTab] = useState("notifications") // Default to notifications
  const [settingsData, setSettingsData] = useState(initialSettingsData); // Renamed from 'settings' to avoid conflict
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Handle sign out
  const handleSignOut = () => {
    logout(navigate);
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/profile/me'); // Fetches the whole user object
        const userData = response.data;
        setSettingsData({ // Populate state from fetched user data
          // Populate settings directly from userData.settings
          notifications: userData.settings?.notifications || initialSettingsData.notifications,
          security: userData.settings?.security || initialSettingsData.security,
        });
        setError('');
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings.");
        if (err.response && err.response.status === 401) {
          // navigate('/login'); // Optional: redirect if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserSettings();
  }, [navigate]);


  const tabs = [
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: KeyIcon },
  ]

  // Updated to work with settingsData and its structure
  const handleSettingChange = (section, key, value) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
    setSuccessMessage('');
    setError('');
  };





  // Change Password Handlers
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess('');
      }, 2000);

    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleTestWeeklySummary = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/email-test/send-weekly-summary');

      if (response.data.success) {
        setSuccessMessage('Weekly health summary email sent successfully! Check your inbox.');
        if (response.data.previewUrl) {
          console.log('Email preview URL:', response.data.previewUrl);
        }
      } else {
        setError('Failed to send weekly summary: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error sending weekly summary:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send weekly summary. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Clear messages after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
    }
  };







  const saveSettings = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      // Construct payload: send settings (removed health settings)
      // Profile information is handled by ProfileNew.jsx page
      const payload = {
        // Settings object
        settings: {
          privacy: settingsData.privacy,
          notifications: settingsData.notifications,
          appearance: settingsData.appearance,
          security: settingsData.security,
        }
      };
      
      // If your backend expects timezone/language under user.settings.profile, adjust payload like so:
      // if (!payload.settings.profile) payload.settings.profile = {};
      // payload.settings.profile.timezone = settingsData.profile.timezone;
      // payload.settings.profile.language = settingsData.profile.language;


      const response = await api.put('/profile/me', payload); // Using the same endpoint
      
      // Update state with response data to ensure consistency
      const userData = response.data;
      setSettingsData({
        privacy: userData.settings?.privacy || initialSettingsData.privacy,
        notifications: userData.settings?.notifications || initialSettingsData.notifications,
        appearance: userData.settings?.appearance || initialSettingsData.appearance,
        security: userData.settings?.security || initialSettingsData.security,
      });

      setSuccessMessage('Settings saved successfully!');
      setHasUnsavedChanges(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error("Error saving settings:", err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          "Failed to save settings. Please try again.";
      setError(errorMessage);

      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  const resetSettings = () => { // This should ideally re-fetch or reset to last saved state from API
    // For simplicity now, it resets to initial structure, but might not reflect last saved state.
    // A better reset would re-trigger fetchUserSettings() or store the initial fetched data separately.
    setSettingsData(initialSettingsData); 
    setHasUnsavedChanges(false);
    setError('');
    setSuccessMessage('');
    setValidationErrors({});
    // To truly reset to last saved state, you'd call fetchUserSettings() again.
    // For now, let's just clear unsaved changes flag and reset to component's initial defaults.
  }







  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Health Monitoring Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">Configure your health monitoring preferences, privacy controls, and notification settings</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0">
            <button
              onClick={resetSettings}
              disabled={loading}
              className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-700/30 border border-yellow-200 dark:border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">You have unsaved changes. Don't forget to save your settings.</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-700/30 border border-green-200 dark:border-green-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-700/30 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto"> {/* Moved overflow-x-auto here */}
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-2 sm:px-4 md:px-6 whitespace-nowrap"> {/* Added whitespace-nowrap and responsive spacing/padding */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {/* Icon color will inherit from text color */}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">




          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Notification Preferences</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Email Notifications */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Email Notifications</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Health Monitoring Alerts</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Critical Health Alerts */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Critical Health Alerts</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Immediate alerts for dangerous readings (cannot be disabled)</p>
                    </div>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                      Always On
                    </div>
                  </div>

                  {/* Threshold Alerts */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Threshold Alerts</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Alerts when readings exceed your target ranges</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.healthAlerts}
                        onChange={(e) => handleSettingChange("notifications", "healthAlerts", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Weekly Health Summary Emails */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Weekly Health Summary Emails</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Receive weekly email summaries of your health metrics and progress</p>
                      {settingsData.notifications.weeklyHealthSummary && (
                        <button
                          onClick={handleTestWeeklySummary}
                          disabled={loading}
                          className="mt-2 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                        >
                          Send Test Summary
                        </button>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.weeklyHealthSummary || false}
                        onChange={(e) => handleSettingChange("notifications", "weeklyHealthSummary", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>


                </div>
              </div>




            </div>
          )}





          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">


              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Password & Authentication</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Change Password</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">Update your account password</p>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0 self-end sm:self-auto">Change</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6">
          <div className="flex justify-start">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 text-sm sm:px-4 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Change Password</h3>
                <button
                  onClick={handleClosePasswordModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.currentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      {showPasswords.currentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      {showPasswords.newPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      {showPasswords.confirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {passwordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Settings
