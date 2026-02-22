import { useMemo } from 'react';

/**
 * Hook for filtering menu items based on user permissions and tenant modules
 * 
 * Extracted from TenantOrgLayout for better maintainability and testability.
 * Handles complex menu visibility logic based on:
 * - User role (owner/admin vs employee)
 * - Tenant modules
 * - User departments
 * - Menu key to module mappings
 * 
 * @param {Array} menuItems - All available menu items
 * @param {Object} user - Current user object
 * @param {Object} tenant - Current tenant object
 * @param {Array} userDepartments - User's assigned departments
 * @returns {Array} Filtered menu items
 * 
 * @example
 * const filteredMenuItems = useMenuFiltering(menuItems, user, tenant, userDepartments);
 */
export const useMenuFiltering = (menuItems, user, tenant, userDepartments) => {
  return useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    const alwaysVisible = ['dashboard', 'settings'];
    const tenantModules = tenant?.erpModules || [];
    const deptModules = userDepartments.map(dept => dept.module || dept.department?.toLowerCase()).filter(Boolean);
    const allAvailableModules = [...new Set([...tenantModules, ...deptModules])];

    const menuKeyToModules = {
      'hr': ['hr', 'attendance', 'employees', 'payroll'],
      'finance': ['finance'],
      'projects': ['projects'],
      'operations': ['operations'],
      'inventory': ['inventory', 'inventory_management'],
      'clients': ['clients'],
      'reports': ['reports'],
      'messaging': ['messaging'],
      'users': ['roles'],
      'analytics': ['reports'],
      'settings': [],
      'permissions': ['role_management', 'roles'],
      'roles': ['role_management', 'roles'],
      'departments': ['departments'],
      'department': ['departments'],
      'products': ['products'],
      'categories': ['categories'],
      'pos': ['pos'],
      'sales': ['sales'],
      'suppliers': ['suppliers'],
      'customers': ['customers'],
      'patients': ['patients'],
      'doctors': ['doctors'],
      'appointments': ['appointments'],
      'medical-records': ['medical_records'],
      'prescriptions': ['prescriptions'],
      'billing': ['billing'],
      'students': ['students'],
      'teachers': ['teachers'],
      'classes': ['classes'],
      'subjects': ['subjects'],
      'syllabus': ['syllabus'],
      'attendance': ['attendance'],
      'attendance-marking': ['attendance'],
      'attendance-reports': ['attendance'],
      'attendance-leaves': ['attendance'],
      'grades': ['grades'],
      'grade-entry': ['grades'],
      'report-cards': ['grades'],
      'teacher-assignments': ['teachers'],
      'fees': ['fees'],
      'fee-structure': ['fees'],
      'fee-collection': ['fees'],
      'fee-reports': ['fees'],
      'timetable': ['timetable'],
      'timetable-builder': ['timetable'],
      'timetable-view': ['timetable'],
      'room-management': ['timetable'],
      'courses': ['courses'],
      'exams': ['exams'],
      'admissions': ['admissions'],
      'production': ['production'],
      'quality-control': ['quality_control'],
      'supply-chain': ['supply_chain'],
      'equipment': ['equipment'],
      'maintenance': ['maintenance'],
      'tech-stack': ['tech_stack'],
      'development': ['development_methodology'],
      'time-tracking': ['time_tracking']
    };

    const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

    return menuItems.filter(item => {
      if (!item || !item.key) return false;

      // Always visible items
      if (alwaysVisible.includes(item.key)) return true;

      // Employee Portal: only for non-admin users
      if (item.key === 'employee-portal') {
        return !isOwnerOrAdmin;
      }

      // Admin/Owner logic
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

      // Regular user logic - check departments
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
  }, [menuItems, tenant?.erpModules, userDepartments, user?.role]);
};

/**
 * Get reason why a menu item is hidden (for visual indicators)
 * 
 * @param {Object} item - Menu item
 * @param {Object} user - Current user
 * @param {Object} tenant - Current tenant
 * @param {Array} userDepartments - User's departments
 * @returns {string|null} Reason why item is hidden, or null if visible
 */
export const getMenuVisibilityReason = (item, user, tenant, userDepartments) => {
  if (!item || !item.key) return null;

  const alwaysVisible = ['dashboard', 'settings'];
  if (alwaysVisible.includes(item.key)) return null;

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';
  
  if (item.key === 'employee-portal' && isOwnerOrAdmin) {
    return 'Admin users cannot access employee portal';
  }

  const tenantModules = tenant?.erpModules || [];
  const menuKeyToModules = {
    'hr': ['hr', 'attendance', 'employees', 'payroll'],
    'finance': ['finance'],
    'projects': ['projects'],
    'operations': ['operations'],
    'inventory': ['inventory', 'inventory_management'],
    'clients': ['clients'],
    'reports': ['reports'],
    'messaging': ['messaging'],
    'users': ['roles'],
    'analytics': ['reports'],
    'settings': [],
    'permissions': ['role_management', 'roles'],
    'roles': ['role_management', 'roles'],
    'departments': ['departments'],
    'department': ['departments'],
    'products': ['products'],
    'categories': ['categories'],
    'pos': ['pos'],
    'sales': ['sales'],
    'suppliers': ['suppliers'],
    'customers': ['customers'],
    'patients': ['patients'],
    'doctors': ['doctors'],
    'appointments': ['appointments'],
    'medical-records': ['medical_records'],
    'prescriptions': ['prescriptions'],
    'billing': ['billing'],
    'students': ['students'],
    'teachers': ['teachers'],
    'classes': ['classes'],
    'subjects': ['subjects'],
    'syllabus': ['syllabus'],
    'attendance': ['attendance'],
    'attendance-marking': ['attendance'],
    'attendance-reports': ['attendance'],
    'attendance-leaves': ['attendance'],
    'grades': ['grades'],
    'grade-entry': ['grades'],
    'report-cards': ['grades'],
    'teacher-assignments': ['teachers'],
    'fees': ['fees'],
    'fee-structure': ['fees'],
    'fee-collection': ['fees'],
    'fee-reports': ['fees'],
    'timetable': ['timetable'],
    'timetable-builder': ['timetable'],
    'timetable-view': ['timetable'],
    'room-management': ['timetable'],
    'courses': ['courses'],
    'exams': ['exams'],
    'admissions': ['admissions'],
    'production': ['production'],
    'quality-control': ['quality_control'],
    'supply-chain': ['supply_chain'],
    'equipment': ['equipment'],
    'maintenance': ['maintenance'],
    'tech-stack': ['tech_stack'],
    'development': ['development_methodology'],
    'time-tracking': ['time_tracking']
  };

  const allowedModules = menuKeyToModules[item.key] || [];
  if (allowedModules.length > 0) {
    const hasModule = allowedModules.some(module => tenantModules.includes(module));
    if (!hasModule) {
      return 'Module not enabled for your organization';
    }
  }

  if (!isOwnerOrAdmin && userDepartments.length > 0) {
    const hasAccess = userDepartments.some(dept => {
      const deptModule = dept.module || dept.department?.toLowerCase();
      const deptName = dept.name?.toLowerCase() || dept.department?.toLowerCase();
      const menuKey = item.key.toLowerCase();
      return deptModule === menuKey || deptName === menuKey;
    });
    
    if (!hasAccess) {
      return 'Not assigned to your department';
    }
  }

  return null;
};
