import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Step3Documents = ({ 
  formData, 
  uploadedDocuments, 
  handleFileUpload, 
  removeDocument, 
  error 
}) => {
  const [uploading, setUploading] = useState({});

  const requiredDocuments = [
    {
      type: 'medical_license',
      title: 'Medical License',
      description: 'Upload a clear copy of your current medical license (front and back if applicable)',
      acceptedFormats: '.pdf, .jpg, .jpeg, .png',
      required: true
    },
    {
      type: 'cv_resume',
      title: 'CV/Resume',
      description: 'Upload your current curriculum vitae or professional resume',
      acceptedFormats: '.pdf, .doc, .docx',
      required: true
    },
    {
      type: 'professional_headshot',
      title: 'Professional Headshot',
      description: 'Upload a professional photo for your profile (clear, recent photo)',
      acceptedFormats: '.jpg, .jpeg, .png',
      required: true
    }
  ];

  const optionalDocuments = [
    {
      type: 'board_certification',
      title: 'Board Certification',
      description: 'Upload your board certification documents (if applicable)',
      acceptedFormats: '.pdf, .jpg, .jpeg, .png',
      required: false
    },
    {
      type: 'government_id',
      title: 'Government ID',
      description: 'Upload a copy of your government-issued ID for verification',
      acceptedFormats: '.pdf, .jpg, .jpeg, .png',
      required: false
    }
  ];

  const handleFileSelect = async (documentType, file) => {
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, image, or Word document.');
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));

    try {
      await handleFileUpload(documentType, file);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const DocumentUploadCard = ({ document }) => {
    const isUploaded = uploadedDocuments[document.type];
    const isUploading = uploading[document.type];

    return (
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-slate-100">
                {document.title}
                {document.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                {document.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Accepted formats: {document.acceptedFormats}
              </p>
            </div>
          </div>
          
          {isUploaded && (
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
          )}
        </div>

        {isUploaded ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {isUploaded.fileName}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    Uploaded successfully
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(isUploaded.fileUrl, '_blank')}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="View document"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeDocument(document.type)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Remove document"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Uploading document...
                </p>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Click to upload or drag and drop
                </p>
                <input
                  type="file"
                  id={`file-${document.type}`}
                  className="hidden"
                  accept={document.acceptedFormats}
                  onChange={(e) => handleFileSelect(document.type, e.target.files[0])}
                />
                <label
                  htmlFor={`file-${document.type}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const requiredDocsUploaded = requiredDocuments.filter(doc => uploadedDocuments[doc.type]).length;
  const totalRequiredDocs = requiredDocuments.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Upload Documents
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Please upload the required documents for verification. All documents will be securely stored and reviewed by our team.
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

      {/* Progress Indicator */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Required Documents Progress
          </span>
          <span className="text-sm text-blue-600 dark:text-blue-300">
            {requiredDocsUploaded} of {totalRequiredDocs} completed
          </span>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(requiredDocsUploaded / totalRequiredDocs) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Required Documents */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Required Documents
        </h3>
        <div className="space-y-4">
          {requiredDocuments.map((document) => (
            <DocumentUploadCard key={document.type} document={document} />
          ))}
        </div>
      </div>

      {/* Optional Documents */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Optional Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          These documents are optional but may help expedite the verification process.
        </p>
        <div className="space-y-4">
          {optionalDocuments.map((document) => (
            <DocumentUploadCard key={document.type} document={document} />
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          📋 Important Notes
        </h4>
        <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
          <li>• All documents must be clear and legible</li>
          <li>• File size limit: 10MB per document</li>
          <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
          <li>• Documents will be securely stored and encrypted</li>
          <li>• You can replace documents by uploading new ones</li>
        </ul>
      </div>
    </div>
  );
};

export default Step3Documents;
