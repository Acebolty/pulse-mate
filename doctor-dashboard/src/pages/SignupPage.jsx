import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MultiStepForm from '../components/registration/MultiStepForm';
import DocumentUpload from '../components/registration/DocumentUpload';
import Step1PersonalInfo from '../components/registration/Step1PersonalInfo';
import Step2Credentials from '../components/registration/Step2Credentials';
import Step3Documents from '../components/registration/Step3Documents';
import Step4Review from '../components/registration/Step4Review';
import { filterSpecializations } from '../data/medicalSpecializations';
import SearchableDropdown from '../components/ui/SearchableDropdown';
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
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
    
    // Step 2: Professional Credentials
    title: 'Dr.',
    licenseNumber: '',
    licenseState: '',
    licenseExpirationDate: '',
    specialization: '',
    subSpecialty: '',
    yearsOfExperience: '',
    telemedicineExperience: ''
  });
  
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { title: 'Personal Info', description: 'Basic information', icon: UserIcon },
    { title: 'Credentials', description: 'Professional details', icon: AcademicCapIcon },
    { title: 'Documents', description: 'Upload certificates', icon: DocumentTextIcon },
    { title: 'Review', description: 'Confirm & submit', icon: CheckCircleIcon }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDirectFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleFileUpload = async (documentType, file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('document', file);
    formDataUpload.append('documentType', documentType);

    try {
      const response = await api.post('/auth/upload-document', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: {
          fileName: file.name,
          fileUrl: response.data.fileUrl,
          cloudinaryPublicId: response.data.publicId
        }
      }));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const removeDocument = (documentType) => {
    setUploadedDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[documentType];
      return newDocs;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      console.log(`📍 Navigating to step ${newStep}`);
      setCurrentStep(newStep);

      if (newStep === 4) {
        console.log('📋 Reached Review step - NO automatic submission should happen');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
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
        if (!formData.licenseNumber || !formData.licenseState || !formData.specialization) {
          setError('Please fill in all required professional credentials');
          return false;
        }
        break;
      case 3:
        const requiredDocs = ['medical_license', 'cv_resume', 'professional_headshot'];
        const missingDocs = requiredDocs.filter(doc => !uploadedDocuments[doc]);
        if (missingDocs.length > 0) {
          setError('Please upload all required documents');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Add confirmation dialog to prevent accidental submissions
    const confirmed = window.confirm(
      'Are you sure you want to submit your doctor registration application? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    if (!validateStep(4)) return;

    console.log('🚀 User confirmed submission - proceeding with registration');
    setLoading(true);
    try {
      // Prepare the complete registration data
      const { confirmPassword, ...registrationData } = formData;
      
      // Add role and documents
      registrationData.role = 'doctor';
      registrationData.applicationDocuments = Object.entries(uploadedDocuments).map(([type, doc]) => ({
        documentType: type,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        cloudinaryPublicId: doc.cloudinaryPublicId
      }));

      // Clean up any empty fields
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === '' || registrationData[key] === null) {
          delete registrationData[key];
        }
      });

      console.log('📋 Submitting doctor registration:', registrationData);

      const response = await api.post('/auth/doctor-signup', registrationData);
      
      setSuccess('Registration submitted successfully! Your application is under review. You will receive an email once approved.');
      
      // Redirect to a success page or login after a delay
      setTimeout(() => {
        navigate('/login?message=registration_success');
      }, 3000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
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
          <Step2Credentials
            formData={formData}
            handleChange={handleChange}
            handleDirectFieldChange={handleDirectFieldChange}
            error={error}
          />
        );
      case 3:
        return (
          <Step3Documents
            formData={formData}
            uploadedDocuments={uploadedDocuments}
            handleFileUpload={handleFileUpload}
            removeDocument={removeDocument}
            error={error}
          />
        );
      case 4:
        return (
          <Step4Review
            formData={formData}
            uploadedDocuments={uploadedDocuments}
            error={error}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Doctor Registration
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Join PulseMate as a verified healthcare provider
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
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Step Content */}
          <div>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-6 h-6 mr-3" />
                      🚀 Submit Doctor Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </MultiStepForm>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in here
            </button>
          </p>
          <p className="mt-4 text-xs text-gray-500 dark:text-slate-500">
            By registering, you agree to our Terms of Service and Privacy Policy.
            All information will be verified during the approval process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
