import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MultiStepForm from '../components/registration/MultiStepForm';
import Step1PersonalInfo from '../components/registration/Step1PersonalInfo';
import Step2ContactInfo from '../components/registration/Step2ContactInfo';
import Step3MedicalInfo from '../components/registration/Step3MedicalInfo';
import Step4Review from '../components/registration/Step4Review';
import {
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',

    // Step 2: Contact & Emergency Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },

    // Step 3: Medical Information (optional)
    medicalInfo: {
      bloodType: '',
      height: '',
      weight: '',
      allergies: [],
      chronicConditions: []
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { title: 'Personal Info', description: 'Basic information' },
    { title: 'Contact & Emergency', description: 'Address & emergency contact' },
    { title: 'Medical Info', description: 'Basic medical information' },
    { title: 'Review', description: 'Review and complete' }
  ];

  const handleChange = (field, value) => {
    if (typeof field === 'object' && field.target) {
      // Handle regular input events
      const { name, value: inputValue } = field.target;
      setFormData({ ...formData, [name]: inputValue });
    } else {
      // Handle custom field updates (for nested objects)
      setFormData({ ...formData, [field]: value });
    }
  };

  // Validation for each step
  const validateStep = (step) => {
    setError('');

    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.dateOfBirth || !formData.gender) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!isEmailVerified) {
          setError('Please verify your email address before proceeding');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
      case 2:
        if (!formData.emergencyContact?.name || !formData.emergencyContact?.relationship || !formData.emergencyContact?.phone) {
          setError('Please provide emergency contact information');
          return false;
        }
        break;
      case 3:
        // Medical info is optional, so no validation needed
        break;
      case 4:
        if (!acceptTerms) {
          setError('Please accept the terms and conditions to continue');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // Prepare data for backend - remove confirmPassword and structure properly
      const { confirmPassword, ...signupData } = formData;

      // Structure the data properly for the backend
      const registrationData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        dateOfBirth: signupData.dateOfBirth,
        gender: signupData.gender,
        address: signupData.address,
        emergencyContact: signupData.emergencyContact,
        medicalInfo: signupData.medicalInfo
      };

      const response = await api.post('/auth/signup', registrationData);
      setSuccess('Account created successfully! Redirecting to login...');

      // Redirect to login page after success
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            formData={formData}
            handleChange={handleChange}
            error={error}
            isEmailVerified={isEmailVerified}
            onEmailVerified={(verified) => setIsEmailVerified(verified !== false)}
          />
        );
      case 2:
        return (
          <Step2ContactInfo
            formData={formData}
            handleChange={handleChange}
            error={error}
          />
        );
      case 3:
        return (
          <Step3MedicalInfo
            formData={formData}
            handleChange={handleChange}
            error={error}
          />
        );
      case 4:
        return (
          <Step4Review
            formData={formData}
            error={error}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && formData.phone && formData.dateOfBirth && formData.gender;
      case 2:
        return formData.emergencyContact?.name && formData.emergencyContact?.relationship && formData.emergencyContact?.phone;
      case 3:
        return true; // Medical info is optional
      case 4:
        return acceptTerms;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-700/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Account Created Successfully!</h2>
          <p className="text-gray-600 dark:text-slate-400">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Registration
          </h1>
          <p className="mt-2 text-gray-600">
            Join PulseMate to monitor your health journey
          </p>
        </div>

        {/* Multi-Step Form */}
        <MultiStepForm
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        >
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Step Content */}
          <div>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`
                flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep === 4 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className={`
                  flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-200
                  ${canProceed() && !loading
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${canProceed()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </MultiStepForm>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              Sign in here
            </button>
          </p>
          <p className="mt-4 text-xs text-gray-500">
            By registering, you agree to our Terms of Service and Privacy Policy.
            Your health information is protected and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
