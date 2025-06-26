import React, { useState } from 'react';
import { InformationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * Tooltip component for providing helpful information
 */
const Tooltip = ({ 
  content, 
  children, 
  position = 'top',
  trigger = 'hover',
  icon = 'info',
  className = '',
  maxWidth = 'max-w-xs'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const toggleTooltip = () => setIsVisible(!isVisible);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-slate-700';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 dark:border-b-slate-700';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 dark:border-l-slate-700';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 dark:border-r-slate-700';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-slate-700';
    }
  };

  const IconComponent = icon === 'question' ? QuestionMarkCircleIcon : InformationCircleIcon;

  const triggerProps = trigger === 'click' 
    ? { onClick: toggleTooltip }
    : { onMouseEnter: showTooltip, onMouseLeave: hideTooltip };

  return (
    <div className={`relative inline-block ${className}`}>
      <div {...triggerProps} className="cursor-help">
        {children || (
          <IconComponent className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" />
        )}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()}`}>
          <div className={`${maxWidth} px-3 py-2 text-xs text-white bg-gray-800 dark:bg-slate-700 rounded-lg shadow-lg`}>
            {content}
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Info tooltip specifically for settings help
 */
export const SettingsTooltip = ({ content, className = '' }) => (
  <Tooltip 
    content={content} 
    position="top" 
    className={`ml-2 ${className}`}
    maxWidth="max-w-sm"
  />
);

/**
 * Help text component for longer explanations
 */
export const HelpText = ({ children, className = '' }) => (
  <p className={`text-xs text-gray-500 dark:text-slate-400 mt-1 ${className}`}>
    {children}
  </p>
);

/**
 * Warning text component
 */
export const WarningText = ({ children, className = '' }) => (
  <p className={`text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center ${className}`}>
    <InformationCircleIcon className="w-3 h-3 mr-1" />
    {children}
  </p>
);

/**
 * Info box component for important information
 */
export const InfoBox = ({ title, children, type = 'info', className = '' }) => {
  const getTypeClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 text-green-800 dark:text-green-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`p-3 border rounded-lg ${getTypeClasses()} ${className}`}>
      {title && (
        <h4 className="text-sm font-medium mb-1">{title}</h4>
      )}
      <div className="text-xs">{children}</div>
    </div>
  );
};

/**
 * Settings section with help
 */
export const SettingsSection = ({ title, description, children, helpContent, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center space-x-2">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">
        {title}
      </h3>
      {helpContent && <SettingsTooltip content={helpContent} />}
    </div>
    {description && (
      <HelpText>{description}</HelpText>
    )}
    {children}
  </div>
);

export default Tooltip;
