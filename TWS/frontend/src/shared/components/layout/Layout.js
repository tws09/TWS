import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import Sidebar from '../navigation/Sidebar';
import ClickUpSidebar from '../navigation/ClickUpSidebar';
import Header from '../navigation/Header';
import MobileMenu from '../navigation/MobileMenu';
import { 
  BuildingOfficeIcon,
  HomeIcon,
  UsersIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  DocumentTextIcon,
  TrophyIcon,
  EllipsisHorizontalIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

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

    // Listen for fullscreen changes
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
      // ESC key to exit fullscreen
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  const navigation = [
    { name: 'Projects', href: '/projects', icon: 'ClipboardDocumentListIcon', current: location.pathname.startsWith('/projects') },
    { name: 'Dashboard', href: '/', icon: 'HomeIcon', current: location.pathname === '/' },
    { name: 'Employees', href: '/employees', icon: 'UsersIcon', current: location.pathname.startsWith('/employees') },
    { name: 'Attendance', href: '/attendance', icon: 'ClockIcon', current: location.pathname === '/attendance' },
    { name: 'Messaging', href: '/admin/messaging', icon: 'ChatBubbleLeftRightIcon', current: location.pathname.startsWith('/admin/messaging') },
    { name: 'Payroll', href: '/payroll', icon: 'CurrencyDollarIcon', current: location.pathname === '/payroll' },
    { name: 'Finance', href: '/finance', icon: 'ChartBarIcon', current: location.pathname === '/finance' },
    { name: 'Templates', href: '/templates', icon: 'DocumentDuplicateIcon', current: location.pathname === '/templates' },
    { name: 'Settings', href: '/settings', icon: 'CogIcon', current: location.pathname === '/settings' },
  ];

  // ClickUp-style navigation items with icon components
  const clickUpNavigation = [
    { name: 'Home', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'Teams', href: '/employees', icon: UserGroupIcon, current: location.pathname.startsWith('/employees') },
    { name: 'Docs', href: '/templates', icon: DocumentTextIcon, current: location.pathname.startsWith('/templates') },
    { name: 'Goals', href: '/goals', icon: TrophyIcon, current: location.pathname.startsWith('/goals') },
    { name: 'Timesheet', href: '/attendance', icon: ClockIcon, current: location.pathname === '/attendance' },
    { name: 'More', href: '/more', icon: EllipsisHorizontalIcon, current: location.pathname.startsWith('/more') },
    { name: 'Invite', href: '/invite', icon: UserPlusIcon, current: location.pathname.startsWith('/invite') },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    switch (item.name) {
      case 'WorkSpaces':
        return ['super_admin', 'org_manager', 'pmo', 'project_manager', 'admin', 'owner', 'manager', 'contributor', 'department_lead'].includes(user?.role);
      case 'Employees':
        return ['super_admin', 'org_manager', 'hr', 'admin', 'owner'].includes(user?.role);
      case 'Payroll':
        return ['super_admin', 'org_manager', 'hr', 'finance', 'admin', 'owner'].includes(user?.role);
      case 'Finance':
        return ['super_admin', 'org_manager', 'finance', 'admin', 'owner'].includes(user?.role);
      case 'Meetings':
        return ['super_admin', 'org_manager', 'hr', 'admin', 'owner', 'project_manager', 'pmo'].includes(user?.role);
      case 'Templates':
        return ['super_admin', 'org_manager', 'pmo', 'project_manager'].includes(user?.role);
      case 'Settings':
        return ['super_admin', 'org_manager', 'admin', 'owner'].includes(user?.role);
      default:
        return true;
    }
  });

  return (
    <div className="h-screen flex overflow-hidden wolfstack-main">
      {/* Mobile menu */}
      <MobileMenu 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        navigation={filteredNavigation}
      />

      {/* Existing Static sidebar for desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${
        isFullscreen ? 'w-0' : sidebarCollapsed ? 'w-0' : 'w-56'
      }`}>
        {!isFullscreen && (
          <Sidebar 
            navigation={filteredNavigation} 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
      </div>

      {/* ClickUp-style Sidebar */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${
        isFullscreen ? 'w-0' : 'w-64'
      }`}>
        {!isFullscreen && (
          <ClickUpSidebar navigation={clickUpNavigation} />
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isFullscreen={isFullscreen}
          requestFullscreen={requestFullscreen}
          exitFullscreen={exitFullscreen}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8 wolfstack-animate-fadeIn">
            <div className={`mx-auto px-6 space-y-8 transition-all duration-500 ease-in-out ${
              isFullscreen ? 'max-w-none px-8' : 'max-w-7xl'
            }`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
