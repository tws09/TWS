const { Grade, Student, Exam, Course } = require('../../models/industry/Education');

/**
 * Grade Validation Middleware
 * Validates grade data before creation/update
 */

/**
 * Validate grade data
 */
const validateGrade = async (req, res, next) => {
  try {
    const { score, marksObtained, totalMarks, examId, studentId, courseId } = req.body;
    const { org, tenantSlug } = req.tenantContext || {};

    // Validate score range
    const scoreValue = score || marksObtained;
    const maxMarks = totalMarks || 100;

    if (scoreValue < 0 || scoreValue > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${maxMarks}`
      });
    }

    // Validate exam exists
    if (examId) {
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

      // Validate score doesn't exceed exam total marks
      if (scoreValue > exam.totalMarks) {
        return res.status(400).json({
          success: false,
          message: `Score cannot exceed exam total marks (${exam.totalMarks})`
        });
      }
    }

    // Validate student is enrolled in course
    if (studentId && courseId) {
      const student = await Student.findOne({
        _id: studentId,
        orgId: org?._id,
        tenantId: tenantSlug,
        'courseEnrollments.courseId': courseId,
        'courseEnrollments.status': 'enrolled',
        isActive: true
      });

      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Student is not enrolled in this course'
        });
      }
    }

    // Validate grade doesn't already exist (for same exam and student)
    if (examId && studentId && req.method === 'POST') {
      const existingGrade = await Grade.findOne({
        examId,
        studentId,
        orgId: org?._id,
        tenantId: tenantSlug,
        isActive: true
      });

      if (existingGrade) {
        return res.status(400).json({
          success: false,
          message: 'Grade already exists for this exam and student'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Grade validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating grade'
    });
  }
};

/**
 * Calculate grade automatically from score (stub: education ERP removed)
 */
const calculateGrade = (req, res, next) => {
  next();
};

module.exports = {
  validateGrade,
  calculateGrade
};
