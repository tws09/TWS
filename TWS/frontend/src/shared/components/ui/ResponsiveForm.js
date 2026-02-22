import React from 'react';
import { useResponsiveTouch, useResponsiveTypography } from '../../../shared/hooks/useResponsive';
import { LoadingSpinner } from './Loading/UnifiedLoading';

const ResponsiveForm = ({
  children,
  onSubmit,
  loading = false,
  className = '',
  ...props
}) => {
  const { isTouchDevice } = useResponsiveTouch();

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${isTouchDevice ? 'space-y-8' : ''} ${className}`}
      {...props}
    >
      {children}
      {loading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" variant="primary" text="Processing..." />
        </div>
      )}
    </form>
  );
};

const ResponsiveFormGroup = ({
  children,
  className = '',
  ...props
}) => {
  const { isTouchDevice } = useResponsiveTouch();

  return (
    <div
      className={`space-y-2 ${isTouchDevice ? 'space-y-3' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveLabel = ({
  children,
  htmlFor,
  required = false,
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  return (
    <label
      htmlFor={htmlFor}
      className={`
        block font-medium text-gray-700 dark:text-gray-300
        ${getFontSize('sm')}
        ${className}
      `}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

const ResponsiveInput = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = false,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const { touchTargetSize, touchPadding, isTouchDevice } = useResponsiveTouch();

  const baseClasses = `
    block w-full
    border rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${touchTargetSize}
    ${isTouchDevice ? touchPadding : 'px-3 py-2'}
  `;

  const stateClasses = error
    ? `
      border-red-300 dark:border-red-600
      bg-red-50 dark:bg-red-900/20
      text-red-900 dark:text-red-300
      placeholder-red-300 dark:placeholder-red-600
      focus:ring-red-500 focus:border-red-500
    `
    : `
      border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
      focus:ring-primary-500 focus:border-primary-500
    `;

  const combinedClasses = `
    ${baseClasses}
    ${stateClasses}
    ${className}
  `.trim();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      className={combinedClasses}
      {...props}
    />
  );
};

const ResponsiveTextarea = ({
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = false,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const { touchTargetSize, isTouchDevice } = useResponsiveTouch();

  const baseClasses = `
    block w-full
    border rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-vertical
    ${isTouchDevice ? 'min-h-[120px] p-4' : 'min-h-[100px] p-3'}
  `;

  const stateClasses = error
    ? `
      border-red-300 dark:border-red-600
      bg-red-50 dark:bg-red-900/20
      text-red-900 dark:text-red-300
      placeholder-red-300 dark:placeholder-red-600
      focus:ring-red-500 focus:border-red-500
    `
    : `
      border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
      focus:ring-primary-500 focus:border-primary-500
    `;

  const combinedClasses = `
    ${baseClasses}
    ${stateClasses}
    ${className}
  `.trim();

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      rows={rows}
      className={combinedClasses}
      {...props}
    />
  );
};

const ResponsiveSelect = ({
  children,
  value = '',
  onChange,
  onBlur,
  error = false,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const { touchTargetSize, touchPadding, isTouchDevice } = useResponsiveTouch();

  const baseClasses = `
    block w-full
    border rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${touchTargetSize}
    ${isTouchDevice ? touchPadding : 'px-3 py-2'}
  `;

  const stateClasses = error
    ? `
      border-red-300 dark:border-red-600
      bg-red-50 dark:bg-red-900/20
      text-red-900 dark:text-red-300
      focus:ring-red-500 focus:border-red-500
    `
    : `
      border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-primary-500 focus:border-primary-500
    `;

  const combinedClasses = `
    ${baseClasses}
    ${stateClasses}
    ${className}
  `.trim();

  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      className={combinedClasses}
      {...props}
    >
      {children}
    </select>
  );
};

const ResponsiveCheckbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const { isTouchDevice } = useResponsiveTouch();

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded
          ${isTouchDevice ? 'h-5 w-5' : ''}
        `}
        {...props}
      />
      {label && (
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
    </div>
  );
};

const ResponsiveRadio = ({
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const { isTouchDevice } = useResponsiveTouch();

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300
          ${isTouchDevice ? 'h-5 w-5' : ''}
        `}
        {...props}
      />
      {label && (
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
    </div>
  );
};

const ResponsiveFormError = ({
  children,
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  return (
    <p
      className={`
        text-red-600 dark:text-red-400
        ${getFontSize('sm')}
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
};

const ResponsiveFormHelp = ({
  children,
  className = '',
  ...props
}) => {
  const { getFontSize } = useResponsiveTypography();

  return (
    <p
      className={`
        text-gray-500 dark:text-gray-400
        ${getFontSize('sm')}
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
};

export {
  ResponsiveForm,
  ResponsiveFormGroup,
  ResponsiveLabel,
  ResponsiveInput,
  ResponsiveTextarea,
  ResponsiveSelect,
  ResponsiveCheckbox,
  ResponsiveRadio,
  ResponsiveFormError,
  ResponsiveFormHelp
};

export default ResponsiveForm;
