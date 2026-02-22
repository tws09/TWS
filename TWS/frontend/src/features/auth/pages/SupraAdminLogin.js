import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import LoginNavbar from '../components/LoginNavbar';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CogIcon,
  UsersIcon,
  SparklesIcon,
  CloudIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SupraAdminLogin = () => {
  const [email, setEmail] = useState('admin@tws.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode for Premium feel
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/supra-admin');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-50'} relative overflow-hidden font-['Inter']`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-br from-purple-400/20 to-pink-400/20'} blur-[120px] animate-pulse`}></div>
        <div className={`absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'bg-gradient-to-tr from-fuchsia-600/20 to-rose-600/20' : 'bg-gradient-to-tr from-fuchsia-400/20 to-rose-400/20'} blur-[120px] animate-pulse delay-1000`}></div>
      </div>

      {/* Login Navbar */}
      <LoginNavbar
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="relative z-10 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column: Login Form */}
            <div className="lg:col-span-5">
              <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'} backdrop-blur-xl rounded-3xl shadow-2xl border p-8 sm:p-10 transition-all duration-300`}>
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/30">
                      <ShieldCheckIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>GTS Admin Login</h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Global Technology Solutions ERP</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} flex items-start`}>
                    <InformationCircleIcon className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mr-3 mt-0.5 flex-shrink-0`} />
                    <div className="text-sm">
                      <p className={`${isDarkMode ? 'text-purple-200' : 'text-purple-800'} font-semibold mb-1`}>🔐 Enterprise Resource Planning</p>
                      <p className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Global Technology Solutions Management</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className={`mb-6 p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl flex items-center animate-fadeIn`}>
                    <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-focus-within:text-purple-500' : 'text-gray-400 group-focus-within:text-purple-600'} transition-colors`} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pl-11 pr-4 py-3.5 border ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'} rounded-xl focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500/50' : 'focus:ring-purple-500/20'} transition-all duration-200`}
                        placeholder="admin@tws.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-focus-within:text-purple-500' : 'text-gray-400 group-focus-within:text-purple-600'} transition-colors`} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`block w-full pl-11 pr-12 py-3.5 border ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'} rounded-xl focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500/50' : 'focus:ring-purple-500/20'} transition-all duration-200`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5`}
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <span>Sign in to SupraAdmin Portal</span>
                          <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Default Credentials Section */}
                <div className={`mt-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5`}>
                  <div className="flex items-center mb-4">
                    <InformationCircleIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mr-2`} />
                    <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Default Credentials</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className={`flex justify-between items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Email:</span>
                      <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-mono`}>admin@tws.com</span>
                    </div>
                    <div className={`flex justify-between items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Password:</span>
                      <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-mono`}>admin123</span>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-center`}>
                      ⚠️ SupraAdmin access requires special privileges
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Features & Links */}
            <div className="lg:col-span-7 space-y-6">

              {/* Features Showcase */}
              <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'} backdrop-blur-xl rounded-3xl shadow-2xl border p-8`}>
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>SupraAdmin Features</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced system management capabilities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: BuildingOfficeIcon, title: 'Multi-Tenant Management', desc: 'Manage multiple organizations and their configurations', color: 'purple' },
                    { icon: CogIcon, title: 'System Configuration', desc: 'Configure system-wide settings and parameters', color: 'pink' },
                    { icon: ChartBarIcon, title: 'Advanced Analytics', desc: 'Comprehensive system performance and usage analytics', color: 'indigo' },
                    { icon: ShieldCheckIcon, title: 'Security Controls', desc: 'Advanced security policies and access controls', color: 'purple' },
                    { icon: UsersIcon, title: 'User Management', desc: 'Manage users across all tenant organizations', color: 'pink' },
                    { icon: CloudIcon, title: 'Cloud Infrastructure', desc: 'Monitor and manage cloud resources and deployments', color: 'indigo' }
                  ].map((feature, i) => (
                    <div key={i} className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? `bg-${feature.color}-500/20 text-${feature.color}-400` : `bg-${feature.color}-100 text-${feature.color}-600`}`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-sm mb-1`}>{feature.title}</h4>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs leading-relaxed`}>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'} backdrop-blur-xl rounded-3xl shadow-xl border p-6`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Security & Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Zero-trust security model</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <LockClosedIcon className="w-5 h-5 text-pink-500" />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>End-to-end encryption</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>SOC 2 Type II compliant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="w-5 h-5 text-purple-500" />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Advanced threat detection</span>
                    </div>
                  </div>
                </div>

                {/* Quick Access Links */}
                <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'} backdrop-blur-xl rounded-3xl shadow-xl border p-6`}>
                  <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Other Portals</h4>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Admin Portal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2024 TWS SupraAdmin Portal. All rights reserved. | Restricted access - System administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupraAdminLogin;
