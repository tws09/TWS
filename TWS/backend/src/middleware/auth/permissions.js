const { hasPermission } = require('../../config/permissions');
const { Student, Teacher, Class } = require('../../models/industry/Education');
const SchoolRoleConfig = require('../../models/education/SchoolRoleConfig');
const { getCounselorFilter, counselorHasAccess } = require('../../utils/counselorPrivacyFilter');
const AuditLog = require('../../models/AuditLog');

/**
 * Require permission middleware
 * Checks if user has permission to perform action on resource
 * 
 * @param {string} resource - Resource name (e.g., 'students', 'grades')
 * @param {string} action - Action name (e.g., 'view', 'create', 'update')
 * @param {object} options - Additional options
 * @param {boolean} options.resourceLevel - Whether to check resource-level access
 * @param {string} options.resourceId - Parameter name for resource ID
 * @returns {Function} Express middleware
 */
const requirePermission = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user roles (support multi-role)
      const userRoles = getUserRoles(user);
      
      if (userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No valid roles assigned'
        });
      }

      // Check school-level role configuration
      const orgId = req.tenantContext?.orgId || user.orgId;
      if (orgId) {
        const roleConfig = await SchoolRoleConfig.findOne({ orgId });
        if (roleConfig) {
          // Filter out disabled roles
          const enabledRoles = userRoles.filter(role => 
            roleConfig.isRoleEnabled(role)
          );
          
          if (enabledRoles.length === 0) {
            // Log audit
            await logPermissionCheck(req, resource, action, false, 'Role disabled for school');
            return res.status(403).json({
              success: false,
              message: 'Role not enabled for this school',
              userRoles,
              enabledRoles: roleConfig.enabledRoles.filter(r => r.enabled).map(r => r.role)
            });
          }
        }
      }

      // Check if any role has permission
      let hasAccess = false;
      for (const role of userRoles) {
        if (hasPermission(resource, action, role)) {
          hasAccess = true;
          break;
        }
      }

      if (!hasAccess) {
        // Log audit
        await logPermissionCheck(req, resource, action, false, 'Insufficient permissions');
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${resource}.${action}`,
          required: { resource, action },
          userRoles
        });
      }

      // Apply counselor privacy filtering
      if (userRoles.includes('counselor') && resource === 'students') {
        // Check if counselor has access to specific student
        if (options.resourceLevel && req.params.id) {
          const hasStudentAccess = await counselorHasAccess(user, req.params.id);
          if (!hasStudentAccess) {
            await logPermissionCheck(req, resource, action, false, 'Counselor access denied to student');
            return res.status(403).json({
              success: false,
              message: 'Access denied: Student not assigned to counselor'
            });
          }
        }
        // Apply database-level filter
        req.counselorFilter = getCounselorFilter(user);
      }

      // Log successful permission check (for audit)
      await logPermissionCheck(req, resource, action, true);

      // Resource-level permission check (e.g., teacher can only access assigned classes)
      if (options.resourceLevel) {
        // Check all user roles for resource access
        let hasResourceAccess = false;
        for (const role of userRoles) {
          const access = await checkResourceAccess(role, resource, req, options);
          if (access) {
            hasResourceAccess = true;
            break;
          }
        }
        
        if (!hasResourceAccess) {
          await logPermissionCheck(req, resource, action, false, 'Resource-level access denied');
          return res.status(403).json({
            success: false,
            message: 'Access denied to this resource'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Check resource-level access
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @param {object} req - Express request object
 * @param {object} options - Options
 * @returns {boolean} - True if user has access
 */
const checkResourceAccess = async (role, resource, req, options) => {
  const resourceId = req.params[options.resourceId || 'id'] || req.body[options.resourceId || 'id'];
  
  if (!resourceId) {
    return true; // No specific resource, allow
  }

  try {
    // Teacher can only access assigned classes
    if (role === 'teacher' && resource === 'classes') {
      const teacher = await Teacher.findOne({ 
        userId: req.user._id,
        tenantId: req.tenantContext?.tenantSlug || req.tenantContext?.tenantIdString,
        orgId: req.tenantContext?.orgId
      });
      
      if (!teacher) {
        return false;
      }

      const classObj = await Class.findById(resourceId);
      if (!classObj) {
        return false;
      }

      // Check if teacher is assigned to this class
      const isAssigned = teacher.professionalInfo?.classes?.some(
        classId => classId.toString() === resourceId
      ) || classObj.classTeacher?.toString() === teacher._id.toString();

      return isAssigned;
    }

    // Student can only access own data
    if (role === 'student' && resource === 'students') {
      const student = await Student.findOne({ 
        userId: req.user._id,
        tenantId: req.tenantContext?.tenantSlug || req.tenantContext?.tenantIdString,
        orgId: req.tenantContext?.orgId
      });
      
      if (!student) {
        return false;
      }

      return student._id.toString() === resourceId;
    }

    // Student can only view own grades
    if (role === 'student' && resource === 'grades') {
      const studentId = req.params.studentId || req.body.studentId;
      const student = await Student.findOne({ 
        userId: req.user._id,
        tenantId: req.tenantContext?.tenantSlug || req.tenantContext?.tenantIdString,
        orgId: req.tenantContext?.orgId
      });
      
      if (!student) {
        return false;
      }

      return student._id.toString() === studentId || student._id.toString() === resourceId;
    }

    // Principal and admin have access to all resources in their tenant
    if (['principal', 'admin'].includes(role)) {
      return true;
    }

    // Default: allow if no specific check
    return true;
  } catch (error) {
    console.error('Resource access check error:', error);
    return false;
  }
};

/**
 * Get all user roles (support multi-role)
 * @param {Object} user - User object
 * @returns {Array} - Array of role strings
 */
const getUserRoles = (user) => {
  const roles = [];
  
  // Primary role
  if (user.role) {
    roles.push(user.role);
  }
  
  // Additional roles from roles array (only active ones)
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach(roleAssignment => {
      if (roleAssignment.status === 'active' && roleAssignment.role) {
        if (!roles.includes(roleAssignment.role)) {
          roles.push(roleAssignment.role);
        }
      }
    });
  }
  
  return roles;
};

/**
 * Log permission check for audit
 */
const logPermissionCheck = async (req, resource, action, granted, reason = '') => {
  try {
    await AuditLog.create({
      action: granted ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
      performedBy: req.user?._id,
      userId: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      organization: req.tenantContext?.orgId || req.user?.orgId,
      tenantId: req.tenantContext?.tenantSlug || req.tenantContext?.tenantIdString,
      resource: `${resource}.${action}`,
      resourceId: req.params?.id || req.body?.id,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      details: {
        resource,
        action,
        granted,
        reason,
        userRoles: getUserRoles(req.user),
        path: req.path,
        method: req.method
      },
      severity: granted ? 'low' : 'medium',
      status: granted ? 'success' : 'failure'
    });
  } catch (error) {
    console.error('Failed to log permission check:', error);
    // Don't fail the request if audit logging fails
  }
};

module.exports = {
  requirePermission,
  checkResourceAccess,
  getUserRoles
};
