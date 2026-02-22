/**
 * Healthcare RBAC Middleware
 * Provides role-based access control for healthcare resources
 */

const PatientAssignment = require('../../models/industry/PatientAssignment');
const rbac = require('./rbac');
const auditService = require('../../services/compliance/audit.service');

/**
 * Healthcare role permissions
 */
const healthcarePermissions = {
  doctor: {
    canAccessPatients: true,
    canAccessAllPatients: false, // Only assigned patients
    canCreateMedicalRecords: true,
    canPrescribe: true,
    canViewLabResults: true,
    canModifyPrescriptions: true,
    canAccessBilling: false
  },
  nurse: {
    canAccessPatients: true,
    canAccessAllPatients: false,
    canCreateMedicalRecords: true,
    canPrescribe: false,
    canViewLabResults: true,
    canModifyPrescriptions: false,
    canAccessBilling: false
  },
  nurse_practitioner: {
    canAccessPatients: true,
    canAccessAllPatients: false,
    canCreateMedicalRecords: true,
    canPrescribe: true,
    canViewLabResults: true,
    canModifyPrescriptions: true,
    canAccessBilling: false
  },
  physician_assistant: {
    canAccessPatients: true,
    canAccessAllPatients: false,
    canCreateMedicalRecords: true,
    canPrescribe: true,
    canViewLabResults: true,
    canModifyPrescriptions: true,
    canAccessBilling: false
  },
  receptionist: {
    canAccessPatients: true,
    canAccessAllPatients: true, // For scheduling
    canViewDemographics: true,
    canViewClinicalData: false,
    canScheduleAppointments: true,
    canAccessBilling: false
  },
  billing_staff: {
    canAccessPatients: true,
    canViewDemographics: true,
    canViewClinicalData: false,
    canAccessBilling: true,
    canModifyBilling: true
  },
  patient: {
    canAccessPatients: true,
    canAccessAllPatients: false, // Only own record
    canViewOwnRecords: true,
    canScheduleAppointments: true,
    canRequestPrescriptionRefills: true
  },
  admin: {
    canAccessPatients: true,
    canAccessAllPatients: true,
    canCreateMedicalRecords: true,
    canPrescribe: true,
    canViewLabResults: true,
    canModifyPrescriptions: true,
    canAccessBilling: true
  }
};

/**
 * Require healthcare role middleware
 */
const requireHealthcareRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const isRoleAllowed = Array.isArray(allowedRoles)
      ? allowedRoles.includes(userRole)
      : userRole === allowedRoles;

    if (!isRoleAllowed) {
      // Log authorization failure for audit (HIPAA compliance)
      try {
        await auditService.logSecurityEvent(
          auditService.auditActions.LOGIN_FAILED,
          req.user._id,
          req.user.orgId,
          {
            resource: 'HEALTHCARE_AUTHORIZATION',
            resourceId: req.params?.id || req.body?.id,
            userId: req.user._id,
            userEmail: req.user.email,
            userRole: userRole,
            status: 'failure',
            details: {
              reason: 'Insufficient healthcare role permissions',
              userRole: userRole,
              requiredRoles: Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles],
              endpoint: req.path,
              method: req.method,
              ipAddress: req.ip || req.connection?.remoteAddress,
              userAgent: req.get('User-Agent'),
              hipaaRelevant: true
            },
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            severity: 'high' // High severity for healthcare authorization failures
          }
        );
      } catch (auditError) {
        console.error('Failed to log healthcare authorization failure:', auditError);
        // Don't fail the request if audit logging fails
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions for this operation' 
      });
    }

    // Check healthcare-specific permissions
    const permissions = healthcarePermissions[userRole];
    if (permissions) {
      req.healthcarePermissions = permissions;
    }

    next();
  };
};

/**
 * Require patient access middleware
 * Checks if user can access a specific patient based on role and assignments
 */
const requirePatientAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const userRole = req.user.role;
  const patientId = req.params.id || req.body.patientId;

  if (!patientId) {
    return next(); // No patient ID, skip check
  }

  // Admin and super_admin can access all patients
  if (['admin', 'super_admin', 'org_manager'].includes(userRole)) {
    return next();
  }

  // Patient role can only access own record
  if (userRole === 'patient') {
    if (req.user.patientId?.toString() !== patientId.toString()) {
      // Log patient access violation (HIPAA critical)
      try {
        await auditService.logSecurityEvent(
          auditService.auditActions.LOGIN_FAILED,
          req.user._id,
          req.user.orgId,
          {
            resource: 'PATIENT_DATA_ACCESS',
            resourceId: patientId,
            userId: req.user._id,
            userEmail: req.user.email,
            userRole: userRole,
            status: 'failure',
            details: {
              reason: 'Patient attempting to access another patient\'s records',
              userPatientId: req.user.patientId?.toString(),
              requestedPatientId: patientId.toString(),
              endpoint: req.path,
              method: req.method,
              ipAddress: req.ip || req.connection?.remoteAddress,
              userAgent: req.get('User-Agent'),
              hipaaViolation: true,
              privacyBreach: true
            },
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            severity: 'critical' // Critical for HIPAA violations
          }
        );
      } catch (auditError) {
        console.error('Failed to log patient access violation:', auditError);
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'You can only access your own records' 
      });
    }
    return next();
  }

  // Clinical roles (doctor, nurse) can only access assigned patients
  const clinicalRoles = ['doctor', 'nurse', 'nurse_practitioner', 'physician_assistant'];
  if (clinicalRoles.includes(userRole)) {
    const assignment = await PatientAssignment.findOne({
      tenantId: req.tenantContext?.tenantId,
      orgId: req.tenantContext?.orgId,
      patientId: patientId,
      doctorId: req.user._id,
      isActive: true
    });

    if (!assignment) {
      // Log unauthorized patient access attempt (HIPAA compliance)
      try {
        await auditService.logSecurityEvent(
          auditService.auditActions.LOGIN_FAILED,
          req.user._id,
          req.user.orgId,
          {
            resource: 'PATIENT_DATA_ACCESS',
            resourceId: patientId,
            userId: req.user._id,
            userEmail: req.user.email,
            userRole: userRole,
            status: 'failure',
            details: {
              reason: 'Clinical staff attempting to access unassigned patient',
              userRole: userRole,
              requestedPatientId: patientId.toString(),
              endpoint: req.path,
              method: req.method,
              ipAddress: req.ip || req.connection?.remoteAddress,
              userAgent: req.get('User-Agent'),
              hipaaRelevant: true,
              unauthorizedAccess: true
            },
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            severity: 'high' // High severity for unauthorized patient access
          }
        );
      } catch (auditError) {
        console.error('Failed to log unauthorized patient access:', auditError);
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to this patient' 
      });
    }
  }

  // Receptionist can access for scheduling purposes
  if (userRole === 'receptionist') {
    // Allow access but will filter clinical data in response
    return next();
  }

  next();
};

module.exports = {
  requireHealthcareRole,
  requirePatientAccess,
  healthcarePermissions
};
