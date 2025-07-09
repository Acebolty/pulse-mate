import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

const MultiStepForm = ({ currentStep, totalSteps, steps, children }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent
                          ? 'text-gray-900 dark:text-slate-100'
                          : 'text-gray-500 dark:text-slate-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                      stepNumber < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Mobile Step Indicator */}
        <div className="sm:hidden mt-4 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1 text-center">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};

export default MultiStepForm;
