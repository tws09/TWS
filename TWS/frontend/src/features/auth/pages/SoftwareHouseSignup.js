import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../app/providers/ThemeContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

// Stable components - defined outside to prevent re-creation on each render (avoids input focus loss)
const InputLabel = ({ children, required }) => (
  <label className="block text-sm font-medium text-zinc-700 mb-1.5 min-w-0">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const TextField = ({ id, type = 'text', icon: Icon, rightElement, ...props }) => (
  <div className="relative group">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-violet-600 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <input
      id={id}
      type={type}
      className={`w-full min-w-0 ${Icon ? 'pl-10' : 'pl-3'} ${rightElement ? 'pr-12' : 'pr-3'} py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 text-zinc-900 placeholder-zinc-400 transition-all font-medium text-base sm:text-sm shadow-sm`}
      {...props}
    />
    {rightElement && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {rightElement}
      </div>
    )}
  </div>
);

const SoftwareHouseSignup = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationSlug: ''
  });

  const slugCheckTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from organization name (single atomic update)
      if (name === 'organizationName') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        next.organizationSlug = slug;
      }
      return next;
    });
    if (error) setError('');

    if (name === 'organizationName') {
      const slug = (value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (slug.length >= 3) {
        checkSlugAvailability(slug);
      } else {
        setSlugAvailable(null);
      }
    }
  };

  const handleSlugChange = (e) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, organizationSlug: slug }));
    if (slug.length >= 3) {
      // Debounce slug check - wait 400ms after user stops typing
      if (slugCheckTimeoutRef.current) clearTimeout(slugCheckTimeoutRef.current);
      slugCheckTimeoutRef.current = setTimeout(() => checkSlugAvailability(slug), 400);
    } else {
      if (slugCheckTimeoutRef.current) clearTimeout(slugCheckTimeoutRef.current);
      setSlugAvailable(null);
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const response = await axios.get(`/api/signup/check-slug-availability?slug=${slug}`);
      if (response.data.success) {
        setSlugAvailable(response.data.data.available);
      }
    } catch (error) {
      // Don't log 429 - it's expected when rate limited; fail silently
      if (error.response?.status !== 429) {
        console.error('Slug check error:', error);
      }
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || 
        !formData.confirmPassword || !formData.organizationName || !formData.organizationSlug) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.organizationSlug.length < 3) {
      setError('Organization slug must be at least 3 characters long');
      return false;
    }
    
    if (slugAvailable === false) {
      setError('This slug is taken. Please choose another.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/signup/software-house/complete', {
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        organizationName: formData.organizationName,
        organizationSlug: formData.organizationSlug
      });
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('Account and workspace created successfully!');
        setTimeout(() => {
          navigate('/software-house-login');
        }, 2000);
      } else {
        setError(response.data.message || 'Signup failed.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      
      // Handle specific error codes
      if (err.response?.data?.code === 'DUPLICATE_EMAIL') {
        setError('An account with this email already exists.');
      } else if (err.response?.data?.code === 'DUPLICATE_SLUG') {
        setError('This organization slug is already taken. Please choose another.');
        setSlugAvailable(false);
      } else if (err.response?.data?.code === 'PASSWORD_MISMATCH') {
        setError('Passwords do not match.');
      } else if (err.response?.data?.code === 'INVALID_SLUG') {
        setError('Invalid organization slug format.');
      } else if (err.response?.status === 429 || err.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setError('Too many attempts. Please wait a moment and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Form Render ---

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 gap-5">
        <div>
          <InputLabel required>Full Name</InputLabel>
          <TextField
            id="fullName"
            name="fullName"
            placeholder="Elon Musk"
            value={formData.fullName}
            onChange={handleChange}
            autoFocus
            required
          />
        </div>
        <div>
          <InputLabel required>Work Email</InputLabel>
          <TextField
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="elon@spacex.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <InputLabel required>Password</InputLabel>
            <TextField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <div>
            <InputLabel required>Confirm Password</InputLabel>
            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              }
            />
          </div>
        </div>
        <div>
          <InputLabel required>Organization Name</InputLabel>
          <TextField
            id="organizationName"
            name="organizationName"
            placeholder="Acme Industries"
            icon={BuildingOfficeIcon}
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <InputLabel required>Workspace URL</InputLabel>
          <div className="flex rounded-lg shadow-sm">
            <input
              id="organizationSlug"
              name="organizationSlug"
              type="text"
              required
              value={formData.organizationSlug}
              onChange={handleSlugChange}
              className="flex-1 block w-full min-w-0 rounded-l-lg border-zinc-200 py-2.5 pl-3 text-base sm:text-sm text-zinc-900 placeholder-zinc-400 focus:ring-violet-500/10 focus:border-violet-500 font-medium border focus:outline-none focus:ring-2 z-10"
              placeholder="acme"
            />
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-zinc-200 bg-zinc-50 px-3 text-zinc-500 text-sm font-medium shrink-0">
              .tws.com
            </span>
          </div>
          <div className="mt-2 min-h-[1.25rem] flex items-center text-xs">
            {checkingSlug && <span className="text-zinc-500 flex items-center gap-1 break-words"><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current shrink-0"></span> Checking...</span>}
            {!checkingSlug && slugAvailable === true && <span className="text-green-600 flex items-center gap-1 font-medium break-words"><CheckCircleIcon className="h-3 w-3 shrink-0" /> Available</span>}
            {!checkingSlug && slugAvailable === false && <span className="text-red-600 flex items-center gap-1 font-medium break-words"><ExclamationTriangleIcon className="h-3 w-3 shrink-0" /> Taken</span>}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || slugAvailable === false}
          className="group relative w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base font-semibold py-3 px-4 rounded-lg overflow-hidden transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-zinc-500/20"
        >
          {/* Shimmer/Bubble Event */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

          <span className="relative z-10 flex items-center gap-2 truncate">
            {loading ? 'Creating Account & Workspace...' : 'Create Account'}
            {!loading && <ArrowRightIcon className="h-4 w-4 shrink-0" />}
          </span>
        </button>
      </div>

      <p className="text-center text-xs sm:text-sm text-zinc-500 mt-4 break-words max-w-md mx-auto">
        By clicking create account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center animate-fadeIn space-y-6 py-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-6">
        <CheckCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 break-words">You're all set!</h2>
        <p className="text-sm sm:text-base text-zinc-500 mt-2 max-w-xs mx-auto break-words">
          Your account and workspace have been created successfully.
        </p>
      </div>
      <div className="pt-4">
        <button
          onClick={() => navigate('/software-house-login')}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-zinc-900/20"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-white selection:bg-violet-100 selection:text-violet-900">
      {/* Left Panel - Form */}
      <div className="min-w-0 w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-6 sm:py-8 overflow-x-hidden overflow-y-auto relative custom-scrollbar">
        {/* Header */}
        <div className="flex-none flex items-center justify-between gap-3 mb-8 min-w-0">
          <Link to="/" className="flex items-center gap-2 group min-w-0 shrink-0">
            <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shrink-0">
              W
            </div>
            <span className="font-bold text-lg sm:text-xl text-zinc-900 tracking-tight truncate">TWS</span>
          </Link>
          <div className="text-xs sm:text-sm font-medium text-zinc-500 shrink-0 text-right">
            Already have an account?{' '}
            <Link to="/software-house-login" className="text-zinc-900 hover:text-violet-600 transition-colors whitespace-nowrap">
              Log in
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full min-w-0 min-h-0">
          {/* Content Header */}
          {!success && (
            <div className="mb-6 flex-none min-w-0 overflow-hidden">
              <h1 className="text-[clamp(1.125rem,3.5vw+0.75rem,1.875rem)] font-bold text-zinc-900 tracking-tight mb-2 break-words leading-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-zinc-500 break-words">
                Start building your software house empire today.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 flex-none min-w-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium break-words min-w-0">{error}</p>
            </div>
          )}

          {/* Form or Success */}
          <div className="flex-1">
            {success ? renderSuccess() : renderForm()}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center lg:text-left text-xs sm:text-sm text-zinc-400 flex-none break-words">
          © 2025 The Wolf Stack. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Visuals */}
      <div className="hidden lg:flex lg:flex-1 bg-zinc-950 h-full relative overflow-hidden items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

        {/* Abstract Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Content Card */}
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
            </div>

            <div className="space-y-4 mb-8 font-mono text-sm">
              <div className="flex items-center text-zinc-400">
                <span className="text-violet-400 mr-2">➜</span>
                <span>Initializing development environment...</span>
              </div>
              <div className="flex items-center text-zinc-400">
                <span className="text-violet-400 mr-2">➜</span>
                <span>Loading modules: <span className="text-zinc-300">Agile, Scrum, CI/CD</span></span>
              </div>
              <div className="flex items-center text-zinc-400">
                <span className="text-violet-400 mr-2">➜</span>
                <span>Optimizing for scale...</span>
              </div>
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span>Ready to ship.</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 text-white font-bold">
                  JS
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-semibold break-words">TWS Architecture</h4>
                  <p className="text-zinc-400 text-sm mt-1 break-words">
                    "The most powerful operating system for modern software houses. It handles the complexity so you can focus on the code."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwareHouseSignup;
