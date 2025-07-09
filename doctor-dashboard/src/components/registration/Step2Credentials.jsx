import React from 'react';
import SearchableDropdown from '../ui/SearchableDropdown';
import { filterSpecializations, filterSubSpecialties } from '../../data/medicalSpecializations';

const Step2Credentials = ({ formData, handleChange, handleDirectFieldChange, error }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Professional Credentials
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Please provide your medical credentials and professional information. This information will be verified during the approval process.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Professional Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Professional Title <span className="text-red-500">*</span>
          </label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
            <option value="Prof. Dr.">Prof. Dr.</option>
            <option value="Dr. med.">Dr. med.</option>
          </select>
        </div>

        {/* Medical License Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Medical License Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your medical license number"
          />
        </div>

        {/* License State/Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            License State/Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="licenseState"
            value={formData.licenseState}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., California, New York, Ontario"
          />
        </div>

        {/* License Expiration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            License Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="licenseExpirationDate"
            value={formData.licenseExpirationDate}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Primary Specialization - Searchable Dropdown */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Primary Specialization <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            value={formData.specialization}
            onChange={(value) => {
              handleDirectFieldChange('specialization', value);
              // Clear sub-specialty when main specialization changes
              if (formData.subSpecialty) {
                handleDirectFieldChange('subSpecialty', '');
              }
            }}
            filterFunction={filterSpecializations}
            placeholder="Search for your medical specialization..."
            emptyMessage="No specializations found. Try a different search term."
            className="w-full"
            maxHeight="250px"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Start typing to search through remote health monitoring relevant specializations
          </p>
        </div>

        {/* Sub-Specialty - Searchable Dropdown */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Sub-Specialty (Optional)
          </label>
          <SearchableDropdown
            value={formData.subSpecialty}
            onChange={(value) => handleDirectFieldChange('subSpecialty', value)}
            filterFunction={(query) => filterSubSpecialties(query, formData.specialization)}
            placeholder={
              formData.specialization 
                ? `Search sub-specialties for ${formData.specialization}...`
                : "Select a primary specialization first..."
            }
            emptyMessage={
              formData.specialization
                ? "No sub-specialties found for this specialization."
                : "Please select a primary specialization first."
            }
            disabled={!formData.specialization}
            className="w-full"
            maxHeight="200px"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <select
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="0">Less than 1 year</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5">5 years</option>
            <option value="6">6-10 years</option>
            <option value="11">11-15 years</option>
            <option value="16">16-20 years</option>
            <option value="21">21-25 years</option>
            <option value="26">26+ years</option>
          </select>
        </div>



        {/* Telemedicine Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Telemedicine Experience
          </label>
          <select
            name="telemedicineExperience"
            value={formData.telemedicineExperience}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="none">No prior telemedicine experience</option>
            <option value="basic">Basic experience (less than 1 year)</option>
            <option value="intermediate">Intermediate experience (1-3 years)</option>
            <option value="advanced">Advanced experience (3+ years)</option>
            <option value="expert">Expert level (5+ years)</option>
          </select>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          📋 Verification Notice
        </h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          All professional credentials will be verified during the approval process. Please ensure all information matches your official medical license and certifications.
        </p>
      </div>
    </div>
  );
};

export default Step2Credentials;
