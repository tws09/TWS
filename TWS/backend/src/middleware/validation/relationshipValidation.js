const { Student, Course, Teacher, Class, Grade, Exam } = require('../models/industry/Education');

/**
 * Relationship Validation Middleware
 * Validates relationships between entities before operations
 */

/**
 * Validate student-course enrollment
 */
const validateStudentCourseEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    const { org, tenantSlug } = req.tenantContext || {};

    if (!studentId || !courseId) {
      return next(); // No enrollment data, continue
    }

    // Check if student exists
    const student = await Student.findOne({
      _id: studentId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    const course = await Course.findOne({
      _id: courseId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is already enrolled
    const existingEnrollment = student.courseEnrollments?.find(
      e => e.courseId.toString() === courseId && e.status === 'enrolled'
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    next();
  } catch (error) {
    console.error('Enrollment validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating enrollment'
    });
  }
};

/**
 * Validate grade-exam relationship
 */
const validateGradeExamRelationship = async (req, res, next) => {
  try {
    const { examId, studentId, courseId } = req.body;
    const { org, tenantSlug } = req.tenantContext || {};

    if (!examId || !studentId || !courseId) {
      return next(); // No grade data, continue
    }

    // Check if exam exists
    const exam = await Exam.findOne({
      _id: examId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam belongs to the course
    if (exam.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: 'Exam does not belong to the specified course'
      });
    }

    // Check if student is enrolled in the course
    const student = await Student.findOne({
      _id: studentId,
      orgId: org?._id,
      tenantId: tenantSlug,
      'courseEnrollments.courseId': courseId,
      'courseEnrollments.status': 'enrolled'
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Check if grade already exists for this exam and student
    const existingGrade = await Grade.findOne({
      examId,
      studentId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (existingGrade && req.method !== 'PUT') {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this exam'
      });
    }

    next();
  } catch (error) {
    console.error('Grade-exam validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating grade-exam relationship'
    });
  }
};

/**
 * Validate teacher-class assignment
 */
const validateTeacherClassAssignment = async (req, res, next) => {
  try {
    const { teacherId, classId } = req.body;
    const { org, tenantSlug } = req.tenantContext || {};

    if (!teacherId || !classId) {
      return next(); // No assignment data, continue
    }

    // Check if teacher exists
    const teacher = await Teacher.findOne({
      _id: teacherId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if class exists
    const classObj = await Class.findOne({
      _id: classId,
      orgId: org?._id,
      tenantId: tenantSlug,
      isActive: true
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    next();
  } catch (error) {
    console.error('Teacher-class validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating teacher-class assignment'
    });
  }
};

module.exports = {
  validateStudentCourseEnrollment,
  validateGradeExamRelationship,
  validateTeacherClassAssignment
};
