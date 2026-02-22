const Tenant = require('../../models/Tenant');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const { Student, Teacher, Class, Grade, Course, AcademicYear, Exam } = require('../../models/industry/Education');
const tokenBlacklistService = require('../auth/token-blacklist.service');
const AuditLog = require('../../models/AuditLog');
const mongoose = require('mongoose');

// Additional models for full cascade delete (lazy load to avoid circular deps)
let Billing, Session, TenantSettings, TenantUser, TenantRole, DefaultContact, OnboardingChecklist;
let Department, DepartmentAccess, Role, Permission, Project, Deliverable;
let ChangeRequest, ChangeRequestAudit, Approval, Analytics;
let HPatient, HDoctor, HAppointment, HMedicalRecord, HPrescription, HcDepartment;
try { Billing = require('../../models/Billing'); } catch (_) {}
try { Session = require('../../models/Session'); } catch (_) {}
try { TenantSettings = require('../../models/TenantSettings'); } catch (_) {}
try { TenantUser = require('../../models/TenantUser'); } catch (_) {}
try { TenantRole = require('../../models/TenantRole'); } catch (_) {}
try { DefaultContact = require('../../models/DefaultContact'); } catch (_) {}
try { OnboardingChecklist = require('../../models/OnboardingChecklist'); } catch (_) {}
try { Department = require('../../models/Department'); } catch (_) {}
try { DepartmentAccess = require('../../models/DepartmentAccess'); } catch (_) {}
try { Role = require('../../models/Role'); } catch (_) {}
try { Permission = require('../../models/Permission'); } catch (_) {}
try { Project = require('../../models/Project'); } catch (_) {}
try { Deliverable = require('../../models/Deliverable'); } catch (_) {}
try { ChangeRequest = require('../../models/ChangeRequest'); } catch (_) {}
try { ChangeRequestAudit = require('../../models/ChangeRequestAudit'); } catch (_) {}
try { Approval = require('../../models/Approval'); } catch (_) {}
try { Analytics = require('../../models/Analytics'); } catch (_) {}
try {
  const H = require('../../models/industry/Healthcare');
  HPatient = H.Patient; HDoctor = H.Doctor; HAppointment = H.Appointment;
  HMedicalRecord = H.MedicalRecord; HPrescription = H.Prescription; HcDepartment = H.Department;
} catch (_) {}

/**
 * Tenant Lifecycle Service
 * Handles tenant suspension, reactivation, and deletion with proper cascade operations
 */
class TenantLifecycleService {
  /**
   * Suspend tenant (temporary disable access)
   * @param {string} tenantId - Tenant ID or slug
   * @param {string} reason - Reason for suspension
   * @param {string} suspendedBy - User ID who suspended
   * @returns {object} Suspended tenant
   */
  async suspendTenant(tenantId, reason, suspendedBy) {
    try {
      // Find tenant by ID or slug
      let tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        tenant = await Tenant.findOne({ slug: tenantId });
      }
      if (!tenant) {
        tenant = await Tenant.findOne({ tenantId });
      }

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Update tenant status
      tenant.status = 'suspended';
      tenant.suspendedAt = new Date();
      tenant.suspensionReason = reason;
      tenant.suspendedBy = suspendedBy;
      await tenant.save();

      // Revoke all API access tokens for tenant users
      await this.revokeAllTenantTokens(tenant);

      // Disable all user logins
      await User.updateMany(
        { 
          $or: [
            { tenantId: tenant.slug },
            { tenantId: tenant._id.toString() },
            { orgId: tenant.organizationId || tenant.orgId }
          ]
        },
        { 
          isActive: false, 
          suspendedAt: new Date(),
          suspensionReason: reason
        }
      );

      // Log the suspension
      await this.logTenantActivity(tenant, 'suspended', reason, suspendedBy);

      return tenant;
    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  }

  /**
   * Reactivate tenant
   * @param {string} tenantId - Tenant ID or slug
   * @param {string} reactivatedBy - User ID who reactivated
   * @returns {object} Reactivated tenant
   */
  async reactivateTenant(tenantId, reactivatedBy) {
    try {
      // Find tenant by ID or slug
      let tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        tenant = await Tenant.findOne({ slug: tenantId });
      }
      if (!tenant) {
        tenant = await Tenant.findOne({ tenantId });
      }

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Update tenant status
      tenant.status = 'active';
      tenant.suspendedAt = null;
      tenant.suspensionReason = null;
      tenant.suspendedBy = null;
      await tenant.save();

      // Reactivate users
      await User.updateMany(
        { 
          $or: [
            { tenantId: tenant.slug },
            { tenantId: tenant._id.toString() },
            { orgId: tenant.organizationId || tenant.orgId }
          ]
        },
        { 
          isActive: true, 
          suspendedAt: null,
          suspensionReason: null
        }
      );

      // Log the reactivation
      await this.logTenantActivity(tenant, 'reactivated', 'Tenant reactivated', reactivatedBy);

      return tenant;
    } catch (error) {
      console.error('Error reactivating tenant:', error);
      throw error;
    }
  }

  /**
   * Delete tenant (with cascade deletion option)
   * @param {string} tenantId - Tenant ID or slug
   * @param {boolean} hardDelete - If true, permanently delete all data
   * @param {string} deletedBy - User ID who deleted
   * @returns {object} Deletion result
   */
  async deleteTenant(tenantId, hardDelete = false, deletedBy) {
    try {
      // Find tenant by ID or slug
      let tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        tenant = await Tenant.findOne({ slug: tenantId });
      }
      if (!tenant) {
        tenant = await Tenant.findOne({ tenantId });
      }

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const tenantSlug = tenant.slug;
      const tenantObjectId = tenant._id;
      const orgId = tenant.organizationId || tenant.orgId;

      if (hardDelete) {
        // Hard delete - remove tenant and ALL associated data (users, orgs, portal data)
        await this.cascadeDeleteTenantData(tenant);
        await Tenant.findByIdAndDelete(tenant._id);
        
        // Log the deletion
        await this.logTenantActivity(tenant, 'deleted', 'Tenant permanently deleted', deletedBy);
      } else {
        // Soft delete - mark as deleted, retain for retention period
        tenant.status = 'deleted';
        tenant.deletedAt = new Date();
        tenant.deletedBy = deletedBy;
        tenant.retentionUntil = new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000); // 7 years
        await tenant.save();

        // Soft delete all related data
        await this.softDeleteTenantData(tenantSlug, tenantObjectId, orgId);

        // Log the soft deletion
        await this.logTenantActivity(tenant, 'soft_deleted', 'Tenant soft deleted (retained for 7 years)', deletedBy);
      }

      return {
        success: true,
        tenantId: tenant._id,
        tenantSlug,
        hardDelete,
        deletedAt: new Date()
      };
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  /**
   * Cascade delete all tenant data (hard delete)
   * Removes: users, organizations, sessions, billing, roles, permissions, departments,
   * projects, deliverables, education & healthcare data, analytics, audit logs, etc.
   */
  async cascadeDeleteTenantData(tenant) {
    try {
      const tenantSlug = tenant.slug;
      const tenantObjId = tenant._id;
      const tenantIdVariants = [tenantSlug, tenantObjId.toString(), tenant.tenantId].filter(Boolean);

      // Resolve all organizations for this tenant (Organization.tenantId = Tenant._id)
      const orgs = await Organization.find({ tenantId: tenantObjId });
      const orgIds = orgs.map((o) => o._id);
      const tenantOrOrgFilter = {
        $or: [
          { tenantId: { $in: tenantIdVariants } },
          { tenantId: tenantObjId },
          ...(orgIds.length ? [{ orgId: { $in: orgIds } }] : [])
        ]
      };
      const tenantOnlyFilter = {
        $or: [
          { tenantId: { $in: tenantIdVariants } },
          { tenantId: tenantObjId }
        ]
      };

      const run = async (model, filter, label) => {
        if (!model) return;
        try {
          const r = await model.deleteMany(filter);
          if (r.deletedCount > 0) console.log(`   - ${label}: ${r.deletedCount}`);
        } catch (e) {
          console.warn(`Cascade ${label} failed:`, e.message);
        }
      };

      // 1) Sessions, billing, analytics, audit
      await run(Session, tenantOnlyFilter, 'Session');
      await run(Billing, tenantOnlyFilter, 'Billing');
      await run(Analytics, tenantOnlyFilter, 'Analytics');
      await AuditLog.deleteMany(tenantOnlyFilter);

      // 2) Tenant-scoped settings and associations
      await run(TenantSettings, tenantOnlyFilter, 'TenantSettings');
      await run(TenantUser, tenantOnlyFilter, 'TenantUser');
      await run(TenantRole, tenantOnlyFilter, 'TenantRole');
      await run(DefaultContact, tenantOnlyFilter, 'DefaultContact');
      await run(OnboardingChecklist, tenantOnlyFilter, 'OnboardingChecklist');

      // 3) Department access and departments
      await run(DepartmentAccess, tenantOrOrgFilter, 'DepartmentAccess');
      await run(Department, tenantOnlyFilter, 'Department');

      // 4) Roles and permissions
      await run(Role, tenantOnlyFilter, 'Role');
      await run(Permission, tenantOnlyFilter, 'Permission');

      // 5) Projects, deliverables, change requests, approvals
      await run(Project, tenantOnlyFilter, 'Project');
      await run(Deliverable, tenantOnlyFilter, 'Deliverable');
      await run(ChangeRequest, tenantOnlyFilter, 'ChangeRequest');
      await run(ChangeRequestAudit, tenantOnlyFilter, 'ChangeRequestAudit');
      await run(Approval, tenantOnlyFilter, 'Approval');

      // 6) Education data
      const eduFilter = orgIds.length
        ? { $or: [tenantOnlyFilter.$or, { orgId: { $in: orgIds } }] }
        : tenantOnlyFilter;
      await run(Student, eduFilter, 'Student');
      await run(Teacher, eduFilter, 'Teacher');
      await run(Class, eduFilter, 'Class');
      await run(Grade, eduFilter, 'Grade');
      await run(Course, eduFilter, 'Course');
      await run(AcademicYear, eduFilter, 'AcademicYear');
      await run(Exam, eduFilter, 'Exam');

      // 7) Healthcare data
      await run(HPatient, tenantOrOrgFilter, 'Patient');
      await run(HDoctor, tenantOrOrgFilter, 'Doctor');
      await run(HAppointment, tenantOrOrgFilter, 'Appointment');
      await run(HMedicalRecord, tenantOrOrgFilter, 'MedicalRecord');
      await run(HPrescription, tenantOrOrgFilter, 'Prescription');
      await run(HcDepartment, tenantOrOrgFilter, 'Healthcare.Department');

      // 8) Users (by orgId or tenantId)
      await User.deleteMany(tenantOrOrgFilter);

      // 9) Organizations for this tenant
      await Organization.deleteMany({ tenantId: tenantObjId });

      console.log(`✅ Cascade deleted all data for tenant: ${tenantSlug}`);
    } catch (error) {
      console.error('Error in cascade delete:', error);
      throw error;
    }
  }

  /**
   * Soft delete tenant data (mark as deleted)
   */
  async softDeleteTenantData(tenantSlug, tenantId, orgId) {
    try {
      const tenantIdString = tenantSlug || tenantId.toString();

      // Soft delete education data
      await Student.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );
      await Teacher.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );
      await Class.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );
      await Grade.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );
      await Course.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );
      await AcademicYear.updateMany(
        { tenantId: tenantIdString, orgId },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );

      // Soft delete users
      await User.updateMany(
        {
          $or: [
            { tenantId: tenantIdString },
            { tenantId: tenantId.toString() },
            { orgId }
          ]
        },
        { isActive: false, isDeleted: true, deletedAt: new Date() }
      );

      // Soft delete organization
      if (orgId) {
        await Organization.findByIdAndUpdate(orgId, {
          status: 'deleted',
          isDeleted: true,
          deletedAt: new Date()
        });
      }

      console.log(`✅ Soft deleted all data for tenant: ${tenantSlug}`);
    } catch (error) {
      console.error('Error in soft delete:', error);
      throw error;
    }
  }

  /**
   * Revoke all tokens for tenant users
   */
  async revokeAllTenantTokens(tenant) {
    try {
      const users = await User.find({
        $or: [
          { tenantId: tenant.slug },
          { tenantId: tenant._id.toString() },
          { orgId: tenant.organizationId || tenant.orgId }
        ]
      });

      // In a production system, you'd track active tokens
      // For now, we rely on token expiration and blacklist service
      // This would require tracking tokens in a database or Redis
      console.log(`⚠️ Token revocation for ${users.length} users - tokens will expire naturally`);
      
      // Note: Full token revocation would require tracking active tokens
      // This is a placeholder for the implementation
    } catch (error) {
      console.error('Error revoking tenant tokens:', error);
      // Don't throw - token revocation failure shouldn't block suspension
    }
  }

  /**
   * Log tenant activity
   */
  async logTenantActivity(tenant, action, reason, performedBy) {
    try {
      await AuditLog.create({
        tenantId: tenant.slug || tenant._id.toString(),
        orgId: tenant.organizationId || tenant.orgId || new mongoose.Types.ObjectId(),
        userId: performedBy ? new mongoose.Types.ObjectId(performedBy) : new mongoose.Types.ObjectId(),
        userEmail: 'system@tws.com',
        userRole: 'system',
        action: `TENANT_${action.toUpperCase()}`,
        resource: 'TENANT',
        resourceId: tenant._id.toString(),
        ipAddress: '127.0.0.1',
        compliance: {
          gdprRelevant: true,
          retentionPeriod: 2555 // 7 years
        },
        result: {
          status: 'success'
        },
        metadata: {
          reason,
          tenantSlug: tenant.slug,
          tenantName: tenant.name
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging tenant activity:', error);
      // Don't throw - logging failure shouldn't block operation
    }
  }
}

module.exports = new TenantLifecycleService();
