import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import LoginNavbar from '../components/LoginNavbar';
import {
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    DevicePhoneMobileIcon,
    CloudIcon,
    ChartBarIcon,
    ArrowPathIcon,
    CogIcon
} from '@heroicons/react/24/outline';


const Login = () => {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode for Premium feel

    // Check for access denied error
    useEffect(() => {
        const accessDeniedError = searchParams.get('error');
        if (accessDeniedError === 'access_denied') {
            setError('Access denied. Employee portal is only available to TWS employees.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            if (!result.success) {
                setError(result.error || 'Invalid credentials. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ LOGIN ERROR:', error);
            setError('An error occurred during login. Please try again.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handlePortalRedirect = (portal) => {
        switch (portal) {
            case 'client':
                window.location.href = '/client-portal';
                break;
            default:
                break;
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-50'} relative overflow-hidden font-['Inter']`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20' : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'} blur-[120px] animate-pulse`}></div>
                <div className={`absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'bg-gradient-to-tr from-[#764ba2]/20 to-[#f093fb]/20' : 'bg-gradient-to-tr from-purple-400/20 to-pink-400/20'} blur-[120px] animate-pulse delay-1000`}></div>
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
                                        <div className="h-14 w-14 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/30">
                                            <CogIcon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>Admin Portal</h3>
                                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Management Dashboard Access</p>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} flex items-start`}>
                                        <InformationCircleIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-3 mt-0.5 flex-shrink-0`} />
                                        <div className="text-sm">
                                            <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-800'} font-semibold mb-1`}>Demo Credentials:</p>
                                            <div className={`${isDarkMode ? 'text-blue-300' : 'text-blue-600'} space-y-0.5`}>
                                                <p>Email: <span className="font-mono opacity-80">admin@wolfstack.com</span></p>
                                                <p>Password: <span className="font-mono opacity-80">admin123</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className={`mb-6 p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl flex items-center animate-fadeIn`}>
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-focus-within:text-[#667eea]' : 'text-gray-400 group-focus-within:text-blue-600'} transition-colors`} />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                className={`block w-full pl-11 pr-4 py-3.5 border ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-[#667eea]' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-[#667eea]/50' : 'focus:ring-blue-500/20'} transition-all duration-200`}
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                            Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-focus-within:text-[#667eea]' : 'text-gray-400 group-focus-within:text-blue-600'} transition-colors`} />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                required
                                                className={`block w-full pl-11 pr-12 py-3.5 border ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-[#667eea]' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-[#667eea]/50' : 'focus:ring-blue-500/20'} transition-all duration-200`}
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                                                ) : (
                                                    <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className={`h-4 w-4 rounded border-gray-300 text-[#667eea] focus:ring-[#667eea] ${isDarkMode ? 'bg-black/20 border-white/10' : ''}`}
                                            />
                                            <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Remember me
                                            </label>
                                        </div>
                                        <div className="text-sm">
                                            <a href="#" className={`font-medium ${isDarkMode ? 'text-[#667eea] hover:text-[#764ba2]' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                                                Forgot password?
                                            </a>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#667eea] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5`}
                                    >
                                        {loading ? (
                                            <>
                                                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign in to Admin Portal</span>
                                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Other Portals & Features */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Portal Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Portal Card */}
                                <div className={`${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-white/20 hover:bg-white'} backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 group cursor-pointer`} onClick={() => handlePortalRedirect('employee')}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <UserGroupIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <ArrowRightIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`} />
                                    </div>
                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Employee Portal</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Access your personal workspace, payroll, and projects.</p>
                                    <div className="space-y-2">
                                        {['Profile Management', 'Finance & Payroll', 'Project Management'].map((item, i) => (
                                            <div key={i} className="flex items-center text-xs">
                                                <CheckCircleIcon className={`h-3.5 w-3.5 mr-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SupraAdmin Portal Card */}
                                <div className={`${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-white/20 hover:bg-white'} backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 group cursor-pointer`}>
                                    <Link to="/supra-admin-login" className="block h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                                                <ShieldCheckIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <ArrowRightIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`} />
                                        </div>
                                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>SupraAdmin Portal</h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>System administration and multi-tenant management.</p>
                                        <div className="space-y-2">
                                            {['Multi-Tenant Control', 'System Config', 'Global Analytics'].map((item, i) => (
                                                <div key={i} className="flex items-center text-xs">
                                                    <CheckCircleIcon className={`h-3.5 w-3.5 mr-2 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'} backdrop-blur-xl rounded-3xl border p-8`}>
                                <div className="text-center mb-8">
                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Enterprise-Grade Platform</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Built for modern businesses with security and scalability in mind</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {[
                                        { icon: ShieldCheckIcon, label: 'Secure Access', sub: 'Enterprise Security', color: 'blue' },
                                        { icon: CloudIcon, label: 'Cloud Sync', sub: 'Real-time Updates', color: 'green' },
                                        { icon: DevicePhoneMobileIcon, label: 'Mobile Ready', sub: 'Responsive Design', color: 'purple' },
                                        { icon: ChartBarIcon, label: 'Analytics', sub: 'Data Insights', color: 'orange' }
                                    ].map((feature, i) => (
                                        <div key={i} className="text-center group">
                                            <div className={`h-12 w-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDarkMode ? `bg-${feature.color}-500/10 text-${feature.color}-400` : `bg-${feature.color}-100 text-${feature.color}-600`
                                                }`}>
                                                <feature.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.label}</h4>
                                            <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{feature.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center">
                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    © 2025 The Wolf Stack (TWS). All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
