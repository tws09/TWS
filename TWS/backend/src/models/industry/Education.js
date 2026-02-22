const mongoose = require('mongoose');
const ferpaComplianceService = require('../../services/compliance/ferpa-compliance.service');

// Student Schema for Education Master ERP
const studentSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  studentId: {
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
    nationality: String,
    bloodGroup: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
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
  academicInfo: {
    admissionDate: { type: Date, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: String,
    rollNumber: String,
    academicYear: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended'],
      default: 'active'
    },
    previousSchool: String,
    transferCertificate: String
  },
  guardianInfo: {
    father: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    mother: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    guardian: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: String
    }
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    doctorName: String,
    doctorPhone: String
  },
  documents: [{
    type: { type: String, enum: ['birth_certificate', 'transfer_certificate', 'medical_certificate', 'photo', 'other'] },
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

// Teacher Schema for Education Master ERP
const teacherSchema = new mongoose.Schema({
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
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
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
    department: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true
    },
    designation: { type: String, required: true },
    qualification: [{
      degree: String,
      institution: String,
      year: Number,
      grade: String
    }],
    experience: [{
      organization: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    subjects: [String], // Subjects they can teach
    classes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active'
    }
  },
  salaryInfo: {
    basicSalary: Number,
    allowances: [{
      type: String,
      amount: Number
    }],
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String
    }
  },
  documents: [{
    type: { type: String, enum: ['resume', 'certificates', 'photo', 'id_proof', 'other'] },
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

// Class Schema for Education Master ERP
const classSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  classCode: {
    type: String,
    required: true,
    unique: true
  },
  academicYear: {
    type: String,
    required: true
  },
  section: String,
  capacity: {
    type: Number,
    default: 30
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  subjects: [{
    subject: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    weeklyHours: Number
  }],
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    periods: [{
      periodNumber: Number,
      startTime: String,
      endTime: String,
      subject: String,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      }
    }]
  }],
  room: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Exam Schema for Education Master ERP
const examSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  examCode: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project', 'practical'],
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    index: true
  },
  examDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: Number,
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  term: String,
  instructions: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Grade Schema for Education Master ERP
const gradeSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project', 'practical'],
    required: true
  },
  examDate: Date,
  marksObtained: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: Number,
  grade: String,
  remarks: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    index: true
  },
  term: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Course Schema for Education Master ERP
const courseSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  credits: Number,
  duration: {
    type: String,
    enum: ['semester', 'year', 'quarter', 'month']
  },
  prerequisites: [String],
  objectives: [String],
  syllabus: [{
    topic: String,
    description: String,
    duration: Number // in hours
  }],
  assessment: {
    assignments: { weight: Number, count: Number },
    quizzes: { weight: Number, count: Number },
    midterm: { weight: Number },
    final: { weight: Number },
    project: { weight: Number }
  },
  resources: [{
    type: { type: String, enum: ['textbook', 'reference', 'online', 'video', 'other'] },
    title: String,
    author: String,
    url: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  // Enrolled students relationship
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped', 'withdrawn'],
      default: 'enrolled'
    },
    finalGrade: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Academic Year Schema for Education Master ERP
const academicYearSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  yearName: {
    type: String,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  terms: [{
    termName: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: false }
  }],
  holidays: [{
    name: String,
    date: Date,
    type: { type: String, enum: ['national', 'religious', 'academic', 'other'] }
  }],
  isCurrent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance and tenant isolation
// Compound indexes for tenant isolation (CRITICAL for security)
studentSchema.index({ tenantId: 1, orgId: 1 });
studentSchema.index({ tenantId: 1, studentId: 1 });
studentSchema.index({ tenantId: 1, 'academicInfo.classId': 1 });
studentSchema.index({ tenantId: 1, 'courseEnrollments.courseId': 1 });
studentSchema.index({ orgId: 1, 'academicInfo.classId': 1 });
studentSchema.index({ 'contactInfo.email': 1 });
studentSchema.index({ tenantId: 1, 'academicInfo.status': 1 });

teacherSchema.index({ tenantId: 1, orgId: 1 });
teacherSchema.index({ tenantId: 1, employeeId: 1 });
teacherSchema.index({ tenantId: 1, 'professionalInfo.departmentId': 1 });
teacherSchema.index({ tenantId: 1, 'professionalInfo.classes.classId': 1 });
teacherSchema.index({ orgId: 1, 'professionalInfo.department': 1 });
teacherSchema.index({ 'contactInfo.email': 1 });
teacherSchema.index({ tenantId: 1, 'professionalInfo.status': 1 });

classSchema.index({ tenantId: 1, orgId: 1 });
classSchema.index({ tenantId: 1, classCode: 1 });
classSchema.index({ orgId: 1, academicYear: 1 });
classSchema.index({ tenantId: 1, academicYear: 1 });

gradeSchema.index({ tenantId: 1, orgId: 1 });
gradeSchema.index({ tenantId: 1, studentId: 1 });
gradeSchema.index({ tenantId: 1, examId: 1 });
gradeSchema.index({ tenantId: 1, courseId: 1 });
gradeSchema.index({ tenantId: 1, classId: 1 });
gradeSchema.index({ tenantId: 1, studentId: 1, examId: 1 }, { unique: true });
gradeSchema.index({ orgId: 1, classId: 1, subject: 1 });
gradeSchema.index({ tenantId: 1, studentId: 1, examDate: 1 });

courseSchema.index({ tenantId: 1, orgId: 1 });
courseSchema.index({ tenantId: 1, courseCode: 1 });
courseSchema.index({ tenantId: 1, 'enrolledStudents.studentId': 1 });
courseSchema.index({ orgId: 1, status: 1 });
courseSchema.index({ tenantId: 1, status: 1 });

academicYearSchema.index({ tenantId: 1, orgId: 1 });
academicYearSchema.index({ tenantId: 1, yearName: 1 });
academicYearSchema.index({ orgId: 1, isCurrent: 1 });
academicYearSchema.index({ tenantId: 1, isCurrent: 1 });

// Exam schema indexes
examSchema.index({ tenantId: 1, orgId: 1 });
examSchema.index({ tenantId: 1, examCode: 1 });
examSchema.index({ tenantId: 1, courseId: 1 });
examSchema.index({ tenantId: 1, classId: 1 });
examSchema.index({ tenantId: 1, examDate: 1 });

// Create models (check if already exists to prevent overwrite errors)
module.exports = {
  Student: mongoose.models.Student || mongoose.model('Student', studentSchema),
  Teacher: mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema),
  Class: mongoose.models.Class || mongoose.model('Class', classSchema),
  Grade: mongoose.models.Grade || mongoose.model('Grade', gradeSchema),
  Course: mongoose.models.Course || mongoose.model('Course', courseSchema),
  AcademicYear: mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema),
  Exam: mongoose.models.Exam || mongoose.model('Exam', examSchema)
};
