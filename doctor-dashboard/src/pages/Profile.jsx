"use client"

import { useState } from "react"
import {
  UserCircleIcon, // Changed from UserIcon for a more profile-centric feel
  PencilIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
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
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"


// Dummy doctor data
const doctorData = {
  personalInfo: {
    title: "Dr.",
    firstName: "Evelyn",
    lastName: "Reed",
    profilePictureUrl: "https://randomuser.me/api/portraits/women/60.jpg", // Placeholder
  },
  professionalInfo: {
    specialization: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    yearsOfExperience: 12,
    qualifications: [
      "MD, Stanford University School of Medicine",
      "Board Certified in Internal Medicine",
      "Board Certified in Cardiovascular Disease",
      "Fellow of the American College of Cardiology (FACC)",
    ],
    biography:
      "Dr. Evelyn Reed is a dedicated and compassionate cardiologist with over 12 years of experience in diagnosing and treating a wide range of cardiovascular conditions. She is passionate about preventive care and patient education, empowering her patients to take an active role in their heart health. Dr. Reed stays updated with the latest advancements in cardiology to provide the highest standard of care.",
    languagesSpoken: ["English", "Spanish"],
    affiliatedHospitals: ["City General Hospital", "Heart & Vascular Institute"],
  },
  contactInfo: {
    email: "dr.evelyn.reed@clinic.com",
    phone: "+1 (555) 123-4567",
    officeAddress: "123 Health Parkway, Suite 402, Wellness City, ST 90210",
  },
  availability: {
    generalHours: "Monday - Friday, 9:00 AM - 5:00 PM",
    consultationTypes: ["In-Person", "Video Consultation", "Secure Chat"],
    outOfOffice: [], // Array of { startDate, endDate, reason }
    consultationFee: "$250 per consultation (approx.)", // Optional
  },
  accountSettings: { // Basic account settings for the doctor
    notificationsEnabled: true,
    twoFactorAuth: false,
  }
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("professional")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(doctorData))) // Deep copy for editing

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
     setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: value
        }
     }));
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
  
  const handleSave = () => {
    setIsEditing(false);
    // Here, you would typically send formData to a backend API
    console.log("Saving data:", formData);
    // Update original data state if needed, or refetch
    // doctorData = JSON.parse(JSON.stringify(formData)); // Not ideal, but for demo
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Professional Profile</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-300 mt-1">Manage your public profile and account settings.</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center space-x-2 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm md:text-base mt-3 sm:mt-0 ${
            isEditing ? "bg-green-600 dark:bg-green-500" : "bg-blue-600 dark:bg-blue-500"
          }`}
        >
          {isEditing ? <CheckCircleIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
          <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
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
              src={formData.personalInfo.profilePictureUrl || "https://via.placeholder.com/150/E0E0E0/B0B0B0?text=Dr"}
              alt={`${formData.personalInfo.title} ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-700/50"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md">
                <CameraIcon className="w-4 h-4" />
              </button>
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
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300">
                Accepting New Patients
             </span>
             {/* Or other status like "Online for Consultations" */}
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
                  <input type="text" value={formData.professionalInfo.specialization} disabled={!isEditing} 
                         onChange={(e) => handleDirectFieldChange('professionalInfo', 'specialization', e.target.value)}
                         className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sub-Specialty (Optional)</label>
                  <input type="text" value={formData.professionalInfo.subSpecialty} disabled={!isEditing} 
                         onChange={(e) => handleDirectFieldChange('professionalInfo', 'subSpecialty', e.target.value)}
                         className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">General Availability</label>
                <input type="text" value={formData.availability.generalHours} disabled={!isEditing} 
                       onChange={(e) => handleDirectFieldChange('availability', 'generalHours', e.target.value)}
                       className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">e.g., Mon-Fri, 9 AM - 5 PM; Sat, 10 AM - 2 PM (By appointment)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Consultation Types Offered</label>
                 {formData.availability.consultationTypes.map((type, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <input type="text" value={type} disabled={!isEditing} 
                               onChange={(e) => handleListChange('availability', 'consultationTypes', index, e.target.value)}
                               className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
                        {isEditing && <button onClick={() => removeListItem('availability', 'consultationTypes', index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-md"><XMarkIcon className="w-5 h-5"/></button>}
                    </div>
                ))}
                {isEditing && <button onClick={() => addListItem('availability', 'consultationTypes')} className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Type</button>}
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Consultation Fee (Optional)</label>
                <input type="text" value={formData.availability.consultationFee} disabled={!isEditing} 
                       onChange={(e) => handleDirectFieldChange('availability', 'consultationFee', e.target.value)}
                       className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Out of Office / Specific Non-availability</label>
                {/* Placeholder for a more complex date range picker system */}
                <textarea value={formData.availability.outOfOffice.map(o => `${o.startDate} to ${o.endDate}: ${o.reason || 'Unavailable'}`).join('\n')} 
                          disabled={!isEditing} rows={3}
                          onChange={(e) => { /* Needs complex parsing */}}
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-50 dark:disabled:bg-slate-700/50" 
                          placeholder="List any upcoming out-of-office periods."/>
                {isEditing && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Future: Add structured date pickers for unavailability.</p>}
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
                 {/* Placeholder for map integration */}
                <div className="h-48 bg-gray-100 dark:bg-slate-700/30 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-10 h-10 text-gray-400 dark:text-slate-500"/>
                    <span className="ml-2 text-gray-500 dark:text-slate-400">Map View (Placeholder)</span>
                </div>
            </motion.div>
          )}

          {/* Account Settings Tab */}
          {activeTab === "account" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">Security</h3>
                     <button className="w-full text-left p-4 border border-gray-200 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-lg hover:bg-gray-50 mb-3">
                        Change Password
                    </button>
                    <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-slate-300">Enable Two-Factor Authentication</span>
                        <input type="checkbox" checked={formData.accountSettings.twoFactorAuth} disabled={!isEditing}
                               onChange={(e) => handleDirectFieldChange('accountSettings', 'twoFactorAuth', e.target.checked)}
                               className="rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500 disabled:opacity-50" />
                    </label>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-3">System Notifications</h3>
                    <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-slate-300">Receive email notifications for system updates</span>
                         <input type="checkbox" checked={formData.accountSettings.notificationsEnabled} disabled={!isEditing}
                               onChange={(e) => handleDirectFieldChange('accountSettings', 'notificationsEnabled', e.target.checked)}
                               className="rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500 disabled:opacity-50" />
                    </label>
                </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Profile;
