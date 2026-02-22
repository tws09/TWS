# Faculty Page - Purpose & Functionality

## Current Problem

The Faculty page (`/tenant/:tenantSlug/org/education/faculty`) is currently showing **teacher-specific features** that don't match what university faculty actually need.

**What you're seeing (WRONG):**
- Dashboard (teacher-style)
- Attendance (school teachers mark daily attendance)
- Homework (school teachers assign homework)
- My Timetable (class-based)
- Behaviour & Skills (student behavior tracking)
- Messaging
- Live Class
- Question Paper
- Exams
- Class Tests
- Reports
- Account Settings

---

## What Faculty Page SHOULD Do (University Context)

### Faculty vs Teachers - Key Differences:

| Feature | School Teachers | University Faculty |
|---------|----------------|-------------------|
| **Teaching Unit** | Classes (Grade 1, Grade 2, etc.) | Courses (CS101, Math201, etc.) |
| **Students** | Fixed class roster | Enrolled students per course |
| **Attendance** | Daily mandatory attendance | Optional/lecture-based |
| **Homework** | Regular assignments | Projects, papers, research |
| **Grading** | Frequent tests/quizzes | Midterms, finals, papers |
| **Structure** | Fixed timetable | Flexible schedule |
| **Additional Duties** | Parent communication | Research, publications, committees |

---

## Correct Faculty Portal Features

### 1. **Dashboard** ✅ (Keep but modify)
- **Show:** Courses taught, enrolled students per course, upcoming deadlines
- **Remove:** Class-based metrics, daily attendance stats
- **Add:** Research projects, publications, committee assignments

### 2. **My Courses** (Replace "Classes")
- View all courses assigned
- Course enrollment lists
- Course materials and syllabi
- Course announcements
- Student roster per course

### 3. **Course Management** (Replace "Homework")
- Upload course materials
- Create assignments/projects
- Set deadlines
- Grade submissions
- Provide feedback

### 4. **Student Management** (Replace "Attendance")
- View enrolled students per course
- Track assignment submissions
- Grade management
- Student communication
- Office hours scheduling

### 5. **Grading & Assessment** (Replace "Class Tests")
- Grade assignments
- Midterm/final exam grading
- Grade distribution
- Grade submission deadlines
- Grade appeals

### 6. **Research & Publications** (NEW - Faculty-specific)
- Research projects
- Publications tracking
- Grant management
- Conference submissions

### 7. **Department & Committees** (NEW - Faculty-specific)
- Department meetings
- Committee assignments
- Academic calendar
- Faculty meetings

### 8. **Office Hours** (NEW - Faculty-specific)
- Schedule office hours
- Student appointment requests
- Virtual office hours

### 9. **Academic Calendar** (Replace "Timetable")
- Semester schedule
- Important dates
- Exam schedules
- Registration periods

### 10. **Messaging** ✅ (Keep)
- Student communication
- Department communication
- Committee communication

### 11. **Reports** ✅ (Keep but modify)
- Course reports
- Grade reports
- Enrollment reports
- Research reports

### 12. **Settings** ✅ (Keep)

---

## What Needs to Change

### Remove These (School-specific):
- ❌ **Attendance** - Faculty don't mark daily attendance
- ❌ **Homework** - Replace with "Assignments/Projects"
- ❌ **Class Tests** - Replace with "Assessments"
- ❌ **Behaviour & Skills** - Not applicable to university
- ❌ **Live Class** - Can keep but rename to "Virtual Lectures"

### Add These (University-specific):
- ✅ **My Courses** - Course management
- ✅ **Research** - Research projects and publications
- ✅ **Office Hours** - Student consultation scheduling
- ✅ **Department** - Department activities
- ✅ **Committees** - Committee assignments

---

## Recommended Menu Structure

```javascript
const facultyMenuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { key: 'courses', label: 'My Courses', icon: BookOpenIcon }, // Changed from "Classes"
  { key: 'assignments', label: 'Assignments', icon: DocumentTextIcon }, // Changed from "Homework"
  { key: 'grading', label: 'Grading', icon: ClipboardDocumentCheckIcon }, // Changed from "Class Tests"
  { key: 'students', label: 'Students', icon: UserGroupIcon }, // Changed from "Attendance"
  { key: 'research', label: 'Research', icon: BeakerIcon }, // NEW
  { key: 'office-hours', label: 'Office Hours', icon: ClockIcon }, // NEW
  { key: 'department', label: 'Department', icon: BuildingOfficeIcon }, // NEW
  { key: 'academic-calendar', label: 'Academic Calendar', icon: CalendarIcon }, // Changed from "Timetable"
  { key: 'messaging', label: 'Messaging', icon: ChatBubbleLeftRightIcon },
  { key: 'reports', label: 'Reports', icon: ChartBarIcon },
  { key: 'settings', label: 'Settings', icon: CogIcon }
];
```

---

## Summary

**Current State:** Faculty page = Teacher page (WRONG for universities)

**Should Be:** Faculty page = University course management, research, and academic activities

**Action Required:** 
1. Update `FacultyLayout.js` menu items
2. Create faculty-specific components (Courses, Research, Office Hours, etc.)
3. Update `FacultyDashboard.js` to show course-based data instead of class-based
4. Remove school-specific features (daily attendance, behavior tracking)

---

**Note:** If your system is for **schools only** (not universities), then "Faculty" might just be an alternative name for "Teachers" and the current implementation is fine. But if you support universities, faculty needs different features.
