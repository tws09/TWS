const mongoose = require('mongoose');
const encryptionService = require('../../services/core/encryption.service');
const securityConfig = require('../../config/security');

// PHI fields that need encryption
const PHI_FIELDS = {
  patient: [
    'personalInfo.firstName',
    'personalInfo.lastName',
    'personalInfo.middleName',
    'personalInfo.dateOfBirth',
    'contactInfo.email',
    'contactInfo.phone',
    'contactInfo.address.street',
    'contactInfo.address.city',
    'contactInfo.address.state',
    'contactInfo.address.zipCode',
    'contactInfo.emergencyContact.name',
    'contactInfo.emergencyContact.phone',
    'contactInfo.emergencyContact.email',
    'insuranceInfo.policyNumber',
    'insuranceInfo.groupNumber'
  ],
  medicalRecord: [
    'chiefComplaint',
    'historyOfPresentIllness',
    'physicalExamination',
    'diagnosis',
    'treatment',
    'labResults',
    'imagingResults'
  ],
  prescription: [
    'medications',
    'instructions'
  ]
};

// Patient Schema for Healthcare Master ERP
const patientSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    nationality: String,
    occupation: String
  },
  contactInfo: {
    email: String,
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  medicalInfo: {
    allergies: [String],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      prescribedBy: String
    }],
    medicalHistory: [{
      condition: String,
      diagnosisDate: Date,
      treatment: String,
      status: { type: String, enum: ['active', 'resolved', 'chronic'] }
    }],
    familyHistory: [{
      relation: String,
      condition: String,
      age: Number
    }],
    vitalSigns: {
      height: Number, // cm
      weight: Number, // kg
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      lastUpdated: Date
    }
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    coverageType: { type: String, enum: ['primary', 'secondary', 'tertiary'] },
    copay: Number,
    deductible: Number,
    expiryDate: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Doctor Schema for Healthcare Master ERP
const doctorSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    nationality: String
  },
  contactInfo: {
    email: { type: String, required: true, unique: true },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  professionalInfo: {
    employeeId: { type: String, required: true, unique: true },
    joiningDate: { type: Date, required: true },
    department: { type: String, required: true },
    specialization: [String],
    designation: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: Date,
    qualification: [{
      degree: String,
      institution: String,
      year: Number,
      specialization: String
    }],
    experience: [{
      organization: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    consultationFee: Number,
    followUpFee: Number,
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active'
    }
  },
  schedule: {
    workingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    workingHours: {
      start: String,
      end: String
    },
    breakTime: {
      start: String,
      end: String
    },
    consultationDuration: { type: Number, default: 30 }, // minutes
    maxPatientsPerDay: { type: Number, default: 20 }
  },
  documents: [{
    type: { type: String, enum: ['license', 'certificates', 'photo', 'id_proof', 'other'] },
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Appointment Schema for Healthcare Master ERP
const appointmentSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  type: {
    type: String,
    enum: ['consultation', 'follow_up', 'emergency', 'surgery', 'checkup', 'vaccination'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  reason: String,
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Medical Record Schema for Healthcare Master ERP
const medicalRecordSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordDate: {
    type: Date,
    default: Date.now
  },
  recordType: {
    type: String,
    enum: ['consultation', 'lab_result', 'imaging', 'surgery', 'vaccination', 'emergency', 'other'],
    required: true
  },
  chiefComplaint: String,
  historyOfPresentIllness: String,
  physicalExamination: {
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number
    },
    generalAppearance: String,
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    neurological: String,
    musculoskeletal: String,
    skin: String,
    other: String
  },
  diagnosis: [{
    primary: String,
    secondary: [String],
    icd10Code: String
  }],
  treatment: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [String],
    recommendations: [String]
  },
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    unit: String,
    date: Date,
    labName: String
  }],
  imagingResults: [{
    type: String,
    findings: String,
    date: Date,
    facility: String,
    report: String
  }],
  followUp: {
    required: { type: Boolean, default: false },
    date: Date,
    instructions: String
  },
  attachments: [{
    type: { type: String, enum: ['image', 'document', 'lab_report', 'imaging', 'other'] },
    fileName: String,
    fileUrl: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prescription Schema for Healthcare Master ERP
const prescriptionSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  prescriptionId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  prescriptionDate: {
    type: Date,
    default: Date.now
  },
  medications: [{
    name: { type: String, required: true },
    genericName: String,
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: Number,
    instructions: String,
    sideEffects: [String],
    contraindications: [String]
  }],
  instructions: String,
  followUpDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Department Schema for Healthcare Master ERP
const departmentSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  departmentName: {
    type: String,
    required: true
  },
  departmentCode: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  location: String,
  contactInfo: {
    phone: String,
    email: String
  },
  services: [String],
  equipment: [{
    name: String,
    model: String,
    serialNumber: String,
    purchaseDate: Date,
    warrantyExpiry: Date,
    status: { type: String, enum: ['active', 'maintenance', 'out_of_order'] }
  }],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
patientSchema.index({ tenantId: 1, patientId: 1 });
patientSchema.index({ orgId: 1, 'contactInfo.phone': 1 });
patientSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });

doctorSchema.index({ tenantId: 1, employeeId: 1 });
doctorSchema.index({ orgId: 1, 'professionalInfo.department': 1 });
doctorSchema.index({ 'professionalInfo.licenseNumber': 1 });

appointmentSchema.index({ tenantId: 1, appointmentId: 1 });
appointmentSchema.index({ orgId: 1, patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

medicalRecordSchema.index({ tenantId: 1, recordId: 1 });
medicalRecordSchema.index({ orgId: 1, patientId: 1, recordDate: -1 });

prescriptionSchema.index({ tenantId: 1, prescriptionId: 1 });
prescriptionSchema.index({ orgId: 1, patientId: 1, prescriptionDate: -1 });

departmentSchema.index({ tenantId: 1, departmentCode: 1 });
departmentSchema.index({ orgId: 1, status: 1 });

// Encryption hooks for Patient schema
patientSchema.pre('save', function(next) {
  if (securityConfig.compliance.hipaa.enabled && securityConfig.compliance.hipaa.requireFieldLevelEncryption) {
    PHI_FIELDS.patient.forEach(field => {
      const value = this.get(field);
      if (value && typeof value === 'string' && value.length > 0) {
        // Check if already encrypted
        if (typeof value === 'object' && value.encrypted) {
          return; // Already encrypted
        }
        try {
          const encrypted = encryptionService.encryptField(value);
          this.set(field, encrypted);
        } catch (error) {
          console.error(`Error encrypting field ${field}:`, error);
        }
      }
    });
  }
  next();
});

// Decryption method for Patient
patientSchema.methods.decryptPHI = function() {
  if (!securityConfig.compliance.hipaa.enabled) {
    return this.toObject();
  }
  
  const decrypted = this.toObject();
  PHI_FIELDS.patient.forEach(field => {
    const value = this.get(field);
    if (value && typeof value === 'object' && value.encrypted) {
      try {
        const decryptedValue = encryptionService.decryptField(value);
        // Set decrypted value in the object
        const keys = field.split('.');
        let target = decrypted;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!target[keys[i]]) target[keys[i]] = {};
          target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = decryptedValue;
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
      }
    }
  });
  return decrypted;
};

// Encryption hooks for MedicalRecord schema
medicalRecordSchema.pre('save', function(next) {
  if (securityConfig.compliance.hipaa.enabled && securityConfig.compliance.hipaa.requireFieldLevelEncryption) {
    PHI_FIELDS.medicalRecord.forEach(field => {
      const value = this.get(field);
      if (value) {
        if (typeof value === 'string' && value.length > 0) {
          if (typeof value !== 'object' || !value.encrypted) {
            try {
              const encrypted = encryptionService.encryptField(value);
              this.set(field, encrypted);
            } catch (error) {
              console.error(`Error encrypting field ${field}:`, error);
            }
          }
        } else if (Array.isArray(value)) {
          // Encrypt array elements if they are strings
          const encryptedArray = value.map(item => {
            if (typeof item === 'string' && item.length > 0) {
              return encryptionService.encryptField(item);
            }
            return item;
          });
          this.set(field, encryptedArray);
        }
      }
    });
  }
  next();
});

// Decryption method for MedicalRecord
medicalRecordSchema.methods.decryptPHI = function() {
  if (!securityConfig.compliance.hipaa.enabled) {
    return this.toObject();
  }
  
  const decrypted = this.toObject();
  PHI_FIELDS.medicalRecord.forEach(field => {
    const value = this.get(field);
    if (value && typeof value === 'object' && value.encrypted) {
      try {
        const decryptedValue = encryptionService.decryptField(value);
        decrypted[field] = decryptedValue;
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
      }
    }
  });
  return decrypted;
};

// Encryption hooks for Prescription schema
prescriptionSchema.pre('save', function(next) {
  if (securityConfig.compliance.hipaa.enabled && securityConfig.compliance.hipaa.requireFieldLevelEncryption) {
    PHI_FIELDS.prescription.forEach(field => {
      const value = this.get(field);
      if (value) {
        if (typeof value === 'string' && value.length > 0) {
          if (typeof value !== 'object' || !value.encrypted) {
            try {
              const encrypted = encryptionService.encryptField(value);
              this.set(field, encrypted);
            } catch (error) {
              console.error(`Error encrypting field ${field}:`, error);
            }
          }
        } else if (Array.isArray(value)) {
          // Encrypt medications array
          const encryptedArray = value.map(item => {
            if (typeof item === 'object') {
              const encryptedItem = { ...item };
              if (item.name) encryptedItem.name = encryptionService.encryptField(item.name);
              if (item.instructions) encryptedItem.instructions = encryptionService.encryptField(item.instructions);
              return encryptedItem;
            }
            return item;
          });
          this.set(field, encryptedArray);
        }
      }
    });
  }
  next();
});

// Decryption method for Prescription
prescriptionSchema.methods.decryptPHI = function() {
  if (!securityConfig.compliance.hipaa.enabled) {
    return this.toObject();
  }
  
  const decrypted = this.toObject();
  PHI_FIELDS.prescription.forEach(field => {
    const value = this.get(field);
    if (Array.isArray(value)) {
      decrypted[field] = value.map(item => {
        if (typeof item === 'object') {
          const decryptedItem = { ...item };
          if (item.name && typeof item.name === 'object' && item.name.encrypted) {
            decryptedItem.name = encryptionService.decryptField(item.name);
          }
          if (item.instructions && typeof item.instructions === 'object' && item.instructions.encrypted) {
            decryptedItem.instructions = encryptionService.decryptField(item.instructions);
          }
          return decryptedItem;
        }
        return item;
      });
    }
  });
  return decrypted;
};

// Create models (check if already exists to prevent overwrite errors)
module.exports = {
  Patient: mongoose.models.Patient || mongoose.model('Patient', patientSchema),
  Doctor: mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema),
  Appointment: mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema),
  MedicalRecord: mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema),
  Prescription: mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema),
  Department: mongoose.models.Department || mongoose.model('Department', departmentSchema)
};
