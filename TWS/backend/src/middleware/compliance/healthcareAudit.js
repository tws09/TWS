/**
 * Healthcare Audit Middleware
 * Logs all PHI access for HIPAA compliance
 */

const auditService = require('../../services/compliance/audit.service');
const securityConfig = require('../../config/security');

/**
 * Extract PHI fields accessed from response data
 */
const extractPHIFields = (resource, data) => {
  const phiFields = [];
  
  if (!data || !data.data) {
    return phiFields;
  }

  const resourceData = Array.isArray(data.data) ? data.data[0] : data.data;

  if (resource === 'PATIENT' && resourceData) {
    if (resourceData.personalInfo) phiFields.push('personalInfo');
    if (resourceData.contactInfo) phiFields.push('contactInfo');
    if (resourceData.medicalInfo) phiFields.push('medicalInfo');
    if (resourceData.insuranceInfo) phiFields.push('insuranceInfo');
  } else if (resource === 'MEDICAL_RECORD' && resourceData) {
    if (resourceData.chiefComplaint) phiFields.push('chiefComplaint');
    if (resourceData.diagnosis) phiFields.push('diagnosis');
    if (resourceData.treatment) phiFields.push('treatment');
    if (resourceData.labResults) phiFields.push('labResults');
  } else if (resource === 'PRESCRIPTION' && resourceData) {
    if (resourceData.medications) phiFields.push('medications');
  }

  return phiFields;
};

/**
 * Log PHI access for healthcare resources
 */
const logPHIAccess = (resource, action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Capture original response
    const originalJson = res.json;
    
    res.json = async function(data) {
      // Log after operation completes
      if (securityConfig.compliance.hipaa.enabled && securityConfig.compliance.hipaa.accessLogging) {
        try {
          const responseTime = Date.now() - startTime;
          
          await auditService.logEvent({
            action: action, // CREATE, READ, UPDATE, DELETE
            resource: resource, // PATIENT, MEDICAL_RECORD, PRESCRIPTION, etc.
            resourceId: req.params.id || (data?.data?._id ? data.data._id.toString() : null),
            tenantId: req.tenantContext?.tenantId || 'unknown',
            orgId: req.tenantContext?.orgId || null,
            userId: req.user?._id || null,
            userEmail: req.user?.email || 'unknown',
            userRole: req.user?.role || 'unknown',
            ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            method: req.method,
            endpoint: req.path,
            changes: action === 'UPDATE' ? req.body : undefined,
            details: {
              responseTime,
              success: data?.success !== false,
              recordsAffected: Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0)
            },
            metadata: {
              endpoint: req.path,
              method: req.method,
              responseTime,
              sensitiveDataAccess: true,
              phiFieldsAccessed: extractPHIFields(resource, data),
              complianceFlags: {
                hipaa: true
              }
            },
            compliance: {
              gdprRelevant: false,
              dataCategories: ['health_data'],
              retentionPeriod: 2555 // 7 years for HIPAA
            },
            security: {
              riskLevel: action === 'DELETE' ? 'high' : action === 'UPDATE' ? 'medium' : 'low',
              suspiciousActivity: false
            },
            status: data?.success !== false ? 'success' : 'failure'
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
          // Don't fail the request if audit logging fails, but log error
        }
      }
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { logPHIAccess };
