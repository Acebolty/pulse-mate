"use client"

import { useState, useEffect } from "react"
import api from '../services/api'
import { getCurrentUser } from '../services/authService'
import { useDoctorProfile } from '../contexts/DoctorProfileContext'
import { generateDoctorAvatar } from '../utils/avatarUtils'
import SearchableDropdown from '../components/ui/SearchableDropdown'
import { filterSpecializations, filterSubSpecialties } from '../data/medicalSpecializations'
import {
  UserCircleIcon, // Changed from UserIcon for a more profile-centric feel
  PencilIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon, // Changed from CalendarIcon for better semantics
  BriefcaseIcon, // For specialization/experience
  AcademicCapIcon, // For qualifications
  InformationCircleIcon, // For About Me / Biography
  ClockIcon, // For availability
  LanguageIcon, // For languages
  BuildingOffice2Icon, // For affiliated hospital
  CurrencyDollarIcon, // For consultation fee (optional)
  ShieldCheckIcon, // For Account Settings
  CogIcon, // For general settings or could be used for Account
  CheckCircleIcon, // For save button
  XMarkIcon, // For remove buttons
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"


// Default doctor data structure
const getDefaultDoctorData = () => ({
  personalInfo: {
    title: "Dr.",
    firstName: "",
    lastName: "",
    profilePictureUrl: null,
  },
  professionalInfo: {
    specialization: "",
    subSpecialty: "",
    yearsOfExperience: 0,
    qualifications: [],
    biography: "",
    languagesSpoken: ["English"],
    affiliatedHospitals: [],
  },
  contactInfo: {
    email: "",
    phone: "",
    officeAddress: "",
  },
  availability: {
    generalHours: "Monday - Friday, 9:00 AM - 5:00 PM",
    consultationTypes: ["Secure Chat"], // Only secure chat supported
    isAcceptingPatients: true, // New availability toggle
    consultationFee: "$250 per consultation (approx.)",
  }
})

const Profile = () => {
  const [activeTab, setActiveTab] = useState("professional")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(getDefaultDoctorData())
  const [originalData, setOriginalData] = useState(getDefaultDoctorData())
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  // Use the context for global state management
  const {
    profileData,
    loading,
    error: contextError,
    updateProfile,
    updateProfilePicture,
    refreshProfile
  } = useDoctorProfile()

  const [error, setError] = useState(null)

  // Change Password Modal States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

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

  // Fetch doctor profile data
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🩺 Fetching doctor profile...')
      const response = await api.get('/profile/me')
      const userData = response.data

      console.log('👨‍⚕️ Doctor profile data:', userData)

      // Transform backend data to match our structure
      const transformedData = {
        personalInfo: {
          title: userData.doctorInfo?.title || userData.title || "Dr.",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          profilePictureUrl: userData.profilePicture || null,
        },
        professionalInfo: {
          specialization: userData.doctorInfo?.specialization || "",
          subSpecialty: userData.doctorInfo?.subSpecialty || "",
          yearsOfExperience: userData.doctorInfo?.yearsOfExperience || 0,
          qualifications: userData.doctorInfo?.qualifications || [],
          biography: userData.doctorInfo?.biography || "",
          languagesSpoken: userData.doctorInfo?.languagesSpoken || ["English"],
          affiliatedHospitals: userData.doctorInfo?.affiliatedHospitals || [],
        },
        contactInfo: {
          email: userData.email || "",
          phone: userData.doctorInfo?.phone || userData.phone || "",
          officeAddress: userData.doctorInfo?.officeAddress || "",
        },
        availability: {
          generalHours: userData.doctorInfo?.generalHours || "Monday - Friday, 9:00 AM - 5:00 PM",
          consultationTypes: ["Secure Chat"], // Only secure chat supported
          isAcceptingPatients: userData.doctorInfo?.isAcceptingPatients !== false, // Default to true
          consultationFee: userData.doctorInfo?.consultationFee || "$250 per consultation (approx.)",
        }
      }

      setFormData(transformedData)
      setOriginalData(JSON.parse(JSON.stringify(transformedData))) // Deep copy

    } catch (err) {
      console.error('❌ Error fetching doctor profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // Load profile data from context when available
  useEffect(() => {
    if (profileData && !justSaved) {
      console.log('📋 Profile: Loading data from context:', profileData)

      // Transform context data to form structure
      const transformedData = {
        personalInfo: {
          title: profileData.doctorInfo?.title || profileData.title || "Dr.",
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          profilePictureUrl: profileData.profilePicture || null,
        },
        professionalInfo: {
          specialization: profileData.doctorInfo?.specialization || "",
          subSpecialty: profileData.doctorInfo?.subSpecialty || "",
          yearsOfExperience: profileData.doctorInfo?.yearsOfExperience || 0,
          qualifications: profileData.doctorInfo?.qualifications || [],
          biography: profileData.doctorInfo?.biography || "",
          languagesSpoken: profileData.doctorInfo?.languagesSpoken || ["English"],
          affiliatedHospitals: profileData.doctorInfo?.affiliatedHospitals || [],
        },
        contactInfo: {
          email: profileData.email || "",
          phone: profileData.doctorInfo?.phone || profileData.phone || "",
          officeAddress: profileData.doctorInfo?.officeAddress || "",
        },
        availability: {
          generalHours: profileData.doctorInfo?.generalHours || "Monday - Friday, 9:00 AM - 5:00 PM",
          consultationTypes: ["Secure Chat"],
          isAcceptingPatients: profileData.doctorInfo?.isAcceptingPatients !== false,
          consultationFee: profileData.doctorInfo?.consultationFee || "$250 per consultation (approx.)",
        }
      }

      setFormData(transformedData)
      setOriginalData(JSON.parse(JSON.stringify(transformedData)))
    }

    // Reset the justSaved flag after a delay
    if (justSaved) {
      const timer = setTimeout(() => setJustSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [profileData, justSaved])

  // Handle profile picture upload using context
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      setError(null)

      console.log('📸 Uploading profile picture via context...')
      const response = await updateProfilePicture(file)

      console.log('✅ Profile picture uploaded successfully:', response)

      // Update the form data with new profile picture URL
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          profilePictureUrl: response.profilePicture
        }
      }))

      // Update original data as well
      setOriginalData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          profilePictureUrl: response.profilePicture
        }
      }))

    } catch (err) {
      console.error('❌ Error uploading profile picture:', err)
      setError(err.response?.data?.message || 'Failed to upload profile picture')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInputChange = (section, field, value, index = null, subField = null) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (index !== null && subField !== null) { // For arrays of objects e.g. qualifications (if they become objects)
        newData[section][field][index][subField] = value;
      } else if (index !== null) { // For arrays of strings e.g. languagesSpoken
        newData[section][field][index] = value;
      } else if (subField !== null) { // For nested objects e.g. personalInfo.firstName
         newData[section][subField] = value; // Assuming subField is directly under section for simplicity here
      } else {
        newData[section][field] = value;
      }
      return newData;
    });
  };
  
  // Simplified handler for top-level fields in sections like professionalInfo, contactInfo etc.
  const handleDirectFieldChange = (section, field, value) => {
     setFormData(prev => {
       const newData = {
         ...prev,
         [section]: {
           ...prev[section],
           [field]: value
         }
       };

       // If specialization changes, clear sub-specialty
       if (section === 'professionalInfo' && field === 'specialization') {
         newData.professionalInfo.subSpecialty = '';
       }

       return newData;
     });
  };
  
  // Handler for arrays of strings like qualifications or languages
  const handleListChange = (section, field, index, value) => {
    setFormData(prev => {
        const newList = [...prev[section][field]];
        newList[index] = value;
        return {
            ...prev,
            [section]: {
                ...prev[section],
                [field]: newList
            }
        };
    });
  };

  const addListItem = (section, field) => {
    setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: [...prev[section][field], ""] // Add an empty string for new item
        }
    }));
  };

  const removeListItem = (section, field, index) => {
    setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: prev[section][field].filter((_, i) => i !== index)
        }
    }));
  };


  const tabs = [
    { id: "professional", label: "Professional Details", icon: BriefcaseIcon },
    { id: "availability", label: "Availability & Services", icon: ClockIcon },
    { id: "contact", label: "Contact Information", icon: PhoneIcon },
    { id: "account", label: "Account Settings", icon: CogIcon },
  ];
  
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      console.log("💾 Saving doctor profile data:", formData)

      // Transform our data structure back to backend format
      const updateData = {
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        title: formData.personalInfo.title,
        email: formData.contactInfo.email,
        phone: formData.contactInfo.phone, // Save to main phone field
        doctorInfo: {
          specialization: formData.professionalInfo.specialization,
          subSpecialty: formData.professionalInfo.subSpecialty,
          yearsOfExperience: formData.professionalInfo.yearsOfExperience,
          qualifications: formData.professionalInfo.qualifications,
          biography: formData.professionalInfo.biography,
          languagesSpoken: formData.professionalInfo.languagesSpoken,
          affiliatedHospitals: formData.professionalInfo.affiliatedHospitals,
          phone: formData.contactInfo.phone, // Also save to doctorInfo.phone for consistency
          officeAddress: formData.contactInfo.officeAddress,
          generalHours: formData.availability.generalHours,
          isAcceptingPatients: formData.availability.isAcceptingPatients,
          consultationFee: formData.availability.consultationFee,
        }
      }

      console.log("📤 Sending update data to backend:", JSON.stringify(updateData, null, 2))
      const updatedProfile = await updateProfile(updateData)

      console.log("📥 Received updated profile from backend:", updatedProfile)

      // Update original data to reflect saved changes
      setOriginalData(JSON.parse(JSON.stringify(formData)))
      setIsEditing(false)
      setJustSaved(true) // Prevent context from overriding form data immediately

      console.log("✅ Profile saved successfully via context")

    } catch (err) {
      console.error('❌ Error saving profile:', err)
      setError('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Alert */}
      {(error || contextError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error || contextError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Professional Profile</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your public profile and account settings.</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className={`flex items-center space-x-2 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm md:text-base mt-3 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditing ? "bg-green-600 dark:bg-green-500" : "bg-blue-600 dark:bg-blue-500"
          }`}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : isEditing ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <PencilIcon className="w-5 h-5" />
          )}
          <span>{saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700"
      >
        <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <img
              src={formData.personalInfo.profilePictureUrl || generateDoctorAvatar(formData.personalInfo.firstName, formData.personalInfo.lastName, 150)}
              alt={`${formData.personalInfo.title} ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-700/50"
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  id="profilePictureUpload"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profilePictureUpload').click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
          <div className="flex-1 mt-4 sm:mt-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formData.personalInfo.title} {formData.personalInfo.firstName} {formData.personalInfo.lastName}
            </h2>
            <p className="text-base md:text-lg text-blue-600 dark:text-blue-400 font-medium">{formData.professionalInfo.specialization}</p>
            {formData.professionalInfo.subSpecialty && <p className="text-sm text-gray-500 dark:text-slate-400">{formData.professionalInfo.subSpecialty}</p>}
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{formData.professionalInfo.yearsOfExperience} years of experience</p>
          </div>
           <div className="mt-4 sm:mt-0 text-center sm:text-right">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
               formData.availability.isAcceptingPatients
                 ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300'
                 : 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
             }`}>
                {formData.availability.isAcceptingPatients
                  ? 'Accepting New Patients'
                  : 'Not Accepting Patients'}
             </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs and Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-6 px-3 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              ><tab.icon className="w-5 h-5" /><span>{tab.label}</span></button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {/* Professional Details Tab */}
          {activeTab === "professional" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={`${formData.personalInfo.title} ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`} disabled={!isEditing} 
                         onChange={(e) => { /* Needs more complex logic for parsing title/first/last */ }}
                         className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Specialization</label>
                  {isEditing ? (
                    <SearchableDropdown
                      value={formData.professionalInfo.specialization}
                      onChange={(value) => handleDirectFieldChange('professionalInfo', 'specialization', value)}
                      filterFunction={filterSpecializations}
                      placeholder="Search for your medical specialization..."
                      emptyMessage="No specializations found. Try a different search term."
                      className="w-full"
                      maxHeight="250px"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.professionalInfo.specialization}
                      disabled={true}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed"
                    />
                  )}
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sub-Specialty (Optional)</label>
                  {isEditing ? (
                    <SearchableDropdown
                      value={formData.professionalInfo.subSpecialty}
                      onChange={(value) => handleDirectFieldChange('professionalInfo', 'subSpecialty', value)}
                      filterFunction={(query) => filterSubSpecialties(query, formData.professionalInfo.specialization)}
                      placeholder={
                        formData.professionalInfo.specialization
                          ? `Search sub-specialties for ${formData.professionalInfo.specialization}...`
                          : "Select a specialization first..."
                      }
                      emptyMessage={
                        formData.professionalInfo.specialization
                          ? "No sub-specialties found for this specialization."
                          : "Please select a main specialization first."
                      }
                      disabled={!formData.professionalInfo.specialization}
                      className="w-full"
                      maxHeight="200px"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.professionalInfo.subSpecialty}
                      disabled={true}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Years of Experience</label>
                  <input type="number" value={formData.professionalInfo.yearsOfExperience} disabled={!isEditing} 
                         onChange={(e) => handleDirectFieldChange('professionalInfo', 'yearsOfExperience', parseInt(e.target.value) || 0)}
                         className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Biography / About Me</label>
                <textarea value={formData.professionalInfo.biography} disabled={!isEditing} rows={5}
                          onChange={(e) => handleDirectFieldChange('professionalInfo', 'biography', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Qualifications / Certifications</label>
                {formData.professionalInfo.qualifications.map((q, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <input type="text" value={q} disabled={!isEditing} 
                               onChange={(e) => handleListChange('professionalInfo', 'qualifications', index, e.target.value)}
                               className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                        {isEditing && <button onClick={() => removeListItem('professionalInfo', 'qualifications', index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-md"><XMarkIcon className="w-5 h-5"/></button>}
                    </div>
                ))}
                {isEditing && <button onClick={() => addListItem('professionalInfo', 'qualifications')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Qualification</button>}
                 {!isEditing && formData.professionalInfo.qualifications.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400">No qualifications listed.</p>}
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Languages Spoken</label>
                    {formData.professionalInfo.languagesSpoken.map((lang, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" value={lang} disabled={!isEditing} 
                                   onChange={(e) => handleListChange('professionalInfo', 'languagesSpoken', index, e.target.value)}
                                   className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                            {isEditing && <button onClick={() => removeListItem('professionalInfo', 'languagesSpoken', index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-md"><XMarkIcon className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {isEditing && <button onClick={() => addListItem('professionalInfo', 'languagesSpoken')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Language</button>}
                    {!isEditing && formData.professionalInfo.languagesSpoken.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400">No languages listed.</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Affiliated Hospitals/Clinics</label>
                     {formData.professionalInfo.affiliatedHospitals.map((hospital, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" value={hospital} disabled={!isEditing} 
                                   onChange={(e) => handleListChange('professionalInfo', 'affiliatedHospitals', index, e.target.value)}
                                   className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                            {isEditing && <button onClick={() => removeListItem('professionalInfo', 'affiliatedHospitals', index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-md"><XMarkIcon className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {isEditing && <button onClick={() => addListItem('professionalInfo', 'affiliatedHospitals')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Affiliation</button>}
                    {!isEditing && formData.professionalInfo.affiliatedHospitals.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400">No affiliations listed.</p>}
                </div>
               </div>
            </motion.div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* General Availability Toggle */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">General Availability</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {formData.availability.isAcceptingPatients
                        ? "You are currently accepting new patients"
                        : "You are not accepting new patients"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleDirectFieldChange('availability', 'isAcceptingPatients', !formData.availability.isAcceptingPatients)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.availability.isAcceptingPatients ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.availability.isAcceptingPatients ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {!formData.availability.isAcceptingPatients && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> When availability is turned off, patients will see you as unavailable and cannot book appointments with you.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Working Hours</label>
                <input type="text" value={formData.availability.generalHours} disabled={!isEditing}
                       onChange={(e) => handleDirectFieldChange('availability', 'generalHours', e.target.value)}
                       className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">e.g., Mon-Fri, 9 AM - 5 PM; Sat, 10 AM - 2 PM (By appointment)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Consultation Types Offered</label>
                <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Secure Chat</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Real-time messaging with patients during appointment sessions</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-slate-400">
                    This is the only consultation type currently supported by the platform.
                  </div>
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Consultation Fee (Optional)</label>
                <input type="text" value={formData.availability.consultationFee} disabled={!isEditing} 
                       onChange={(e) => handleDirectFieldChange('availability', 'consultationFee', e.target.value)}
                       className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
              </div>

            </motion.div>
          )}
          
          {/* Contact Info Tab */}
          {activeTab === "contact" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Public Email</label>
                        <input type="email" value={formData.contactInfo.email} disabled={!isEditing} 
                               onChange={(e) => handleDirectFieldChange('contactInfo', 'email', e.target.value)}
                               className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Public Phone</label>
                        <input type="tel" value={formData.contactInfo.phone} disabled={!isEditing} 
                               onChange={(e) => handleDirectFieldChange('contactInfo', 'phone', e.target.value)}
                               className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Office Address</label>
                    <textarea value={formData.contactInfo.officeAddress} disabled={!isEditing} rows={3}
                              onChange={(e) => handleDirectFieldChange('contactInfo', 'officeAddress', e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                </div>
            </motion.div>
          )}

          {/* Account Settings Tab */}
          {activeTab === "account" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">Security</h3>
                     <button
                        onClick={() => setShowChangePasswordModal(true)}
                        className="w-full text-left p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 mb-3 text-gray-900 dark:text-white transition-colors"
                     >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">Change Password</h4>
                            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">Update your account password</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                    </button>
                </div>
            </motion.div>
          )}

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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:bg-slate-700 dark:text-slate-200"
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

export default Profile;
