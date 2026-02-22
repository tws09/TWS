# TWS Multi-Tenant ERP Platform - Use Case Diagrams

## Overview

This document provides a comprehensive set of **Use Case Diagrams** following **UML best practices** and **industry standards**. Instead of a single overwhelming diagram, the system is broken down into **7 focused diagrams**, each representing a specific perspective or module of the system.

## Best Practices Applied

### ✅ Separation of Concerns
- Each diagram focuses on a specific aspect of the system
- Reduces complexity and improves readability
- Makes maintenance and updates easier

### ✅ Multiple Perspectives
- **System Overview**: High-level view for stakeholders
- **Module-Specific**: Detailed views for each industry module
- **Functional**: Focused on specific functional areas

### ✅ Industry Standards
- Follows UML 2.5 Use Case Diagram conventions
- Uses proper actor, use case, and relationship notation
- Includes include/extend relationships correctly

### ✅ Documentation Quality
- Each diagram is self-contained and understandable
- Color-coded for visual distinction
- Includes explanatory notes where needed

---

## Diagram Structure

### 0. Index (`TWS_USE_CASE_00_INDEX.puml`)
**Purpose**: Overview of all diagrams and their relationships

**Shows**:
- All 7 use case diagrams
- Relationships between diagrams
- Purpose and focus of each diagram

**When to Use**: 
- First diagram to show stakeholders
- Navigation guide for the diagram set
- Understanding the overall structure

---

### 1. System Overview (`TWS_USE_CASE_01_SYSTEM_OVERVIEW.puml`)
**Purpose**: High-level view of the entire system for stakeholders and executives

**Actors**:
- Supra Admin
- Tenant Admin
- User (general)

**Use Cases**:
- Core Functions: Authentication, Tenant Signup, Tenant Management, User Management, Role Management
- Industry Modules: Education ERP, Healthcare ERP, Software House ERP
- Common Features: Dashboard, Reports, Messaging

**When to Use**: 
- Executive presentations
- System architecture overview
- Initial stakeholder discussions

---

### 2. Authentication & Access (`TWS_USE_CASE_02_AUTHENTICATION.puml`)
**Purpose**: Detailed view of authentication, signup, and access control

**Actors**:
- Supra Admin
- Tenant Admin
- User
- Pre-Tenant User

**Use Cases**:
- UC-01: User Login / Authentication
- UC-02: Self-Serve Tenant Signup & Provisioning
- UC-15: Password Recovery
- UC-14: User Profile Management

**When to Use**:
- Security reviews
- Authentication flow discussions
- Onboarding process documentation

---

### 3. Platform Administration (`TWS_USE_CASE_03_PLATFORM_ADMIN.puml`)
**Purpose**: Administration functions for Supra Admin and Tenant Admin

**Actors**:
- Supra Admin (Platform-level)
- Tenant Admin (Tenant-level)

**Use Cases**:
- **Supra Admin**: Tenant Management, Master ERP Template Management, Subscription & Billing, Activity History
- **Tenant Admin**: User Management, Role & Permission Management, Subscription Management, Activity History
- **Shared**: Dashboard & Analytics, Report Generation

**When to Use**:
- Admin training documentation
- Role-based access discussions
- Platform management workflows

---

### 4. Education Module (`TWS_USE_CASE_04_EDUCATION.puml`)
**Purpose**: Education-specific ERP module functionality

**Actors**:
- Principal
- Teacher
- Student
- Tenant Admin

**Use Cases**:
- UC-07: Education ERP Module Management
- Common Features: Authentication, Dashboard, Reports, Messaging, Profile

**Key Features**:
- Student Management
- Teacher Management
- Class & Course Management
- Academic Year Management
- Exam & Grade Management
- Admission Management

**When to Use**:
- Education module implementation
- School administrator training
- Education-specific requirements gathering

---

### 5. Healthcare Module (`TWS_USE_CASE_05_HEALTHCARE.puml`)
**Purpose**: Healthcare-specific ERP module functionality

**Actors**:
- Doctor
- Patient
- Receptionist
- Tenant Admin

**Use Cases**:
- UC-08: Healthcare ERP Module Management
- Common Features: Authentication, Dashboard, Reports, Messaging, Profile

**Key Features**:
- Patient Management
- Doctor Management
- Appointment Scheduling
- Medical Records
- Prescription Management
- Billing & Insurance
- Department Management

**When to Use**:
- Healthcare module implementation
- Medical staff training
- Healthcare compliance discussions

---

### 6. Software House Module (`TWS_USE_CASE_06_SOFTWARE_HOUSE.puml`)
**Purpose**: Software House-specific ERP module functionality

**Actors**:
- Project Manager
- Developer
- Client
- Tenant Admin

**Use Cases**:
- UC-09: Software House ERP Module Management
- Common Features: Authentication, Dashboard, Reports, Messaging, Profile

**Key Features**:
- Project Management (Agile/Scrum/Kanban)
- Time Tracking
- Client Portal
- HRM Integration
- Finance Management
- Internal Messaging
- Project Reporting

**When to Use**:
- Software House module implementation
- Development team training
- Project management workflows

---

### 7. Common Features (`TWS_USE_CASE_07_COMMON_FEATURES.puml`)
**Purpose**: Shared features across all modules and user types

**Actors**:
- Supra Admin
- Tenant Admin
- Manager
- Employee

**Use Cases**:
- UC-10: Dashboard & Analytics
- UC-11: Report Generation & Export
- UC-12: Messaging & Notifications
- UC-14: User Profile Management
- UC-16: User Activity History

**When to Use**:
- General user training
- Feature documentation
- Cross-module functionality discussions

---

## How to Use These Diagrams

### Viewing Online
1. Copy the content of any `.puml` file
2. Go to http://www.plantuml.com/plantuml
3. Paste the content
4. View the rendered diagram

### Using in VS Code
1. Install the "PlantUML" extension
2. Open any `.puml` file
3. Press `Alt+D` (Windows/Linux) or `Option+D` (Mac) to preview
4. Right-click for export options (PNG, SVG, PDF)

### Command Line (Java Required)
```bash
# Download PlantUML JAR from http://plantuml.com/download
java -jar plantuml.jar TWS_USE_CASE_01_SYSTEM_OVERVIEW.puml

# Generate all diagrams
java -jar plantuml.jar *.puml

# Generate PDF (requires Graphviz)
java -jar plantuml.jar -tpdf *.puml
```

### Printing
- All diagrams are optimized for **A4 Landscape** printing
- Use high-quality export (PNG 300 DPI or PDF)
- Each diagram fits on a single page

---

## Use Case Relationships

### Include Relationships (<<include>>)
- **UC-01 includes UC-10**: Login always leads to Dashboard
- **UC-04 includes UC-05**: User Management requires Role Management
- **UC-14 includes UC-16**: Profile Management tracks Activity History

### Extend Relationships (<<extend>>)
- **UC-15 extends UC-01**: Password Recovery extends Login (when password forgotten)
- **UC-11 extends UC-07, UC-08, UC-09**: Reports extend Industry Modules (optional)
- **UC-02 extends UC-04**: Tenant Signup creates User Management requirement

---

## Diagram Conventions

### Color Coding
- **Actors**: Light Blue (#E1F5FF) - All actors use this color
- **Use Cases**: 
  - Orange (#FFF3E0) - General/Common features
  - Green (#E8F5E9) - Education module
  - Red (#FFEBEE) - Healthcare module
  - Blue (#E3F2FD) - Software House module
- **System Boundary**: Light Gray (#F5F5F5)

### Notation
- **Actors**: Stick figure notation (UML standard)
- **Use Cases**: Oval notation (UML standard)
- **System Boundary**: Rectangle with system name
- **Packages**: Grouped use cases within system boundary
- **Relationships**: 
  - `-->` : Association (actor to use case)
  - `..>` : Include/Extend relationship

---

## Maintenance Guidelines

### When to Update Diagrams
1. **New Use Case Added**: Add to appropriate diagram(s)
2. **New Actor Introduced**: Add to relevant module diagram
3. **Relationship Changed**: Update include/extend relationships
4. **Module Added**: Create new module-specific diagram

### Best Practices for Updates
- Keep diagrams focused (don't add unrelated use cases)
- Maintain color consistency
- Update this README when adding new diagrams
- Test rendering after changes

---

## Integration with SRS Document

These diagrams complement the **Use Case Specifications** in `SRS_DOCUMENT_TEMPLATE.md`:

- **Section 5.3**: Detailed use case specifications
- **These Diagrams**: Visual representation of use cases and actors

Together, they provide:
- **Visual Overview**: Quick understanding of system scope
- **Detailed Specifications**: Step-by-step use case flows
- **Complete Documentation**: Both visual and textual requirements

---

## References

- **UML 2.5 Specification**: https://www.omg.org/spec/UML/2.5.1/
- **PlantUML Documentation**: https://plantuml.com/
- **Use Case Diagram Best Practices**: 
  - Keep diagrams focused and readable
  - Use multiple diagrams for complex systems
  - Group related use cases
  - Show relationships clearly

---

## File Structure

```
TWS/
├── TWS_USE_CASE_00_INDEX.puml (Start here!)
├── TWS_USE_CASE_01_SYSTEM_OVERVIEW.puml
├── TWS_USE_CASE_02_AUTHENTICATION.puml
├── TWS_USE_CASE_03_PLATFORM_ADMIN.puml
├── TWS_USE_CASE_04_EDUCATION.puml
├── TWS_USE_CASE_05_HEALTHCARE.puml
├── TWS_USE_CASE_06_SOFTWARE_HOUSE.puml
├── TWS_USE_CASE_07_COMMON_FEATURES.puml
└── TWS_USE_CASE_DIAGRAMS_README.md (this file)
```

---

## Support

For questions or issues with these diagrams:
1. Check PlantUML syntax at http://www.plantuml.com/plantuml
2. Review UML Use Case Diagram conventions
3. Refer to the SRS document for detailed use case specifications

---

**Last Updated**: 2025-01-27  
**Version**: 1.0  
**Author**: TWS Development Team

