const auditService = require('../../services/compliance/audit.service');

/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 * Provides comprehensive permission checking for messaging system
 */
class RBACMiddleware {
  constructor() {
    // Define role hierarchy (higher number = more permissions)
    this.roleHierarchy = {
      // Platform-level roles (TWS Admins)
      platform_super_admin: 1000,
      platform_admin: 900,
      platform_support: 800,
      platform_billing: 700,
      
      // System role
      system: 100,
      
      // Tenant-level roles (Organization Admins)
      super_admin: 90,    // Tenant super admin
      org_manager: 80,    // Organization manager
      owner: 70,          // Business owner
      admin: 60,          // Tenant admin

      moderator: 50,      // Content moderator
      hr: 45,             // HR manager
      finance: 45,        // Finance manager
      pmo: 40,            // Project management office
      project_manager: 35, // Project manager
      department_lead: 30, // Department lead
      manager: 25,        // Team manager
      employee: 20,       // Regular employee
      contributor: 15,    // External contributor
      contractor: 10,     // Contractor
      auditor: 5,         // Auditor (read-only)
      client: 3,          // Client access
      reseller: 2,        // Reseller access
      user: 1             // Basic user
    };

    // Define permissions for each role
    this.rolePermissions = {
      // Platform-level permissions
      platform_super_admin: ['*'], // All platform permissions
      platform_admin: [
        'tenants:read', 'tenants:write', 'tenants:delete',
        'users:read', 'users:write', 'users:delete',
        'billing:read', 'billing:write',
        'analytics:read', 'analytics:export',
        'erp:read', 'erp:write', 'erp:delete',
        'master_erp:read', 'master_erp:write', 'master_erp:delete'
      ],
      platform_support: [
        'tenants:read', 'users:read',
        'analytics:read', 'support:tickets'
      ],
      platform_billing: [
        'billing:read', 'billing:write',
        'tenants:read', 'analytics:read'
      ],
      
      // System permissions
      system: ['*'], // All permissions
      
      // Tenant-level permissions
      super_admin: ['*'], // All permissions within tenant
      org_manager: ['*'], // All permissions within organization
      owner: ['*'], // All permissions within organization
      admin: [
        'users:read', 'users:write', 'users:delete',
        // Messaging permissions removed - messaging system removed
        'audit:read', 'audit:export',
        'retention:read', 'retention:write',
        'reports:read', 'reports:generate',
        'tenant:*'  // Full tenant access
      ],
      
      moderator: [
        'users:read',
        'messages:read', 'messages:write', 'messages:moderate',
        'chats:read', 'chats:write', 'chats:moderate',
        'audit:read'
      ],
      hr: [
        'users:read', 'users:write',
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'audit:read'
      ],
      finance: [
        'users:read',
        'messages:read',
        'chats:read',
        'audit:read'
      ],
      pmo: [
        'users:read',
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'audit:read'
      ],
      project_manager: [
        'users:read',
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'audit:read'
      ],
      department_lead: [
        'users:read',
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'audit:read'
      ],
      manager: [
        'users:read',
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'audit:read'
      ],
      employee: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write'
      ],
      contributor: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write'
      ],
      contractor: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write'
      ],
      auditor: [
        'users:read',
        'messages:read',
        'chats:read',
        'audit:read', 'audit:export'
      ],
      client: [
        'messages:read',
        'chats:read'
      ],
      reseller: [
        'messages:read',
        'chats:read'
      ],
      user: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write'
      ]
    };

    // Define resource-specific permissions
    this.resourcePermissions = {
      message: {
        read: ['employee', 'contributor', 'contractor', 'moderator', 'admin', 'system'],
        write: ['employee', 'contributor', 'contractor', 'moderator', 'admin', 'system'],
        delete: ['moderator', 'admin', 'system'],
        moderate: ['moderator', 'admin', 'system']
      },
      chat: {
        read: ['employee', 'contributor', 'contractor', 'moderator', 'admin', 'system'],
        write: ['employee', 'contributor', 'contractor', 'moderator', 'admin', 'system'],
        delete: ['admin', 'system'],
        moderate: ['moderator', 'admin', 'system']
      },
      user: {
        read: ['employee', 'contributor', 'contractor', 'moderator', 'admin', 'system'],
        write: ['admin', 'system'],
        delete: ['admin', 'system']
      },
      audit: {
        read: ['auditor', 'moderator', 'admin', 'system'],
        export: ['auditor', 'admin', 'system']
      },
      retention: {
        read: ['admin', 'system'],
        write: ['admin', 'system']
      }
    };
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(userRole, permission) {
    const userPermissions = this.rolePermissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  /**
   * Check if user has permission for a specific resource and action
   */
  hasResourcePermission(userRole, resource, action) {
    const allowedRoles = this.resourcePermissions[resource]?.[action] || [];
    return allowedRoles.includes(userRole) || this.hasPermission(userRole, '*');
  }

  /**
   * Check if user role is higher than or equal to required role
   */
  hasRoleLevel(userRole, requiredRole) {
    const userLevel = this.roleHierarchy[userRole] || 0;
    const requiredLevel = this.roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Middleware to require specific permission
   */
  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!this.hasPermission(req.user.role, permission)) {
        // SECURITY FIX: Log unauthorized access attempt with full context
        auditService.logEvent({
          action: 'RBAC_ACCESS_DENIED',
          performedBy: req.user._id?.toString() || 'system',
          userId: req.user._id?.toString() || 'system',
          userEmail: req.user?.email || 'unknown',
          userRole: req.user.role || 'unknown',
          organization: req.user.orgId || null,
          tenantId: req.tenant?._id?.toString() || 'default',
          resource: 'Request',
          resourceId: null,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent'),
          details: {
            reason: 'Insufficient permissions',
            requiredPermission: permission,
            userRole: req.user.role,
            attemptedAction: req.method + ' ' + req.path
          },
          severity: 'high',
          status: 'failure'
        }).catch(err => console.error('Failed to log RBAC denial:', err));

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission,
          current: req.user.role,
          traceId: req.headers['x-request-id'] || req.id
        });
      }

      next();
    };
  }

  /**
   * Middleware to require specific role level
   */
  requireRole(requiredRole) {
    return (req, res, next) => {
      if (!req.user) {
        // SECURITY FIX: Log authentication failure
        auditService.logEvent({
          action: 'RBAC_AUTH_REQUIRED',
          performedBy: 'anonymous',
          userId: 'anonymous',
          userEmail: 'unknown',
          userRole: 'unknown',
          organization: null,
          tenantId: req.tenant?._id?.toString() || 'default',
          resource: 'Request',
          resourceId: null,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent'),
          details: {
            method: req.method,
            path: req.path,
            reason: 'Authentication required'
          },
          severity: 'medium',
          status: 'failure'
        }).catch(err => console.error('Failed to log auth failure:', err));
        
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
          traceId: req.headers['x-request-id'] || req.id
        });
      }

      // Handle array of roles (OR condition)
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRequiredRole = requiredRoles.some(role => this.hasRoleLevel(req.user.role, role));

      if (!hasRequiredRole) {
        // SECURITY FIX: Log unauthorized access attempt with full context
        auditService.logEvent({
          action: 'RBAC_ROLE_DENIED',
          performedBy: req.user._id?.toString() || 'system',
          userId: req.user._id?.toString() || 'system',
          userEmail: req.user?.email || 'unknown',
          userRole: req.user.role || 'unknown',
          organization: req.user.orgId || null,
          tenantId: req.tenant?._id?.toString() || 'default',
          resource: 'Request',
          resourceId: null,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent'),
          details: {
            reason: 'Insufficient role level',
            requiredRoles: requiredRoles,
            userRole: req.user.role,
            attemptedAction: req.method + ' ' + req.path
          },
          severity: 'high',
          status: 'failure'
        }).catch(err => console.error('Failed to log RBAC denial:', err));

        return res.status(403).json({
          success: false,
          message: 'Insufficient role level',
          code: 'INSUFFICIENT_ROLE',
          required: requiredRoles,
          current: req.user.role,
          traceId: req.headers['x-request-id'] || req.id
        });
      }

      next();
    };
  }

  /**
   * Middleware to require resource-specific permission
   */
  requireResourcePermission(resource, action) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!this.hasResourcePermission(req.user.role, resource, action)) {
        // Log unauthorized access attempt
        auditService.logSecurityEvent(
          auditService.auditActions.ADMIN_ACCESS,
          req.user._id,
          req.user.orgId,
          {
            reason: 'Insufficient resource permissions',
            details: {
              resource,
              action,
              userRole: req.user.role,
              attemptedAction: req.method + ' ' + req.path
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'warning'
          }
        );

        return res.status(403).json({
          success: false,
          message: 'Insufficient resource permissions',
          resource,
          action,
          current: req.user.role
        });
      }

      next();
    };
  }

  /**
   * Middleware to check if user can access a specific message
   */
  requireMessageAccess(action = 'read') {
    // Messaging features have been removed - this middleware returns error
    return async (req, res, next) => {
      return res.status(410).json({
        success: false,
        message: 'Message access middleware is no longer supported. Messaging features have been removed.'
      });
    };
  }

  /**
   * Middleware to check if user can access a specific chat
   */
  requireChatAccess(action = 'read') {
    // Messaging features have been removed - this middleware returns error
    return async (req, res, next) => {
      return res.status(410).json({
        success: false,
        message: 'Chat access middleware is no longer supported. Messaging features have been removed.'
      });
    };
  }

  /**
   * Middleware to check admin access
   */
  requireAdminAccess() {
    return this.requireRole('admin');
  }

  /**
   * Middleware to check moderator access
   */
  requireModeratorAccess() {
    return this.requireRole('moderator');
  }

  /**
   * Middleware to check system access
   */
  requireSystemAccess() {
    return this.requireRole('system');
  }

  /**
   * Require TWS Platform Admin access
   */
  requireTWSAdminAccess() {
    return (req, res, next) => {
      console.log('🔍 requireTWSAdminAccess - Checking access:', {
        hasUser: !!req.user,
        userId: req.user?._id,
        userRole: req.user?.role,
        authContextType: req.authContext?.type,
        userEmail: req.user?.email
      });

      if (!req.user) {
        console.log('❌ requireTWSAdminAccess - No user found');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Allow access if:
      // 1. User is TWS Admin (req.authContext?.type === 'tws_admin')
      // 2. User is a regular User with super_admin role (for backward compatibility)
      const isTWSAdmin = req.authContext?.type === 'tws_admin';
      const isSuperAdmin = req.user.role === 'super_admin';
      
      console.log('🔍 requireTWSAdminAccess - Access check:', {
        isTWSAdmin,
        isSuperAdmin,
        userRole: req.user.role,
        authContextType: req.authContext?.type
      });
      
      if (!isTWSAdmin && !isSuperAdmin) {
        console.log('❌ requireTWSAdminAccess - Access denied. User role:', req.user.role);
        return res.status(403).json({
          success: false,
          message: 'TWS Platform Admin access required. User role: ' + req.user.role,
          debug: {
            userRole: req.user.role,
            authContextType: req.authContext?.type,
            isTWSAdmin,
            isSuperAdmin
          }
        });
      }

      // Check role level (only for TWS Admin, skip for regular Users with super_admin)
      if (isTWSAdmin && !this.hasRoleLevel(req.user.role, 'platform_admin')) {
        console.log('❌ requireTWSAdminAccess - Insufficient role level');
        return res.status(403).json({
          success: false,
          message: 'Insufficient platform admin privileges'
        });
      }

      console.log('✅ requireTWSAdminAccess - Access granted');
      next();
    };
  }

  /**
   * Require TWS Platform Super Admin access
   */
  requireTWSSuperAdminAccess() {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user is TWS Admin
      if (req.authContext?.type !== 'tws_admin') {
        return res.status(403).json({
          success: false,
          message: 'TWS Platform Admin access required'
        });
      }

      // Check role level
      if (!this.hasRoleLevel(req.user.role, 'platform_super_admin')) {
        return res.status(403).json({
          success: false,
          message: 'TWS Platform Super Admin access required'
        });
      }

      next();
    };
  }

  /**
   * Require Supra-Admin access (legacy - redirects to TWS Admin)
   */
  requireSupraAdminAccess() {
    return this.requireTWSAdminAccess();
  }

  /**
   * Get user permissions for frontend
   */
  getUserPermissions(userRole) {
    return {
      role: userRole,
      level: this.roleHierarchy[userRole] || 0,
      permissions: this.rolePermissions[userRole] || [],
      canAccess: (resource, action) => this.hasResourcePermission(userRole, resource, action),
      hasPermission: (permission) => this.hasPermission(userRole, permission)
    };
  }

  /**
   * Check if a role is allowed for a specific ERP category
   * @param {String} role - Role to check
   * @param {String} erpCategory - ERP category (tenant, business, etc.)
   * @returns {Boolean} - True if role is allowed for this ERP category
   */
  isRoleAllowedForERP(role, erpCategory) {
    // Software House only: all roles allowed for software_house / business
    return true;
  }

  /**
   * Middleware to validate role assignment based on ERP category
   */
  validateRoleForERP(erpCategory) {
    return (req, res, next) => {
      // Check if role is being assigned in request body
      const requestedRole = req.body.role || req.params.role;
      
      if (requestedRole && !this.isRoleAllowedForERP(requestedRole, erpCategory)) {
        return res.status(403).json({
          success: false,
          message: `Role '${requestedRole}' is not available for ${erpCategory} ERP category`,
          code: 'ROLE_NOT_ALLOWED_FOR_ERP',
          requestedRole,
          erpCategory,
          allowedRoles: this.getAllowedRolesForERP(erpCategory)
        });
      }

      // Check if user's current role is allowed for this ERP
      if (req.user && req.user.role && !this.isRoleAllowedForERP(req.user.role, erpCategory)) {
        return res.status(403).json({
          success: false,
          message: `Your current role '${req.user.role}' is not valid for ${erpCategory} ERP category`,
          code: 'USER_ROLE_INVALID_FOR_ERP',
          userRole: req.user.role,
          erpCategory
        });
      }

      next();
    };
  }

  /**
   * Get all allowed roles for a specific ERP category
   * @param {String} erpCategory - ERP category
   * @returns {Array} - Array of allowed role keys
   */
  getAllowedRolesForERP(erpCategory) {
    const allRoles = Object.keys(this.roleHierarchy);
    return allRoles;
  }
}

// Create singleton instance
const rbacMiddleware = new RBACMiddleware();

// Export individual middleware functions
module.exports = {
  // Permission-based middleware
  requirePermission: (permission) => rbacMiddleware.requirePermission(permission),
  requireRole: (role) => rbacMiddleware.requireRole(role),
  requireResourcePermission: (resource, action) => rbacMiddleware.requireResourcePermission(resource, action),
  
  // Resource-specific middleware
  requireMessageAccess: (action) => rbacMiddleware.requireMessageAccess(action),
  requireChatAccess: (action) => rbacMiddleware.requireChatAccess(action),
  
  // Role-based middleware
  requireAdminAccess: () => rbacMiddleware.requireAdminAccess(),
  requireModeratorAccess: () => rbacMiddleware.requireModeratorAccess(),
  requireSystemAccess: () => rbacMiddleware.requireSystemAccess(),
  
  // TWS Platform Admin middleware
  requireTWSAdminAccess: () => rbacMiddleware.requireTWSAdminAccess(),
  requireTWSSuperAdminAccess: () => rbacMiddleware.requireTWSSuperAdminAccess(),
  
  // Legacy middleware (for backward compatibility)
  requireSupraAdminAccess: () => rbacMiddleware.requireSupraAdminAccess(),
  
  // Utility functions
  hasPermission: (role, permission) => rbacMiddleware.hasPermission(role, permission),
  hasResourcePermission: (role, resource, action) => rbacMiddleware.hasResourcePermission(role, resource, action),
  hasRoleLevel: (userRole, requiredRole) => rbacMiddleware.hasRoleLevel(userRole, requiredRole),
  getUserPermissions: (role) => rbacMiddleware.getUserPermissions(role),
  
  // ERP category role validation
  isRoleAllowedForERP: (role, erpCategory) => rbacMiddleware.isRoleAllowedForERP(role, erpCategory),
  validateRoleForERP: (erpCategory) => rbacMiddleware.validateRoleForERP(erpCategory),
  getAllowedRolesForERP: (erpCategory) => rbacMiddleware.getAllowedRolesForERP(erpCategory),
  
  // Class instance for advanced usage
  rbac: rbacMiddleware
};
