import React from 'react';
import { CheckCircleIcon, UserIcon, HomeIcon, HeartIcon } from '@heroicons/react/24/outline';

const Step4Review = ({ formData, error, acceptTerms, setAcceptTerms }) => {
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Not provided';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Review Your Information
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Please review all the information you've provided. You can go back to make changes or proceed to create your account.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Personal Information Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Name:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.firstName} {formData.lastName}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Email:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">{formData.email}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Phone:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">{formData.phone}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Age:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {calculateAge(formData.dateOfBirth)} years old
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Gender:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">{formData.gender}</span>
          </div>
        </div>
      </div>

      {/* Contact Information Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <HomeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Contact & Emergency Information</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Address:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.address?.street ? (
                `${formData.address.street}, ${formData.address.city || ''} ${formData.address.state || ''} ${formData.address.zipCode || ''}, ${formData.address.country || ''}`
              ) : (
                'Not provided'
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Emergency Contact:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.emergencyContact?.name ? (
                `${formData.emergencyContact.name} (${formData.emergencyContact.relationship}) - ${formData.emergencyContact.phone}`
              ) : (
                'Not provided'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Medical Information Summary */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <HeartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Medical Information</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Blood Type:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.medicalInfo?.bloodType || 'Not provided'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Height:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.medicalInfo?.height || 'Not provided'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Weight:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.medicalInfo?.weight || 'Not provided'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Allergies:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.medicalInfo?.allergies?.length > 0 
                ? formData.medicalInfo.allergies.join(', ')
                : 'None reported'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-slate-300">Chronic Conditions:</span>
            <span className="ml-2 text-gray-900 dark:text-slate-100">
              {formData.medicalInfo?.chronicConditions?.length > 0 
                ? formData.medicalInfo.chronicConditions.join(', ')
                : 'None reported'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Terms and Conditions</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-slate-300">
              I agree to the{' '}
              <a href="#" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline">
                Privacy Policy
              </a>
            </label>
          </div>
          
          <div className="text-xs text-gray-600 dark:text-slate-400 space-y-2">
            <p>
              • Your personal and medical information will be securely stored and encrypted
            </p>
            <p>
              • You can update or delete your information at any time in your profile settings
            </p>
            <p>
              • Your data will only be shared with healthcare providers you choose to connect with
            </p>
            <p>
              • You will receive important health alerts and appointment notifications
            </p>
          </div>
        </div>
      </div>

      {/* Success Message Preview */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Ready to create your account!</strong> Once you click "Create Account", you'll be able to log in immediately and start using PulseMate to monitor your health and connect with healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Review;
