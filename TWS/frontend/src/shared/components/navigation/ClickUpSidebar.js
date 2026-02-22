import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const MAX_SHORTCUTS = 5;
const STORAGE_KEY_PREFIX = 'clickup-shortcuts';

/**
 * ClickUp-style shortcut navigation: 5 customizable shortcuts + "More".
 * More → popup with all modules + "Customize navigation" → popup to pick top 5.
 */
const ClickUpSidebar = ({ allModules = [], tenantSlug = '', isProjectWorkspace = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]); // for customize modal (temp selection)
  const [savedShortcutKeys, setSavedShortcutKeys] = useState(() => {
    if (!tenantSlug || typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${tenantSlug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const storageKey = tenantSlug ? `${STORAGE_KEY_PREFIX}-${tenantSlug}` : null;

  // Persist when savedShortcutKeys change (e.g. after customize save)
  useEffect(() => {
    if (storageKey && savedShortcutKeys.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(savedShortcutKeys));
      } catch (_) {}
    }
  }, [storageKey, savedShortcutKeys]);

  const modulesList = useMemo(() => {
    return Array.isArray(allModules) ? allModules : [];
  }, [allModules]);

  const shortcutModules = useMemo(() => {
    const fromSaved = savedShortcutKeys
      .map((key) => modulesList.find((m) => m.key === key))
      .filter(Boolean)
      .slice(0, MAX_SHORTCUTS);
    if (fromSaved.length > 0) return fromSaved;
    return modulesList.slice(0, MAX_SHORTCUTS);
  }, [modulesList, savedShortcutKeys]);

  const openCustomize = () => {
    setSelectedKeys([...savedShortcutKeys]);
    setMoreOpen(false);
    setCustomizeOpen(true);
  };

  const saveCustomize = () => {
    const trimmed = selectedKeys.slice(0, MAX_SHORTCUTS);
    setSavedShortcutKeys(trimmed);
    setCustomizeOpen(false);
  };

  const toggleCustomizeKey = (key) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_SHORTCUTS) return prev;
      return [...prev, key];
    });
  };

  const isActive = (path) =>
    path && (location.pathname === path || location.pathname.startsWith(path + '/'));

  return (
    <div className="flex flex-col w-16 flex-shrink-0 bg-[#1A1F2E] text-white h-[calc(100%-1rem)] max-h-[calc(100vh-5rem)] rounded-2xl m-2 mr-4 border border-[#2A2F3E] shadow-lg min-h-0">
      {/* Logo / Home at top */}
      <div className="flex items-center justify-center py-4 border-b border-[#2A2F3E]">
        <Link
          to={modulesList.find((m) => m.key === 'dashboard')?.path || '/'}
          className="relative group"
          onMouseEnter={() => setHoveredItem('home')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              location.pathname.includes('/dashboard')
                ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg'
                : 'bg-gradient-to-br from-purple-600/80 via-pink-600/80 to-blue-600/80 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500'
            }`}
          >
            <HomeIcon className="h-5 w-5 text-white" />
          </div>
          {hoveredItem === 'home' && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-[100] pointer-events-none">
              Home
            </div>
          )}
        </Link>
      </div>

      {/* All projects - when inside a project workspace */}
      {isProjectWorkspace && tenantSlug && (
        <div className="px-2 pt-2 border-b border-[#2A2F3E]">
          <div
            className="relative"
            onMouseEnter={() => setHoveredItem('all-projects')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to={`/${tenantSlug}/org/projects`}
              className="group flex items-center justify-center w-12 h-12 rounded-lg transition-all text-gray-400 hover:bg-[#2A2F3E] hover:text-white"
              title="All projects"
            >
              <FolderIcon className="h-5 w-5" />
            </Link>
            {hoveredItem === 'all-projects' && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-[100] pointer-events-none">
                All projects
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5 shortcut icons */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {shortcutModules.map((item) => {
          const Icon = item.icon || HomeIcon;
          const active = isActive(item.path);
          return (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={item.path}
                className={`group flex items-center justify-center w-12 h-12 rounded-lg transition-all relative ${
                  active ? 'bg-[#2A2F3E] text-white' : 'text-gray-400 hover:bg-[#2A2F3E] hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              </Link>
              {hoveredItem === item.key && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-[100] pointer-events-none">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {/* More */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('more')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="group flex items-center justify-center w-12 h-12 rounded-lg transition-all text-gray-400 hover:bg-[#2A2F3E] hover:text-white"
            title="More"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
          {hoveredItem === 'more' && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-[100] pointer-events-none">
              More
            </div>
          )}
        </div>
      </nav>

      {/* Upgrade */}
      <div className="px-2 py-3 border-t border-[#2A2F3E]">
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('upgrade')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            type="button"
            className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 hover:from-purple-400 hover:via-pink-400 hover:to-blue-400 text-white transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronUpIcon className="h-5 w-5" />
          </button>
          {hoveredItem === 'upgrade' && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-[100] pointer-events-none">
              Upgrade
            </div>
          )}
        </div>
      </div>

      {/* More modal: all modules + Customize navigation */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apps & modules</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {modulesList.map((m) => {
                const Icon = m.icon || HomeIcon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      navigate(m.path);
                      setMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={openCustomize}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1F2E] text-white hover:bg-[#2A2F3E]"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Customize navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize modal: pick top 5 */}
      {customizeOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setCustomizeOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose your top {MAX_SHORTCUTS} shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="px-4 pt-2 text-sm text-gray-500 dark:text-gray-400">
              Select up to {MAX_SHORTCUTS} modules to show in the shortcut bar.
            </p>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {modulesList.map((m) => {
                const Icon = m.icon || HomeIcon;
                const checked = selectedKeys.includes(m.key);
                const disabled = !checked && selectedKeys.length >= MAX_SHORTCUTS;
                return (
                  <label
                    key={m.key}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${
                      disabled ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleCustomizeKey(m.key)}
                      className="rounded border-gray-300"
                    />
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{m.label}</span>
                    {checked && <CheckIcon className="h-5 w-5 ml-auto text-green-500" />}
                  </label>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomize}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1A1F2E] text-white hover:bg-[#2A2F3E]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClickUpSidebar;
