import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../shared/utils/axiosInstance';
import { isTenantWorkspacePath } from '../../shared/utils/tenantRoutes';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Public routes where auth check is skipped (avoids 401 noise and unnecessary API calls)
const PUBLIC_ROUTES = [
  '/software-house-signup',
  '/software-house-login',
  '/software-house',
  '/login',
  '/register',
  '/signup',
  '/supra-admin-login'
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // SECURITY FIX: Don't initialize from localStorage - tokens are in HttpOnly cookies
  const [token, setToken] = useState(null);

  // Memoize user object to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      orgId: user.orgId,
      permissions: user.permissions
    };
  }, [user?.id, user?.role, user?.email, user?.fullName, user?.status, user?.orgId, user?.permissions]);

  // SECURITY FIX: Don't set Authorization header - cookies are sent automatically
  // Axios instance already configured with withCredentials: true
  // Backend reads from req.cookies.accessToken

  // Check if user is logged in on app start (skip on public routes to avoid 401 noise)
  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );

    // On tenant workspace routes (FR2: /<slug>/org/... or /<slug>/dashboard): preserve login state
    const isTenantRoute = isTenantWorkspacePath(location.pathname);
    const hasTenantData = isTenantRoute && !!localStorage.getItem('tenantData');

    const checkAuth = async () => {
      // Skip auth check on public routes - user isn't logged in, avoid unnecessary 401
      if (isPublicRoute) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        // SECURITY FIX: Check authentication via /api/auth/me with cookies
        // Use axiosInstance which is already configured with withCredentials: true
        const response = await axiosInstance.get('/api/auth/me');
        
        // Handle case where interceptor returns { data: null, status: 401 } for 401 errors
        // Check status first, then check if data is null or doesn't have success
        if (response.status === 401) {
          // On tenant routes with tenantData: preserve user from localStorage (just logged in)
          // Prevents auto-logout when /api/auth/me 401 due to cookie timing
          if (hasTenantData) {
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed?.email) {
                  setUser(parsed);
                  setToken('cookie-based');
                  setLoading(false);
                  return;
                }
              }
            } catch (e) {
              // Fall through to clear
            }
          }
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Check if response has success and user data
        if (response.data && response.data.success && response.data.data?.user) {
          const user = response.data.data.user;
          // Ensure id field is set from _id for frontend compatibility
          if (user._id && !user.id) {
            user.id = user._id.toString();
          }
          setUser(user);
          // No localStorage - always fetch fresh from cloud database
          setToken('cookie-based'); // Placeholder - actual token is in HttpOnly cookie
        } else {
          // No localStorage - always fetch from cloud
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        // 401 is expected when user is not logged in - don't log as error
        if (error.response?.status === 401 || error.status === 401) {
          // On tenant routes with tenantData: preserve user from localStorage (just logged in)
          if (hasTenantData) {
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed?.email) {
                  setUser(parsed);
                  setToken('cookie-based');
                  setLoading(false);
                  return;
                }
              }
            } catch (e) {
              // Fall through to clear
            }
          }
          setToken(null);
          setUser(null);
        } else {
          // Only log actual errors (network errors, 500s, etc.)
          console.error('Auth check failed:', error.response?.data || error.message);
          // No localStorage - always fetch from cloud
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-run when route changes (e.g. navigate from signup to dashboard)

  const login = useCallback(async (email, password) => {
    console.log('🔵 LOGIN FUNCTION CALLED:', { email, hasPassword: !!password });
    
    try {
      // Normalize email to lowercase for consistent API calls
      const normalizedEmail = (email || '').toLowerCase().trim();
      
      console.log('🔵 Login attempt started:', {
        originalEmail: email,
        normalizedEmail: normalizedEmail,
        environment: process.env.NODE_ENV
      });
      
      // SECURITY FIX: Use real API authentication with cookies
      const loginUrl = '/api/auth/login';
      
      console.log('🔵 Frontend Login Attempt:', {
        email: normalizedEmail,
        loginUrl: loginUrl,
        hasPassword: !!password,
        usingProxy: true,
        proxyTarget: 'http://localhost:5000',
        usingCookies: true // SECURITY FIX: Using HttpOnly cookies
      });
      
      // SECURITY FIX: Use fetch with credentials: 'include' to send/receive cookies
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password
        }),
        credentials: 'include' // SECURITY FIX: Include cookies (HttpOnly tokens)
      });
      
      // Parse response - handle both JSON and text responses
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          throw new Error(text || `HTTP error! status: ${response.status}`);
        }
      } else {
        // Handle non-JSON responses (like rate limit plain text)
        const text = await response.text();
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ Login Response:', {
        status: response.status,
        success: responseData.success,
        hasUser: !!responseData.data?.user,
        tokensInCookies: true // SECURITY FIX: Tokens are in HttpOnly cookies
      });
      
      if (response.ok && responseData.success) {
        const { user } = responseData.data;
        
        // Ensure id field is set from _id for frontend compatibility
        if (user._id && !user.id) {
          user.id = user._id.toString();
        }
        
        console.log('🔍 User data from backend:', {
          userId: user?.id || user?._id,
          email: user?.email,
          role: user?.role,
          tenantId: user?.tenantId,
          fullUser: user
        });
        
        // SECURITY FIX: Don't store tokens in localStorage - they're in HttpOnly cookies
        // No localStorage - always fetch fresh from cloud database
        setToken('cookie-based'); // Placeholder - actual token is in HttpOnly cookie
        setUser(user);
        
        return { success: true, user };
      } else {
        const errorMessage = responseData.message || 'Login failed';
        console.error('❌ Login failed:', errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Login error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let message = 'Login failed';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        message = 'Network error. Please check if backend server is running on port 5000.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);


  const logout = useCallback(async () => {
    try {
      // SECURITY FIX: Call backend logout endpoint with credentials to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // SECURITY FIX: Include cookies
      });
      
      // No localStorage - always fetch from cloud
      // Tokens are cleared by backend via cookies
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
      
      // Navigate to login page after logout
      // Use setTimeout to ensure state is cleared before navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // No localStorage - always fetch from cloud
      setToken(null);
      setUser(null);
      // Navigate even on error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      // SECURITY FIX: Refresh token using cookies (credentials: 'include')
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // SECURITY FIX: Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Tokens are now in HttpOnly cookies, not in response
          setToken('cookie-based'); // Placeholder
          return 'cookie-based'; // Success - tokens in cookies
        }
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, [logout]);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const setAuthData = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const rolePermissions = {
      super_admin: ['*'], // SupraAdmin has all permissions
      owner: ['*'],
      admin: ['users:read', 'users:write', 'employees:read', 'employees:write', 'payroll:read', 'payroll:write', 'finance:read', 'finance:write', 'tasks:read', 'tasks:write', 'attendance:read', 'attendance:write'],
      hr: ['users:read', 'employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'tasks:read', 'tasks:write'],
      finance: ['payroll:read', 'payroll:write', 'finance:read', 'finance:write', 'employees:read'],
      manager: ['employees:read', 'tasks:read', 'tasks:write', 'attendance:read'],
      employee: ['tasks:read', 'tasks:write', 'attendance:read', 'attendance:write'],
      contractor: ['tasks:read', 'tasks:write'],
      auditor: ['users:read', 'employees:read', 'payroll:read', 'finance:read', 'attendance:read', 'tasks:read']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  const value = useMemo(() => ({
    user: memoizedUser,
    loading,
    login,
    logout,
    refreshToken,
    updateUser,
    setAuthData,
    hasPermission,
    hasRole
  }), [memoizedUser, loading, login, logout, refreshToken, updateUser, setAuthData, hasPermission, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
