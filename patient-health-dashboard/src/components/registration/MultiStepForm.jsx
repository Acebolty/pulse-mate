import React from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  HomeIcon,
  HeartIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const MultiStepForm = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onSubmit, 
  children, 
  canProceed = true,
  isLastStep = false,
  loading = false 
}) => {
  const steps = [
    { number: 1, title: 'Personal Info', icon: UserIcon, description: 'Basic information' },
    { number: 2, title: 'Contact & Emergency', icon: HomeIcon, description: 'Address & emergency contact' },
    { number: 3, title: 'Medical Info', icon: HeartIcon, description: 'Basic medical information' },
    { number: 4, title: 'Review', icon: CheckCircleIcon, description: 'Review and complete' }
  ];

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border-green-600';
      case 'current':
        return 'bg-blue-600 text-white border-blue-600';
      default:
        return 'bg-gray-200 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Create Your Patient Account
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Join PulseMate to start monitoring your health and connect with healthcare providers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.number);
              const StepIcon = step.icon;
              
              return (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${getStepClasses(status)}
                    `}>
                      {status === 'completed' ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-all duration-200
                      ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-slate-700'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 md:p-8"
        >
          {children}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }
            `}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canProceed || loading}
              className={`
                flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200
                ${canProceed && !loading
                  ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${canProceed
                  ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400'
                }
              `}
            >
              <span>Next</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
