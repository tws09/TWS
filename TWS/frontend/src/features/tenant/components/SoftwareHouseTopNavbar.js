import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CogIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  BriefcaseIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  BellIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilSquareIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

// Search suggestions (same as CommandPalette) – navigate + quick create
const getSearchActions = (tenantSlug, navigate) => {
  if (!tenantSlug) return [];
  return [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: `/${tenantSlug}/org/dashboard` },
    { id: 'my-work', label: 'My Work', icon: BriefcaseIcon, path: `/${tenantSlug}/org/my-work` },
    { id: 'tasks', label: 'Tasks', icon: ClipboardDocumentListIcon, path: `/${tenantSlug}/org/projects/tasks` },
    { id: 'projects', label: 'Projects', icon: FolderIcon, path: `/${tenantSlug}/org/projects` },
    { id: 'add-task', label: 'Add Task', icon: ClipboardDocumentListIcon, path: `/${tenantSlug}/org/projects/tasks?create=task` },
    { id: 'hr', label: 'HR', icon: UsersIcon, path: `/${tenantSlug}/org/software-house/hr` },
    { id: 'finance', label: 'Finance', icon: CurrencyDollarIcon, path: `/${tenantSlug}/org/finance` },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, path: `/${tenantSlug}/org/analytics` },
    { id: 'documents', label: 'Documents', icon: PencilSquareIcon, path: `/${tenantSlug}/org/documents` },
    { id: 'settings', label: 'Settings', icon: CogIcon, path: `/${tenantSlug}/org/settings` },
    { id: 'add-user', label: 'Add User', icon: UserIcon, path: `/${tenantSlug}/org/users/create` },
    { id: 'log-time', label: 'Log Time', icon: ClockIcon, path: `/${tenantSlug}/org/software-house/time-tracking` },
  ];
};

/**
 * Horizontal navbar for Software House admin panel.
 * Left: Org logo (uploaded by admin from settings; falls back to initial).
 * Middle: Search bar with as-you-type suggestions.
 * Right: Profile dropdown.
 */
const SoftwareHouseTopNavbar = ({
  orgLogoUrl,
  orgName = 'Organization',
  user,
  onProfile,
  onLogout,
  onSearch,
  searchPlaceholder = 'Search...',
  onAddAction,
  isFullscreen = false,
  onFullscreenToggle,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionsRef = useRef(null);
  const addMenuRef = useRef(null);

  const actions = getSearchActions(tenantSlug, navigate);
  const query = searchQuery.trim().toLowerCase();
  const filteredSuggestions = query.length > 0
    ? actions.filter(
        (a) =>
          a.label.toLowerCase().includes(query)
      )
    : actions.slice(0, 6);

  const showSuggestions = suggestionsOpen && filteredSuggestions.length > 0;

  // Close suggestions and add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (onSearch) {
      onSearch(q);
    } else if (filteredSuggestions.length > 0) {
      navigate(filteredSuggestions[0].path);
    } else {
      navigate(`/${tenantSlug}/org/dashboard?q=${encodeURIComponent(q)}`);
    }
    setSearchQuery('');
    setSuggestionsOpen(false);
    setProfileOpen(false);
  };

  const handleSuggestionClick = (item) => {
    navigate(item.path);
    setSearchQuery('');
    setSuggestionsOpen(false);
    setProfileOpen(false);
  };

  const handleProfile = () => {
    setProfileOpen(false);
    if (onProfile) {
      onProfile();
    } else {
      navigate(`/${tenantSlug}/org/profile`);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    if (onLogout) onLogout();
  };

  const displayName = user?.fullName || user?.email || 'User';
  const initial = (orgName || 'O').charAt(0).toUpperCase();
  const userInitial = (user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

  return (
    <header className="flex items-center justify-between w-full h-[40px] px-2 sm:px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Left: Org logo */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => navigate(`/${tenantSlug}/org/dashboard`)}
          className="flex items-center gap-1.5 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
          aria-label="Go to dashboard"
        >
          {orgLogoUrl ? (
            <img
              src={orgLogoUrl}
              alt={orgName}
              className="h-7 w-auto max-w-[100px] object-contain object-left"
            />
          ) : (
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold text-xs shadow-sm">
              {initial}
            </div>
          )}
        </button>
      </div>

      {/* Middle: Search bar with suggestions */}
      <div className="flex-1 flex justify-center max-w-md mx-2" ref={suggestionsRef}>
        <form onSubmit={handleSearch} className="w-full relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-7 pr-2.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
               aria-label="Search"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="navbar-search-suggestions"
            />
          </div>
          {showSuggestions && (
            <div
              id="navbar-search-suggestions"
              className="absolute top-full left-0 right-0 mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {filteredSuggestions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </button>
                );
              })}
            </div>
          )}
        </form>
      </div>

      {/* Right: Add, Fullscreen, Notifications, Profile */}
      <div className="flex items-center shrink-0 gap-0.5 sm:gap-1">
        {/* Add dropdown */}
        {onAddAction && (
          <div className="relative" ref={addMenuRef}>
            <button
              type="button"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 transition-opacity"
              title="Quick add"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Add</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${addMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {addMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                <button type="button" onClick={() => { onAddAction('task'); setAddMenuOpen(false); }} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-primary-500" />
                  Add Task
                </button>
                <button type="button" onClick={() => { onAddAction('project'); setAddMenuOpen(false); }} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FolderIcon className="h-5 w-5 text-primary-500" />
                  Create Project
                </button>
                <button type="button" onClick={() => { onAddAction('user'); setAddMenuOpen(false); }} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <UserIcon className="h-5 w-5 text-primary-500" />
                  Add User
                </button>
                <button type="button" onClick={() => { onAddAction('time'); setAddMenuOpen(false); }} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ClockIcon className="h-5 w-5 text-primary-500" />
                  Log Time
                </button>
              </div>
            )}
          </div>
        )}

        {/* Night mode / Theme toggle */}
        {typeof onToggleTheme === 'function' && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Fullscreen */}
        {typeof onFullscreenToggle === 'function' && (
          <button
            type="button"
            onClick={onFullscreenToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button
          type="button"
          className="relative p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          title="Notifications"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
              {userInitial}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDownIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

        {profileOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden="true"
              onClick={() => setProfileOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-56 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleProfile}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); navigate(`/${tenantSlug}/org/settings`); }}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CogIcon className="h-4 w-4" />
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  );
};

export default SoftwareHouseTopNavbar;
