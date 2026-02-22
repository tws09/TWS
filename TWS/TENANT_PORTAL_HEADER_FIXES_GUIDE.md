# Tenant Portal Header - Quick Fix Implementation Guide

This guide provides step-by-step fixes for the critical issues found in `PortalHeader.js`.

---

## 🔴 CRITICAL FIXES (Do First)

### Fix 1: Add Click-Outside Handler

**Add this useEffect hook after line 15:**

```javascript
import React, { useState, useEffect, useRef } from 'react';

const PortalHeader = ({ currentWorkspace, onWorkspaceChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const userMenuRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (showWorkspaceMenu && workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target)) {
        setShowWorkspaceMenu(false);
      }
    };

    if (showUserMenu || showWorkspaceMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu, showWorkspaceMenu]);
```

**Then add refs to the menu containers:**

```javascript
// Line 36 - Add ref to workspace menu container
<div className="relative" ref={workspaceMenuRef}>

// Line 104 - Add ref to user menu container  
<div className="relative" ref={userMenuRef}>
```

---

### Fix 2: Add Escape Key Handler

**Add this useEffect after the click-outside handler:**

```javascript
// Escape key handler
useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      setShowUserMenu(false);
      setShowWorkspaceMenu(false);
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, []);
```

---

### Fix 3: Replace href="#" with React Router

**Update imports:**

```javascript
import { Link, useLocation, useNavigate } from 'react-router-dom';
```

**Replace navigation links (lines 65-88):**

```javascript
{/* Navigation */}
<nav className="hidden md:flex space-x-8">
  <Link
    to="/dashboard"
    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
  >
    Dashboard
  </Link>
  <Link
    to="/boards"
    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
  >
    Boards
  </Link>
  <Link
    to="/analytics"
    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
  >
    Analytics
  </Link>
  <Link
    to="/settings"
    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
  >
    Settings
  </Link>
</nav>
```

**Add active state:**

```javascript
const location = useLocation();

const isActive = (path) => location.pathname === path;

// Then update className:
className={`${isActive('/dashboard') ? 'text-indigo-600 font-semibold' : 'text-gray-500'} hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium`}
```

**Replace user menu links (lines 123-135):**

```javascript
const navigate = useNavigate();

<Link
  to="/profile"
  onClick={() => setShowUserMenu(false)}
  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
  Profile Settings
</Link>

<Link
  to="/workspace-settings"
  onClick={() => setShowUserMenu(false)}
  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
  Workspace Settings
</Link>
```

---

### Fix 4: Add Mobile Menu Toggle

**Add state:**

```javascript
const [showMobileMenu, setShowMobileMenu] = useState(false);
```

**Add hamburger button before line 63:**

```javascript
{/* Mobile Menu Toggle */}
<button
  onClick={() => setShowMobileMenu(!showMobileMenu)}
  className="md:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  aria-label="Toggle mobile menu"
  aria-expanded={showMobileMenu}
>
  <Bars3Icon className="h-6 w-6" />
</button>
```

**Update mobile menu section (lines 154-181):**

```javascript
{/* Mobile menu */}
{showMobileMenu && (
  <div className="md:hidden border-t border-gray-200">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      <Link
        to="/dashboard"
        onClick={() => setShowMobileMenu(false)}
        className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
      >
        Dashboard
      </Link>
      {/* ... repeat for other links ... */}
    </div>
  </div>
)}
```

**Add Bars3Icon to imports:**

```javascript
import { 
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon  // Add this
} from '@heroicons/react/24/outline';
```

---

### Fix 5: Add ARIA Labels and Accessibility

**Update buttons with ARIA:**

```javascript
{/* Workspace Menu Button */}
<button
  onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
  aria-label="Switch workspace"
  aria-expanded={showWorkspaceMenu}
  aria-haspopup="true"
>
  <span className="truncate max-w-32">{currentWorkspace.name}</span>
  <ChevronDownIcon className="ml-1 h-4 w-4" />
</button>

{/* Workspace Menu Dropdown */}
{showWorkspaceMenu && (
  <div 
    className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
    role="menu"
  >
    <button
      onClick={() => {
        setShowWorkspaceMenu(false);
        onWorkspaceChange(null);
      }}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
    >
      Switch Workspace
    </button>
  </div>
)}

{/* Notifications Button */}
<button 
  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  aria-label="Notifications"
>
  <BellIcon className="h-6 w-6" />
</button>

{/* Settings Button */}
<button 
  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  aria-label="Settings"
>
  <Cog6ToothIcon className="h-6 w-6" />
</button>

{/* User Menu Button */}
<button
  onClick={() => setShowUserMenu(!showUserMenu)}
  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  aria-label="User menu"
  aria-expanded={showUserMenu}
  aria-haspopup="true"
>
  <UserCircleIcon className="h-8 w-8 text-gray-400" />
  <span className="ml-2 text-sm font-medium text-gray-700">
    {user?.fullName || 'User'}
  </span>
  <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400" />
</button>

{/* User Menu Dropdown */}
{showUserMenu && (
  <div 
    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
    role="menu"
  >
    {/* ... menu items with role="menuitem" ... */}
  </div>
)}
```

---

### Fix 6: Add Null Checks and Fallbacks

**Update user display (lines 111, 119-120):**

```javascript
<span className="ml-2 text-sm font-medium text-gray-700">
  {user?.fullName || 'User'}
</span>

{/* In dropdown */}
<p className="text-sm font-medium text-gray-900">
  {user?.fullName || 'User'}
</p>
<p className="text-sm text-gray-500">
  {user?.email || 'No email'}
</p>
```

---

## 🟡 HIGH PRIORITY FIXES

### Fix 7: Add Notification Badge

**Update notifications button:**

```javascript
{/* Notifications */}
<div className="relative">
  <button 
    className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    aria-label="Notifications"
  >
    <BellIcon className="h-6 w-6" />
    {/* Add badge - replace 5 with actual notification count */}
    {notificationCount > 0 && (
      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
    )}
  </button>
</div>
```

---

### Fix 8: Add Loading States

**Add loading state:**

```javascript
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await logout();
  } catch (error) {
    console.error('Logout failed:', error);
    setIsLoggingOut(false);
  }
};
```

**Update logout button:**

```javascript
<button
  onClick={handleLogout}
  disabled={isLoggingOut}
  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
  {isLoggingOut ? 'Signing out...' : 'Sign out'}
</button>
```

---

### Fix 9: Improve Workspace Name Display

**Add tooltip for truncated names:**

```javascript
<div className="ml-8">
  <div className="relative group">
    <button
      onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      aria-label="Switch workspace"
      aria-expanded={showWorkspaceMenu}
      aria-haspopup="true"
    >
      <span className="truncate max-w-48" title={currentWorkspace.name}>
        {currentWorkspace.name}
      </span>
      <ChevronDownIcon className="ml-1 h-4 w-4" />
    </button>
    {/* Tooltip */}
    {currentWorkspace.name.length > 20 && (
      <div className="absolute bottom-full left-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {currentWorkspace.name}
      </div>
    )}
  </div>
</div>
```

---

## 🟢 MEDIUM PRIORITY FIXES

### Fix 10: Add PropTypes

**Add at end of file:**

```javascript
import PropTypes from 'prop-types';

PortalHeader.propTypes = {
  currentWorkspace: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
  }),
  onWorkspaceChange: PropTypes.func.isRequired,
};
```

---

### Fix 11: Add Dark Mode Support

**Update header className:**

```javascript
<header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
```

**Update text colors:**

```javascript
className="text-gray-900 dark:text-white"
className="text-gray-700 dark:text-gray-300"
className="text-gray-500 dark:text-gray-400"
```

---

## 📝 COMPLETE UPDATED COMPONENT STRUCTURE

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../app/providers/AuthContext';
import { 
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const PortalHeader = ({ currentWorkspace, onWorkspaceChange }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (showWorkspaceMenu && workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target)) {
        setShowWorkspaceMenu(false);
      }
    };

    if (showUserMenu || showWorkspaceMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu, showWorkspaceMenu]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowWorkspaceMenu(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* ... rest of component with all fixes applied ... */}
    </header>
  );
};

PortalHeader.propTypes = {
  currentWorkspace: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
  }),
  onWorkspaceChange: PropTypes.func.isRequired,
};

export default PortalHeader;
```

---

## ✅ TESTING CHECKLIST

After implementing fixes, test:

- [ ] Click outside closes dropdowns
- [ ] Escape key closes dropdowns
- [ ] Mobile menu toggles correctly
- [ ] Navigation links work without page jumps
- [ ] Active navigation state shows correctly
- [ ] Screen reader can navigate menu
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Workspace name tooltip shows on hover
- [ ] Logout shows loading state
- [ ] Null user data doesn't break component
- [ ] Dark mode works (if implemented)
- [ ] Mobile responsive layout works

---

**Next Steps:** Implement fixes in order of priority, test thoroughly, and deploy incrementally.
