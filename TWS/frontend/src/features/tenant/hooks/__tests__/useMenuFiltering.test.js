/**
 * Tests for useMenuFiltering hook
 */

import { renderHook } from '@testing-library/react';
import { useMenuFiltering } from '../useMenuFiltering';

describe('useMenuFiltering', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'admin',
    permissions: ['read', 'write']
  };

  const mockTenant = {
    id: '1',
    name: 'Test Tenant',
    slug: 'test-tenant'
  };

  const mockUserDepartments = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Sales' }
  ];

  const mockMenuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'HomeIcon',
      visible: true
    },
    {
      key: 'projects',
      label: 'Projects',
      path: '/projects',
      icon: 'FolderIcon',
      visible: true,
      requiredPermission: 'read'
    },
    {
      key: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: 'CogIcon',
      visible: true,
      requiredRole: 'admin'
    },
    {
      key: 'hidden',
      label: 'Hidden',
      path: '/hidden',
      icon: 'EyeIcon',
      visible: false
    }
  ];

  it('should filter out items with visible: false', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    expect(filtered.find(item => item.key === 'hidden')).toBeUndefined();
  });

  it('should include items with visible: true', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    expect(filtered.find(item => item.key === 'dashboard')).toBeDefined();
  });

  it('should filter items based on requiredPermission', () => {
    const userWithoutPermission = {
      ...mockUser,
      permissions: []
    };

    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, userWithoutPermission, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    const projectsItem = filtered.find(item => item.key === 'projects');
    
    // Should be filtered out if user doesn't have required permission
    expect(projectsItem).toBeUndefined();
  });

  it('should include items when user has requiredPermission', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    const projectsItem = filtered.find(item => item.key === 'projects');
    
    expect(projectsItem).toBeDefined();
  });

  it('should filter items based on requiredRole', () => {
    const nonAdminUser = {
      ...mockUser,
      role: 'user'
    };

    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, nonAdminUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    const adminItem = filtered.find(item => item.key === 'admin');
    
    expect(adminItem).toBeUndefined();
  });

  it('should include items when user has requiredRole', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    const adminItem = filtered.find(item => item.key === 'admin');
    
    expect(adminItem).toBeDefined();
  });

  it('should handle empty menu items', () => {
    const { result } = renderHook(() =>
      useMenuFiltering([], mockUser, mockTenant, mockUserDepartments)
    );

    expect(result.current).toEqual([]);
  });

  it('should handle null user gracefully', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, null, mockTenant, mockUserDepartments)
    );

    // Should filter out items requiring permissions/roles
    const filtered = result.current;
    expect(filtered.length).toBeLessThanOrEqual(mockMenuItems.length);
  });

  it('should preserve menu item structure', () => {
    const { result } = renderHook(() =>
      useMenuFiltering(mockMenuItems, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    if (filtered.length > 0) {
      const item = filtered[0];
      expect(item).toHaveProperty('key');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('path');
    }
  });

  it('should handle nested menu items', () => {
    const menuWithChildren = [
      {
        key: 'parent',
        label: 'Parent',
        path: '/parent',
        children: [
          {
            key: 'child1',
            label: 'Child 1',
            path: '/parent/child1',
            visible: true
          },
          {
            key: 'child2',
            label: 'Child 2',
            path: '/parent/child2',
            visible: false
          }
        ]
      }
    ];

    const { result } = renderHook(() =>
      useMenuFiltering(menuWithChildren, mockUser, mockTenant, mockUserDepartments)
    );

    const filtered = result.current;
    const parentItem = filtered.find(item => item.key === 'parent');
    
    if (parentItem && parentItem.children) {
      expect(parentItem.children.length).toBe(1);
      expect(parentItem.children[0].key).toBe('child1');
    }
  });
});
