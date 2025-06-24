"use client"

import React, { useState, useEffect } from "react"
import api from '../services/api'
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  CalendarIcon,
  HeartIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BeakerIcon,
  FireIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"

// Default health targets
const defaultHealthTargets = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 }, unit: 'mmHg' },
  bodyTemperature: { min: 97.0, max: 99.5, unit: '°F' },
  glucoseLevel: { min: 70, max: 140, unit: 'mg/dL' },
  weight: { target: 175, unit: 'lbs' },
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // States for adding new medical info
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: ''
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    patientId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profilePicture: null,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    medicalInfo: {
      bloodType: "",
      height: "",
      weight: "",
      allergies: [],
      chronicConditions: [],
      medications: [],
      primaryDoctor: {
        name: "",
        specialty: "",
        phone: "",
        email: ""
      }
    }
  });

  // Health targets state
  const [healthTargets, setHealthTargets] = useState(defaultHealthTargets);

  // Recent health data state
  const [recentHealthData, setRecentHealthData] = useState({
    heartRate: [],
    bloodPressure: [],
    bodyTemperature: [],
    glucoseLevel: []
  });

  // Fetch profile data and recent health data
  useEffect(() => {
    const fetchProfileAndHealthData = async () => {
      try {
        setLoading(true);

        // Fetch profile data
        const profileResponse = await api.get('/profile/me');
        if (profileResponse.data) {
          const userData = profileResponse.data;

          // Address is handled as object structure to match backend schema

          setProfileData({
            patientId: userData.patientId || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : "",
            gender: userData.gender || "",
            profilePicture: userData.profilePicture || null,
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "USA"
            },
            emergencyContact: userData.emergencyContact || {
              name: "",
              relationship: "",
              phone: ""
            },
            medicalInfo: userData.medicalInfo || {
              bloodType: "",
              height: "",
              weight: "",
              allergies: [],
              chronicConditions: [],
              medications: [],
              primaryDoctor: {
                name: "",
                specialty: "",
                phone: "",
                email: ""
              }
            }
          });

          // Load health targets from backend or use defaults
          if (userData.healthTargets) {
            setHealthTargets(userData.healthTargets);
          }
        }

        // Fetch recent health data for health score calculation
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7); // Last 7 days

        const commonParams = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 10,
          sortBy: 'timestamp',
          order: 'desc'
        };

        // Fetch recent health data
        const [heartRateRes, bloodPressureRes, temperatureRes, glucoseRes] = await Promise.allSettled([
          api.get('/health-data', { params: { ...commonParams, dataType: 'heartRate' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'bloodPressure' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'bodyTemperature' } }),
          api.get('/health-data', { params: { ...commonParams, dataType: 'glucoseLevel' } })
        ]);

        setRecentHealthData({
          heartRate: heartRateRes.status === 'fulfilled' ? heartRateRes.value.data.data : [],
          bloodPressure: bloodPressureRes.status === 'fulfilled' ? bloodPressureRes.value.data.data : [],
          bodyTemperature: temperatureRes.status === 'fulfilled' ? temperatureRes.value.data.data : [],
          glucoseLevel: glucoseRes.status === 'fulfilled' ? glucoseRes.value.data.data : []
        });

        setError('');
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setError('Profile not found. Please contact support.');
        } else {
          setError('Failed to load profile and health data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHealthData();
  }, []);

  // Calculate health score based on recent data
  const calculateHealthScore = () => {
    let score = 100;
    let factors = [];

    // Check heart rate against user's targets (using most recent reading)
    if (recentHealthData.heartRate.length > 0) {
      const currentHR = recentHealthData.heartRate[0].value; // Most recent reading
      const hrMin = healthTargets.heartRate.min;
      const hrMax = healthTargets.heartRate.max;

      if (currentHR < hrMin - 10 || currentHR > hrMax + 20) {
        score -= 20;
        factors.push(`Heart rate (${currentHR} bpm) outside optimal range (${hrMin}-${hrMax} bpm)`);
      } else if (currentHR < hrMin || currentHR > hrMax) {
        score -= 10;
        factors.push(`Heart rate (${currentHR} bpm) outside target range (${hrMin}-${hrMax} bpm)`);
      }
    }

    // Check blood pressure against user's targets
    if (recentHealthData.bloodPressure.length > 0) {
      const latestBP = recentHealthData.bloodPressure[0];
      const systolic = typeof latestBP.value === 'object' ? latestBP.value.systolic : latestBP.value;
      const diastolic = typeof latestBP.value === 'object' ? latestBP.value.diastolic : latestBP.value - 40;

      const sysMin = healthTargets.bloodPressure.systolic.min;
      const sysMax = healthTargets.bloodPressure.systolic.max;
      const diaMin = healthTargets.bloodPressure.diastolic.min;
      const diaMax = healthTargets.bloodPressure.diastolic.max;

      if (systolic > sysMax + 20 || diastolic > diaMax + 10) {
        score -= 20;
        factors.push(`Blood pressure (${systolic}/${diastolic}) critically elevated`);
      } else if (systolic > sysMax || diastolic > diaMax || systolic < sysMin || diastolic < diaMin) {
        score -= 10;
        factors.push(`Blood pressure (${systolic}/${diastolic}) outside target range (${sysMin}-${sysMax}/${diaMin}-${diaMax})`);
      }
    }

    // Check body temperature against user's targets (using most recent reading)
    if (recentHealthData.bodyTemperature.length > 0) {
      const currentTemp = recentHealthData.bodyTemperature[0].value; // Most recent reading
      const tempMin = healthTargets.bodyTemperature.min;
      const tempMax = healthTargets.bodyTemperature.max;

      if (currentTemp > tempMax + 1 || currentTemp < tempMin - 1) {
        score -= 15;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside safe range`);
      } else if (currentTemp > tempMax || currentTemp < tempMin) {
        score -= 5;
        factors.push(`Body temperature (${currentTemp.toFixed(1)}°F) outside target range (${tempMin}-${tempMax}°F)`);
      }
    }

    // Check glucose levels against user's targets (using most recent reading)
    if (recentHealthData.glucoseLevel.length > 0) {
      const currentGlucose = recentHealthData.glucoseLevel[0].value; // Most recent reading
      const glucoseMin = healthTargets.glucoseLevel.min;
      const glucoseMax = healthTargets.glucoseLevel.max;

      if (currentGlucose > glucoseMax + 40 || currentGlucose < glucoseMin - 20) {
        score -= 20;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) critically outside range`);
      } else if (currentGlucose > glucoseMax || currentGlucose < glucoseMin) {
        score -= 10;
        factors.push(`Blood glucose (${Math.round(currentGlucose)} mg/dL) outside target range (${glucoseMin}-${glucoseMax} mg/dL)`);
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const getScoreLabel = (score) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Attention';
    };

    const result = { score: Math.round(score), label: getScoreLabel(score), factors };

    return result;
  };

  const healthScore = calculateHealthScore();

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Prepare data for backend - ensure phone field is included
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact,
        medicalInfo: profileData.medicalInfo,
        healthTargets: healthTargets,
        // Note: email and phone updates might need special handling in backend
        // For now, including them in the update
        email: profileData.email,
        phone: profileData.phone
      };

      const response = await api.put('/profile/me', updateData);

      if (response.data) {
        // Update local state with response data
        const userData = response.data;
        setProfileData(prev => ({
          ...prev,
          ...userData,
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : prev.dateOfBirth,
          address: userData.address || prev.address,
          emergencyContact: userData.emergencyContact || prev.emergencyContact,
          medicalInfo: userData.medicalInfo || prev.medicalInfo
        }));
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid data provided.');
      } else if (err.response?.status === 404) {
        setError('Profile not found. Please contact support.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
      setSuccessMessage('');
      setError('');
    }
  };

  const handleInputChange = (field, value, section = null, subSection = null) => {
    if (section && subSection) {
      // Handle nested objects like medicalInfo.primaryDoctor.name
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...(prev[section]?.[subSection] || {}),
            [field]: value
          }
        }
      }));
    } else if (section) {
      // Handle single level nesting like emergencyContact.name
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [field]: value
        }
      }));
    } else {
      // Handle top level fields
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTargetChange = (metric, field, value) => {
    setHealthTargets(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP).');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/profile/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.profilePicture) {
        // Update profile data with new profile picture URL
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        setSuccessMessage('Profile picture updated successfully!');
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid image file.');
      } else {
        setError('Failed to upload profile picture. Please try again.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // Functions for managing medical info arrays
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfileData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          allergies: [...(prev.medicalInfo?.allergies || []), newAllergy.trim()]
        }
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    setProfileData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo?.allergies?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfileData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          chronicConditions: [...(prev.medicalInfo?.chronicConditions || []), newCondition.trim()]
        }
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index) => {
    setProfileData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        chronicConditions: prev.medicalInfo?.chronicConditions?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim() && newMedication.frequency.trim()) {
      setProfileData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          medications: [...(prev.medicalInfo?.medications || []), { ...newMedication }]
        }
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index) => {
    setProfileData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: prev.medicalInfo?.medications?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleRemoveProfilePicture = async () => {
    if (!profileData.profilePicture) return;

    setUploadingImage(true);
    setError('');

    try {
      // Send request to remove profile picture (set to null)
      const response = await api.put('/profile/me', {
        profilePicture: null
      });

      if (response.data) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: null
        }));
        setSuccessMessage('Profile picture removed successfully!');
      }
    } catch (err) {
      console.error('Error removing profile picture:', err);
      setError('Failed to remove profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const tabs = [
    { id: "overview", label: "Health Overview", icon: ChartBarIcon },
    { id: "personal", label: "Personal & Medical", icon: UserIcon },
    { id: "targets", label: "Health Targets", icon: HeartIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Profile & Health Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your health profile and monitoring preferences</p>
        </div>
        <button
          onClick={handleEditToggle}
          disabled={loading && isEditing}
          className="flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 text-sm sm:px-4 sm:py-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors mt-3 sm:mt-0 disabled:opacity-70"
        >
          <PencilIcon className="w-4 h-4" />
          <span>{isEditing ? (loading ? "Saving..." : "Save Changes") : "Edit Profile"}</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700/30 p-3 rounded-md flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-700/30 p-3 rounded-md flex items-center space-x-2">
          <CheckCircleIcon className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Enhanced Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-700/30 rounded-full flex items-center justify-center overflow-hidden">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
              )}
            </div>
            {isEditing && (
              <>
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors cursor-pointer"
                  aria-label="Change profile picture"
                >
                  {uploadingImage ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </label>
                {profileData.profilePicture && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors text-xs"
                    aria-label="Remove profile picture"
                    disabled={uploadingImage}
                  >
                    ×
                  </button>
                )}
              </>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
                Click camera to upload<br />
                Max 5MB (JPEG, PNG, GIF, WEBP)
              </p>
            )}
          </div>

          <div className="flex-1 mt-4 sm:mt-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
              {`${profileData.firstName} ${profileData.lastName}`}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300">
              Patient ID: {profileData.patientId || 'Not assigned'}
            </p>
            <div className="flex flex-col space-y-1 items-center mt-2 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{calculateAge(profileData.dateOfBirth)} years old</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {profileData.address?.city && profileData.address?.state
                    ? `${profileData.address.city}, ${profileData.address.state}`
                    : 'Location not set'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Last active: 2 minutes ago</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 text-center sm:text-right">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-1">Health Score</div>
            <div className={`text-2xl sm:text-3xl font-bold ${
              healthScore.score >= 80 ? 'text-green-600 dark:text-green-400' :
              healthScore.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {healthScore.score}
            </div>
            <div className="text-2xs sm:text-xs text-gray-500 dark:text-slate-400">{healthScore.label}</div>
            {healthScore.factors.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                {healthScore.factors.length} factor{healthScore.factors.length > 1 ? 's' : ''} affecting score
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tabs and Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-2 sm:px-4 md:px-6 whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-500"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Health Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Recent Health Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Recent Health Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Heart Rate Card */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <HeartIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Heart Rate</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {recentHealthData.heartRate.length > 0 ? `${recentHealthData.heartRate[0].value}` : '--'}
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">bpm</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Target: {healthTargets.heartRate.min}-{healthTargets.heartRate.max} bpm
                    </div>
                  </div>

                  {/* Blood Pressure Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Blood Pressure</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {recentHealthData.bloodPressure.length > 0
                        ? (() => {
                            const bp = recentHealthData.bloodPressure[0];
                            const systolic = typeof bp.value === 'object' ? bp.value.systolic : bp.value;
                            const diastolic = typeof bp.value === 'object' ? bp.value.diastolic : bp.value - 40;
                            return `${systolic}/${diastolic}`;
                          })()
                        : '--/--'
                      }
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">mmHg</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Target: {healthTargets.bloodPressure.systolic.min}-{healthTargets.bloodPressure.systolic.max}/{healthTargets.bloodPressure.diastolic.min}-{healthTargets.bloodPressure.diastolic.max}
                    </div>
                  </div>

                  {/* Body Temperature Card */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FireIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Temperature</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {recentHealthData.bodyTemperature.length > 0 ? `${recentHealthData.bodyTemperature[0].value.toFixed(1)}` : '--'}
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">°F</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Target: {healthTargets.bodyTemperature.min}-{healthTargets.bodyTemperature.max}°F
                    </div>
                  </div>

                  {/* Blood Glucose Card */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BeakerIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Blood Glucose</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {recentHealthData.glucoseLevel.length > 0 ? `${recentHealthData.glucoseLevel[0].value}` : '--'}
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">mg/dL</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Target: {healthTargets.glucoseLevel.min}-{healthTargets.glucoseLevel.max} mg/dL
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Score Breakdown */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Health Score Breakdown</h4>
                <div className="space-y-2">
                  {healthScore.factors.length > 0 ? (
                    healthScore.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-slate-300">{factor}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-slate-300">All health metrics are within target ranges</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Personal & Medical Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={profileData.address?.street || ""}
                      onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">City</label>
                    <input
                      type="text"
                      value={profileData.address?.city || ""}
                      onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">State</label>
                    <input
                      type="text"
                      value={profileData.address?.state || ""}
                      onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={profileData.address?.zipCode || ""}
                      onChange={(e) => handleInputChange('zipCode', e.target.value, 'address')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Country</label>
                    <input
                      type="text"
                      value={profileData.address?.country || ""}
                      onChange={(e) => handleInputChange('country', e.target.value, 'address')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact?.name || ""}
                      onChange={(e) => handleInputChange('name', e.target.value, 'emergencyContact')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact?.relationship || ""}
                      onChange={(e) => handleInputChange('relationship', e.target.value, 'emergencyContact')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.emergencyContact?.phone || ""}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'emergencyContact')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="border-t dark:border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Blood Type</label>
                    <select
                      value={profileData.medicalInfo?.bloodType || ""}
                      onChange={(e) => handleInputChange('bloodType', e.target.value, 'medicalInfo')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Height</label>
                    <input
                      type="text"
                      value={profileData.medicalInfo?.height || ""}
                      onChange={(e) => handleInputChange('height', e.target.value, 'medicalInfo')}
                      disabled={!isEditing}
                      placeholder="e.g., 5'10&quot;"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Weight</label>
                    <input
                      type="text"
                      value={profileData.medicalInfo?.weight || ""}
                      onChange={(e) => handleInputChange('weight', e.target.value, 'medicalInfo')}
                      disabled={!isEditing}
                      placeholder="e.g., 175 lbs"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Primary Doctor */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Primary Doctor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Doctor Name</label>
                      <input
                        type="text"
                        value={profileData.medicalInfo?.primaryDoctor?.name || ""}
                        onChange={(e) => handleInputChange('name', e.target.value, 'medicalInfo', 'primaryDoctor')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Specialty</label>
                      <input
                        type="text"
                        value={profileData.medicalInfo?.primaryDoctor?.specialty || ""}
                        onChange={(e) => handleInputChange('specialty', e.target.value, 'medicalInfo', 'primaryDoctor')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.medicalInfo?.primaryDoctor?.phone || ""}
                        onChange={(e) => handleInputChange('phone', e.target.value, 'medicalInfo', 'primaryDoctor')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Allergies and Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Allergies</h4>
                    <div className="space-y-2">
                      {(profileData.medicalInfo?.allergies || []).map((allergy, index) => (
                        <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{allergy}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeAllergy(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <span className="sr-only">Remove allergy</span>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {(profileData.medicalInfo?.allergies || []).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 italic">No allergies recorded</p>
                      )}
                      {isEditing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            placeholder="Add new allergy"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                          />
                          <button
                            onClick={addAllergy}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Chronic Conditions</h4>
                    <div className="space-y-2">
                      {(profileData.medicalInfo?.chronicConditions || []).map((condition, index) => (
                        <div key={index} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{condition}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeCondition(index)}
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                            >
                              <span className="sr-only">Remove condition</span>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {(profileData.medicalInfo?.chronicConditions || []).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 italic">No chronic conditions recorded</p>
                      )}
                      {isEditing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            placeholder="Add new chronic condition"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                          />
                          <button
                            onClick={addCondition}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Current Medications</h4>
                  <div className="space-y-3">
                    {(profileData.medicalInfo?.medications || []).map((medication, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-gray-900 dark:text-slate-100">{medication.name}</span>
                              <span className="text-sm text-gray-600 dark:text-slate-400">{medication.dosage}</span>
                              <span className="text-sm text-gray-600 dark:text-slate-400">{medication.frequency}</span>
                            </div>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => removeMedication(index)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <span className="sr-only">Remove medication</span>
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(profileData.medicalInfo?.medications || []).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 italic">No medications recorded</p>
                    )}
                    {isEditing && (
                      <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Add New Medication</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={newMedication.name}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Medication name"
                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                            placeholder="Dosage (e.g., 10mg)"
                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            value={newMedication.frequency}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                            placeholder="Frequency (e.g., Once daily)"
                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <button
                          onClick={addMedication}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add Medication
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Targets Tab */}
          {activeTab === "targets" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Health Target Ranges</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                  Set your target ranges for health metrics. These will be used to calculate your health score and generate alerts.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Heart Rate Targets */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <HeartIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Heart Rate</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Min (bpm)</label>
                        <input
                          type="number"
                          value={healthTargets.heartRate.min}
                          onChange={(e) => handleTargetChange('heartRate', 'min', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max (bpm)</label>
                        <input
                          type="number"
                          value={healthTargets.heartRate.max}
                          onChange={(e) => handleTargetChange('heartRate', 'max', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      Current: {recentHealthData.heartRate.length > 0 ? `${recentHealthData.heartRate[0].value} bpm` : 'No data'}
                    </p>
                  </div>

                  {/* Blood Pressure Targets */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Blood Pressure</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Systolic Min</label>
                          <input
                            type="number"
                            value={healthTargets.bloodPressure.systolic.min}
                            onChange={(e) => setHealthTargets(prev => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                systolic: { ...prev.bloodPressure.systolic, min: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Systolic Max</label>
                          <input
                            type="number"
                            value={healthTargets.bloodPressure.systolic.max}
                            onChange={(e) => setHealthTargets(prev => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                systolic: { ...prev.bloodPressure.systolic, max: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Diastolic Min</label>
                          <input
                            type="number"
                            value={healthTargets.bloodPressure.diastolic.min}
                            onChange={(e) => setHealthTargets(prev => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                diastolic: { ...prev.bloodPressure.diastolic, min: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Diastolic Max</label>
                          <input
                            type="number"
                            value={healthTargets.bloodPressure.diastolic.max}
                            onChange={(e) => setHealthTargets(prev => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                diastolic: { ...prev.bloodPressure.diastolic, max: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      Current: {recentHealthData.bloodPressure.length > 0
                        ? (() => {
                            const bp = recentHealthData.bloodPressure[0];
                            const systolic = typeof bp.value === 'object' ? bp.value.systolic : bp.value;
                            const diastolic = typeof bp.value === 'object' ? bp.value.diastolic : bp.value - 40;
                            return `${systolic}/${diastolic} mmHg`;
                          })()
                        : 'No data'
                      }
                    </p>
                  </div>

                  {/* Body Temperature Targets */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FireIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Body Temperature</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Min (°F)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={healthTargets.bodyTemperature.min}
                          onChange={(e) => handleTargetChange('bodyTemperature', 'min', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max (°F)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={healthTargets.bodyTemperature.max}
                          onChange={(e) => handleTargetChange('bodyTemperature', 'max', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      Current: {recentHealthData.bodyTemperature.length > 0 ? `${recentHealthData.bodyTemperature[0].value.toFixed(1)}°F` : 'No data'}
                    </p>
                  </div>

                  {/* Blood Glucose Targets */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <BeakerIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Blood Glucose</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Min (mg/dL)</label>
                        <input
                          type="number"
                          value={healthTargets.glucoseLevel.min}
                          onChange={(e) => handleTargetChange('glucoseLevel', 'min', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max (mg/dL)</label>
                        <input
                          type="number"
                          value={healthTargets.glucoseLevel.max}
                          onChange={(e) => handleTargetChange('glucoseLevel', 'max', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                      Current: {recentHealthData.glucoseLevel.length > 0 ? `${recentHealthData.glucoseLevel[0].value} mg/dL` : 'No data'}
                    </p>
                  </div>
                </div>

                {/* Target Summary */}
                <div className="mt-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-3">Target Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Heart Rate:</span>
                      <span className="ml-2 text-gray-600 dark:text-slate-400">
                        {healthTargets.heartRate.min}-{healthTargets.heartRate.max} bpm
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Blood Pressure:</span>
                      <span className="ml-2 text-gray-600 dark:text-slate-400">
                        {healthTargets.bloodPressure.systolic.min}-{healthTargets.bloodPressure.systolic.max}/
                        {healthTargets.bloodPressure.diastolic.min}-{healthTargets.bloodPressure.diastolic.max} mmHg
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Temperature:</span>
                      <span className="ml-2 text-gray-600 dark:text-slate-400">
                        {healthTargets.bodyTemperature.min}-{healthTargets.bodyTemperature.max}°F
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Glucose:</span>
                      <span className="ml-2 text-gray-600 dark:text-slate-400">
                        {healthTargets.glucoseLevel.min}-{healthTargets.glucoseLevel.max} mg/dL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
