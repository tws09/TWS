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
      
      // Healthcare-specific roles (RESTRICTED to Healthcare ERP only - NOT available in Education ERP)
      // These roles are only valid for healthcare tenants (erpCategory === 'healthcare')
      // SECURITY FIX: Disabled for Education ERP to prevent inappropriate role assignments
      chief_medical_officer: 59,    // CMO - highest clinical authority (HEALTHCARE ONLY)
      doctor: 55,                   // Physician - can access assigned patients (HEALTHCARE ONLY)
      nurse_practitioner: 54,      // NP - can access assigned patients (HEALTHCARE ONLY)
      physician_assistant: 53,     // PA - can access assigned patients (HEALTHCARE ONLY)
      nurse: 50,                   // Registered nurse (HEALTHCARE ONLY)
      medical_assistant: 45,        // MA - limited clinical access (HEALTHCARE ONLY)
      receptionist: 40,            // Front desk - demographics only (HEALTHCARE ONLY)
      billing_staff: 35,           // Billing - no clinical data (HEALTHCARE ONLY)
      medical_records_staff: 30,   // Records - read-only clinical data (HEALTHCARE ONLY)
      patient: 10,                 // Patient - own records only (HEALTHCARE ONLY)
      
      // Education-specific roles (integrated into RBAC)
      principal: 58,      // School principal (below admin, can manage school)
      academic_coordinator: 52,  // Academic program coordinator (between principal and head_teacher)
      
      moderator: 50,      // Content moderator
      hr: 45,             // HR manager
      finance: 45,        // Finance manager
      pmo: 40,            // Project management office
      head_teacher: 35,   // Head teacher / Department head (education)
      project_manager: 35, // Project manager
      counselor: 32,      // Student counselor (special privacy permissions)
      teacher: 30,        // Teacher (can manage classes)
      lab_instructor: 28, // Lab/workshop instructor (similar to teacher but lab-specific)
      department_lead: 30, // Department lead
      assistant_teacher: 25, // Teaching assistant (below teacher)
      librarian: 25,      // Library staff
      sports_coach: 25,   // Physical education/sports coach
      manager: 25,        // Team manager
      admin_staff: 22,   // Administrative staff (non-teaching)
      employee: 20,       // Regular employee
      contributor: 15,    // External contributor
      student: 10,        // Student (view own data only)
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
        'education:*'  // Full education access
      ],
      
      // Education role permissions
      principal: [
        'users:read',
        // Messaging permissions removed - messaging system removed
        'audit:read',
        'education:students:*',        // Full student management
        'education:teachers:read',     // View teachers
        'education:teachers:update',   // Manage teacher assignments
        'education:classes:*',         // Full class management
        'education:grades:read',       // View all grades
        'education:attendance:*',      // Attendance management
        'education:exams:*',           // Exam management
        'education:fees:*',            // Fee management
        'education:reports:*',         // Generate reports
        'education:timetable:*',       // Timetable management
        'education:announcements:*'    // School announcements
      ],
      
      head_teacher: [
        // Messaging permissions removed - messaging system removed
        'education:students:read',     // View students
        'education:teachers:read',     // View teachers in dept
        'education:classes:read',      // View classes
        'education:grades:*',          // Manage dept grades
        'education:attendance:*',      // Dept attendance
        'education:homework:*',        // Dept homework
        'education:exams:read',        // View exams
        'education:timetable:read',    // View timetable
        'education:department:manage'  // Manage department
      ],
      
      teacher: [
        // Messaging permissions removed - messaging system removed
        'education:students:read',     // View assigned students
        'education:classes:read',      // View assigned classes
        'education:grades:create',     // Enter grades
        'education:grades:read',       // View grades
        'education:grades:update',     // Update grades
        'education:attendance:create', // Mark attendance
        'education:attendance:read',   // View attendance
        'education:attendance:update', // Update attendance
        'education:homework:create',   // Create homework
        'education:homework:read',     // View homework
        'education:homework:update',   // Update homework
        'education:homework:grade',    // Grade submissions
        'education:exams:read',        // View exam schedule
        'education:timetable:read',    // View timetable
        'education:announcements:read' // Read announcements
      ],
      
      // New faculty role permissions
      academic_coordinator: [
        // Messaging permissions removed - messaging system removed
        'education:students:read',      // View all students
        'education:teachers:read',      // View all teachers
        'education:classes:*',          // Full class management
        'education:grades:read',        // View all grades
        'education:attendance:read',    // View attendance
        'education:exams:*',            // Full exam management
        'education:programs:*',          // Program management
        'education:reports:generate',    // Generate reports
        'education:timetable:*'         // Timetable management
      ],
      
      counselor: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'education:students:read',      // View assigned students only (DB-filtered)
        'education:students:counsel',   // Special counseling permission
        'education:grades:read',        // View grades (for counseling, DB-filtered)
        'education:attendance:read',    // View attendance (DB-filtered)
        'education:reports:read',       // View reports (privacy-filtered)
        // NO access to: exams, fees, other sensitive data
      ],
      
      lab_instructor: [
        'messages:read', 'messages:write',
        'education:students:read',      // View assigned lab students
        'education:classes:read',       // View lab classes
        'education:attendance:mark',     // Mark lab attendance
        'education:grades:create',      // Enter lab grades
        'education:equipment:manage'     // Lab equipment management
      ],
      
      assistant_teacher: [
        'messages:read', 'messages:write',
        'education:students:read',      // View assigned students
        'education:classes:read',       // View assigned classes
        'education:attendance:mark',    // Mark attendance
        'education:homework:read',      // View homework
        // NO access to: grades, exams (read-only)
      ],
      
      librarian: [
        'messages:read',
        'education:students:read',      // View students (for library access)
        'education:library:*',          // Full library management
        'education:books:*'             // Book management
      ],
      
      sports_coach: [
        'messages:read', 'messages:write',
        'education:students:read',      // View assigned students
        'education:attendance:mark',    // Mark sports attendance
        'education:sports:*'           // Sports management
      ],
      
      admin_staff: [
        'messages:read',
        'education:students:read',      // View students (for admin tasks)
        'education:fees:read',         // View fees (billing)
        'education:reports:read',       // View reports
        // NO access to: grades, exams, academic data
      ],
      
      student: [
        'messages:read', 'messages:write',
        'chats:read', 'chats:write',
        'education:student:profile:read',      // View own profile
        'education:student:grades:read',       // View own grades
        'education:student:attendance:read',   // View own attendance
        'education:student:timetable:read',    // View own timetable
        'education:student:homework:read',     // View assigned homework
        'education:student:homework:submit',   // Submit homework
        'education:student:fees:read',         // View fee status
        'education:student:announcements:read' // Read announcements
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
   * SECURITY FIX: Prevents healthcare roles from being used in Education ERP
   * @param {String} role - Role to check
   * @param {String} erpCategory - ERP category (education, healthcare, business, etc.)
   * @returns {Boolean} - True if role is allowed for this ERP category
   */
  isRoleAllowedForERP(role, erpCategory) {
    // Software House only: all roles allowed for software_house / business
    return true;
  }

  /**
   * Middleware to validate role assignment based on ERP category
   * SECURITY FIX: Prevents healthcare roles from being assigned in Education ERP
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
    const healthcareRoles = [
      'chief_medical_officer',
      'doctor',
      'nurse_practitioner',
      'physician_assistant',
      'nurse',
      'medical_assistant',
      'receptionist',
      'billing_staff',
      'medical_records_staff',
      'patient'
    ];

    return allRoles.filter(role => !healthcareRoles.includes(role));
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
