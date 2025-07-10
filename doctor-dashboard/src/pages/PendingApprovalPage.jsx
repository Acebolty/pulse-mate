import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ClockIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get status from navigation state or URL params
  const status = location.state?.status || new URLSearchParams(location.search).get('status') || 'pending_review';
  const email = location.state?.email || 'your registered email';

  const getStatusInfo = () => {
    switch (status) {
      case 'pending_review':
        return {
          icon: ClockIcon,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Application Under Review',
          message: 'Your doctor registration application is currently being reviewed by our medical team.',
          details: [
            'We are verifying your medical credentials and documents',
            'This process typically takes 3-5 business days',
            'You will receive an email notification once approved',
            'Please ensure your contact information is up to date'
          ],
          actionText: 'Check your email regularly for updates'
        };
      
      case 'rejected':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Application Not Approved',
          message: 'Unfortunately, your doctor registration application was not approved.',
          details: [
            'Please check your email for specific feedback',
            'You may resubmit with corrected information',
            'Contact support if you need clarification',
            'Ensure all documents meet our requirements'
          ],
          actionText: 'Contact support for assistance'
        };
      
      case 'suspended':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: 'Account Suspended',
          message: 'Your doctor account has been temporarily suspended.',
          details: [
            'Please contact our support team immediately',
            'Review the suspension notice sent to your email',
            'Provide any requested documentation',
            'Account access will be restored upon resolution'
          ],
          actionText: 'Contact support immediately'
        };
      
      default:
        return {
          icon: ClockIcon,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          title: 'Account Verification Required',
          message: 'Your account requires additional verification.',
          details: [
            'Please check your email for instructions',
            'Complete any pending verification steps',
            'Contact support if you need assistance'
          ],
          actionText: 'Check your email for next steps'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <DocumentCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-slate-100">
            PulseMate Doctor Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Healthcare Professional Access
          </p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6`}>
          <div className="flex items-center mb-4">
            <StatusIcon className={`w-8 h-8 ${statusInfo.iconColor} mr-3`} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {statusInfo.title}
            </h2>
          </div>
          
          <p className="text-gray-700 dark:text-slate-300 mb-4">
            {statusInfo.message}
          </p>
          
          <ul className="space-y-2 mb-6">
            {statusInfo.details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-slate-400">{detail}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
              📧 Registered Email:
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{email}</p>
          </div>
        </div>

        {/* Action Message */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-4">
            {statusInfo.actionText}
          </p>
          
          {/* Support Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
              Need Help?
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <p>📧 Email: support@pulsemate.com</p>
              <p>📞 Phone: (234) 704 463 2134</p>
              <p>🕒 Hours: Mon-Fri 9AM-6PM GMT+1</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Login
          </button>
          
          {status === 'rejected' && (
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentCheckIcon className="w-4 h-4 mr-2" />
              Submit New Application
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-slate-500">
            PulseMate - Connecting Healthcare Professionals with Patients
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
