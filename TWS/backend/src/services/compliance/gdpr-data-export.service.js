const { Student, Teacher, Grade, Attendance, Course } = require('../../models/industry/Education');
const AcademicYear = require('../../models/industry/Education').AcademicYear;

/**
 * GDPR Data Export Service
 * Provides data export functionality for GDPR compliance (Right to Data Portability)
 */
class GDPRDataExportService {
  /**
   * Export all data for a specific student
   * @param {string} studentId - Student ID
   * @param {string} tenantId - Tenant ID
   * @param {string} orgId - Organization ID
   * @returns {object} Student data in structured format
   */
  async exportStudentData(studentId, tenantId, orgId) {
    try {
      const student = await Student.findOne({ 
        _id: studentId, 
        tenantId, 
        orgId 
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Get all related data
      const grades = await Grade.find({ 
        studentId: student._id, 
        tenantId, 
        orgId 
      }).populate('examId').populate('courseId');

      const attendance = await Attendance.find({ 
        studentId: student._id, 
        tenantId, 
        orgId 
      });

      const courses = await Course.find({
        'enrolledStudents.studentId': student._id,
        tenantId,
        orgId
      });

      // Get FERPA-compliant data if method exists
      const studentData = student.getFERPAData ? student.getFERPAData() : student.toObject();

      return {
        exportDate: new Date().toISOString(),
        dataSubject: {
          studentId: student.studentId,
          email: student.contactInfo?.email
        },
        personalData: {
          personalInfo: studentData.personalInfo,
          contactInfo: studentData.contactInfo,
          guardianInfo: student.guardianInfo,
          medicalInfo: student.medicalInfo
        },
        academicData: {
          academicInfo: studentData.academicInfo,
          grades: grades.map(g => ({
            examType: g.examType,
            subject: g.subject,
            examDate: g.examDate,
            marksObtained: g.marksObtained,
            totalMarks: g.totalMarks,
            percentage: g.percentage,
            grade: g.grade,
            remarks: g.remarks,
            academicYear: g.academicYear,
            term: g.term
          })),
          attendance: attendance.map(a => ({
            date: a.date,
            status: a.status,
            remarks: a.remarks,
            classId: a.classId
          })),
          courses: courses.map(c => ({
            courseName: c.courseName,
            courseCode: c.courseCode,
            credits: c.credits,
            enrollmentDate: c.enrolledStudents?.find(e => e.studentId.toString() === studentId)?.enrollmentDate
          }))
        },
        metadata: {
          exportFormat: 'json',
          version: '1.0',
          gdprCompliant: true
        }
      };
    } catch (error) {
      console.error('GDPR export error:', error);
      throw error;
    }
  }

  /**
   * Export all tenant data (for tenant deletion/export)
   * @param {string} tenantId - Tenant ID
   * @param {string} orgId - Organization ID
   * @returns {object} Complete tenant data
   */
  async exportTenantData(tenantId, orgId) {
    try {
      const students = await Student.find({ tenantId, orgId });
      const teachers = await Teacher.find({ tenantId, orgId });
      const grades = await Grade.find({ tenantId, orgId });
      const attendance = await Attendance.find({ tenantId, orgId });
      const courses = await Course.find({ tenantId, orgId });
      const academicYears = await AcademicYear.find({ tenantId, orgId });

      return {
        exportDate: new Date().toISOString(),
        tenantId,
        orgId,
        data: {
          students: await Promise.all(
            students.map(s => this.exportStudentData(s._id, tenantId, orgId))
          ),
          teachers: teachers.map(t => t.toObject()),
          courses: courses.map(c => c.toObject()),
          academicYears: academicYears.map(a => a.toObject())
        },
        metadata: {
          recordCount: {
            students: students.length,
            teachers: teachers.length,
            grades: grades.length,
            attendance: attendance.length,
            courses: courses.length,
            academicYears: academicYears.length
          },
          exportFormat: 'json',
          version: '1.0',
          gdprCompliant: true
        }
      };
    } catch (error) {
      console.error('GDPR tenant export error:', error);
      throw error;
    }
  }

  /**
   * Export data in CSV format
   * @param {object} data - Data to export
   * @returns {string} CSV formatted string
   */
  exportToCSV(data) {
    // Simple CSV export (can be enhanced)
    if (!data || typeof data !== 'object') {
      return '';
    }

    const rows = [];
    
    // Export student data
    if (data.personalData) {
      rows.push(['Field', 'Value']);
      rows.push(['First Name', data.personalData.personalInfo?.firstName || '']);
      rows.push(['Last Name', data.personalData.personalInfo?.lastName || '']);
      rows.push(['Email', data.personalData.contactInfo?.email || '']);
      rows.push(['Date of Birth', data.personalData.personalInfo?.dateOfBirth || '']);
    }

    // Export grades
    if (data.academicData?.grades) {
      rows.push([]);
      rows.push(['Grades']);
      rows.push(['Subject', 'Exam Type', 'Date', 'Marks', 'Grade']);
      data.academicData.grades.forEach(g => {
        rows.push([
          g.subject || '',
          g.examType || '',
          g.examDate || '',
          g.marksObtained || '',
          g.grade || ''
        ]);
      });
    }

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

module.exports = new GDPRDataExportService();
