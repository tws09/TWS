/**
 * Counselor Privacy Filter
 * Database-level filtering for counselor role to ensure privacy compliance
 * Counselors can only access students assigned to them
 */

/**
 * Get database query filter for counselor role
 * Ensures counselors can only see students assigned to them
 * 
 * @param {Object} user - User object with roles
 * @param {Object} baseQuery - Base MongoDB query
 * @returns {Object} - Modified query with counselor restrictions
 */
const getCounselorFilter = (user, baseQuery = {}) => {
  // Check if user has counselor role
  const isCounselor = user.role === 'counselor' || 
    (user.roles && user.roles.some(r => r.role === 'counselor' && r.status === 'active'));
  
  if (!isCounselor) {
    return baseQuery; // No restrictions for non-counselors
  }
  
  // Counselors can only see students assigned to them
  // This assumes there's a counselor assignment field in Student model
  return {
    ...baseQuery,
    $or: [
      { assignedCounselorId: user._id },
      { counselorId: user._id },
      // Fallback: if no assignment field exists, return empty result
      // This ensures privacy by default
      { _id: { $exists: false } } // This will return no results if no assignment
    ]
  };
};

/**
 * Filter student data for counselor view
 * Removes sensitive fields that counselors shouldn't see
 * 
 * @param {Object} student - Student document
 * @param {Object} user - User object
 * @returns {Object} - Filtered student data
 */
const filterStudentDataForCounselor = (student, user) => {
  if (!student) return null;
  
  const isCounselor = user.role === 'counselor' || 
    (user.roles && user.roles.some(r => r.role === 'counselor' && r.status === 'active'));
  
  if (!isCounselor) {
    return student; // No filtering for non-counselors
  }
  
  // Fields counselors CAN see
  const allowedFields = [
    '_id',
    'firstName',
    'lastName',
    'studentId',
    'email',
    'phone',
    'currentClass',
    'attendance',
    'grades', // For counseling purposes, but filtered
    'counselingNotes', // Counselor-specific field
    'assignedCounselorId'
  ];
  
  // Fields counselors CANNOT see (privacy-sensitive)
  const restrictedFields = [
    'fees',
    'feePayments',
    'parentDetails',
    'medicalRecords',
    'disciplinaryRecords',
    'financialAid',
    'scholarshipInfo'
  ];
  
  // Create filtered object
  const filtered = {};
  allowedFields.forEach(field => {
    if (student[field] !== undefined) {
      filtered[field] = student[field];
    }
  });
  
  // Filter grades to only show summary (not detailed breakdown)
  if (filtered.grades && Array.isArray(filtered.grades)) {
    filtered.grades = filtered.grades.map(grade => ({
      subject: grade.subject,
      overallGrade: grade.overallGrade,
      semester: grade.semester
      // Exclude: detailed marks, exam scores, etc.
    }));
  }
  
  return filtered;
};

/**
 * Check if counselor has access to specific student
 * 
 * @param {Object} user - User object
 * @param {String|ObjectId} studentId - Student ID
 * @returns {Promise<boolean>} - True if counselor has access
 */
const counselorHasAccess = async (user, studentId) => {
  const isCounselor = user.role === 'counselor' || 
    (user.roles && user.roles.some(r => r.role === 'counselor' && r.status === 'active'));
  
  if (!isCounselor) {
    return true; // Non-counselors have normal access
  }
  
  // Check if student is assigned to this counselor
  const Student = require('../models/industry/Education').Student;
  const student = await Student.findOne({
    _id: studentId,
    $or: [
      { assignedCounselorId: user._id },
      { counselorId: user._id }
    ]
  });
  
  return !!student;
};

/**
 * Middleware to apply counselor filtering to query
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const applyCounselorFilter = (req, res, next) => {
  if (req.user) {
    // Store original query
    req.originalQuery = req.query;
    
    // Apply counselor filter if needed
    if (req.user.role === 'counselor' || 
        (req.user.roles && req.user.roles.some(r => r.role === 'counselor' && r.status === 'active'))) {
      req.counselorFilter = getCounselorFilter(req.user);
    }
  }
  next();
};

module.exports = {
  getCounselorFilter,
  filterStudentDataForCounselor,
  counselorHasAccess,
  applyCounselorFilter
};
