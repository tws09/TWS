import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CogIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  SunIcon,
  MoonIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const LoginNavbar = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();

  const loginPages = [
    {
      path: '/login',
      label: 'Admin',
      icon: CogIcon,
      color: 'blue'
    },
    {
      path: '/supra-admin-login',
      label: 'SupraAdmin',
      icon: ShieldCheckIcon,
      color: 'purple'
    },
    {
      path: '/software-house-login',
      label: 'Software House',
      icon: CodeBracketIcon,
      color: 'purple'
    },
    {
      path: '/software-house-signup',
      label: 'Software House Signup',
      icon: UserPlusIcon,
      color: 'purple'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const getColorClasses = (color, active) => {
    const colors = {
      blue: {
        active: 'bg-blue-600 text-white shadow-blue-500/30',
        inactive: isDarkMode
          ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      },
      green: {
        active: 'bg-emerald-600 text-white shadow-emerald-500/30',
        inactive: isDarkMode
          ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
      },
      purple: {
        active: 'bg-purple-600 text-white shadow-purple-500/30',
        inactive: isDarkMode
          ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
          : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
      },
      indigo: {
        active: 'bg-indigo-600 text-white shadow-indigo-500/30',
        inactive: isDarkMode
          ? 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10'
          : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
      },
      emerald: {
        active: 'bg-emerald-600 text-white shadow-emerald-500/30',
        inactive: isDarkMode
          ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
      }
    };

    return active ? colors[color].active : colors[color].inactive;
  };

  return (
    <div className={`relative z-20 ${isDarkMode ? 'bg-[#0A0A0A]/80 border-white/5' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              } shadow-lg shadow-blue-500/20`}>
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                TWS Portal
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                Secure Access Gateway
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile: Dropdown menu for navigation */}
            <div className="md:hidden relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    window.location.href = e.target.value;
                  }
                }}
                value={location.pathname}
                className={`
                  appearance-none bg-transparent border rounded-lg px-3 py-2 text-sm font-medium
                  ${isDarkMode 
                    ? 'border-white/10 text-white bg-white/5' 
                    : 'border-gray-300 text-gray-700 bg-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                `}
              >
                {loginPages.map((page) => (
                  <option key={page.path} value={page.path}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: Full navigation links */}
            <div className="hidden md:flex items-center space-x-1 flex-wrap gap-1">
              {loginPages.map((page) => {
                const Icon = page.icon;
                const active = isActive(page.path);
                const colorClasses = getColorClasses(page.color, active);

                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium
                      transition-all duration-200 whitespace-nowrap
                      ${colorClasses}
                      ${active ? 'shadow-lg scale-105' : ''}
                    `}
                    title={`Go to ${page.label} login`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{page.label}</span>
                    <span className="lg:hidden">{page.label.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>

            {/* Dark Mode Toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode
                    ? 'bg-white/5 text-yellow-400 hover:bg-white/10 hover:text-yellow-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginNavbar;
