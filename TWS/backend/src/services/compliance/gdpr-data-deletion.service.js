const { Student, Teacher, Grade, Attendance } = require('../../models/industry/Education');
const AuditLog = require('../../models/AuditLog');
const mongoose = require('mongoose');

/**
 * GDPR Data Deletion Service
 * Handles data anonymization and deletion for GDPR compliance (Right to Erasure)
 */
class GDPRDataDeletionService {
  /**
   * Anonymize student data (soft delete with PII removal)
   * @param {string} studentId - Student ID
   * @param {string} tenantId - Tenant ID
   * @param {string} orgId - Organization ID
   * @returns {object} Anonymized student record
   */
  async anonymizeStudentData(studentId, tenantId, orgId) {
    try {
      const student = await Student.findOne({ 
        _id: studentId, 
        tenantId, 
        orgId 
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Anonymize PII fields
      student.personalInfo = {
        firstName: 'ANONYMIZED',
        lastName: 'ANONYMIZED',
        middleName: null,
        dateOfBirth: null,
        gender: null,
        nationality: null,
        bloodGroup: null,
        emergencyContact: {}
      };

      student.contactInfo = {
        email: `anonymized_${studentId}@deleted.local`,
        phone: null,
        address: {}
      };

      student.guardianInfo = {
        father: {},
        mother: {},
        guardian: {}
      };

      student.medicalInfo = {
        allergies: [],
        medications: [],
        medicalConditions: [],
        doctorName: null,
        doctorPhone: null
      };

      // Mark as anonymized
      student.isAnonymized = true;
      student.anonymizedAt = new Date();
      student.isActive = false;

      await student.save();

      // Log the anonymization
      await AuditLog.create({
        tenantId,
        orgId,
        userId: new mongoose.Types.ObjectId(),
        userEmail: 'system@tws.com',
        userRole: 'system',
        action: 'GDPR_DATA_ANONYMIZATION',
        resource: 'STUDENT',
        resourceId: studentId.toString(),
        ipAddress: '127.0.0.1',
        compliance: {
          gdprRelevant: true,
          dataSubject: studentId.toString(),
          legalBasis: 'data_subject_request',
          retentionPeriod: 2555 // 7 years
        },
        result: {
          status: 'success'
        },
        timestamp: new Date()
      });

      return student;
    } catch (error) {
      console.error('GDPR anonymization error:', error);
      throw error;
    }
  }

  /**
   * Delete student data (hard delete after retention period)
   * @param {string} studentId - Student ID
   * @param {string} tenantId - Tenant ID
   * @param {string} orgId - Organization ID
   * @returns {boolean} Success status
   */
  async deleteStudentData(studentId, tenantId, orgId) {
    try {
      // First anonymize
      await this.anonymizeStudentData(studentId, tenantId, orgId);

      // Delete related records (or anonymize them)
      await Grade.updateMany(
        { studentId, tenantId, orgId },
        { 
          $set: { 
            isDeleted: true,
            deletedAt: new Date()
          }
        }
      );

      await Attendance.updateMany(
        { studentId, tenantId, orgId },
        { 
          $set: { 
            isDeleted: true,
            deletedAt: new Date()
          }
        }
      );

      // Log the deletion
      await AuditLog.create({
        tenantId,
        orgId,
        userId: new mongoose.Types.ObjectId(),
        userEmail: 'system@tws.com',
        userRole: 'system',
        action: 'GDPR_DATA_DELETION',
        resource: 'STUDENT',
        resourceId: studentId.toString(),
        ipAddress: '127.0.0.1',
        compliance: {
          gdprRelevant: true,
          dataSubject: studentId.toString(),
          legalBasis: 'data_subject_request'
        },
        result: {
          status: 'success'
        },
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('GDPR deletion error:', error);
      throw error;
    }
  }

  /**
   * Check if data can be deleted (not within retention period)
   * @param {string} studentId - Student ID
   * @returns {boolean} True if data can be deleted
   */
  async canDeleteData(studentId) {
    const student = await Student.findById(studentId);
    if (!student) {
      return false;
    }

    // Check if student graduated more than retention period ago
    const retentionPeriodDays = 7 * 365; // 7 years
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionPeriodDays);

    if (student.academicInfo?.status === 'graduated' && 
        student.academicInfo?.graduationDate && 
        student.academicInfo.graduationDate < retentionDate) {
      return true;
    }

    // For active students, require explicit consent
    return false;
  }
}

module.exports = new GDPRDataDeletionService();
