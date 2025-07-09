import React from 'react';
import { 
  UserIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Step4Review = ({ formData, uploadedDocuments, error, loading }) => {
  const requiredDocuments = ['medical_license', 'cv_resume', 'professional_headshot'];
  const uploadedRequiredDocs = requiredDocuments.filter(doc => uploadedDocuments[doc]);
  const allRequiredDocsUploaded = uploadedRequiredDocs.length === requiredDocuments.length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentTitle = (docType) => {
    const titles = {
      medical_license: 'Medical License',
      cv_resume: 'CV/Resume',
      professional_headshot: 'Professional Headshot',
      board_certification: 'Board Certification',
      government_id: 'Government ID'
    };
    return titles[docType] || docType;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Review & Submit Application
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Please review all your information before submitting your application. Once submitted, your application will be reviewed by our team.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Application Status */}
      <div className={`border rounded-lg p-4 ${
        allRequiredDocsUploaded 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center">
          {allRequiredDocsUploaded ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
          )}
          <h3 className={`font-medium ${
            allRequiredDocsUploaded 
              ? 'text-green-800 dark:text-green-200'
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {allRequiredDocsUploaded 
              ? 'Application Ready for Submission'
              : 'Missing Required Documents'
            }
          </h3>
        </div>
        <p className={`text-sm mt-1 ${
          allRequiredDocsUploaded 
            ? 'text-green-700 dark:text-green-300'
            : 'text-yellow-700 dark:text-yellow-300'
        }`}>
          {allRequiredDocsUploaded 
            ? 'All required information and documents have been provided.'
            : `Please upload all required documents before submitting. Missing: ${requiredDocuments.filter(doc => !uploadedDocuments[doc]).length} documents.`
          }
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Personal Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Full Name</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.firstName} {formData.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Phone</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.phone || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Date of Birth</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formatDate(formData.dateOfBirth)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Gender</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.gender || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Credentials */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Professional Credentials
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Professional Title</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Medical License Number</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.licenseNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">License State</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.licenseState}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">License Expiration</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formatDate(formData.licenseExpirationDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Primary Specialization</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.specialization}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Sub-Specialty</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.subSpecialty || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Years of Experience</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.yearsOfExperience || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Telemedicine Experience</p>
            <p className="font-medium text-gray-900 dark:text-slate-100">
              {formData.telemedicineExperience || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Uploaded Documents
          </h3>
        </div>
        
        {Object.keys(uploadedDocuments).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(uploadedDocuments).map(([docType, doc]) => (
              <div key={docType} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {getDocumentTitle(docType)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {doc.fileName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              No documents uploaded yet
            </p>
          </div>
        )}
      </div>

      {/* Submission Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          📋 What happens next?
        </h4>
        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <li>• Your application will be reviewed by our medical team</li>
          <li>• We'll verify your credentials and documents</li>
          <li>• You'll receive an email update within 3-5 business days</li>
          <li>• Once approved, you'll gain full access to the doctor dashboard</li>
        </ul>
      </div>

      {!allRequiredDocsUploaded && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Action Required
          </h4>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Please go back to Step 3 and upload all required documents before submitting your application.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step4Review;
