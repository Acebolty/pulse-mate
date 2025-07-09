"use client"

import { useState, useEffect } from "react"
import api from '../services/api'
import { getCurrentUser } from '../services/authService'
import {
  UserCircleIcon, // For Profile
  ShieldCheckIcon, // For Privacy
  BellIcon, // For Notifications
  ClockIcon, // For Availability/Consultation
  KeyIcon, // For Security
  PaintBrushIcon, // For Appearance (alternative to CogIcon)
  BriefcaseIcon, // For Professional details within Profile
  PencilIcon, // For Edit action
  ArrowRightOnRectangleIcon, // For Sign Out
  ExclamationTriangleIcon, // For Banners
  CheckCircleIcon, // For Save success (general)
  InformationCircleIcon, // For info tooltips or section headers
  ListBulletIcon, // For list management in profile
  PlusCircleIcon, // For adding items to lists
  XCircleIcon, // For removing items from lists
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  LanguageIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

// Default Doctor Settings Data Structure
const getDefaultDoctorSettings = () => ({
  professionalProfile: {
    title: "Dr.",
    firstName: "",
    lastName: "",
    profilePictureUrl: null,
    specialization: "",
    subSpecialty: "",
    yearsOfExperience: 0,
    biography: "",
    qualifications: [],
    languagesSpoken: ["English"],
    affiliatedHospitals: [],
    officeAddress: "",
    publicEmail: "",
    publicPhone: "",
    generalAvailability: "Monday - Friday, 9:00 AM - 5:00 PM",
    consultationTypesOffered: ["Secure Chat"], // Only secure chat supported
    consultationFee: "$250 per consultation (approx.)",
    isAcceptingPatients: true,
  },
  practicePrivacy: {
    profileVisibilityToPatients: "full", // 'full', 'basic', 'searchable_only'
    allowDirectPatientMessages: true,
    allowVideoCallRequests: true,
    shareAvailabilityCalendarPublicly: false, // e.g. on a public profile page
  },
  notificationPreferences: {
    newAppointmentRequests: true,
    appointmentConfirmationsCancellations: true,
    newMessageFromPatient: true,
    criticalPatientAlerts: true, // General toggle
    // criticalPatientSubAlerts: { highBP: true, lowGlucose: true, fallDetected: false }, // Example for future granularity
    patientDocumentUploads: true,
    dailySummaryEmail: false,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  consultationSetup: {
    defaultConsultationDurationInPerson: 45, // minutes
    defaultConsultationDurationVirtual: 30, // minutes
    videoPlatformPreference: "System Default", // 'System Default', 'Zoom', 'Google Meet'
    cancellationPolicyNotes: "Cancellations less than 24 hours in advance may incur a fee.",
    bookingLeadTime: "24_hours", // e.g., '1_hour', '24_hours', '2_days'
  },
  accountSecurity: {
    twoFactorEnabled: false,
    sessionTimeout: "30-minutes", // '15-minutes', '30-minutes', '1-hour', 'never'
    loginAlerts: true,
  },
  systemAppearance: {
    theme: "system", // 'light', 'dark', 'system'
    fontSize: "medium", // 'small', 'medium', 'large'
    // colorScheme: "blue", // Example: doctor dashboard might have a blue theme
  },
});

// Helper function to render list items for profile arrays (qualifications, languages, etc.)
const EditableListItem = ({ item, index, section, field, isEditing, handleListChange, removeListItem }) => (
  <div className="flex items-center space-x-2 mb-2">
    <input
      type="text"
      value={item}
      disabled={!isEditing}
      onChange={(e) => handleListChange(section, field, index, e.target.value)}
      className="flex-grow p-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-700/50"
    />
    {isEditing && (
      <button onClick={() => removeListItem(section, field, index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-md">
        <XCircleIcon className="w-5 h-5" />
      </button>
    )}
  </div>
);


const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState(getDefaultDoctorSettings())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // For profile picture, a real app would use a file upload state
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  // Fetch doctor settings data
  const fetchDoctorSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('⚙️ Fetching doctor settings...')
      const response = await api.get('/profile/me')
      const userData = response.data

      console.log('👨‍⚕️ Doctor settings data:', userData)

      // Transform backend data to match settings structure
      const transformedSettings = {
        professionalProfile: {
          title: userData.title || "Dr.",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          profilePictureUrl: userData.profilePicture || null,
          specialization: userData.doctorInfo?.specialization || "",
          subSpecialty: userData.doctorInfo?.subSpecialty || "",
          yearsOfExperience: userData.doctorInfo?.yearsOfExperience || 0,
          biography: userData.doctorInfo?.biography || "",
          qualifications: userData.doctorInfo?.qualifications || [],
          languagesSpoken: userData.doctorInfo?.languagesSpoken || ["English"],
          affiliatedHospitals: userData.doctorInfo?.affiliatedHospitals || [],
          officeAddress: userData.doctorInfo?.officeAddress || "",
          publicEmail: userData.email || "",
          publicPhone: userData.doctorInfo?.phone || "",
          generalAvailability: userData.doctorInfo?.generalHours || "Monday - Friday, 9:00 AM - 5:00 PM",
          consultationTypesOffered: ["Secure Chat"], // Only secure chat supported
          consultationFee: userData.doctorInfo?.consultationFee || "$250 per consultation (approx.)",
          isAcceptingPatients: userData.doctorInfo?.isAcceptingPatients !== false,
        },
        // Keep other sections as they were for now
        ...getDefaultDoctorSettings(),
        professionalProfile: {
          ...getDefaultDoctorSettings().professionalProfile,
          title: userData.title || "Dr.",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          profilePictureUrl: userData.profilePicture || null,
          specialization: userData.doctorInfo?.specialization || "",
          subSpecialty: userData.doctorInfo?.subSpecialty || "",
          yearsOfExperience: userData.doctorInfo?.yearsOfExperience || 0,
          biography: userData.doctorInfo?.biography || "",
          qualifications: userData.doctorInfo?.qualifications || [],
          languagesSpoken: userData.doctorInfo?.languagesSpoken || ["English"],
          affiliatedHospitals: userData.doctorInfo?.affiliatedHospitals || [],
          officeAddress: userData.doctorInfo?.officeAddress || "",
          publicEmail: userData.email || "",
          publicPhone: userData.doctorInfo?.phone || "",
          generalAvailability: userData.doctorInfo?.generalHours || "Monday - Friday, 9:00 AM - 5:00 PM",
          consultationTypesOffered: ["Secure Chat"],
          consultationFee: userData.doctorInfo?.consultationFee || "$250 per consultation (approx.)",
          isAcceptingPatients: userData.doctorInfo?.isAcceptingPatients !== false,
        }
      }

      setSettings(transformedSettings)
      setProfilePicPreview(userData.profilePicture)

    } catch (err) {
      console.error('❌ Error fetching doctor settings:', err)
      setError('Failed to load settings data')
    } finally {
      setLoading(false)
    }
  }

  // Load settings data on component mount
  useEffect(() => {
    fetchDoctorSettings()
  }, [])

  const tabs = [
    { id: "profile", label: "Professional Profile", icon: BriefcaseIcon },
    { id: "privacy", label: "Practice & Privacy", icon: ShieldCheckIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "consultations", label: "Consultation Setup", icon: ClockIcon },
    { id: "security", label: "Account Security", icon: KeyIcon },
    { id: "appearance", label: "Dashboard Appearance", icon: PaintBrushIcon },
  ]

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };
  
  const handleListChange = (section, field, index, value) => {
    setSettings(prev => {
        const newList = [...prev[section][field]];
        newList[index] = value;
        const updatedSection = { ...prev[section], [field]: newList };
        return { ...prev, [section]: updatedSection };
    });
    setHasUnsavedChanges(true);
  };

  const addListItem = (section, field) => {
    setSettings(prev => {
        const updatedSection = { ...prev[section], [field]: [...prev[section][field], ""] };
        return { ...prev, [section]: updatedSection };
    });
    setHasUnsavedChanges(true);
  };

  const removeListItem = (section, field, index) => {
    setSettings(prev => {
        const newList = prev[section][field].filter((_, i) => i !== index);
        const updatedSection = { ...prev[section], [field]: newList };
        return { ...prev, [section]: updatedSection };
    });
    setHasUnsavedChanges(true);
  };


  const saveSettings = () => {
    console.log("Saving doctor settings:", settings);
    // API call to save settings would go here
    setHasUnsavedChanges(false);
    // Optionally, update initialDoctorSettings to reflect saved state for next reset
    // initialDoctorSettings = JSON.parse(JSON.stringify(settings));
    alert("Settings saved successfully!"); // Simple feedback
  };

  const resetSettings = () => {
    setSettings(JSON.parse(JSON.stringify(initialDoctorSettings)));
    setProfilePicPreview(initialDoctorSettings.professionalProfile.profilePictureUrl);
    setHasUnsavedChanges(false);
  };
  
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicPreview(reader.result);
            handleSettingChange('professionalProfile', 'profilePictureUrl', reader.result); // Or handle actual upload
        };
        reader.readAsDataURL(file);
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your professional profile, practice, and account preferences.</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
            <button onClick={resetSettings} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm">
              Reset
            </button>
            <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-700/30 border border-yellow-200 dark:border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">You have unsaved changes.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-6 px-3 sm:px-6">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              ><tab.icon className="w-5 h-5" /><span>{tab.label}</span></button>
            ))}
          </nav>
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} transition={{duration: 0.3}} className="p-4 sm:p-6 md:p-8">
          {/* Professional Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Edit Professional Information</h3>
              {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                    <img src={profilePicPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover bg-gray-200 dark:bg-slate-700"/>
                    <div>
                        <label htmlFor="profilePicUpload" className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">Change Photo</label>
                        <input type="file" id="profilePicUpload" className="hidden" accept="image/*" onChange={handleProfilePictureChange} />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Recommended: Square JPG or PNG, min 200x200px.</p>
                    </div>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title (e.g., Dr., Prof.)</label><input type="text" value={settings.professionalProfile.title} onChange={(e) => handleSettingChange('professionalProfile', 'title', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">First Name</label><input type="text" value={settings.professionalProfile.firstName} onChange={(e) => handleSettingChange('professionalProfile', 'firstName', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Last Name</label><input type="text" value={settings.professionalProfile.lastName} onChange={(e) => handleSettingChange('professionalProfile', 'lastName', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Specialization</label><input type="text" value={settings.professionalProfile.specialization} onChange={(e) => handleSettingChange('professionalProfile', 'specialization', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sub-Specialty (Optional)</label><input type="text" value={settings.professionalProfile.subSpecialty} onChange={(e) => handleSettingChange('professionalProfile', 'subSpecialty', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Years of Experience</label><input type="number" value={settings.professionalProfile.yearsOfExperience} onChange={(e) => handleSettingChange('professionalProfile', 'yearsOfExperience', parseInt(e.target.value) || 0)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Biography</label><textarea value={settings.professionalProfile.biography} onChange={(e) => handleSettingChange('professionalProfile', 'biography', e.target.value)} rows="4" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Qualifications</label>
                {settings.professionalProfile.qualifications.map((q, index) => <EditableListItem key={index} item={q} index={index} section="professionalProfile" field="qualifications" isEditing={true} handleListChange={handleListChange} removeListItem={removeListItem} />)}
                <button onClick={() => addListItem('professionalProfile', 'qualifications')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"><PlusCircleIcon className="w-4 h-4 mr-1"/> Add Qualification</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Languages Spoken</label>
                {settings.professionalProfile.languagesSpoken.map((lang, index) => <EditableListItem key={index} item={lang} index={index} section="professionalProfile" field="languagesSpoken" isEditing={true} handleListChange={handleListChange} removeListItem={removeListItem} />)}
                <button onClick={() => addListItem('professionalProfile', 'languagesSpoken')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"><PlusCircleIcon className="w-4 h-4 mr-1"/> Add Language</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Affiliated Hospitals/Clinics</label>
                {settings.professionalProfile.affiliatedHospitals.map((hospital, index) => <EditableListItem key={index} item={hospital} index={index} section="professionalProfile" field="affiliatedHospitals" isEditing={true} handleListChange={handleListChange} removeListItem={removeListItem} />)}
                <button onClick={() => addListItem('professionalProfile', 'affiliatedHospitals')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"><PlusCircleIcon className="w-4 h-4 mr-1"/> Add Affiliation</button>
              </div>
               <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mt-6 mb-3 border-t dark:border-slate-700 pt-4">Public Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Public Email</label><input type="email" value={settings.professionalProfile.publicEmail} onChange={(e) => handleSettingChange('professionalProfile', 'publicEmail', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Public Phone</label><input type="tel" value={settings.professionalProfile.publicPhone} onChange={(e) => handleSettingChange('professionalProfile', 'publicPhone', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 mt-4">Office Address</label><textarea value={settings.professionalProfile.officeAddress} onChange={(e) => handleSettingChange('professionalProfile', 'officeAddress', e.target.value)} rows="3" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" /></div>
            </div>
          )}

          {/* Practice & Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Practice & Patient Interaction Privacy</h3>
              <div className="space-y-4">
                 <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Profile Visibility to Patients</label>
                    <select id="profileVisibility" value={settings.practicePrivacy.profileVisibilityToPatients} onChange={(e) => handleSettingChange('practicePrivacy', 'profileVisibilityToPatients', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="full">Full Profile</option>
                        <option value="basic">Basic Information Only</option>
                        <option value="searchable_only">Searchable (Contact for Details)</option>
                    </select>
                 </div>
                {[
                  { key: 'allowDirectPatientMessages', label: 'Allow patients to send direct messages' },
                  { key: 'allowVideoCallRequests', label: 'Allow patients to request video calls' },
                  { key: 'shareAvailabilityCalendarPublicly', label: 'Share general availability on public profile' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <span className="text-sm text-gray-700 dark:text-slate-300">{opt.label}</span>
                    <input type="checkbox" checked={settings.practicePrivacy[opt.key]} onChange={(e) => handleSettingChange('practicePrivacy', opt.key, e.target.checked)}
                           className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === "notifications" && (
             <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Notification Preferences for Your Account</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'newAppointmentRequests', label: 'New Appointment Requests' },
                        { key: 'appointmentConfirmationsCancellations', label: 'Appointment Confirmations/Cancellations' },
                        { key: 'newMessageFromPatient', label: 'New Message from Patient' },
                        { key: 'criticalPatientAlerts', label: 'Critical Patient Health Alerts (Subscribed)' },
                        { key: 'patientDocumentUploads', label: 'Patient Document Uploads' },
                        { key: 'dailySummaryEmail', label: 'Daily Summary Email' },
                    ].map(opt => (
                        <label key={opt.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30">
                            <span className="text-sm text-gray-700 dark:text-slate-300">{opt.label}</span>
                            <input type="checkbox" checked={settings.notificationPreferences[opt.key]} onChange={(e) => handleSettingChange('notificationPreferences', opt.key, e.target.checked)}
                                   className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                        </label>
                    ))}
                </div>
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <label className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Enable Quiet Hours</span>
                        <input type="checkbox" checked={settings.notificationPreferences.quietHoursEnabled} onChange={(e) => handleSettingChange('notificationPreferences', 'quietHoursEnabled', e.target.checked)}
                               className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                    </label>
                    {settings.notificationPreferences.quietHoursEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Start Time</label><input type="time" value={settings.notificationPreferences.quietHoursStart} onChange={(e) => handleSettingChange('notificationPreferences', 'quietHoursStart', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"/></div>
                            <div><label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">End Time</label><input type="time" value={settings.notificationPreferences.quietHoursEnd} onChange={(e) => handleSettingChange('notificationPreferences', 'quietHoursEnd', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"/></div>
                        </div>
                    )}
                </div>
             </div>
          )}

          {/* Consultation Setup Tab */}
          {activeTab === "consultations" && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Consultation & Availability Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Default In-Person Duration (minutes)</label><input type="number" value={settings.consultationSetup.defaultConsultationDurationInPerson} onChange={(e) => handleSettingChange('consultationSetup', 'defaultConsultationDurationInPerson', parseInt(e.target.value))} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Default Virtual Duration (minutes)</label><input type="number" value={settings.consultationSetup.defaultConsultationDurationVirtual} onChange={(e) => handleSettingChange('consultationSetup', 'defaultConsultationDurationVirtual', parseInt(e.target.value))} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"/></div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Preferred Video Platform</label>
                    <select value={settings.consultationSetup.videoPlatformPreference} onChange={(e) => handleSettingChange('consultationSetup', 'videoPlatformPreference', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="System Default">System Default Video</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Other">Other (Specify)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Booking Lead Time</label>
                     <select value={settings.consultationSetup.bookingLeadTime} onChange={(e) => handleSettingChange('consultationSetup', 'bookingLeadTime', e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="1_hour">Patients can book up to 1 hour before</option>
                        <option value="12_hours">Patients can book up to 12 hours before</option>
                        <option value="24_hours">Patients can book up to 24 hours before</option>
                        <option value="2_days">Patients can book up to 2 days before</option>
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cancellation Policy Notes</label><textarea value={settings.consultationSetup.cancellationPolicyNotes} onChange={(e) => handleSettingChange('consultationSetup', 'cancellationPolicyNotes', e.target.value)} rows="3" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200" placeholder="e.g., Cancellations less than 24 hours in advance may be subject to a fee."/></div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === "security" && (
             <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Account Security</h3>
                <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Enable Two-Factor Authentication (2FA)</span>
                    <input type="checkbox" checked={settings.accountSecurity.twoFactorEnabled} onChange={(e) => handleSettingChange('accountSecurity', 'twoFactorEnabled', e.target.checked)}
                           className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                </label>
                 <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Session Timeout</label>
                    <select id="sessionTimeout" value={settings.accountSecurity.sessionTimeout} onChange={(e) => handleSettingChange('accountSecurity', 'sessionTimeout', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="15-minutes">15 minutes of inactivity</option>
                        <option value="30-minutes">30 minutes of inactivity</option>
                        <option value="1-hour">1 hour of inactivity</option>
                        <option value="never">Never log out automatically</option>
                    </select>
                 </div>
                 <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Enable Login Alerts (notifies on new device login)</span>
                    <input type="checkbox" checked={settings.accountSecurity.loginAlerts} onChange={(e) => handleSettingChange('accountSecurity', 'loginAlerts', e.target.checked)}
                           className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                </label>
                 <button className="w-full text-left p-3 sm:p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 transition-colors">
                    Change Password
                </button>
             </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Dashboard Appearance</h3>
                {/* Theme selection - similar to patient's */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Theme</label>
                    <select value={settings.systemAppearance.theme} onChange={(e) => handleSettingChange('systemAppearance', 'theme', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">System Preference</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Font Size</label>
                    <select value={settings.systemAppearance.fontSize} onChange={(e) => handleSettingChange('systemAppearance', 'fontSize', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200">
                        <option value="small">Small</option>
                        <option value="medium">Medium (Default)</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
         <button className="flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Sign Out</span>
        </button>
        <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 rounded-lg transition-colors border border-red-200 dark:border-red-500/50">
                Deactivate Account
            </button>
        </div>
      </div>

    </div>
  )
}

export default Settings;
