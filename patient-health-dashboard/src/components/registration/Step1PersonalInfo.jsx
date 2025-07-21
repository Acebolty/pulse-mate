import React, { useState } from 'react';
import EmailVerification from '../ui/EmailVerification';

const Step1PersonalInfo = ({ formData, handleChange, error, onEmailVerified, isEmailVerified }) => {
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isInitialSending, setIsInitialSending] = useState(false);

  // Handle email change - reset verification if email changes
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    handleChange(e);

    // If email changes and it was previously verified, reset verification
    if (isEmailVerified && verifiedEmail && newEmail !== verifiedEmail) {
      onEmailVerified && onEmailVerified(false); // Reset verification
      setShowEmailVerification(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Let's start with your basic information. This will be used to create your patient profile.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your last name"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Email Address <span className="text-red-500">*</span>
            {isEmailVerified && (
              <span className="ml-2 text-green-600 dark:text-green-400 text-sm">✓ Verified</span>
            )}
          </label>
          <div className="flex space-x-3">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              className="flex-1 p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your email address"
              disabled={isEmailVerified}
            />
            {!isEmailVerified && formData.email && (
              <button
                type="button"
                onClick={() => {
                  setShowEmailVerification(true);
                  setIsInitialSending(true);
                }}
                disabled={isInitialSending}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isInitialSending ? 'Sending...' : 'Verify Email'}
              </button>
            )}
          </div>

          {/* Email Verification Component */}
          <EmailVerification
            email={formData.email}
            isVisible={showEmailVerification && !isEmailVerified}
            onVerificationSuccess={() => {
              setShowEmailVerification(false);
              setVerifiedEmail(formData.email);
              setIsInitialSending(false);
              onEmailVerified && onEmailVerified(true);
            }}
            onVerificationError={(error) => {
              console.error('Email verification error:', error);
              setIsInitialSending(false);
            }}
            onOTPSent={() => {
              setIsInitialSending(false);
            }}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="+234-000-000-0000"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Create a secure password (min. 6 characters)"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privacy Notice:</strong> Your personal information is securely encrypted and will only be used for healthcare purposes. You can update this information anytime in your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
