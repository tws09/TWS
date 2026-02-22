# Software Requirements Specifications (SRS)
## TWS - Multi-Tenant Enterprise Resource Planning (ERP) Platform

---

## 1. INTRODUCTION

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the TWS (The Wolf Stack) Multi-Tenant Enterprise Resource Planning (ERP) Platform. The document outlines functional and non-functional requirements, system architecture, use cases, and design constraints for a cloud-based SaaS platform that enables organizations from multiple industries to manage their business operations through a unified, multi-tenant ERP system.

The platform supports five distinct industry verticals: Education, Healthcare, Retail, Manufacturing, and Software House, each with industry-specific modules while sharing common ERP functionalities such as Human Resources, Finance, Projects, and Operations Management.

### 1.2 Scope

The TWS Multi-Tenant ERP Platform is designed to provide:

- **Multi-Tenancy Architecture**: Complete data isolation and independent configuration for each tenant organization
- **Industry-Specific ERP Modules**: Tailored functionality for Education, Healthcare, Retail, Manufacturing, and Software House industries
- **Common ERP Modules**: Shared modules including HR Management, Finance, Project Management, Attendance, Messaging, and Reporting
- **Platform Administration**: Supra Admin portal for managing tenants, subscriptions, and platform-wide operations
- **Tenant Administration**: Tenant Admin portal for managing organization-specific users, modules, and configurations
- **Role-Based Access Control**: Granular permissions system supporting multiple user roles across different industries
- **Master ERP Templates**: Pre-configured templates for rapid tenant provisioning with industry-specific default data
- **Real-Time Features**: WebSocket-based real-time updates for messaging, notifications, and collaborative features
- **API Integration**: RESTful API for third-party integrations and mobile applications

**Out of Scope:**
- Mobile native applications (iOS/Android) - Web-based responsive design only
- Payment gateway integration for tenant billing (handled externally)
- Advanced analytics and machine learning features
- Multi-language support beyond English
- Offline functionality

### 1.3 Intended Audience

This document is intended for:
- **Software Developers**: To understand system requirements and implement features
- **Project Managers**: To plan development sprints and track progress
- **Quality Assurance Engineers**: To create test cases and validate requirements
- **System Architects**: To design system architecture and integration patterns
- **Stakeholders**: To understand system capabilities and limitations
- **Academic Supervisors**: To evaluate project scope and technical depth

### 1.4 Definitions, Acronyms & Abbreviations

| Term | Definition |
|------|------------|
| **TWS** | The Wolf Stack - Platform name |
| **ERP** | Enterprise Resource Planning |
| **SaaS** | Software as a Service |
| **Tenant** | An organization using the platform with isolated data and configuration |
| **Supra Admin** | Platform-level administrator with access to all tenants |
| **Tenant Admin** | Organization-level administrator managing their tenant |
| **Master ERP** | Pre-configured template for industry-specific tenant provisioning |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token - Authentication mechanism |
| **2FA** | Two-Factor Authentication |
| **BOPIS** | Buy Online, Pickup In Store (Retail feature) |
| **POS** | Point of Sale |
| **orgId** | Organization Identifier |
| **tenantId** | Tenant Identifier |
| **MVC** | Model-View-Controller architecture pattern |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer |
| **WebSocket** | Real-time bidirectional communication protocol |
| **MongoDB** | NoSQL database used for data storage |
| **React** | Frontend JavaScript framework |
| **Express** | Backend Node.js web framework |
| **GDPR** | General Data Protection Regulation |
| **FERPA** | Family Educational Rights and Privacy Act |
| **HIPAA** | Health Insurance Portability and Accountability Act |
| **SOX** | Sarbanes-Oxley Act |
| **PCI-DSS** | Payment Card Industry Data Security Standard |

---

## 2. OVERALL SYSTEM DESCRIPTION

### 2.1 Product Perspective

The TWS Multi-Tenant ERP Platform is a standalone, cloud-based SaaS application that operates independently without requiring integration with external ERP systems. The platform is designed to serve as a complete business management solution for organizations across multiple industries.

**System Context:**
- **Frontend**: React.js web application accessible via web browsers
- **Backend**: Node.js/Express.js RESTful API server
- **Database**: MongoDB with tenant-isolated databases
- **Real-Time**: Socket.IO for WebSocket communication
- **File Storage**: Local file system or cloud storage (S3-compatible)
- **Email Service**: SMTP or third-party service (SendGrid, AWS SES)
- **Caching**: Redis (optional) for session management and performance

**External Dependencies:**
- MongoDB database cluster
- Email service provider (for notifications and welcome emails)
- Web browser (Chrome, Firefox, Edge, Safari)
- Internet connectivity

### 2.2 Product Functions

The TWS platform provides the following major functional areas:

1. **Platform Management (Supra Admin)**
   - Tenant creation, management, and monitoring
   - Master ERP template management
   - Subscription plan management
   - Platform-wide analytics and reporting
   - User management across all tenants

2. **Tenant Management (Tenant Admin)**
   - Organization configuration and settings
   - User management within tenant
   - Module activation and configuration
   - Branding and customization
   - Subscription and billing management

3. **Industry-Specific Modules**
   - **Education ERP**: Student management, Teacher management, Classes, Courses, Academic Year, Exams, Grades, Admissions
   - **Healthcare ERP**: Patient management, Doctor management, Appointments, Medical Records, Prescriptions, Billing
   - **Retail ERP**: Product management, Category management, Suppliers, POS terminal, Sales, Inventory management, Customers, BOPIS
   - **Manufacturing ERP**: Production orders, Quality control, Equipment management, Maintenance, Supply chain
   - **Software House ERP**: Project management, Time tracking, Client portal, Code quality tracking, Billing, Development methodology

4. **Common ERP Modules**
   - **HR Management**: Employee management, Payroll, Attendance, Departments, Teams, Leave management
   - **Finance**: Chart of accounts, Transactions, Invoicing, Financial reports, Budgeting, Tax management
   - **Projects**: Project templates, Task management, Project tracking, Resource allocation, Time tracking
   - **Inventory**: Stock management, Warehouse management, Reorder levels, Stock alerts
   - **Clients & Vendors**: Client management, Vendor management, Contact management
   - **Meetings**: Meeting scheduling, Templates, Calendar integration
   - **Messaging**: Internal messaging, Notifications, Real-time chat
   - **Reports & Analytics**: Customizable reports, Dashboards, Data export

5. **Authentication & Authorization**
   - User registration and login
   - JWT-based authentication
   - Role-based access control
   - Two-factor authentication (2FA)
   - Session management

6. **Data Management**
   - Tenant data isolation
   - Automatic data seeding on tenant creation
   - Data backup and recovery
   - Audit logging

### 2.3 User Classes & Characteristics

| User Class | Characteristics | Typical Use Cases |
|------------|----------------|-------------------|
| **Supra Admin** | Platform administrator with full system access. Manages all tenants, subscriptions, and platform configuration. | Create/manage tenants, Monitor platform health, Manage Master ERP templates, View platform analytics |
| **Tenant Admin/Owner** | Organization administrator managing their tenant. Has full control over tenant configuration, users, and modules. | Manage organization users, Configure modules, Customize branding, View tenant analytics, Manage subscriptions |
| **Manager** | Department or team manager with elevated permissions within their scope. | Manage team members, View reports, Approve requests, Assign tasks |
| **Employee** | Standard user with basic permissions. Access varies by industry and role. | View assigned tasks, Submit timesheets, Access personal information, View schedules |
| **Education: Principal** | School administrator managing education-specific operations. | Manage teachers and students, View academic reports, Manage classes and courses |
| **Education: Teacher** | Educator managing classes and students. | Mark attendance, Upload grades, Create assignments, View student performance |
| **Education: Student** | Student accessing academic information. | View courses, Submit assignments, View grades, Check attendance |
| **Healthcare: Doctor** | Medical professional managing patients. | View patient records, Schedule appointments, Create prescriptions, Update medical records |
| **Healthcare: Patient** | Patient accessing medical information. | View appointments, Access medical records, View prescriptions |
| **Retail: Store Manager** | Retail store manager overseeing operations. | Manage products, View sales reports, Manage inventory, Handle POS operations |
| **Retail: Cashier** | Point-of-sale operator. | Process sales, Handle customer transactions, View product information |
| **Manufacturing: Production Manager** | Manufacturing operations manager. | Manage production orders, Monitor equipment, View quality reports |
| **Software House: Project Manager** | Software project manager. | Manage projects, Track development progress, Manage client relationships |

### 2.4 Operating Environment

**Server Environment:**
- **Operating System**: Linux (Ubuntu 20.04+), Windows Server, or macOS (development)
- **Node.js**: Version 18.x or higher
- **MongoDB**: Version 6.0 or higher
- **Redis**: Version 6.0 or higher (optional, for caching)
- **Web Server**: Nginx or Apache (production)

**Client Environment:**
- **Web Browsers**: 
  - Google Chrome (latest 2 versions)
  - Mozilla Firefox (latest 2 versions)
  - Microsoft Edge (latest 2 versions)
  - Safari (latest 2 versions)
- **Operating Systems**:
  - Windows 10/11
  - macOS (latest 2 versions)
  - Linux (Ubuntu 20.04+)
  - Android 8.0+ (mobile browser)
  - iOS 13+ (mobile browser)
- **Screen Resolutions**: 
  - Desktop: 1920x1080 and above
  - Tablet: 768px - 1024px
  - Mobile: 320px - 767px
- **Network**: Internet connection with minimum 1 Mbps bandwidth

**Development Environment:**
- **IDE**: Visual Studio Code, WebStorm, or similar
- **Version Control**: Git
- **Package Managers**: npm (Node.js), yarn (optional)
- **Testing Tools**: Jest, Supertest, Cypress

### 2.5 Design & Implementation Constraints

**Technical Constraints:**
1. **Database**: Must use MongoDB for data storage (NoSQL document database)
2. **Backend Framework**: Must use Express.js (Node.js web framework)
3. **Frontend Framework**: Must use React.js (JavaScript UI library)
4. **Authentication**: Must use JWT (JSON Web Tokens) for stateless authentication
5. **API Design**: Must follow RESTful principles
6. **Code Structure**: Must follow MVC (Model-View-Controller) architecture pattern
7. **Multi-Tenancy**: Must implement database-per-tenant isolation model
8. **Real-Time Communication**: Must use Socket.IO for WebSocket connections

**Business Constraints:**
1. **Budget**: Limited to open-source technologies and free-tier cloud services (development)
2. **Timeline**: Must be completed within academic semester timeframe
3. **Team Size**: Single developer or small team (2-3 members)
4. **Deployment**: Must support cloud deployment (AWS, Azure, or similar)

**Regulatory Constraints:**
1. **Data Privacy**: Must comply with GDPR for EU users
2. **Education Data**: Must comply with FERPA for education module
3. **Healthcare Data**: Must comply with HIPAA for healthcare module
4. **Financial Data**: Must comply with SOX for finance module
5. **Payment Data**: Must comply with PCI-DSS if payment processing is implemented

**Performance Constraints:**
1. **Response Time**: API endpoints must respond within 500ms for standard operations
2. **Page Load**: Dashboard pages must load within 2-3 seconds
3. **Concurrent Users**: Must support minimum 100 concurrent users per tenant
4. **Database Queries**: Must be optimized with proper indexing
5. **File Upload**: Maximum file size limit of 100MB per file

**Security Constraints:**
1. **Password Encryption**: Must use bcrypt with minimum 10 rounds
2. **Data Encryption**: Must use HTTPS/TLS for data in transit
3. **Input Validation**: All user inputs must be validated and sanitized
4. **SQL Injection Prevention**: Must use parameterized queries (Mongoose)
5. **XSS Prevention**: Must sanitize all user-generated content
6. **CSRF Protection**: Must implement CSRF tokens for state-changing operations

---

## 3. FUNCTIONAL REQUIREMENTS

| No | Requirement Title | Description |
|---|---|---|
| **FR1** | **Multi-Tenant Architecture** | The system must support multiple independent tenant organizations, each with:<br>• Isolated database (`tws_<tenantId>`)<br>• Unique subdomain/slug access (`<tenant-slug>.domain.com`)<br>• Independent configuration and settings<br>• Isolated user management<br>• Tenant-specific branding (logo, colors, company name)<br>• Resource quotas based on subscription plan |
| **FR2** | **Tenant Provisioning & Onboarding** | The system must provide automated tenant creation workflow:<br>• Supra Admin creates tenant with industry selection (Education, Healthcare, Retail, Manufacturing, Software House)<br>• System creates tenant record, database connection, and default organization<br>• System creates admin user with orgId assignment<br>• System seeds industry-specific default data (if Master ERP template selected)<br>• System seeds common default data (departments, teams, chart of accounts, sample projects)<br>• System sends welcome email to tenant admin<br>• System tracks onboarding progress through defined steps |
| **FR3** | **User Authentication & Authorization** | The system must provide secure authentication and authorization:<br>• User registration with email and password<br>• User login with JWT token generation<br>• Role-based access control (RBAC) with multiple roles:<br>  - Supra Admin, Tenant Admin/Owner, Manager, Employee<br>  - Industry-specific roles (Principal, Teacher, Student, Doctor, Patient, etc.)<br>• Two-factor authentication (2FA) support<br>• Session management with refresh tokens<br>• Password reset functionality<br>• Account activation and deactivation |
| **FR4** | **Master ERP Template Management** | The system must support Master ERP templates for rapid tenant provisioning:<br>• Supra Admin creates Master ERP templates for each industry<br>• Templates define industry-specific modules and default configurations<br>• Templates include default data seeding logic<br>• System uses templates during tenant creation for industry-specific setup<br>• Templates are versioned and can be updated |
| **FR5** | **Education ERP Module** | The system must provide education-specific functionality:<br>• Student management (enrollment, profiles, parent/guardian information)<br>• Teacher management (assignments, subjects, departments)<br>• Class management (schedules, rooms, capacity)<br>• Course management (course codes, credits, descriptions)<br>• Academic Year management (start/end dates, terms)<br>• Exam management (scheduling, grading, results)<br>• Grade management (assignment grades, exam grades, GPA calculation)<br>• Admission management (applications, enrollment process) |
| **FR6** | **Healthcare ERP Module** | The system must provide healthcare-specific functionality:<br>• Patient management (profiles, medical history, emergency contacts)<br>• Doctor management (specializations, schedules, licenses)<br>• Appointment scheduling (date, time, duration, status)<br>• Medical records (diagnosis, symptoms, treatment, notes)<br>• Prescription management (medications, dosages, instructions)<br>• Billing and invoicing for medical services<br>• Department management (cardiology, pediatrics, etc.) |
| **FR7** | **Retail ERP Module** | The system must provide retail-specific functionality:<br>• Product management (SKU, name, price, cost, stock, categories)<br>• Category management (hierarchical categories, descriptions)<br>• Supplier management (contact information, payment terms)<br>• POS (Point of Sale) terminal for in-store sales<br>• Sales management (transactions, payment methods, receipts)<br>• Inventory management (stock levels, reorder points, alerts)<br>• Customer management (profiles, purchase history, loyalty points)<br>• BOPIS (Buy Online, Pickup In Store) functionality |
| **FR8** | **Manufacturing ERP Module** | The system must provide manufacturing-specific functionality:<br>• Production order management (order numbers, quantities, schedules)<br>• Quality control (inspections, defects, pass/fail results)<br>• Equipment management (codes, types, locations, maintenance schedules)<br>• Maintenance management (preventive, corrective, costs, technicians)<br>• Supply chain management (materials, suppliers, logistics) |
| **FR9** | **Software House ERP Module** | The system must provide software house-specific functionality:<br>• Project management with development methodologies (Agile, Scrum, Kanban)<br>• Time tracking for billable hours<br>• Client portal for project visibility<br>• Code quality tracking and metrics<br>• Technology stack management (frontend, backend, database, cloud, tools)<br>• Billing configuration (hourly rates, billing cycles, invoice templates)<br>• Team configuration (max team size, remote work policies) |
| **FR10** | **Common HR Module** | The system must provide human resources functionality:<br>• Employee management (profiles, departments, positions, hire dates, salaries)<br>• Payroll management (pay frequencies, tax settings, deductions, calculations)<br>• Attendance management (check-in/check-out, policies, overtime, remote work)<br>• Department management (budgets, heads, descriptions)<br>• Team management (leads, members, assignments)<br>• Leave management (requests, approvals, balances) |
| **FR11** | **Common Finance Module** | The system must provide financial management functionality:<br>• Chart of accounts (hierarchical account structure, codes, types)<br>• Transaction management (revenue, expenses, categories, dates)<br>• Invoicing (generation, sending, tracking)<br>• Financial reporting (income statements, balance sheets, cash flow)<br>• Budgeting (planning, tracking, variance analysis)<br>• Tax management (rates, calculations, compliance) |
| **FR12** | **Common Projects Module** | The system must provide project management functionality:<br>• Project templates (phases, durations, default settings)<br>• Project creation and management (name, description, budget, timeline)<br>• Task management (assignments, priorities, statuses, due dates)<br>• Project tracking (progress, hours, costs)<br>• Resource allocation (team members, equipment)<br>• Time tracking (logged hours, billable/non-billable) |
| **FR13** | **Dashboard & Analytics** | The system must provide role-specific dashboards:<br>• **Supra Admin Dashboard**: Platform overview, total tenants, subscription distribution, tenant growth trends<br>• **Tenant Admin Dashboard**: Organization overview, user statistics, module usage<br>• **Industry-Specific Dashboards**:<br>  - Education: Student enrollment, Teacher assignments, Course statistics<br>  - Healthcare: Patient appointments, Doctor schedules, Revenue<br>  - Retail: Sales revenue, Total orders, Products count, Low stock alerts, Recent sales<br>  - Manufacturing: Production orders status, Equipment status<br>• Real-time metrics and KPIs<br>• Interactive charts and visualizations |
| **FR14** | **Reporting & Export** | The system must provide reporting capabilities:<br>• **Supra Admin Reports**: Tenant usage, Revenue reports, Platform statistics<br>• **Tenant Admin Reports**: User activity, Module usage, Financial reports<br>• **Industry-Specific Reports**:<br>  - Education: Attendance reports, Grade reports, Student performance<br>  - Healthcare: Patient reports, Appointment reports, Billing reports<br>  - Retail: Sales reports, Inventory reports, Customer reports<br>  - Manufacturing: Production reports, Quality reports<br>• Export to PDF, Excel, CSV formats<br>• Customizable date ranges and filters |
| **FR15** | **Messaging & Notifications** | The system must provide communication features:<br>• Internal messaging system (real-time chat, message threads)<br>• Notification system (email, in-app, push notifications)<br>• Notification templates for different events<br>• Notification preferences (user-configurable)<br>• Real-time updates via WebSocket (Socket.IO) |
| **FR16** | **File Management** | The system must support file uploads and management:<br>• File upload for various purposes (documents, images, videos, PDFs)<br>• File validation (type, size limits - max 100MB)<br>• Secure file storage with access control<br>• File organization (folders, categories)<br>• File sharing and permissions |
| **FR17** | **Subscription & Billing Management** | The system must manage tenant subscriptions:<br>• Multiple subscription plans (Trial, Basic, Professional, Enterprise)<br>• Trial period management (default 14 days)<br>• Subscription status tracking (Active, Suspended, Cancelled)<br>• Billing cycle management (Monthly, Annual)<br>• Usage tracking and limits per plan<br>• Subscription upgrade/downgrade |
| **FR18** | **Audit Logging** | The system must log all critical actions:<br>• User actions (creation, modification, deletion)<br>• Data access and modifications<br>• Login attempts and authentication events<br>• Permission changes<br>• Export operations<br>• Audit logs include: User ID, Timestamp, Action, Entity Type, IP Address, User Agent<br>• Audit logs are searchable and exportable |
| **FR19** | **API & Integration** | The system must provide API endpoints:<br>• RESTful API for all modules<br>• API authentication using JWT tokens<br>• Rate limiting and API versioning<br>• Webhook support for external integrations<br>• Calendar integration (Google Calendar)<br>• Swagger/OpenAPI documentation |
| **FR20** | **Profile Management** | The system must allow users to manage their profiles:<br>• Update personal information (name, email, phone, address)<br>• Upload profile picture<br>• Change password with validation<br>• Configure preferences (theme, language, timezone, notifications)<br>• View activity history |

---

## 4. NON-FUNCTIONAL REQUIREMENTS

| No | Requirement | Description |
|---|---|---|
| **NFR1** | **Performance** | • System should load dashboard pages within 2-3 seconds<br>• API endpoints should respond within 500ms for standard operations<br>• Database queries should be optimized with proper indexing<br>• Should support at least 100 concurrent users per tenant<br>• File uploads should support files up to 100MB per file<br>• Real-time updates should have latency less than 100ms |
| **NFR2** | **Security** | • Passwords must be encrypted using bcrypt (minimum 10 rounds)<br>• JWT tokens must have expiration and refresh token mechanism<br>• System must prevent SQL Injection (using parameterized queries with Mongoose)<br>• System must prevent XSS (Cross-Site Scripting) attacks<br>• System must prevent CSRF (Cross-Site Request Forgery) attacks<br>• Data encryption at rest and in transit (HTTPS/TLS)<br>• Role-based access control (RBAC) enforcement at API and UI levels<br>• Session management with automatic logout after inactivity<br>• Input validation and sanitization for all user inputs<br>• Tenant data isolation to prevent cross-tenant data access |
| **NFR3** | **Usability** | • Interface must be user-friendly and intuitive<br>• Responsive design for Desktop (1920x1080+), Tablet (768px-1024px), Mobile (320px-767px)<br>• Consistent UI/UX across all modules<br>• Accessibility compliance (WCAG 2.1 Level AA)<br>• Multi-language support (English as primary, extensible)<br>• Clear error messages and validation feedback<br>• Loading indicators for long-running operations |
| **NFR4** | **Reliability & Availability** | • System must maintain 99.5% uptime<br>• Automatic failover for critical services<br>• Graceful error handling with user-friendly error messages<br>• System should be available 24/7 with scheduled maintenance windows<br>• Health check endpoints for monitoring<br>• Transaction rollback on errors to maintain data consistency |
| **NFR5** | **Scalability** | • System should support horizontal scaling<br>• Should handle 10x growth in tenants, users, and data without major refactoring<br>• Database sharding support for large tenants<br>• Load balancing for API servers<br>• Caching strategy (Redis) for frequently accessed data<br>• Stateless API design for easy scaling |
| **NFR6** | **Maintainability** | • Code should follow MVC architecture pattern<br>• Modular code structure with clear separation of concerns<br>• Comprehensive code documentation (JSDoc)<br>• Version control using Git<br>• Easy to update and extend modules independently<br>• Unit tests and integration tests coverage (minimum 70%)<br>• Consistent coding standards and linting |
| **NFR7** | **Data Backup & Recovery** | • System should perform automated daily backups<br>• Backup retention: 30 days daily, 12 months monthly<br>• Point-in-time recovery capability<br>• Disaster recovery plan with RTO (Recovery Time Objective) < 4 hours<br>• Data replication across multiple data centers<br>• Backup verification and testing procedures |
| **NFR8** | **Compatibility** | • Should work with all major browsers (Chrome, Firefox, Edge, Safari - latest 2 versions)<br>• Cross-platform support (Windows 10/11, macOS, Linux, Android 8.0+, iOS 13+)<br>• Backward compatibility with API versions<br>• Graceful degradation for unsupported browsers |

---

## 5. USE CASE DIAGRAM

*(Insert Diagram Here - Use Case Diagram showing Supra Admin, Tenant Admin, Managers, Employees, and Industry-Specific Roles interacting with various system modules)*

**Key Actors:**
- Supra Admin
- Tenant Admin/Owner
- Manager
- Employee
- Education: Principal, Teacher, Student
- Healthcare: Doctor, Patient
- Retail: Store Manager, Cashier
- Manufacturing: Production Manager
- Software House: Project Manager

**Key Use Cases:**
- Tenant Management
- User Authentication
- Industry-Specific Module Access
- Common Module Management
- Dashboard & Analytics
- Reporting & Export
- Profile Management

---

## 6. USE CASE SPECIFICATIONS

### Use Case: UC-01

**Name:** Tenant Registration & Provisioning

**Summary:** Supra Admin creates a new tenant organization with industry-specific configuration, database setup, and default data seeding.

**Rationale:** Tenant provisioning is the foundation of the multi-tenant platform, enabling new organizations to onboard quickly with industry-specific modules and sample data.

**Users:** Supra Administrator

**Preconditions:** 
- Supra Admin must be logged in and authenticated
- MongoDB database must be accessible
- Email service must be configured

**Basic Course of Events:**
1. Supra Admin navigates to Tenant Management dashboard
2. Admin clicks "Create New Tenant" button
3. Admin fills tenant creation form:
   - Organization Name
   - Tenant Slug (unique identifier)
   - Industry Selection (Education, Healthcare, Retail, Manufacturing, Software House)
   - Admin User Details (Email, Full Name, Password)
   - Subscription Plan (Trial, Basic, Professional, Enterprise)
   - Company Size, Timezone, Currency, Language
4. System validates all input data
5. System checks if tenant slug already exists
6. System creates tenant record in main database
7. System creates isolated database (`tws_<tenantId>`)
8. System creates default organization record
9. System creates admin user with orgId assignment
10. If Master ERP template selected, system seeds industry-specific data:
    - Education: Academic Year, Teachers, Classes, Courses, Students, Exams, Grades
    - Healthcare: Doctors, Patients, Appointments, Medical Records, Prescriptions
    - Retail: Categories, Suppliers, Products, Customers, Sales
    - Manufacturing: Equipment, Production Orders, Quality Control, Maintenance
11. System seeds common default data:
    - Default departments (HR, Finance, Project Management, Operations, Sales & Marketing)
    - Default teams within departments
    - Chart of accounts
    - Sample employees and payroll setup
    - Project templates
    - Sample project with tasks
    - Sample finance transactions
    - Sample clients and vendors
    - Meeting templates
    - Notification templates
    - Audit log entries
12. System sends welcome email to tenant admin
13. System updates onboarding status to "completed"
14. System displays success message with tenant details and access URL

**Alternative Paths:**
1. Invalid data → System displays validation error: "[field] is required" or "[field] format is invalid"
2. Duplicate tenant slug → System displays error: "Tenant slug already exists, please choose another"
3. Database creation failure → System rolls back transaction, displays error: "Unable to create tenant database, contact support"
4. Email sending failure → Tenant created successfully, but welcome email failed (logged as non-critical error)
5. Data seeding failure → Tenant created successfully, but data seeding failed (logged as non-critical error, tenant still functional)

**Postconditions:** 
- New tenant created with isolated database
- Admin user account active and accessible
- Default data seeded (industry-specific and common)
- Tenant accessible via unique subdomain/slug
- Welcome email sent to tenant admin
- Onboarding status marked as completed

---

### Use Case: UC-02

**Name:** User Authentication & Login

**Summary:** Users authenticate to access the platform with role-based dashboard redirection and session management.

**Rationale:** Secure authentication ensures authorized access to platform features and tenant-specific data with proper role-based permissions.

**Users:** Supra Administrator, Tenant Admin/Owner, Manager, Employee, Industry-specific roles (Principal, Teacher, Student, Doctor, Patient, etc.)

**Preconditions:** 
- User must be registered and account must be active
- User must belong to a tenant (except Supra Admin)

**Basic Course of Events:**
1. User navigates to login page
2. User selects login type (Supra Admin, Tenant Login, Education Login, etc.)
3. User enters credentials (Email + Password)
4. System validates input format
5. System queries database for user record
6. System verifies password using bcrypt comparison
7. System checks if account is active and not suspended
8. System checks if account belongs to active tenant (if tenant user)
9. If 2FA enabled, system prompts for verification code
10. System generates JWT access token (expires in 15 minutes)
11. System generates refresh token (expires in 7 days)
12. System stores refresh token in database
13. System logs login activity in audit log (User ID, IP Address, Timestamp, User Agent)
14. System updates user's last login timestamp
15. System redirects user to role-based dashboard:
    - Supra Admin → Supra Admin Dashboard (platform overview)
    - Tenant Admin → Tenant Admin Dashboard (organization overview)
    - Manager → Manager Dashboard (team overview)
    - Employee → Employee Dashboard (personal tasks and information)
    - Industry roles → Industry-specific Dashboard (Education/Healthcare/Retail/etc.)

**Alternative Paths:**
1. Invalid credentials → System displays error: "Incorrect email or password"
2. Account inactive → System displays error: "Account is inactive, contact administrator"
3. Account suspended → System displays error: "Account suspended, contact support"
4. Tenant inactive → System displays error: "Your organization's subscription is inactive"
5. 2FA code incorrect → System displays error: "Invalid verification code, please try again"
6. Session expired → System redirects to login page with message: "Session expired, please login again"
7. Server error → System displays error: "System unavailable, try again later"

**Postconditions:** 
- User is authenticated with active session
- JWT token stored in browser (httpOnly cookie or localStorage)
- Refresh token stored in database
- User redirected to appropriate dashboard
- Login activity logged in audit log
- Last login timestamp updated

---

### Use Case: UC-03

**Name:** Tenant Management (Supra Admin)

**Summary:** Supra Admin manages tenant organizations including creation, update, deactivation, monitoring, and subscription management.

**Rationale:** Centralized tenant management ensures platform governance, resource allocation, and subscription tracking.

**Users:** Supra Administrator

**Preconditions:** 
- Supra Admin must be logged in
- User must have Supra Admin role

**Basic Course of Events:**
1. Supra Admin navigates to Tenant Management dashboard
2. System displays list of all tenants with filters (Status, Plan, Industry, Date Range)
3. Admin views tenant statistics:
   - Total tenants, Active tenants, Trial tenants, Suspended tenants
   - Subscription plan distribution
   - Tenant growth trends (chart)
4. Admin can perform actions:
   - **Create Tenant**: Opens tenant creation wizard (UC-01)
   - **View Tenant Details**: Displays tenant information, users, modules, usage statistics
   - **Edit Tenant**: Updates tenant information (name, contact, settings)
   - **Deactivate Tenant**: Sets tenant status to "inactive", prevents login access
   - **Reactivate Tenant**: Sets tenant status to "active", restores access
   - **Delete Tenant**: Permanently deletes tenant (with confirmation and data backup)
   - **Change Subscription Plan**: Updates tenant's subscription (Trial → Basic → Professional → Enterprise)
   - **Extend Trial**: Extends trial period
   - **View Usage Statistics**: Displays tenant's resource usage (users, storage, API calls)
5. System validates all actions
6. System updates database
7. System logs all actions in audit log
8. System sends notification to tenant admin (if subscription changed)
9. System displays confirmation message

**Alternative Paths:**
1. Unauthorized access → System displays error: "You do not have Supra Admin privileges"
2. Tenant has active users → System prevents deletion: "Cannot delete tenant with active users. Deactivate tenant first."
3. Dependency conflict → System prevents action: "Cannot perform action, tenant has active dependencies"
4. System error → System displays error: "Unable to process request, please try again"

**Postconditions:** 
- Tenant information updated in database
- Changes reflected in tenant list
- Audit log updated with action details
- Tenant admin notified (if applicable)
- Subscription status updated (if changed)

---

### Use Case: UC-04

**Name:** Industry-Specific Module Access

**Summary:** Users access industry-specific modules (Education, Healthcare, Retail, Manufacturing, Software House) based on tenant configuration and role permissions.

**Rationale:** Industry-specific modules provide tailored functionality for different business domains while maintaining common ERP capabilities.

**Users:** Tenant Admin, Managers, Employees, Industry-specific roles (Principal, Teacher, Student, Doctor, Patient, Store Manager, Cashier, Production Manager, Project Manager)

**Preconditions:** 
- User must be logged in
- Tenant must have industry-specific modules enabled
- User must have appropriate role permissions

**Basic Course of Events:**

**Education Module:**
1. User navigates to Education section from dashboard
2. System displays Education menu with options:
   - Students, Teachers, Classes, Courses, Academic Year, Exams, Grades, Admissions
3. User selects module (e.g., "Students")
4. System displays student list with filters (Class, Academic Year, Status)
5. User performs CRUD operations based on role:
   - Principal/Admin: Create, Read, Update, Delete students
   - Teacher: Read students, Update grades, Mark attendance
   - Student: Read own information, View grades, View attendance
6. System validates actions and updates database
7. System logs actions in audit log

**Healthcare Module:**
1. User navigates to Healthcare section
2. System displays Healthcare menu: Patients, Doctors, Appointments, Medical Records, Prescriptions
3. User selects module (e.g., "Appointments")
4. System displays appointment calendar/list
5. User performs actions:
   - Doctor: View appointments, Update medical records, Create prescriptions
   - Patient: View own appointments, Access medical records
   - Admin: Manage all healthcare data
6. System validates and saves data

**Retail Module:**
1. User navigates to Retail section
2. System displays Retail menu: Products, Categories, Suppliers, POS, Sales, Inventory, Customers
3. User selects module (e.g., "Products")
4. System displays product list with search and filters
5. User performs actions:
   - Store Manager: Create, Update, Delete products, Manage inventory
   - Cashier: View products, Process sales via POS
   - Admin: Full product management
6. System updates inventory automatically on sales

**Manufacturing Module:**
1. User navigates to Manufacturing section
2. System displays Manufacturing menu: Production Orders, Quality Control, Equipment, Maintenance
3. User selects module (e.g., "Production Orders")
4. System displays production order list
5. User performs actions:
   - Production Manager: Create orders, Monitor progress, Update status
   - Quality Inspector: Perform inspections, Record defects
   - Admin: Full manufacturing management
6. System tracks production metrics

**Software House Module:**
1. User navigates to Software House section
2. System displays Software House menu: Projects, Time Tracking, Client Portal, Code Quality
3. User selects module (e.g., "Projects")
4. System displays project list
5. User performs actions:
   - Project Manager: Create projects, Assign tasks, Track progress
   - Developer: Log time, Update task status
   - Admin: Full project management
6. System tracks development metrics

**Alternative Paths:**
1. Module not enabled → System displays message: "This module is not available for your tenant"
2. Insufficient permissions → System displays error: "You do not have permission to access this module"
3. Data not found → System displays message: "No records found"
4. Validation error → System displays error: "Invalid data: [field]"

**Postconditions:** 
- User accesses industry-specific features
- Data displayed according to role permissions
- Actions logged in audit log
- Database updated with changes

---

### Use Case: UC-05

**Name:** Common Module Management (HR, Finance, Projects)

**Summary:** Users manage common ERP modules including HR, Finance, Projects, Inventory, Clients, Meetings that are available across all industries.

**Rationale:** Common modules provide essential business functions that are shared across all industries, reducing code duplication and ensuring consistency.

**Users:** Tenant Admin, Managers, Employees (role-dependent permissions)

**Preconditions:** 
- User must be logged in
- Module must be enabled for tenant
- User must have appropriate role permissions

**Basic Course of Events:**

**HR Module:**
1. Admin navigates to HR section
2. Admin creates departments (HR, Finance, Project Management, Operations, Sales & Marketing)
3. Admin creates teams within departments
4. Admin adds employees with details:
   - Employee ID, Full Name, Email, Phone
   - Department, Position, Hire Date, Salary
   - Manager assignment
5. Admin configures payroll settings:
   - Pay frequency (Monthly, Bi-weekly, Weekly)
   - Tax rates (Federal, State, Social Security, Medicare)
   - Deductions (Health Insurance, 401k, etc.)
6. Employees view their profile and payroll information
7. System calculates payroll automatically

**Finance Module:**
1. Admin navigates to Finance section
2. Admin sets up chart of accounts:
   - Assets (Current Assets, Cash, Accounts Receivable, Inventory)
   - Liabilities (Accounts Payable, Accrued Expenses)
   - Equity (Capital, Retained Earnings)
   - Revenue (Service Revenue, Product Revenue)
   - Expenses (Salaries, Rent, Marketing, Professional Services)
3. Users create financial transactions:
   - Revenue transactions (amount, category, date, account)
   - Expense transactions (amount, category, date, account)
4. System generates financial reports:
   - Income Statement
   - Balance Sheet
   - Cash Flow Statement
5. System tracks budget vs actual spending

**Projects Module:**
1. Admin creates project templates:
   - Web Development (Planning, Design, Development, Testing, Deployment phases)
   - Mobile App Development (Planning, Design, Development, Testing, App Store phases)
2. Manager creates project:
   - Name, Description, Budget, Timeline
   - Team members assignment
   - Client access settings
3. Manager creates tasks:
   - Title, Description, Assignee, Due Date, Priority
   - Estimated hours, Status
4. Employees update task status and log hours
5. System tracks project progress and budget
6. System generates project reports

**Alternative Paths:**
1. Invalid data → System displays validation error: "[field] is required" or "[field] format is invalid"
2. Unauthorized action → System displays error: "You do not have permission to perform this action"
3. Dependency conflict → System prevents deletion: "Cannot delete, record is in use"
4. Budget exceeded → System displays warning: "Project budget exceeded"

**Postconditions:** 
- Module data created/updated in tenant database
- Changes reflected in UI immediately
- Audit log updated with action details
- Reports updated with new data

---

### Use Case: UC-06

**Name:** Dashboard & Analytics

**Summary:** Users view role-specific dashboards with real-time metrics, KPIs, charts, and analytics for quick insights into system status and performance.

**Rationale:** Dashboards provide at-a-glance insights into system status, performance metrics, and key business indicators, enabling data-driven decision making.

**Users:** All authenticated users (role-specific dashboards)

**Preconditions:** 
- User must be logged in
- User must have dashboard access permission

**Basic Course of Events:**

**Supra Admin Dashboard:**
1. Supra Admin logs in and is redirected to Supra Admin Dashboard
2. System displays platform overview:
   - Total Tenants (with breakdown: Active, Trial, Suspended)
   - Subscription Plan Distribution (pie chart)
   - Tenant Growth Trends (line chart over time)
   - Recent Tenants (table with name, industry, plan, created date)
   - Top Tenants by Revenue/Usage
3. Admin can filter by date range, industry, plan
4. Admin clicks on tenant to view details
5. System displays tenant-specific information

**Tenant Admin Dashboard:**
1. Tenant Admin logs in and is redirected to Tenant Admin Dashboard
2. System displays organization overview:
   - Total Users (with breakdown by role)
   - Active Modules
   - Recent Activities
   - System Health Status
3. Admin can navigate to specific modules

**Industry-Specific Dashboards:**

**Retail Dashboard:**
1. Retail tenant admin/manager views Retail Dashboard
2. System displays:
   - Total Revenue (with trend indicator)
   - Total Orders (count)
   - Total Products (count)
   - Total Customers (count)
   - Low Stock Alerts (products below reorder level)
   - Recent Sales (table with sale number, customer, amount, date)
   - Sales Chart (revenue over time)
3. User clicks on metric to view detailed report
4. User can filter by date range

**Education Dashboard:**
1. Education tenant admin/principal views Education Dashboard
2. System displays:
   - Total Students (with breakdown by class)
   - Total Teachers (count)
   - Total Classes (count)
   - Total Courses (count)
   - Student Enrollment Trends (chart)
   - Recent Admissions
   - Upcoming Exams
3. User clicks on metric to view detailed information

**Healthcare Dashboard:**
1. Healthcare tenant admin/doctor views Healthcare Dashboard
2. System displays:
   - Total Patients (count)
   - Total Doctors (count)
   - Today's Appointments (count and list)
   - Revenue (with trend)
   - Patient Visits Chart (over time)
3. User clicks on appointment to view details

**Manufacturing Dashboard:**
1. Manufacturing tenant admin/production manager views Manufacturing Dashboard
2. System displays:
   - Active Production Orders (count and list)
   - Equipment Status (operational, maintenance, offline)
   - Quality Inspection Results (passed, failed, pending)
   - Production Metrics (units produced, efficiency)
3. User clicks on order to view details

**Alternative Paths:**
1. Data loading failure → System displays error: "Unable to load dashboard data, please refresh"
2. No data available → System displays message: "No data available for selected period"
3. Permission denied → System displays error: "You do not have permission to view this dashboard"

**Postconditions:** 
- Dashboard displays real-time metrics
- User can interact with charts and filters
- Data is cached for performance
- User can navigate to detailed reports

---

### Use Case: UC-07

**Name:** Data Seeding & Onboarding

**Summary:** System automatically seeds default data when tenant is created, including departments, chart of accounts, sample projects, and industry-specific data based on Master ERP template.

**Rationale:** Default data seeding provides tenants with a ready-to-use system with sample data for demonstration, learning, and immediate productivity.

**Users:** System (Automated Process)

**Preconditions:** 
- Tenant record must be created successfully
- Organization must be created
- Admin user must be created

**Basic Course of Events:**
1. System triggers data seeding after tenant creation (Step 5 of provisioning workflow)
2. System creates default attendance policy:
   - Working hours (9:00 AM - 5:00 PM)
   - Working days (Monday-Friday)
   - Overtime settings
   - Remote work policies
3. System creates default departments:
   - Human Resources
   - Finance & Accounting
   - Project Management
   - Operations
   - Sales & Marketing
4. System creates default teams within departments:
   - Development Team (Project Management)
   - QA Team (Project Management)
   - Design Team (Project Management)
5. System creates sample employees:
   - Employee 1: Senior Developer (Project Management department)
   - Employee 2: HR Manager (Human Resources department)
6. System creates payroll setup:
   - Pay frequency: Monthly
   - Tax settings (Federal, State, Social Security, Medicare rates)
   - Deductions (Health Insurance, 401k)
7. System creates default project templates:
   - Web Development template (Planning, Design, Development, Testing, Deployment phases)
   - Mobile App Development template (Planning, Design, Development, Testing, App Store phases)
8. System creates sample project:
   - Name: "Welcome Project"
   - Description: Sample project for getting started
   - Budget: $10,000
   - Timeline: 30 days
   - Status: Planning
9. System creates sample tasks for the project:
   - Project Setup (in_progress)
   - Design Review (todo)
   - Development Phase 1 (todo)
   - Testing & QA (todo)
   - Documentation (completed)
10. System creates default chart of accounts:
    - Assets (1000-1400)
    - Liabilities (2000-2300)
    - Equity (3000-3200)
    - Revenue (4000-4200)
    - Expenses (5000-5400)
11. System creates sample finance transactions:
    - Revenue transactions ($5,000, $3,000)
    - Expense transactions ($1,500, $800)
12. System creates sample clients and vendors:
    - Clients: TechCorp Solutions, StartupXYZ
    - Vendors: CloudHosting Inc, Office Supplies Co
13. System creates default meeting templates:
    - Daily Standup (15 minutes)
    - Project Review (60 minutes)
    - Client Meeting (90 minutes)
14. System creates default notification templates:
    - Project Deadline Reminder
    - Payment Overdue
    - New Task Assignment
15. System creates default audit log entries:
    - TENANT_CREATED
    - ORGANIZATION_CREATED
16. If Master ERP template selected, system seeds industry-specific data:
    - **Education**: Academic Year, Teachers (2), Classes (2), Courses (2), Students (2), Exams (2), Grades (2)
    - **Healthcare**: Doctors (2), Patients (2), Appointments (2), Medical Records (1), Prescriptions (2)
    - **Retail**: Categories (2), Suppliers (2), Products (2), Customers (2), Sales (2)
    - **Manufacturing**: Equipment (2), Production Orders (2), Quality Inspections (2), Maintenance (2)
17. System updates onboarding status to "completed"
18. System logs seeding completion in audit log

**Alternative Paths:**
1. Seeding failure → System logs error but continues: "Data seeding failed (non-critical), tenant created successfully"
2. Partial seeding → System logs warning: "Some default data could not be created, tenant is functional"
3. Industry-specific seeding failure → System falls back to default seeding only

**Postconditions:** 
- Tenant has default data seeded
- Onboarding status updated to "completed"
- Tenant ready for use with sample data
- Audit log updated with seeding activities

---

### Use Case: UC-08

**Name:** Reporting & Export

**Summary:** Users generate and export reports for various modules including attendance, grades, sales, financial, and activity reports in multiple formats.

**Rationale:** Reports provide insights for decision-making, compliance requirements, and performance tracking across all modules and industries.

**Users:** Supra Admin, Tenant Admin, Managers (role-dependent permissions)

**Preconditions:** 
- User must be logged in
- User must have report generation permissions
- Relevant data must exist in database

**Basic Course of Events:**
1. User navigates to Reports section
2. System displays available report types:
   - **Supra Admin Reports**: Tenant Usage, Revenue, Platform Statistics
   - **Tenant Admin Reports**: User Activity, Module Usage, Financial Reports
   - **Industry-Specific Reports**:
     - Education: Attendance Reports, Grade Reports, Student Performance Reports
     - Healthcare: Patient Reports, Appointment Reports, Billing Reports
     - Retail: Sales Reports, Inventory Reports, Customer Reports
     - Manufacturing: Production Reports, Quality Reports
3. User selects report type (e.g., "Sales Report" for Retail)
4. User applies filters:
   - Date Range (Start Date, End Date)
   - Department/Module
   - User/Employee
   - Status
   - Custom filters based on report type
5. User clicks "Generate Report"
6. System gathers data from database based on filters
7. System processes and formats data
8. System generates report in selected format:
   - PDF (formatted with charts and tables)
   - Excel (spreadsheet with multiple sheets)
   - CSV (comma-separated values)
9. System displays preview of report
10. User clicks "Download" or "Export"
11. System generates file and provides download link
12. System logs report generation in audit log (User ID, Report Type, Filters, Timestamp)
13. User downloads file to local device

**Alternative Paths:**
1. Insufficient data → System displays message: "No records available for selected criteria"
2. Export failure → System displays error: "Unable to generate report file, please try again"
3. Unauthorized access → System displays error: "You do not have permission to generate this report"
4. Invalid date range → System displays error: "Invalid date range, please select valid dates"
5. File too large → System displays error: "Report is too large, please narrow your filters"

**Postconditions:** 
- Report generated and available for download
- Audit log updated with report generation details
- File saved to user's device
- Report data cached for quick re-download

---

### Use Case: UC-09

**Name:** Profile Management

**Summary:** Users update their personal information including contact details, profile image, password, and preferences (theme, language, timezone, notifications).

**Rationale:** Profile management keeps user data accurate, secure, and personalized according to user preferences.

**Users:** All authenticated users

**Preconditions:** 
- User must be logged in

**Basic Course of Events:**
1. User navigates to Profile Settings (clicking on profile icon/name)
2. System displays profile page with tabs:
   - Personal Information
   - Security (Password Change)
   - Preferences
   - Notifications
3. **Personal Information Tab:**
   - User views current information (Full Name, Email, Phone, Address, Profile Picture)
   - User clicks "Edit" button
   - User updates fields:
     - Full Name
     - Email (with validation)
     - Phone Number
     - Address (Street, City, State, Zip Code, Country)
     - Profile Picture (upload new image)
   - System validates input (email format, phone format)
   - User clicks "Save"
   - System updates user record in database
   - System displays success message: "Profile updated successfully"
4. **Security Tab (Password Change):**
   - User enters current password
   - User enters new password
   - User confirms new password
   - System validates:
     - Current password is correct
     - New password meets requirements (minimum 8 characters, uppercase, lowercase, number)
     - New password and confirmation match
   - User clicks "Change Password"
   - System hashes new password using bcrypt
   - System updates password in database
   - System invalidates all existing sessions (security measure)
   - System displays success message: "Password changed successfully. Please login again."
   - User is redirected to login page
5. **Preferences Tab:**
   - User updates preferences:
     - Theme (Light, Dark, System Default)
     - Language (English, others if available)
     - Timezone (dropdown selection)
     - Date Format (MM/DD/YYYY, DD/MM/YYYY, etc.)
   - System saves preferences
   - System applies preferences immediately
6. **Notifications Tab:**
   - User configures notification preferences:
     - Email Notifications (On/Off)
     - Push Notifications (On/Off)
     - SMS Notifications (On/Off)
     - Notification Types (New Assignment, Deadline Reminder, etc.)
   - System saves preferences
7. System logs profile update in audit log
8. System displays confirmation message

**Alternative Paths:**
1. Invalid email format → System displays error: "Invalid email format"
2. Email already exists → System displays error: "Email is already in use by another user"
3. Incorrect current password → System displays error: "Current password is incorrect"
4. Weak password → System displays error: "Password must be at least 8 characters with uppercase, lowercase, and number"
5. Password mismatch → System displays error: "New password and confirmation do not match"
6. File upload error → System displays error: "Unable to upload profile picture, please try again"
7. Server error → System displays error: "Unable to update profile, please try again"

**Post Conditions:** 
- User profile updated in database
- Changes reflected immediately in UI
- Password changed and sessions invalidated (if password changed)
- Preferences applied immediately
- Audit log updated with profile changes

---

### Use Case: UC-10

**Name:** Subscription & Billing Management

**Summary:** Supra Admin manages tenant subscriptions including plan changes, billing cycles, trial extensions, and subscription status updates.

**Rationale:** Subscription management ensures proper resource allocation, revenue tracking, and plan-based feature access for tenants.

**Users:** Supra Administrator

**Preconditions:** 
- Supra Admin must be logged in
- Tenant must exist

**Basic Course of Events:**
1. Supra Admin navigates to Tenant Management
2. Admin selects tenant from list
3. Admin views tenant details including current subscription:
   - Current Plan (Trial, Basic, Professional, Enterprise)
   - Billing Cycle (Monthly, Annual)
   - Subscription Status (Active, Suspended, Cancelled)
   - Trial End Date (if on trial)
   - Next Billing Date
   - Usage Statistics (Users, Storage, API Calls)
4. Admin can perform actions:
   - **Change Subscription Plan:**
     - Admin selects new plan from dropdown
     - System displays plan comparison (features, limits, pricing)
     - Admin confirms plan change
     - System validates plan transition (e.g., can upgrade from Basic to Professional)
     - System updates tenant subscription in database
     - System adjusts tenant resource limits based on new plan
     - System sends notification email to tenant admin
   - **Update Billing Cycle:**
     - Admin changes billing cycle (Monthly ↔ Annual)
     - System updates billing cycle in database
     - System recalculates next billing date
   - **Extend Trial Period:**
     - Admin extends trial period (e.g., +7 days, +14 days)
     - System updates trial end date
     - System sends notification to tenant admin
   - **Suspend Subscription:**
     - Admin suspends subscription (e.g., for non-payment)
     - System sets subscription status to "suspended"
     - System prevents tenant users from logging in
     - System sends suspension notice to tenant admin
   - **Reactivate Subscription:**
     - Admin reactivates suspended subscription
     - System sets subscription status to "active"
     - System restores tenant access
     - System sends reactivation notice to tenant admin
   - **Cancel Subscription:**
     - Admin cancels subscription (with confirmation)
     - System sets subscription status to "cancelled"
     - System schedules tenant data retention period
     - System sends cancellation notice to tenant admin
5. System validates all actions
6. System updates database
7. System logs subscription changes in audit log
8. System sends email notifications to tenant admin
9. System displays confirmation message

**Alternative Paths:**
1. Invalid plan transition → System displays error: "Cannot downgrade from Enterprise to Basic directly. Please contact support."
2. Trial expired → System displays warning: "Trial period expired, subscription required for continued access"
3. Payment failure → System displays error: "Payment processing failed, subscription suspended"
4. Unauthorized action → System displays error: "You do not have permission to perform this action"

**Postconditions:** 
- Subscription updated in database
- Tenant resource limits adjusted (if plan changed)
- Tenant access updated (if status changed)
- Email notification sent to tenant admin
- Audit log updated with subscription changes
- Changes reflected in tenant list

---

### Use Case: UC-11

**Name:** Audit Logging & Compliance

**Summary:** System automatically logs all critical actions for security monitoring, compliance requirements, and troubleshooting purposes.

**Rationale:** Audit logging ensures accountability, security monitoring, compliance with regulations (GDPR, FERPA, HIPAA, SOX), and enables forensic analysis of system activities.

**Users:** System (Automated), Supra Admin, Tenant Admin (View Only)

**Preconditions:** 
- System must be operational
- User must be logged in (for viewing logs)

**Basic Course of Events:**
1. System detects critical action (User creation, Data modification, Login, Export, Permission change, etc.)
2. System captures audit log data:
   - **User Information**: User ID, User Email, Role
   - **Action Details**: Action Type (CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.)
   - **Entity Information**: Entity Type (User, Tenant, Product, Student, etc.), Entity ID
   - **Context**: IP Address, User Agent (browser/device), Timestamp
   - **Details**: JSON object with action-specific details (old values, new values, etc.)
3. System stores audit log entry in database:
   - Collection: `auditlogs`
   - Indexed by: User ID, Entity Type, Timestamp, Action Type
4. **Viewing Audit Logs:**
   - Supra Admin navigates to Audit Logs section
   - System displays audit log list with filters:
     - User (dropdown)
     - Action Type (dropdown)
     - Entity Type (dropdown)
     - Date Range (Start Date, End Date)
     - IP Address (search)
   - Admin applies filters
   - System queries audit logs from database
   - System displays filtered results in table:
     - Timestamp
     - User (Email)
     - Action
     - Entity Type
     - Entity ID
     - IP Address
     - Details (expandable)
   - Admin clicks on log entry to view full details
   - Admin can export audit logs:
     - Selects date range and filters
     - Clicks "Export"
     - System generates CSV/Excel file
     - Admin downloads file
5. **Tenant Admin Audit Logs:**
   - Tenant Admin views audit logs for their tenant only
   - System filters logs by tenantId
   - Same viewing and export functionality as Supra Admin
6. System logs audit log access in audit log (meta-logging)

**Alternative Paths:**
1. Log storage failure → System logs error but continues processing: "Audit log storage failed, action still processed"
2. Log retrieval failure → System displays error: "Unable to retrieve audit logs, please try again"
3. Insufficient permissions → System displays error: "You do not have permission to view audit logs"
4. No logs found → System displays message: "No audit logs found for selected criteria"

**Postconditions:** 
- Audit log entry stored in database
- Logs available for viewing and export
- Compliance requirements met (GDPR, FERPA, HIPAA, SOX)
- Security monitoring enabled
- Forensic analysis possible

---

**Document End**
