import React, { useState, useCallback } from 'react';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const ProgressiveDisclosure = ({
  title,
  children,
  defaultOpen = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // On mobile/tablet, always show as collapsible
  // On desktop, show as expanded by default unless specified
  const shouldCollapse = isMobile || isTablet || variant === 'collapsible';

  const baseClasses = `
    border border-gray-200 dark:border-gray-700
    rounded-lg
    transition-all duration-200 ease-in-out
  `;

  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800
      shadow-sm
    `,
    card: `
      bg-white dark:bg-gray-800
      shadow-lg
    `,
    minimal: `
      bg-transparent
      border-none
    `,
    collapsible: `
      bg-white dark:bg-gray-800
      shadow-sm
    `
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  if (!shouldCollapse) {
    return (
      <div className={combinedClasses} {...props}>
        {title && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset transition-colors duration-200"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center">
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const ProgressiveAccordion = ({
  items = [],
  allowMultiple = false,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = useCallback((index) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      return newSet;
    });
  }, [allowMultiple]);

  // On desktop, show all items expanded by default
  // On mobile/tablet, show as accordion
  const shouldCollapse = isMobile || isTablet;

  if (!shouldCollapse) {
    return (
      <div className={`space-y-4 ${className}`} {...props}>
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            {item.title && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
            )}
            <div className="p-4">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset transition-colors duration-200"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <div className="flex items-center">
              {openItems.has(index) ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </button>
          
          {openItems.has(index) && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4">
                {item.content}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProgressiveTabs = ({
  tabs = [],
  defaultTab = 0,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState(defaultTab);

  const setActiveTabHandler = useCallback((index) => {
    setActiveTab(index);
  }, []);

  // On mobile, show as dropdown
  // On desktop, show as tabs
  if (isMobile || isTablet) {
    return (
      <div className={className} {...props}>
        <div className="mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTabHandler(parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {tabs.map((tab, index) => (
              <option key={index} value={index}>
                {tab.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          {tabs[activeTab]?.content}
        </div>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTabHandler(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === index
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

const ProgressiveList = ({
  items = [],
  itemsPerPage = 10,
  showLoadMore = true,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);

  const loadMore = useCallback(() => {
    setVisibleItems(prev => Math.min(prev + itemsPerPage, items.length));
  }, [itemsPerPage, items.length]);

  const reset = useCallback(() => {
    setVisibleItems(itemsPerPage);
  }, [itemsPerPage]);

  // On mobile, show fewer items initially
  const initialItems = isMobile ? Math.min(5, itemsPerPage) : itemsPerPage;

  React.useEffect(() => {
    setVisibleItems(initialItems);
  }, [initialItems]);

  const displayItems = items.slice(0, visibleItems);
  const hasMore = visibleItems < items.length;

  return (
    <div className={className} {...props}>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            {item}
          </div>
        ))}
      </div>
      
      {hasMore && showLoadMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
          >
            Load More ({items.length - visibleItems} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

const ProgressiveForm = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [step, setStep] = useState(currentStep);

  const nextStep = useCallback(() => {
    if (step < steps.length - 1) {
      const newStep = step + 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  }, [step, steps.length, onStepChange]);

  const prevStep = useCallback(() => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  }, [step, onStepChange]);

  const goToStep = useCallback((stepIndex) => {
    setStep(stepIndex);
    onStepChange?.(stepIndex);
  }, [onStepChange]);

  React.useEffect(() => {
    setStep(currentStep);
  }, [currentStep]);

  return (
    <div className={className} {...props}>
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {step + 1} of {steps.length}: {steps[step]?.title}
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {steps[step]?.content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={step === steps.length - 1}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export {
  ProgressiveDisclosure,
  ProgressiveAccordion,
  ProgressiveTabs,
  ProgressiveList,
  ProgressiveForm
};

export default ProgressiveDisclosure;
