import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const DocumentUpload = ({ 
  documentType, 
  label, 
  description, 
  required = false, 
  onFileUpload, 
  uploadedFile = null,
  onRemove,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
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
      setError('Please upload a PDF, image, or Word document');
      return;
    }

    try {
      setUploading(true);
      await onFileUpload(documentType, file);
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) return '📄';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return '🖼️';
    if (['doc', 'docx'].includes(extension)) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
      )}

      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="space-y-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Uploading...</p>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                    {' '}or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    PDF, PNG, JPG, DOC up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Uploaded File Display */
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getFileIcon(uploadedFile.fileName)}</span>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {uploadedFile.fileName}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Uploaded successfully
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <button
              onClick={() => onRemove(documentType)}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
              title="Remove file"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
