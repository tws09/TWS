import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
    HomeIcon,
    ChartBarIcon,
    UserIcon,
    UsersIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    InboxIcon,
    CogIcon,
    Bars3Icon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ChevronDownIcon,
    SunIcon,
    MoonIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ClockIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { useTenantAuth } from '../../../app/providers/TenantAuthContext';
import { useTheme } from '../../../app/providers/ThemeContext';
import { getIndustryMenuItems } from '../utils/industryMenuBuilder';
import { TenantThemeProvider } from '../providers/TenantThemeProvider';
import { useThemeStyles } from '../utils/useThemeStyles';
import CommandPalette from './CommandPalette';
import ClickUpSidebar from '../../../shared/components/navigation/ClickUpSidebar';
import SoftwareHouseTopNavbar from './SoftwareHouseTopNavbar';
import './TenantOrgLayout.css';
import '../styles/tenant-theme.css';
import '../styles/tenant-tokens.css';

const TenantOrgLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userDepartments, setUserDepartments] = useState([]);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [commandPaletteInitialQuery, setCommandPaletteInitialQuery] = useState('');
    const mainContentRef = useRef(null);
    const { tenantSlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, tenant, isAuthenticated, loading: authLoading } = useTenantAuth();

    // Project workspace: path is /:slug/org/projects/:projectId or .../projects/:projectId/... (FR2)
    // (segment after "projects" is not a known literal route)
    const PROJECT_LITERAL_ROUTES = ['list', 'tasks', 'milestones', 'resources', 'timesheets', 'sprints', 'gantt', 'change-requests', 'deliverables'];
    const isProjectWorkspace = useMemo(() => {
        const path = location.pathname || '';
        const idx = path.indexOf('/org/projects/');
        if (idx === -1) return false;
        const after = path.slice(idx + '/org/projects/'.length);
        const segment = after.split('/')[0] || '';
        return segment.length > 0 && !PROJECT_LITERAL_ROUTES.includes(segment);
    }, [location.pathname]);
    const { isDarkMode, themeTransition, toggleTheme } = useTheme();
    const themeStyles = useThemeStyles();

    // Use ref to store logout function to avoid dependency issues
    const logoutRef = useRef(logout);
    useEffect(() => {
        logoutRef.current = logout;
    }, [logout]);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Handle fullscreen API
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Cmd/Ctrl + K to open command palette
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setCommandPaletteOpen(true);
                return;
            }
            
            // Cmd/Ctrl + B to toggle sidebar
            if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
                event.preventDefault();
                setCollapsed(!collapsed);
            }
            
            // ESC to close mobile sidebar, command palette, or exit fullscreen
            if (event.key === 'Escape') {
                if (commandPaletteOpen) {
                    setCommandPaletteOpen(false);
                    return;
                }
                if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                }
                if (isFullscreen) {
                    exitFullscreen();
                }
            }

            // F11 to toggle fullscreen
            if (event.key === 'F11') {
                event.preventDefault();
                if (isFullscreen) {
                    exitFullscreen();
                } else {
                    requestFullscreen();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [collapsed, mobileMenuOpen, isFullscreen, commandPaletteOpen]);

    // Fullscreen API functions
    const requestFullscreen = async () => {
        try {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Error entering fullscreen:', error);
        }
    };

    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        } catch (error) {
            console.error('Error exiting fullscreen:', error);
        }
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;
        let hasFetched = false;

        const fetchUserDepartments = async () => {
            if (hasFetched || !isAuthenticated || !user || !tenantSlug || authLoading) {
                return;
            }

            hasFetched = true;

            try {
                // SECURITY FIX: Use credentials: 'include' instead of Authorization header
                // Cookies are sent automatically
                const response = await fetch(`/api/tenant/${tenantSlug}/organization/user-departments`, {
                    method: 'GET',
                    credentials: 'include', // SECURITY FIX: Include cookies (HttpOnly tokens)
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!isMounted) return;

                if (response.ok) {
                    const data = await response.json();
                    setUserDepartments(data.data || []);
                } else {
                    if (response.status === 401) {
                        logoutRef.current();
                    } else {
                        setUserDepartments([]);
                    }
                }
            } catch (error) {
                if (!isMounted) return;
                if (error.message?.includes('expired') || error.message?.includes('Authentication')) {
                    logoutRef.current();
                } else {
                    setUserDepartments([]);
                }
            } finally {
                hasFetched = false;
            }
        };

        fetchUserDepartments();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user?.id, tenantSlug, authLoading]);

    const menuItems = useMemo(() => {
        return getIndustryMenuItems(tenant?.erpCategory || 'business', tenantSlug);
    }, [tenant?.erpCategory, tenantSlug]);

    const getCurrentMenuKey = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const orgIndex = pathSegments.indexOf('org');
        if (orgIndex !== -1 && pathSegments[orgIndex + 1]) {
            const routeSegment = pathSegments[orgIndex + 1];
            const industryRoutes = ['software-house'];
            if (industryRoutes.includes(routeSegment)) {
                return pathSegments[orgIndex + 2] || routeSegment;
            }
            return routeSegment;
        }
        return 'dashboard';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && !event.target.closest('.user-menu-container')) {
                setUserMenuOpen(false);
            }
            if (addMenuOpen && !event.target.closest('.add-menu-container')) {
                setAddMenuOpen(false);
            }
        };

        if (userMenuOpen || addMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [userMenuOpen, addMenuOpen]);

    const handleAddAction = (action) => {
        setAddMenuOpen(false);
        switch (action) {
            case 'task':
                navigate(`/${tenantSlug}/org/projects/tasks?create=task`);
                break;
            case 'project':
                navigate(`/${tenantSlug}/org/projects?create=project`);
                break;
            case 'user':
                navigate(`/${tenantSlug}/org/users/create`);
                break;
            case 'time':
                navigate(`/${tenantSlug}/org/software-house/time-tracking`);
                break;
            default:
                break;
        }
    };

    // Initialize expanded menus based on current route
    useEffect(() => {
        const currentMenuKey = getCurrentMenuKey();
        const newExpanded = {};
        menuItems.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child =>
                    location.pathname === child.path || location.pathname.startsWith(child.path + '/')
                );
                if (currentMenuKey === item.key || hasActiveChild) {
                    newExpanded[item.key] = true;
                }
            }
        });
        setExpandedMenus(newExpanded);
    }, [location.pathname, menuItems]);

    // Safety timeout to prevent infinite loading
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    useEffect(() => {
        if (authLoading) {
            const timeout = setTimeout(() => {
                console.warn('⚠️ Auth loading timeout - forcing render to prevent UI lock');
                setLoadingTimeout(true);
            }, 3000); // 3 second timeout (reduced for faster recovery)
            
            return () => clearTimeout(timeout);
        } else {
            setLoadingTimeout(false);
        }
    }, [authLoading]);

    // Only show loading screen if authLoading is true AND we haven't hit timeout
    // Also check if we're already authenticated - if so, don't block the UI
    if (authLoading && !loadingTimeout && !isAuthenticated) {
        return (
            <div className={`min-h-screen flex items-center justify-center 
                bg-gradient-to-br from-clean-light-pure via-clean-light-soft to-primary-50/30
                dark:bg-gradient-to-br dark:from-glass-dark-deepest dark:via-glass-dark-deep dark:to-glass-dark-base
                ${themeTransition ? 'theme-transition' : ''}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto" style={{ borderColor: themeStyles.getPrimaryColor(500) }}></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 font-normal">Loading...</p>
                </div>
            </div>
        );
    }

    const getFilteredMenuItems = () => {
        const alwaysVisible = ['dashboard', 'settings'];
        const tenantModules = tenant?.erpModules || [];
        const deptModules = userDepartments.map(dept => dept.module || dept.department?.toLowerCase()).filter(Boolean);
        const allAvailableModules = [...new Set([...tenantModules, ...deptModules])];

        const menuKeyToModules = {
            'hr': ['hr', 'attendance', 'employees', 'payroll'], 'finance': ['finance'], 'projects': ['projects'],
            'operations': ['operations'], 'inventory': ['inventory', 'inventory_management'],
            'clients': ['clients'], 'reports': ['reports'], 'messaging': ['messaging'],
            'users': ['roles'], 'analytics': ['reports'], 'settings': [],
            'permissions': ['role_management', 'roles'], 'roles': ['role_management', 'roles'],
            'departments': ['departments'], 'department': ['departments'],
            'products': ['products'], 'categories': ['categories'], 'pos': ['pos'],
            'sales': ['sales'], 'suppliers': ['suppliers'], 'customers': ['customers'],
            'patients': ['patients'], 'doctors': ['doctors'], 'appointments': ['appointments'],
            'medical-records': ['medical_records'], 'prescriptions': ['prescriptions'],
            'billing': ['billing'],
            'students': ['students'], 'teachers': ['teachers'], 'classes': ['classes'],
            'subjects': ['subjects'], 'syllabus': ['syllabus'], 'attendance': ['attendance'],
            'attendance-marking': ['attendance'], 'attendance-reports': ['attendance'],
            'attendance-leaves': ['attendance'], 'grades': ['grades'], 'grade-entry': ['grades'],
            'report-cards': ['grades'], 'teacher-assignments': ['teachers'], 'fees': ['fees'],
            'fee-structure': ['fees'], 'fee-collection': ['fees'], 'fee-reports': ['fees'],
            'timetable': ['timetable'], 'timetable-builder': ['timetable'], 'timetable-view': ['timetable'],
            'room-management': ['timetable'], 'courses': ['courses'], 'exams': ['exams'],
            'admissions': ['admissions'], 'production': ['production'], 'quality-control': ['quality_control'],
            'supply-chain': ['supply_chain'], 'equipment': ['equipment'], 'maintenance': ['maintenance'],
            'tech-stack': ['tech_stack'], 'development': ['development_methodology'], 'time-tracking': ['time_tracking']
        };

        const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

        return menuItems.filter(item => {
            if (alwaysVisible.includes(item.key)) return true;

            // Employee Portal: only for non-admin users (employees, managers viewing own data). Hide from main admin panel.
            if (item.key === 'employee-portal') {
                return !isOwnerOrAdmin;
            }

            if (isOwnerOrAdmin) {
                if (allAvailableModules.length > 0) {
                    const allowedModulesForMenu = menuKeyToModules[item.key] || [];
                    if (allowedModulesForMenu.length > 0) {
                        return allowedModulesForMenu.some(module => allAvailableModules.includes(module));
                    }
                    return true;
                }
                return true;
            }

            if (userDepartments.length > 0) {
                return userDepartments.some(dept => {
                    const deptModule = dept.module || dept.department?.toLowerCase();
                    const deptName = dept.name?.toLowerCase() || dept.department?.toLowerCase();
                    const menuKey = item.key.toLowerCase();
                    return deptModule === menuKey || deptName === menuKey ||
                        deptModule?.includes(menuKey) || deptName?.includes(menuKey);
                });
            }

            return false;
        }).filter(Boolean);
    };

    const handleMenuClick = (item) => {
        if (item.path) {
            navigate(item.path);
            setMobileMenuOpen(false);
        }
    };

    const toggleMenuExpansion = (key) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleUserMenuAction = async (action) => {
        setUserMenuOpen(false);
        switch (action) {
            case 'profile':
                if (user && user.id) {
                    navigate(`/${tenantSlug}/org/users/${user.id}`);
                }
                break;
            case 'logout':
                await logout();
                break;
            default:
                break;
        }
    };

    const getPageTitle = () => {
        const pathSegments = location.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        return lastSegment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderMenuItem = (item, isMobile = false) => {
        const Icon = item.icon;
        const currentMenuKey = getCurrentMenuKey();
        const isActive = currentMenuKey === item.key ||
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
        const hasActiveChild = item.children?.some(child =>
            location.pathname === child.path || location.pathname.startsWith(child.path + '/')
        ) || false;
        const isExpanded = expandedMenus[item.key] || false;
        const hasSubmenu = item.children && item.children.length > 0;

        const handleClick = (e) => {
            if (hasSubmenu) {
                e.preventDefault();
                toggleMenuExpansion(item.key);
            }
            handleMenuClick(item);
        };

        return (
            <div className="relative" key={item.key}>
                <button
                    onClick={handleClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 ${
                        isActive || hasActiveChild
                            ? 'text-white shadow-sm'
                            : 'bg-transparent hover:bg-gray-100/60 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                    style={isActive || hasActiveChild ? {
                        backgroundColor: isDarkMode ? `${themeStyles.getPrimaryColor(900)}66` : `${themeStyles.getPrimaryColor(100)}CC`,
                        color: isDarkMode ? themeStyles.getPrimaryColor(300) : themeStyles.getPrimaryColor(700),
                        borderColor: isDarkMode ? `${themeStyles.getPrimaryColor(700)}80` : `${themeStyles.getPrimaryColor(200)}80`,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                    } : {}}
                    onMouseEnter={(e) => {
                        if (!isActive && !hasActiveChild) {
                            e.target.style.color = isDarkMode ? themeStyles.getPrimaryColor(300) : themeStyles.getPrimaryColor(700);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive && !hasActiveChild) {
                            e.target.style.color = '';
                        }
                    }}
                >
                    <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive || hasActiveChild
                                ? 'text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                        style={isActive || hasActiveChild ? {
                            background: themeStyles.primaryGradientBr
                        } : {}}
                    >
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium truncate text-left">{item.label}</span>
                    {hasSubmenu && (
                        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-250 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </button>

                {/* Submenu */}
                {hasSubmenu && (
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-2">
                            {item.children.map((child) => {
                                const isChildActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                                return (
                                    <button
                                        key={child.key}
                                        onClick={() => {
                                            navigate(child.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`block w-full px-3 py-2 text-sm rounded-lg transition-all text-left ${
                                            isChildActive
                                                ? 'font-semibold'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                        style={isChildActive ? {
                                            backgroundColor: isDarkMode ? `${themeStyles.getPrimaryColor(900)}4D` : themeStyles.getPrimaryColor(100),
                                            color: isDarkMode ? themeStyles.getPrimaryColor(300) : themeStyles.getPrimaryColor(700)
                                        } : {}}
                                    >
                                        {child.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <TenantThemeProvider>
        <div 
            className={`tenant-org-layout tenant-portal h-screen flex flex-col relative overflow-hidden
            bg-gradient-to-br from-clean-light-pure via-clean-light-soft to-primary-50/30
            dark:bg-gradient-to-br dark:from-glass-dark-deepest dark:via-glass-dark-deep dark:to-glass-dark-base
            ${themeTransition ? 'theme-transition' : ''}`}
            data-industry={tenant?.erpCategory || 'business'}>
            {/* Premium Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMC0xOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnpNMCA1NGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMTggMGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')]"></div>
            </div>

            {/* Top Navbar: Logo, Search, Add, Fullscreen, Notifications, Profile */}
            <div className="flex-shrink-0 z-30 relative">
                <SoftwareHouseTopNavbar
                    orgLogoUrl={tenant?.logoUrl || tenant?.logo}
                    orgName={tenant?.name}
                    user={user}
                    onProfile={() => handleUserMenuAction('profile')}
                    onLogout={logout}
                    onSearch={(query) => {
                        setCommandPaletteInitialQuery(query);
                        setCommandPaletteOpen(true);
                    }}
                    searchPlaceholder="Search..."
                    onAddAction={handleAddAction}
                    isFullscreen={isFullscreen}
                    onFullscreenToggle={isFullscreen ? exitFullscreen : requestFullscreen}
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                />
            </div>

            {/* Mobile Header - Wolfstack Portal Style */}
            <div className="lg:hidden glass-header flex-shrink-0 z-50 sticky top-0">
                <div className="flex items-center justify-between px-4 py-3 animate-fade-in-fast">
                    {/* Left: Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="glass-button p-2 rounded-xl hover-scale"
                        aria-label="Open menu"
                    >
                        <Bars3Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    
                    {/* Center: Page Title */}
                    <div className="flex-1 mx-4">
                        <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
                            {getPageTitle()}
                        </h1>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Mobile Add Button */}
                        <div className="relative add-menu-container">
                            <button
                                onClick={() => setAddMenuOpen(!addMenuOpen)}
                                className="glass-button p-2 rounded-xl hover-scale bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                                aria-label="Add"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            {addMenuOpen && (
                                <div className="glass-dropdown absolute right-0 mt-2 w-56 z-[9999] shadow-2xl">
                                    <div className="py-2 px-2">
                                        <button
                                            onClick={() => handleAddAction('task')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                        >
                                            <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                                            Add Task
                                        </button>
                                        <button
                                            onClick={() => handleAddAction('project')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                        >
                                            <FolderIcon className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                                            Create Project
                                        </button>
                                        <button
                                            onClick={() => handleAddAction('user')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                        >
                                            <UserIcon className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                                            Add User
                                        </button>
                                        <button
                                            onClick={() => handleAddAction('time')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                                        >
                                            <ClockIcon className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                                            Log Time
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button className="glass-button p-2 rounded-xl hover-scale relative">
                                <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-glow"></span>
                            </button>
                        </div>
                        <div className="relative user-menu-container">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 glass-button px-2 py-2 rounded-xl hover-scale group"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow-lg group-hover:shadow-glow-xl transition-all">
                                    <span className="text-white text-sm font-bold">
                                        {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            </button>

                            {userMenuOpen && (
                                <div className="glass-dropdown absolute right-0 mt-2 w-56 z-50">
                                    <div className="p-4 border-b border-gray-200/50 dark:border-white/10 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20">
                                        <p className="text-sm font-bold font-heading text-gray-900 dark:text-white">
                                            {user?.fullName || user?.email || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-0.5">
                                            {user?.email || 'No email'}
                                        </p>
                                    </div>
                                    <div className="py-2 px-2">
                                        <button
                                            onClick={() => handleUserMenuAction('profile')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all hover-scale"
                                        >
                                            <UserIcon className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => handleUserMenuAction('logout')}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover-scale"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mobile Search Bar */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="glass-input w-full pl-10 pr-3 py-2.5 text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* ClickUp-style Sidebar - Leftmost (Icon-only, narrow) */}
                <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${
                    isFullscreen ? 'w-0' : 'w-16'
                }`}>
                    {!isFullscreen && (
                        <ClickUpSidebar 
                            allModules={getFilteredMenuItems()}
                            tenantSlug={tenantSlug}
                            isProjectWorkspace={isProjectWorkspace}
                        />
                    )}
                </div>

                {/* Premium Glassmorphism Sidebar - Wolfstack Portal Style (disclosed in project workspace) */}
                <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
                    isProjectWorkspace ? 'w-0' : (collapsed ? 'w-0' : 'w-56')
                }`}>
                <aside className={`
                    fixed inset-y-0 left-0 lg:left-0 z-50 w-56 transform transition-all duration-300 ease-smooth
                    lg:translate-x-0 lg:static lg:inset-0 lg:w-full
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    glass-sidebar glass-scrollbar
                    flex flex-col depth-layer-2
                    rounded-2xl mx-4 border border-gray-200/50 dark:border-white/10 shadow-lg
                    h-[calc(100vh-1rem)]
                `}>
                    {/* Premium Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-white/10 animate-fade-in">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-glow-lg animate-float-slow">
                                <span className="text-white font-bold text-base font-heading">W</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white tracking-tight">
                                    {tenant?.name || 'Organization'}
                                </h2>
                                <p className="text-xs text-gray-600 dark:text-gray-300 capitalize font-medium">
                                    {user?.role?.replace('_', ' ') || 'Member'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden glass-button p-1.5 rounded-lg hover-scale"
                            aria-label="Close sidebar"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Premium Navigation */}
                    <nav className="sidebar-navigation flex-1 overflow-y-auto pt-6 pb-4 glass-scrollbar">
                        <div className="px-3 space-y-2">
                            {getFilteredMenuItems().map((item, index) => (
                                <div
                                    key={item.key}
                                    className="animate-fade-in"
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    {renderMenuItem(item)}
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* Fixed Signout Button */}
                    <div className="mt-auto p-4 border-t border-gray-200/50 dark:border-white/10">
                        <button
                            onClick={() => handleUserMenuAction('logout')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover-scale group"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left">Sign Out</span>
                        </button>
                    </div>

                </aside>
                </div>

                {/* Collapse/Expand Button - Wolfstack Portal Style (hidden in project workspace) */}
                {!isProjectWorkspace && (
                <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 z-[60] transition-all duration-500 ease-in-out ${
                    collapsed ? 'left-[4rem]' : 'left-[calc(4rem+14rem-12px)]'
                }`}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center justify-center w-6 h-12 bg-white/90 dark:bg-gray-800/90 border border-gray-300/50 dark:border-gray-600/50 rounded-r-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:bg-white dark:hover:bg-gray-800 group backdrop-blur-sm"
                        title={collapsed ? "Expand sidebar (Cmd/Ctrl + B)" : "Collapse sidebar (Cmd/Ctrl + B)"}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                        ) : (
                            <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                        )}
                    </button>
                </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 relative z-10 depth-layer-1">
                    {/* Main Content */}
                    <main 
                        ref={mainContentRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 glass-scrollbar transition-all duration-500 ease-in-out"
                    >
                        <div className="p-2 sm:p-3 md:p-3 lg:p-3 xl:p-4 relative animate-fade-in">
                            {children ? children : (
                                <div className="flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto" style={{ borderColor: themeStyles.getPrimaryColor(500) }}></div>
                                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
        <CommandPalette 
            isOpen={commandPaletteOpen}
            onClose={() => {
                setCommandPaletteOpen(false);
                setCommandPaletteInitialQuery('');
            }}
            tenantSlug={tenantSlug}
            initialSearchTerm={commandPaletteInitialQuery}
        />
        <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
                duration: 3000,
                style: {
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500'
                },
                success: {
                    duration: 2500,
                    style: {
                        background: '#10b981',
                        color: '#fff'
                    }
                },
                error: {
                    duration: 4000,
                    style: {
                        background: '#ef4444',
                        color: '#fff'
                    }
                }
            }}
        />
    </TenantThemeProvider>
  );
};

export default TenantOrgLayout;
