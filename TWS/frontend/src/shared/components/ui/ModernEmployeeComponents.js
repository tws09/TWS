// Modern Employee Portal Component Templates
// This file contains the modern styling patterns to be applied across all employee portal components

import React from 'react';
import {
  BellIcon,
  AcademicCapIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ReceiptPercentIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Modern Header Component Template
export const ModernHeader = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "from-blue-500 to-blue-600",
  children 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {children && (
          <div className="flex items-center space-x-3">
            {children}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Modern Metric Card Template
export const ModernMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon, 
  iconColor = "blue",
  description 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-${iconColor}-100 dark:bg-${iconColor}-900/30`}>
        <Icon className={`w-6 h-6 text-${iconColor}-600 dark:text-${iconColor}-400`} />
      </div>
      {change && (
        <div className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {change}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
  </div>
);

// Modern Section Card Template
export const ModernSectionCard = ({ 
  title, 
  icon: Icon, 
  iconColor = "indigo",
  children,
  actions
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${iconColor}-100 dark:bg-${iconColor}-900/30`}>
            <Icon className={`w-5 h-5 text-${iconColor}-600 dark:text-${iconColor}-400`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Modern Table Template
export const ModernTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {headers.map((header, index) => (
            <th 
              key={index}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
    </table>
  </div>
);

// Modern Button Template
export const ModernButton = ({ 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  children, 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// Modern Input Template
export const ModernInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  icon: Icon,
  ...props 
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
        {...props}
      />
    </div>
  </div>
);

// Modern Modal Template
export const ModernModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
        {actions && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Status Badge Template
export const ModernStatusBadge = ({ 
  status, 
  variant = 'default' 
}) => {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {status}
    </span>
  );
};

// Example usage patterns for different employee portal pages:

// For Notifications Hub:
export const NotificationsExample = () => (
  <ModernHeader
    title="Notifications Hub"
    description="Stay updated with important announcements and messages"
    icon={BellIcon}
    iconColor="from-yellow-500 to-yellow-600"
  >
    <ModernButton variant="primary">
      Mark All Read
    </ModernButton>
  </ModernHeader>
);

// For Learning & Development:
export const LearningExample = () => (
  <ModernHeader
    title="Learning & Development"
    description="Enhance your skills with courses and training programs"
    icon={AcademicCapIcon}
    iconColor="from-purple-500 to-purple-600"
  >
    <ModernButton variant="primary">
      Browse Courses
    </ModernButton>
  </ModernHeader>
);

// For Document Storage:
export const DocumentsExample = () => (
  <ModernHeader
    title="Document Storage"
    description="Manage and access your important documents"
    icon={DocumentIcon}
    iconColor="from-emerald-500 to-emerald-600"
  >
    <ModernButton variant="primary" icon={DocumentIcon}>
      Upload Document
    </ModernButton>
  </ModernHeader>
);

// For Internal Communication:
export const CommunicationExample = () => (
  <ModernHeader
    title="Internal Communication"
    description="Connect and collaborate with your team"
    icon={ChatBubbleLeftRightIcon}
    iconColor="from-pink-500 to-pink-600"
  >
    <ModernButton variant="primary">
      New Message
    </ModernButton>
  </ModernHeader>
);

// For Personal Expenses:
export const ExpensesExample = () => (
  <ModernHeader
    title="Personal Expenses"
    description="Track and manage your expense reports"
    icon={ReceiptPercentIcon}
    iconColor="from-orange-500 to-orange-600"
  >
    <ModernButton variant="primary">
      New Expense
    </ModernButton>
  </ModernHeader>
);
