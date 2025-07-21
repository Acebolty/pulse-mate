import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const EmailVerification = ({
  email,
  onVerificationSuccess,
  onVerificationError,
  onOTPSent,
  isVisible = false,
  className = ""
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-send OTP when component becomes visible
  useEffect(() => {
    if (isVisible && email && timeLeft === 0) {
      sendOTP();
    }
  }, [isVisible, email]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/send-otp', { email });
      
      if (response.data.success) {
        setSuccess('OTP sent successfully! Check your email.');
        setTimeLeft(300); // 5 minutes
        setAttemptsLeft(3);
        setOtp('');
        onOTPSent && onOTPSent();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      if (response.data.success) {
        setSuccess('Email verified successfully!');
        onVerificationSuccess && onVerificationSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP';
      setError(errorMessage);
      
      if (err.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(err.response.data.attemptsLeft);
      }
      
      onVerificationError && onVerificationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      verifyOTP();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Email Verification Required
          </h3>
          {timeLeft > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Expires in {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <p className="text-sm text-blue-700 dark:text-blue-300">
          {isSending ? (
            <>Sending verification code to <strong>{email}</strong>...</>
          ) : (
            <>We've sent a 6-digit verification code to <strong>{email}</strong></>
          )}
        </p>

        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Enter Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            className="w-full p-3 text-center text-lg font-mono border border-blue-300 dark:border-blue-600 rounded-lg dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Attempts Left */}
        {attemptsLeft < 3 && attemptsLeft > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={verifyOTP}
            disabled={isLoading || otp.length !== 6}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button
            onClick={sendOTP}
            disabled={isSending || timeLeft > 240} // Disable if recently sent (within 1 minute)
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        {timeLeft > 240 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can request a new code in {formatTime(timeLeft - 240)}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
