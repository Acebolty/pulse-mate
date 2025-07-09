import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { getCurrentUser, logout } from '../services/authService';
import api from '../services/api';

const ApplicationStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Fetch latest user data from backend
        const response = await api.get('/profile/me');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user status:', error);
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending_review':
        return {
          icon: ClockIcon,
          title: 'Application Under Review',
          description: 'Your application has been submitted and is being reviewed by our medical team.',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      case 'under_review':
        return {
          icon: DocumentCheckIcon,
          title: 'Documents Being Verified',
          description: 'Our team is currently verifying your credentials and documents.',
          color: 'yellow',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'needs_more_info':
        return {
          icon: ExclamationTriangleIcon,
          title: 'Additional Information Required',
          description: 'We need some additional information or documents to complete your application.',
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-800 dark:text-orange-200'
        };
      case 'approved':
        return {
          icon: CheckCircleIcon,
          title: 'Application Approved!',
          description: 'Congratulations! Your application has been approved. You can now access your dashboard.',
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          title: 'Application Not Approved',
          description: 'Unfortunately, your application was not approved at this time.',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200'
        };
      default:
        return {
          icon: ClockIcon,
          title: 'Application Status Unknown',
          description: 'Please contact support for assistance.',
          color: 'gray',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const status = user.doctorInfo?.approvalStatus || 'pending_review';
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Doctor Application Status
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Welcome, Dr. {user.firstName} {user.lastName}
          </p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-8 mb-8`}>
          <div className="flex items-center mb-4">
            <StatusIcon className={`w-8 h-8 ${statusInfo.textColor} mr-3`} />
            <h2 className={`text-2xl font-semibold ${statusInfo.textColor}`}>
              {statusInfo.title}
            </h2>
          </div>
          <p className={`text-lg ${statusInfo.textColor} mb-4`}>
            {statusInfo.description}
          </p>
          
          {user.doctorInfo?.adminNotes && (
            <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                Additional Notes:
              </h4>
              <p className="text-gray-700 dark:text-slate-300">
                {user.doctorInfo.adminNotes}
              </p>
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Application Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Submitted</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {user.doctorInfo?.applicationSubmittedAt 
                  ? new Date(user.doctorInfo.applicationSubmittedAt).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Specialization</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {user.doctorInfo?.specialization || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">License Number</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {user.doctorInfo?.licenseNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">License State</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {user.doctorInfo?.licenseState || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            If you have questions about your application status or need to provide additional information, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@pulsemate.com"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Email Support
            </a>
            <a
              href="tel:+1-555-123-4567"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Call Support
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          {status === 'approved' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Access Dashboard
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
