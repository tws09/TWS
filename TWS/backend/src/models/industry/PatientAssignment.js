/**
 * Patient-Doctor Assignment Model
 * Tracks which doctors are assigned to which patients for access control
 */

const mongoose = require('mongoose');

const patientAssignmentSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  assignmentType: {
    type: String,
    enum: ['primary', 'secondary', 'consulting', 'covering'],
    default: 'primary'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Compound indexes for efficient querying
patientAssignmentSchema.index({ tenantId: 1, patientId: 1, doctorId: 1 });
patientAssignmentSchema.index({ tenantId: 1, doctorId: 1, isActive: 1 });
patientAssignmentSchema.index({ tenantId: 1, orgId: 1, patientId: 1, isActive: 1 });

module.exports = mongoose.models.PatientAssignment || mongoose.model('PatientAssignment', patientAssignmentSchema);
