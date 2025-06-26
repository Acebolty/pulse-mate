"use client"

import { useState, useEffect } from "react" // Added useEffect
import api from '../services/api'; // Import API service
import { useNavigate } from 'react-router-dom'; // For potential redirects
import {
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline"





// Default structure for health monitoring settings
const initialSettingsData = {
  // These directly map to the `settings` object in the User model
  privacy: {
    profileVisibility: "healthcare-providers",
    dataSharing: true,
  },
  notifications: {
    emailNotifications: true,
    appointmentReminders: true,
    medicationReminders: true,
    healthAlerts: true,
    messageNotifications: true,
    weeklyHealthSummary: true,
    healthTaskReminders: false,
  },
  health: {
    providerAccess: {
      shareRealTimeData: false,
      shareHistoricalData: false,
      allowRemoteMonitoring: false,
      emergencyAccess: true,
    }
  },
  appearance: {
    theme: "system",
    fontSize: "medium",
    colorScheme: "green",
  },
  security: { // Some basic security flags
    sessionTimeout: "30-minutes",
    loginAlerts: true,
  }
};


const Settings = () => {
  const [activeTab, setActiveTab] = useState("notifications") // Default to notifications
  const [settingsData, setSettingsData] = useState(initialSettingsData); // Renamed from 'settings' to avoid conflict
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/profile/me'); // Fetches the whole user object
        const userData = response.data;
        setSettingsData({ // Populate state from fetched user data
          // Populate settings directly from userData.settings
          privacy: userData.settings?.privacy || initialSettingsData.privacy,
          notifications: userData.settings?.notifications || initialSettingsData.notifications,
          health: userData.settings?.health || initialSettingsData.health,
          appearance: userData.settings?.appearance || initialSettingsData.appearance,
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
    { id: "privacy", label: "Privacy & Data", icon: ShieldCheckIcon },
    { id: "security", label: "Security", icon: KeyIcon },
    { id: "appearance", label: "Appearance", icon: CogIcon },
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



  // Handle nested settings like health.emergencyContact.name
  const handleNestedSettingChange = (section, nestedKey, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...prev[section][nestedKey],
          [field]: value,
        },
      },
    }));
    setHasUnsavedChanges(true);
    setSuccessMessage('');
    setError('');
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

  const handleTestMedicationReminder = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/email-test/send-medication-reminder');

      if (response.data.success) {
        setSuccessMessage('Test medication reminder sent successfully! Check your inbox.');
        if (response.data.previewUrl) {
          console.log('Email preview URL:', response.data.previewUrl);
        }
      } else {
        setError('Failed to send medication reminder: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error sending medication reminder:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send medication reminder. Please try again.';
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

  const handleTestDailySummary = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/email-test/send-daily-medication-summary');

      if (response.data.success) {
        setSuccessMessage('Test daily medication summary sent successfully! Check your inbox.');
        if (response.data.previewUrl) {
          console.log('Email preview URL:', response.data.previewUrl);
        }
      } else {
        setError('Failed to send daily summary: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error sending daily summary:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send daily summary. Please try again.';
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

  const handleTestMedicationAlerts = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/email-test/generate-medication-alerts');

      if (response.data.success) {
        setSuccessMessage(`Generated ${response.data.alertsCreated} medication alerts! Check your dashboard and alerts page.`);
        // Trigger alert refresh in sidebar
        window.dispatchEvent(new CustomEvent('alertsGenerated'));
      } else {
        setError('Failed to generate medication alerts: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error generating medication alerts:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate medication alerts. Please try again.';
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





  // Handle data download
  const handleDownloadData = async () => {
    try {
      setLoading(true);

      // Fetch all user data
      const [profileRes, healthDataRes, alertsRes] = await Promise.allSettled([
        api.get('/profile/me'),
        api.get('/health-data'),
        api.get('/alerts')
      ]);

      const exportData = {
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
        healthData: healthDataRes.status === 'fulfilled' ? healthDataRes.value.data : [],
        alerts: alertsRes.status === 'fulfilled' ? alertsRes.value.data : [],
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('Health data exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error downloading data:', err);
      setError('Failed to export data. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

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


          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Healthcare Provider Access</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Real-time Data Sharing */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/20 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Real-time Data Sharing</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Allow providers to access your live health data for monitoring</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.health.providerAccess?.shareRealTimeData || false}
                        onChange={(e) => handleNestedSettingChange("health", "providerAccess", "shareRealTimeData", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Historical Data Sharing */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Historical Data Sharing</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Share your health history and trends with providers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.health.providerAccess?.shareHistoricalData || false}
                        onChange={(e) => handleNestedSettingChange("health", "providerAccess", "shareHistoricalData", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Remote Monitoring */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Remote Monitoring</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Allow providers to monitor your health remotely and receive alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.health.providerAccess?.allowRemoteMonitoring || false}
                        onChange={(e) => handleNestedSettingChange("health", "providerAccess", "allowRemoteMonitoring", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Emergency Access */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Emergency Access</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Allow emergency access to your health data in critical situations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.health.providerAccess?.emergencyAccess || false}
                        onChange={(e) => handleNestedSettingChange("health", "providerAccess", "emergencyAccess", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">General Privacy Settings</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Profile Visibility */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Profile Visibility</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Control who can see your profile information</p>
                    </div>
                    <select
                      value={settingsData.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange("privacy", "profileVisibility", e.target.value)}
                      className="w-full sm:w-auto mt-1 sm:mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="healthcare-providers">Healthcare Providers Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>


                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Download My Data</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">Get a copy of all your health data</p>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm">Export</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 border border-red-200 dark:border-red-500/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-700/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300">Delete My Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                      </div>
                      <span className="text-red-600 dark:text-red-400 text-sm">Delete</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Data Management</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Download Data */}
                  <div className="p-3 sm:p-4 border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Download My Health Data</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Export all your health data in JSON format</p>
                      </div>
                      <button
                        onClick={handleDownloadData}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download Data</span>
                      </button>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-3 sm:p-4 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Delete My Account</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Permanently delete your account and all associated data</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Healthcare Provider Notifications</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Provider Messages */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Provider Messages</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Messages and updates from your healthcare providers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.messageNotifications}
                        onChange={(e) => handleSettingChange("notifications", "messageNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Appointment Reminders */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Appointment Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Get reminded about upcoming appointments and consultations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.appointmentReminders}
                        onChange={(e) => handleSettingChange("notifications", "appointmentReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>


                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Medication & Treatment</h3>
                <div className="space-y-3 sm:space-y-4">
                  {/* Medication Reminders */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Medication Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Never miss your medication schedule</p>
                      {settingsData.notifications.medicationReminders && (
                        <div className="mt-2 space-x-2">
                          <button
                            onClick={handleTestMedicationReminder}
                            disabled={loading}
                            className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                          >
                            Test Email
                          </button>
                          <button
                            onClick={handleTestDailySummary}
                            disabled={loading}
                            className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                          >
                            Test Summary
                          </button>
                          <button
                            onClick={handleTestMedicationAlerts}
                            disabled={loading}
                            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            Test Alerts
                          </button>
                        </div>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.medicationReminders}
                        onChange={(e) => handleSettingChange("notifications", "medicationReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {/* Health Task Reminders */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Health Task Reminders</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Reminders to log daily health metrics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.healthTaskReminders || false}
                        onChange={(e) => handleSettingChange("notifications", "healthTaskReminders", e.target.checked)}
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Account Security</h3>
                <div className="space-y-3 sm:space-y-4">


                  {/* Session Timeout */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Session Timeout</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Automatically log out after inactivity</p>
                    </div>
                    <select
                      value={settingsData.security.sessionTimeout}
                      onChange={(e) => handleSettingChange("security", "sessionTimeout", e.target.value)}
                      className="w-full sm:w-auto mt-1 sm:mt-0 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="15-minutes">15 minutes</option>
                      <option value="30-minutes">30 minutes</option>
                      <option value="1-hour">1 hour</option>
                      <option value="4-hours">4 hours</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  {/* Login Alerts */}
                  <div className="flex flex-col items-start space-y-2 p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-700/30 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Login Alerts</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1 sm:mt-0 self-end sm:self-center">
                      <input
                        type="checkbox"
                        checked={settingsData.security.loginAlerts}
                        onChange={(e) => handleSettingChange("security", "loginAlerts", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Password & Authentication</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Change Password</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">Update your account password</p>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0 self-end sm:self-auto">Change</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Login History</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-0">View recent login activity</p>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0 self-end sm:self-auto">View</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "light")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.theme === "light"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <SunIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-yellow-500 dark:text-yellow-400" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Light</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "dark")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.theme === "dark"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <MoonIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-gray-700 dark:text-slate-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Dark</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "theme", "system")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.theme === "system"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <ComputerDesktopIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-gray-700 dark:text-slate-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">System</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Font Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "small")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.fontSize === "small"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Small</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Compact view</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "medium")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.fontSize === "medium"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Medium</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Default size</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "fontSize", "large")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.fontSize === "large"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Large</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Easy reading</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "green")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.colorScheme === "green"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Green</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "blue")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.colorScheme === "blue"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Blue</p>
                  </button>
                  <button
                    onClick={() => handleSettingChange("appearance", "colorScheme", "purple")}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-colors text-center ${
                      settingsData.appearance.colorScheme === "purple"
                        ? "border-green-500 bg-green-50 dark:bg-green-700/20 dark:border-green-600"
                        : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-200">Purple</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 text-sm sm:px-4 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button className="px-3 py-2 text-sm sm:px-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-700/20 rounded-lg transition-colors">
                Delete Account
              </button>
              <button className="px-3 py-2 text-sm sm:px-4 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Delete Account</h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete:
            </p>

            <ul className="text-sm text-gray-600 dark:text-slate-400 mb-6 list-disc list-inside space-y-1">
              <li>All your health data and history</li>
              <li>Your profile and settings</li>
              <li>All appointments and messages</li>
              <li>All alerts and notifications</li>
            </ul>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle account deletion here
                  setShowDeleteModal(false);
                  setError('Account deletion is not implemented yet.');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
