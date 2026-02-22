import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import { useTheme } from '../../../app/providers/ThemeContext';
import LoginNavbar from '../components/LoginNavbar';
import {
    UserIcon,
    UserGroupIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOffice2Icon,
    LockClosedIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SoftwareHouseLogin = () => {
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [selectedPortal, setSelectedPortal] = useState('admin'); // Default to Admin
    const validationBlockedRef = useRef(false);

    // Prevent navigation after validation failure
    useEffect(() => {
        if (validationBlockedRef.current) {
            if (window.location.pathname !== '/software-house-login') {
                window.history.replaceState(null, '', '/software-house-login');
            }
        }
    }, []);

    const portals = [
        {
            id: 'admin',
            icon: UserIcon,
            title: 'Admin',
            demoEmail: 'admin@softwarehouse.com'
        },
        {
            id: 'employee',
            icon: UserGroupIcon,
            title: 'Employee',
            demoEmail: 'employee@softwarehouse.com'
        },
        {
            id: 'client',
            icon: BuildingOffice2Icon,
            title: 'Client',
            demoEmail: 'client@softwarehouse.com'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                const userRole = result.user?.role;
                const adminRoles = ['admin', 'owner', 'super_admin', 'org_manager'];
                const employeeRoles = ['employee', 'staff', 'developer', 'engineer', 'programmer', 'project_manager', 'manager', 'ceo', 'cfo', 'finance', 'hr', 'department_lead', 'pmo', 'contributor', 'contractor'];
                const clientRoles = ['client', 'customer'];

                let allowedPortal = null;
                if (adminRoles.includes(userRole)) allowedPortal = 'admin';
                else if (employeeRoles.includes(userRole)) allowedPortal = 'employee';
                else if (clientRoles.includes(userRole)) allowedPortal = 'client';

                if (allowedPortal && selectedPortal !== allowedPortal) {
                    const portalNames = { admin: 'Admin', employee: 'Employee', client: 'Client' };
                    validationBlockedRef.current = true;
                    // SECURITY FIX: Only clear user data, tokens are in HttpOnly cookies
                    localStorage.removeItem('user');
                    localStorage.removeItem('tenantData');

                    setError(`Please switch to the "${portalNames[allowedPortal]}" role to login.`);
                    setLoading(false);
                    window.history.replaceState(null, '', '/software-house-login');
                    setTimeout(() => logout().catch(console.error), 100);
                    return;
                }

                // Get tenant logic
                let tenantSlug = result.user?.tenantId ||
                    (typeof result.user?.orgId === 'object' ? result.user.orgId.slug : null) ||
                    result.user?.orgId?.slug;

                const isObjectId = (str) => str && /^[0-9a-f]{24}$/i.test(str);
                if (isObjectId(tenantSlug)) tenantSlug = typeof result.user?.orgId === 'object' ? result.user.orgId.slug : null;

                if (!tenantSlug || isObjectId(tenantSlug)) {
                    setError('Unable to identify your organization.');
                    return;
                }

                const orgId = typeof result.user?.orgId === 'object' ? result.user.orgId._id : result.user?.orgId;
                const orgSlug = tenantSlug;

                // Set tenant data
                const tenantData = {
                    id: orgId,
                    name: typeof result.user?.orgId === 'object' ? result.user.orgId.name : orgSlug,
                    slug: orgSlug,
                    status: 'active',
                    erpCategory: 'software_house',
                    erpModules: ['projects', 'tasks', 'clients', 'invoices', 'time_tracking', 'employees', 'payroll', 'hr', 'attendance'],
                    orgId: orgId,
                    owner: {
                        username: result.user?.email,
                        email: result.user?.email,
                        fullName: result.user?.fullName || `${result.user?.firstName} ${result.user?.lastName}`
                    }
                };

                // Store tenant data and user for TenantAuthContext (needs both for software house)
                localStorage.setItem('tenantData', JSON.stringify(tenantData));
                localStorage.setItem('user', JSON.stringify({
                    id: result.user?.id || result.user?._id,
                    _id: result.user?._id,
                    email: result.user?.email,
                    fullName: result.user?.fullName,
                    role: result.user?.role,
                    tenantId: orgSlug,
                    orgId: result.user?.orgId
                }));

                // Routing: main dashboard with full org layout (projects, HR, finance, etc.)
                if (employeeRoles.includes(userRole)) {
                    navigate(`/${orgSlug}/org/software-house/employee-portal`);
                } else {
                    // Admin/owner: main org dashboard with full sidebar layout
                    navigate(`/${orgSlug}/org/dashboard`);
                }

            } else {
                setError(result.error || 'Invalid credentials.');
            }
        } catch (error) {
            console.error(error);
            setError('Login failed. Please check your network.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const fillDemoCredentials = (portalId) => {
        const portal = portals.find(p => p.id === portalId);
        if (portal) {
            setFormData({ email: portal.demoEmail, password: 'demo123' });
            setSelectedPortal(portalId);
        }
    };

    return (
        <div className={`flex flex-col min-h-screen font-['Inter'] ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
            {/* Login Navbar */}
            <LoginNavbar
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
            />

            <div className={`flex flex-1 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
                {/* Left Side: Login Form (50%) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative z-10">

                {/* Logo Area */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#7c3aed] text-white mb-4 shadow-lg">
                        <ComputerDesktopIcon className="h-10 w-10" />
                    </div>
                    <Link to="/software-house-signup" className="block text-sm text-[#7c3aed] hover:underline mb-8">
                        I do not have an account yet
                    </Link>
                </div>

                <div className="w-full max-w-sm">
                    {/* Role Selector Circles */}
                    <div className="text-center mb-8">
                        <h3 className={`text-base font-semibold mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>I am</h3>
                        <div className="flex justify-center gap-6 sm:gap-10">
                            {portals.map((portal) => {
                                const Icon = portal.icon;
                                const isSelected = selectedPortal === portal.id;
                                return (
                                    <div key={portal.id} className="flex flex-col items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPortal(portal.id);
                                                fillDemoCredentials(portal.id);
                                            }}
                                            className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isSelected
                                                ? 'border-[#7c3aed] bg-[#7c3aed] text-white shadow-xl scale-110'
                                                : isDarkMode
                                                    ? 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600'
                                                    : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
                                                }`}
                                        >
                                            <Icon className="h-8 w-8" />
                                        </button>
                                        <span className={`text-sm ${isSelected ? 'font-bold text-[#7c3aed]' : 'text-gray-400'}`}>
                                            {portal.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Inputs */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                    }`}
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                    }`}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword
                                    ? <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    : <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                }
                            </button>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                name="remember_me"
                                type="checkbox"
                                className="h-4 w-4 text-[#7c3aed] focus:ring-[#7c3aed] border-gray-300 rounded"
                            />
                            <label htmlFor="remember_me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Remember Me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-[#7c3aed] hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side: Hero Content (50%) - Hidden on mobile */}
            <div className={`hidden lg:flex w-1/2 flex-col justify-center items-center text-center p-12 relative overflow-hidden bg-[#7c3aed]`}>

                {/* Decorative circles/patterns */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <h2 className="text-4xl font-bold mb-6">Software House Management</h2>
                    <p className="text-lg mb-8 text-purple-50">
                        Manage projects, track time, and scale your software development business with our comprehensive Software House ERP platform.
                    </p>

                    <Link to="/software-house-signup">
                        <button className="px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-[#7c3aed] transition-all duration-300 mb-12">
                            Get started
                        </button>
                    </Link>

                    {/* Illustration Placeholder */}
                    <div className="mx-auto w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gray-100 p-2 border-b flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                        <div className="p-6 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                                <ComputerDesktopIcon className="w-8 h-8 text-[#7c3aed]" />
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded"></div>
                            <div className="w-2/3 h-2 bg-gray-100 rounded"></div>
                            <div className="flex gap-2 mt-4 w-full justify-center">
                                <div className="w-8 h-8 rounded-full bg-purple-500 animate-bounce"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-300 animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default SoftwareHouseLogin;
