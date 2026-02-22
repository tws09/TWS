import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserIcon,
  ClockIcon,
  HomeIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowRightIcon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Z_INDEX } from '../../../shared/constants/zIndex';

const CommandPalette = ({ isOpen, onClose, tenantSlug, initialSearchTerm = '' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Navigation actions
  const navigationActions = [
    {
      id: 'my-work',
      label: 'My Work',
      icon: BriefcaseIcon,
      action: () => navigate(`/${tenantSlug}/org/my-work`),
      category: 'Navigate'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ClipboardDocumentListIcon,
      action: () => navigate(`/${tenantSlug}/org/projects/tasks`),
      category: 'Navigate'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderIcon,
      action: () => navigate(`/${tenantSlug}/org/projects`),
      category: 'Navigate'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      action: () => navigate(`/${tenantSlug}/org/dashboard`),
      category: 'Navigate'
    },
    {
      id: 'hr',
      label: 'HR',
      icon: UsersIcon,
      action: () => navigate(`/${tenantSlug}/org/software-house/hr`),
      category: 'Navigate'
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: CurrencyDollarIcon,
      action: () => navigate(`/${tenantSlug}/org/finance`),
      category: 'Navigate'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      action: () => navigate(`/${tenantSlug}/org/analytics`),
      category: 'Navigate'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: PencilSquareIcon,
      action: () => navigate(`/${tenantSlug}/org/documents`),
      category: 'Navigate'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      action: () => navigate(`/${tenantSlug}/org/settings`),
      category: 'Navigate'
    }
  ];

  // Quick create actions
  const quickCreateActions = [
    {
      id: 'create-task',
      label: 'Add Task',
      icon: ClipboardDocumentListIcon,
      action: () => {
        navigate(`/${tenantSlug}/org/projects/tasks?create=task`);
      },
      category: 'Quick Create'
    },
    {
      id: 'create-project',
      label: 'Create Project',
      icon: FolderIcon,
      action: () => {
        navigate(`/${tenantSlug}/org/projects?create=project`);
      },
      category: 'Quick Create'
    },
    {
      id: 'add-user',
      label: 'Add User',
      icon: UserIcon,
      action: () => navigate(`/${tenantSlug}/org/users/create`),
      category: 'Quick Create'
    },
    {
      id: 'log-time',
      label: 'Log Time',
      icon: ClockIcon,
      action: () => navigate(`/${tenantSlug}/org/software-house/time-tracking`),
      category: 'Quick Create'
    },
    {
      id: 'new-document',
      label: 'New Document',
      icon: PencilSquareIcon,
      action: () => navigate(`/${tenantSlug}/org/documents/new`),
      category: 'Quick Create'
    }
  ];

  const allActions = [...quickCreateActions, ...navigationActions];

  // Filter actions based on search term
  const filteredActions = allActions.filter(action =>
    action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {});

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredActions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        filteredActions[selectedIndex].action();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Focus input when opened; pre-fill from navbar search if provided
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialSearchTerm || '');
      setSelectedIndex(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, initialSearchTerm]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleActionClick = (action) => {
    action.action();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center pt-[20vh] px-4"
      style={{ zIndex: Z_INDEX.MODAL }}
      onClick={onClose}
    >
      <div 
        className="glass-card-premium w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200/50 dark:border-white/10">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search or navigate..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto glass-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          ) : (
            <div ref={resultsRef} className="py-2">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {actions.map((action, index) => {
                    const globalIndex = filteredActions.indexOf(action);
                    const Icon = action.icon;
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 font-medium">{action.label}</span>
                        {isSelected && (
                          <ArrowRightIcon className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200/50 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
