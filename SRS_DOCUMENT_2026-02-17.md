# Software Requirements Specifications (SRS)
## TWS - Multi-Tenant Enterprise Resource Planning (ERP) Platform

**Document Version:** 2.0  
**Date:** February 17, 2026  
**Status:** Current System State Documentation

**⚠️ IMPORTANT NOTE:** This SRS document reflects the **actual implemented system** as of February 17, 2026. Currently, **only Software House ERP is fully implemented and active**. The system has infrastructure (database enums, basic models) for Business and Warehouse ERP categories, but these are not fully implemented. Education and Healthcare ERP have legacy code that exists but is not actively loaded or used. Retail and Manufacturing ERP are not implemented.

---

## 1. INTRODUCTION

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the TWS (The Wolf Stack) Multi-Tenant Enterprise Resource Planning (ERP) Platform as of February 17, 2026. The document outlines functional and non-functional requirements, system architecture, use cases, and design constraints for a cloud-based SaaS platform that enables organizations from multiple industries to manage their business operations through a unified, multi-tenant ERP system.

The platform currently supports **Software House ERP** as the primary industry vertical, with infrastructure in place for future expansion to other industries. The system includes common ERP functionalities such as Human Resources, Finance, Projects, and Operations Management, along with specialized Software House features including Nucleus Project Management.

### 1.2 Scope

The TWS Multi-Tenant ERP Platform is designed to provide:

- **Multi-Tenancy Architecture**: Complete data isolation and independent configuration for each tenant organization
- **Software House ERP**: Fully implemented ERP system for software development companies with specialized project management (Nucleus), time tracking, client management, and development tools
- **Common ERP Modules**: Shared modules including HR Management, Finance, Project Management, Attendance, and Reporting
- **Future ERP Support**: Infrastructure prepared for Business and Warehouse ERP categories (enum defined but not fully implemented)
- **Platform Administration**: Supra Admin portal for managing tenants, subscriptions, and platform-wide operations
- **Tenant Administration**: Tenant Admin portal for managing organization-specific users, modules, and configurations
- **Role-Based Access Control**: Granular permissions system supporting multiple user roles across different industries
- **Master ERP Templates**: Pre-configured templates for rapid tenant provisioning with industry-specific default data
- **Real-Time Features**: WebSocket-based real-time updates for notifications and collaborative features
- **API Integration**: RESTful API for third-party integrations and mobile applications
- **Nucleus Project Management**: Advanced project management system for Software House ERP with client portal, deliverables, and approval workflows

**Out of Scope:**
- Mobile native applications (iOS/Android) - Web-based responsive design only
- Payment gateway integration for tenant billing (handled externally)
- Advanced machine learning features
- Multi-language support beyond English (extensible architecture)
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
| **Tenant Admin/Owner** | Organization-level administrator managing their tenant |
| **Master ERP** | Pre-configured template for industry-specific tenant provisioning |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token - Authentication mechanism |
| **2FA** | Two-Factor Authentication |
| **POS** | Point of Sale |
| **orgId** | Organization Identifier |
| **tenantId** | Tenant Identifier |
| **orgSlug** | URL-friendly tenant identifier |
| **MVC** | Model-View-Controller architecture pattern |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer |
| **WebSocket** | Real-time bidirectional communication protocol |
| **MongoDB** | NoSQL database used for data storage |
| **React** | Frontend JavaScript framework |
| **Express** | Backend Node.js web framework |
| **Nucleus** | Advanced project management system for Software House ERP |
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
- **Database**: MongoDB with tenant-isolated data
- **Real-Time**: Socket.IO for WebSocket communication
- **File Storage**: Local file system or cloud storage (S3-compatible)
- **Email Service**: SMTP or third-party service (SendGrid, AWS SES)
- **Caching**: Redis (optional) for session management and performance
- **Monitoring**: Prometheus metrics, Winston logging, Sentry error tracking

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
   - System health monitoring

2. **Tenant Management (Tenant Admin)**
   - Organization configuration and settings
   - User management within tenant
   - Module activation and configuration
   - Branding and customization
   - Subscription and billing management
   - ERP category selection and module restrictions

3. **Software House ERP Module (Fully Implemented)**
   - **Nucleus Project Management**: Advanced workspace-based project management system with deliverables, Gantt charts, approval workflows, and change request management
   - **Time Tracking**: Billable hours tracking, project-wise time allocation, time reports
   - **Client Management**: Client profiles, project portfolios, communication history, invoice generation
   - **Development Tools**: Code quality tracking, development methodology (Agile, Scrum, Kanban), tech stack management
   - **Client Portal**: Read-only access for clients to view project progress, deliverables, and invoices
   - **Project Templates**: Pre-built templates for Web Development, Mobile App Development, API Development
   - **Analytics & Reporting**: Project analytics, team performance metrics, client reports, resource utilization
   - **Software House Roles**: Specialized roles for developers, project managers, and team leads
   - **Software House Attendance**: Industry-specific attendance tracking for development teams

4. **Software House ERP Modules** (Currently the only ERP category)
   - **HR Management**: Employee management, Payroll, Attendance, Departments, Teams, Leave management
   - **Finance**: Chart of accounts, Transactions, Invoicing, Financial reports, Budgeting, Tax management, Equity & Cap Table
   - **Projects**: Project templates, Task management, Project tracking, Resource allocation, Time tracking, Sprints, Teams
   - **Clients & Vendors**: Client management, Vendor management, Contact management, Partners
   - **Workspaces**: Board management, Card management, List management, Kanban boards
   - **Documents (Document Hub)**: Document library, creation from templates, file upload, folders and tags, search and filtering, approval workflow, version history, export (HTML/Word/PDF), audit trail, bulk operations (see FR26)
   - **Reports & Analytics**: Customizable reports, Dashboards, Data export
   - **Notifications**: Real-time notifications, Email notifications, In-app notifications
   - **Nucleus Project Management**: Advanced workspace-based project management (see FR5)
   
   **Note**: These modules are currently Software House-specific. Infrastructure exists to make HR, Finance, and Projects "common" modules if other ERP categories (Education, Healthcare) are added in the future, where they would be restricted based on ERP category.

5. **Authentication & Authorization**
   - User registration and login
   - JWT-based authentication
   - Role-based access control
   - Two-factor authentication (2FA) support
   - Session management
   - Tenant context management

6. **Data Management**
   - Tenant data isolation
   - Automatic data seeding on tenant creation
   - Data backup and recovery
   - Audit logging
   - GDPR compliance features

7. **Nucleus Project Management (Software House ERP)**
   - Workspace-based project management
   - Deliverable management with Gantt charts
   - Approval workflows
   - Change request management
   - Client portal with read-only access
   - Project templates and onboarding
   - Analytics and reporting
   - Batch operations

### 2.3 User Classes & Characteristics

| User Class | Characteristics | Typical Use Cases |
|------------|----------------|-------------------|
| **Supra Admin** | Platform administrator with full system access. Manages all tenants, subscriptions, and platform configuration. | Create/manage tenants, Monitor platform health, Manage Master ERP templates, View platform analytics |
| **Tenant Admin/Owner** | Organization administrator managing their tenant. Has full control over tenant configuration, users, and modules. | Manage organization users, Configure modules, Customize branding, View tenant analytics, Manage subscriptions |
| **Manager** | Department or team manager with elevated permissions within their scope. | Manage team members, View reports, Approve requests, Assign tasks |
| **Employee** | Standard user with basic permissions. Access varies by industry and role. | View assigned tasks, Submit timesheets, Access personal information, View schedules |
| **Software House: Project Manager** | Software project manager managing software development projects. | Manage projects (Nucleus), Track development progress, Manage client relationships, Manage deliverables, Approve change requests, Monitor team performance |
| **Software House: Developer** | Software developer working on projects. | Log time, Update task status, Track deliverables, Update project progress, Submit deliverables for approval |
| **Software House: Team Lead** | Development team lead overseeing team members. | Manage team tasks, Review deliverables, Track team performance, Allocate resources |
| **Client (Read-Only)** | External client accessing project information. | View project progress (Gantt chart), View deliverables status, Create change requests, View invoices |

### 2.4 Operating Environment

**Server Environment:**
- **Operating System**: Linux (Ubuntu 20.04+), Windows Server, or macOS (development)
- **Node.js**: Version 18.x or higher
- **MongoDB**: Version 7.x or higher
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
- **Package Managers**: npm (Node.js)
- **Testing Tools**: Jest, Supertest

### 2.5 Design & Implementation Constraints

**Technical Constraints:**
1. **Database**: Must use MongoDB for data storage (NoSQL document database)
2. **Backend Framework**: Must use Express.js (Node.js web framework)
3. **Frontend Framework**: Must use React.js (JavaScript UI library)
4. **Authentication**: Must use JWT (JSON Web Tokens) for stateless authentication
5. **API Design**: Must follow RESTful principles
6. **Code Structure**: Must follow MVC (Model-View-Controller) architecture pattern
7. **Multi-Tenancy**: Must implement tenant-isolated data model with tenantId/orgId filtering
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
7. **Rate Limiting**: Must implement rate limiting for authentication endpoints (5 attempts per 15 minutes)
8. **Tenant Isolation**: Must enforce tenant data isolation at middleware level

---

## 3. FUNCTIONAL REQUIREMENTS

| No | Requirement Title | Description |
|---|---|---|
| **FR1** | **Multi-Tenant Architecture** | The system must support multiple independent tenant organizations, each with:<br>• Isolated data using tenantId/orgId filtering<br>• Unique subdomain/slug access (`<tenant-slug>.domain.com`)<br>• Independent configuration and settings<br>• Isolated user management<br>• Tenant-specific branding (logo, colors, company name)<br>• Resource quotas based on subscription plan<br>• ERP category selection (currently: Software House; infrastructure for Business and Warehouse exists but not fully implemented)<br><br>**FR1 compliance (verified and updated):**<br>• **tenantId/orgId filtering** — Implemented; queries and verifyERPToken use orgId/tenantId consistently.<br>• **Unique slug access** — Implemented; tenant resolution by slug and token verification in place.<br>• **Independent configuration** — Implemented; per-tenant `/config` GET/PUT and settings.<br>• **Isolated user management** — **Implemented (per-tenant role):** Access control now uses **per-tenant role** when available. `verifyERPToken` loads `TenantUser` for the current user+tenant; if an active TenantUser exists, `req.user.role` is set from `TenantUser.primaryRole` (so the same user can have different roles in different tenants). If no TenantUser exists, fallback to `User.role` for backward compatibility. Self-serve signup creates a `TenantUser` for the owner; invited users get TenantUser via tenant switching/invite flow. TenantUser roles include: owner, admin, manager, project_manager, hr, employee, client, contractor.<br>• **Tenant-specific branding** — Partially implemented; tenant config can store logo/company name; frontend uses `tenant.logoUrl`/`tenant.logo` and theme colors in layout (TenantOrgLayout, SoftwareHouseTopNavbar).<br>• **Resource quotas by subscription** — **Gap:** Tenant model and SubscriptionPlan/pricingService define limits (e.g. maxUsers, maxProjects); featureGate middleware exists but is **not** applied to tenant ERP routes (e.g. `/api/tenant/:tenantSlug/software-house`). Quotas are not enforced on create/list operations for tenant-scoped APIs.<br>• **ERP category** — Software House implemented; Business and Warehouse infrastructure exists but not fully implemented (known gap). |
| **FR2** | **Tenant Provisioning & Onboarding** | **⚠️ SELF-SERVE SIGNUP ONLY — Supra Admin Cannot Create Tenants**<br><br>The system provides automated tenant creation through self-serve signup only, with tenant workspaces accessible via **path-based routing** on a shared subdomain: **app.nexaerp.com/&lt;tenant-slug&gt;**<br><br>**Tenant access & routing**<br>• Each tenant gets a unique slug selected during signup.<br>• Tenant workspace is accessible at **app.nexaerp.com/&lt;tenant-slug&gt;**<br>• Slug must be unique across the platform, URL-safe, and validated at API level with a clear error (not a raw DB exception).<br>• **Slug is immutable after creation** (changing it would break bookmarked URLs and integrations); API rejects slug change with `400 SLUG_IMMUTABLE`.<br>• Future migration path to **&lt;tenant-slug&gt;.nexaerp.com** is preserved — no architectural changes required, only routing layer update.<br><br>**Signup flow (3 steps)**<br>• **Step 1** — User registers with email, password, and full name.<br>• **Step 2** — 6-digit OTP email verification (required before tenant creation proceeds).<br>• **Step 3** — User enters organisation name and selects slug; system validates uniqueness in real time before submission (live API: `GET /api/signup/check-slug-availability` with debounced input).<br><br>**What the system creates automatically on signup**<br>• Tenant record with `erpCategory: 'software_house'`<br>• Default organisation linked to tenant<br>• First user set as owner (`User.role = 'owner'`) with orgId assignment and TenantUser record<br>• Default data seeded: departments, teams, chart of accounts, sample projects<br>• Welcome email sent to tenant owner<br>• Onboarding progress tracker initialised<br><br>**Supra Admin capabilities**<br>• ❌ Cannot create tenants (all routes disabled by design).<br>• ✅ Can view, update, suspend, and delete existing tenants.<br>• **Rationale:** Enforces verified ownership from day one; admin-created tenants would bypass OTP verification and onboarding tracking.<br><br>**Known gaps / future work**<br>• Enterprise white-glove provisioning path for direct sales (Supra Admin creates tenant with forced email verification step).<br>• Onboarding tracker granularity to be confirmed — step-by-step completion vs simple boolean flag. |
| **FR3** | **User Authentication & Authorization** | The system must provide secure authentication and authorization:<br>• User registration with email and password<br>• User login with JWT token generation<br>• Role-based access control (RBAC) with multiple roles:<br>  - Supra Admin, Tenant Admin/Owner, Manager, Employee<br>  - Industry-specific roles (Principal, Teacher, Student, Doctor, Patient, etc.)<br>• Two-factor authentication (2FA) support<br>• Session management with refresh tokens<br>• Password reset functionality<br>• Account activation and deactivation<br>• Rate limiting for authentication endpoints |
| **FR4** | **Master ERP Template Management** | **⚠️ PARTIALLY IMPLEMENTED - Backend Infrastructure Only**<br><br>The system has backend infrastructure for Master ERP templates, but most functionality is disabled:<br>• **Backend Model**: MasterERP model exists with template structure<br>• **Internal Usage**: System automatically searches for Master ERP templates during tenant signup (if industry matches)<br>• **Data Seeding**: If Master ERP template found, system seeds industry-specific default data<br>• **API Routes**: Most Master ERP routes are DISABLED/COMMENTED OUT:<br>  - ❌ Get all Master ERP templates - DISABLED<br>  - ❌ Create tenant from Master ERP - DISABLED<br>  - ❌ Clone Master ERP - DISABLED<br>  - ❌ Get available modules - DISABLED<br>  - ✅ Get Master ERP by industry - ACTIVE (Supra Admin only, internal use)<br>• **Supra Admin Routes**: Some routes exist in `/api/supra-admin/master-erp` but no frontend UI<br>• **Frontend**: No UI for Supra Admin to create/manage Master ERP templates<br>• **Current State**: Templates must be created manually in database or via API; system uses them automatically during signup if they exist<br><br>**Note**: This feature was planned but the management UI was removed. Templates work automatically if they exist in the database. |
| **FR5** | **Software House ERP Module** | The system must provide software house-specific functionality (FULLY IMPLEMENTED):<br>• **Nucleus Project Management System**:<br>  - Workspace-based project organization<br>  - Deliverable management with Gantt chart visualization<br>  - Sequential approval workflow for deliverables<br>  - Change request management<br>  - Client portal with read-only access to deliverables<br>  - Project templates (Web Development, Mobile App, API Development)<br>  - Onboarding checklist and progress tracking<br>  - Analytics and reporting (workspace stats, project summaries, at-risk tracking)<br>  - Batch operations for bulk updates<br>  - Auto-calculation of project progress<br>  - Date validation and dependency management<br>• **Time Tracking**: Billable hours tracking, project-wise time allocation, time reports, billing integration<br>• **Client Management**: Client profiles, project portfolios, communication history, invoice generation<br>• **Development Tools**: Code quality tracking, development methodology (Agile, Scrum, Kanban), tech stack management<br>• **Software House Roles**: Specialized roles for developers, project managers, team leads<br>• **Software House Attendance**: Industry-specific attendance tracking for development teams<br>• **Technology Stack Management**: Frontend, backend, database, cloud platforms, development tools<br>• **Billing Configuration**: Hourly rates, billing cycles, invoice templates<br>• **Team Configuration**: Max team size, remote work policies<br>• All common modules available (HR, Finance, Projects) |
| **FR6** | **Future ERP Modules** | The system has infrastructure prepared for future ERP categories:<br>• **Business ERP**: Enum defined, basic structure exists, not fully implemented<br>• **Warehouse ERP**: Enum defined, basic structure exists, not fully implemented<br>• **Education ERP**: Legacy code exists but not active (models and routes exist but not loaded)<br>• **Healthcare ERP**: Legacy code exists but not active (models and routes exist but not loaded)<br>• **Retail ERP**: Not implemented<br>• **Manufacturing ERP**: Not implemented |
| **FR12** | **HR Module (Software House ERP)** | **⚠️ NOTE: Currently only available for Software House ERP. Would become "common" if other ERP categories are added.**<br><br>The system provides human resources functionality for Software House tenants:<br>• Employee management (profiles, departments, positions, hire dates, salaries)<br>• Payroll management (pay frequencies, tax settings, deductions, calculations)<br>• Attendance management (check-in/check-out, policies, overtime, remote work)<br>• Department management (budgets, heads, descriptions)<br>• Team management (leads, members, assignments)<br>• Leave management (requests, approvals, balances)<br>• Multiple attendance systems (modern, simple, calendar-based, software house specific)<br><br>**Current Status**: These are Software House ERP modules, not truly "common" since only one ERP category exists. Infrastructure exists to make these common modules if other ERP categories (Education, Healthcare) are added in the future. |
| **FR13** | **Finance Module (Software House ERP)** | **⚠️ NOTE: Currently only available for Software House ERP. Would become "common" if other ERP categories are added.**<br><br>The system provides financial management functionality for Software House tenants:<br>• Chart of accounts (hierarchical account structure, codes, types)<br>• Transaction management (revenue, expenses, categories, dates)<br>• Invoicing (generation, sending, tracking)<br>• Financial reporting (income statements, balance sheets, cash flow)<br>• Budgeting (planning, tracking, variance analysis)<br>• Tax management (rates, calculations, compliance)<br>• Equity & Cap Table management<br><br>**Current Status**: This is a Software House ERP module, not truly "common" since only one ERP category exists. Infrastructure exists to make this a common module if other ERP categories are added. |
| **FR14** | **Projects Module (Software House ERP)** | **⚠️ NOTE: Currently only available for Software House ERP. Would become "common" if other ERP categories are added.**<br><br>The system provides project management functionality for Software House tenants:<br>• Project templates (phases, durations, default settings)<br>• Project creation and management (name, description, budget, timeline)<br>• Task management (assignments, priorities, statuses, due dates)<br>• Project tracking (progress, hours, costs)<br>• Resource allocation (team members, equipment)<br>• Time tracking (logged hours, billable/non-billable)<br>• Sprint management (Agile/Scrum)<br>• Team management<br>• Development metrics tracking<br><br>**Current Status**: This is a Software House ERP module, not truly "common" since only one ERP category exists. Infrastructure exists to make this a common module if other ERP categories are added. |
| **FR15** | **Module Access Control** | **⚠️ NOTE: Currently not actively enforced since only Software House ERP exists. Infrastructure exists for future use.**<br><br>The system has infrastructure to enforce module access restrictions based on ERP category:<br>• Middleware exists (`moduleAccessControl.js`) to check module access<br>• Common modules (dashboard, users, settings, reports, messaging, analytics) would be accessible to all ERP categories<br>• Business modules (HR, Finance, Projects) would be restricted by category if multiple ERPs existed<br>• Frontend menu filtering infrastructure exists (`industryMenuBuilder.js`)<br><br>**Current Status**: Since only Software House ERP is implemented, all modules (HR, Finance, Projects) are available to all tenants. Module access control is not actively enforced but infrastructure exists for future ERP categories. If Education or Healthcare ERP were added, they would NOT have access to HR, Finance, Projects modules (as per the existing restriction logic). |
| **FR16** | **Dashboard & Analytics** | The system must provide role-specific dashboards:<br>• **Supra Admin Dashboard**: Platform overview, total tenants, subscription distribution, tenant growth trends<br>• **Tenant Admin Dashboard**: Organization overview, user statistics, module usage<br>• **Software House Dashboard**:<br>  - Project status overview (Nucleus workspaces)<br>  - Team performance metrics<br>  - Client metrics and project portfolios<br>  - Time tracking summary<br>  - Deliverable status and approvals<br>  - At-risk projects tracking<br>• Real-time metrics and KPIs<br>• Interactive charts and visualizations |
| **FR17** | **Reporting & Export** | The system must provide reporting capabilities:<br>• **Supra Admin Reports**: Tenant usage, Revenue reports, Platform statistics<br>• **Tenant Admin Reports**: User activity, Module usage, Financial reports<br>• **Software House Reports**:<br>  - Project reports (Nucleus workspace analytics)<br>  - Time tracking reports (billable hours, project allocation)<br>  - Client reports (project portfolios, invoices)<br>  - Team performance reports<br>  - Deliverable status reports<br>  - Change request reports<br>• Export to PDF, Excel, CSV formats<br>• Customizable date ranges and filters |
| **FR18** | **Notifications** | The system must provide notification features:<br>• Real-time notifications via WebSocket (Socket.IO)<br>• Email notifications<br>• In-app notifications<br>• Notification preferences (user-configurable)<br>• Notification templates for different events |
| **FR19** | **File Management** | The system must support file uploads and management:<br>• File upload for various purposes (documents, images, videos, PDFs)<br>• File validation (type, size limits - max 100MB)<br>• Secure file storage with access control<br>• File organization (folders, categories)<br>• File sharing and permissions<br>• AWS S3 integration support |
| **FR20** | **Subscription & Billing Management** | The system must manage tenant subscriptions:<br>• Multiple subscription plans (Trial, Basic, Professional, Enterprise)<br>• Trial period management (default 14 days)<br>• Subscription status tracking (Active, Suspended, Cancelled)<br>• Billing cycle management (Monthly, Annual)<br>• Usage tracking and limits per plan<br>• Subscription upgrade/downgrade |
| **FR21** | **Audit Logging** | The system must log all critical actions:<br>• User actions (creation, modification, deletion)<br>• Data access and modifications<br>• Login attempts and authentication events<br>• Permission changes<br>• Export operations<br>• Audit logs include: User ID, Timestamp, Action, Entity Type, IP Address, User Agent<br>• Audit logs are searchable and exportable |
| **FR22** | **API & Integration** | The system must provide API endpoints:<br>• RESTful API for all modules<br>• API authentication using JWT tokens<br>• Rate limiting and API versioning<br>• Webhook support for external integrations<br>• Calendar integration (Google Calendar, Microsoft Graph)<br>• Swagger/OpenAPI documentation<br>• WebRTC support for video conferencing |
| **FR23** | **Profile Management** | The system must allow users to manage their profiles:<br>• Update personal information (name, email, phone, address)<br>• Upload profile picture<br>• Change password with validation<br>• Configure preferences (theme, language, timezone, notifications)<br>• View activity history |
| **FR24** | **Workspace Management** | The system must provide workspace management for project collaboration:<br>• Board management (Kanban boards)<br>• Card management (task cards)<br>• List management (task lists)<br>• Template management<br>• Workspace-based organization |
| **FR25** | **Nucleus Project Management** | The system must provide advanced project management for Software House ERP:<br>• Workspace-based project organization<br>• Deliverable management with Gantt chart visualization<br>• Sequential approval workflow<br>• Change request management<br>• Client portal with read-only access to deliverables<br>• Project templates (Web Development, Mobile App, API Development)<br>• Onboarding checklist and progress tracking<br>• Analytics and reporting (workspace stats, project summaries, at-risk tracking)<br>• Batch operations for bulk updates<br>• Auto-calculation of project progress<br>• Date validation and dependency management |
| **FR26** | **Documents Module (Document Hub)** | The system must provide a document management module (Document Hub) for Software House ERP:<br>• **Document Library**: Unified view of created documents and uploaded files; grid, list, and table view modes; pagination; real-time updates<br>• **Document Creation**: Create documents from templates (Blank, Proposal, Contract, Meeting Notes, Project Brief, SOW, Invoice Cover) or blank; rich text editor (BlockNote-based) with auto-save, manual save, and keyboard shortcuts<br>• **File Upload**: Upload PDF, Word, Excel, PowerPoint, images, TXT, ZIP, RAR; upload progress; cloud storage (S3); uploaded files view/download only<br>• **Organization**: Folders and tags for grouping; folder sidebar navigation; tag filtering and assignment; "All Documents" view<br>• **Search & Filtering**: Full-text search; filters for status (Draft, In Review, Approved, Archived), type (created vs uploaded), folder, tags; sort by last updated, created date, title; filter persistence in URL<br>• **Document Lifecycle & Approval**: States (Draft, In Review, Approved, Archived); submit for review; approval queue for reviewers; approve/reject with comments; status badges<br>• **Version History**: Track versions on save; view and restore previous versions; version drawer in editor<br>• **Export & Download**: Export as HTML, Word (.docx), PDF; download uploaded files; safe filenames<br>• **Audit Trail**: Activity log for viewed, created, edited, submitted, approved, rejected, archived, restored, deleted; timestamp, user, document, comments; dedicated audit page with pagination and filtering<br>• **Bulk Operations**: Multi-select documents; bulk delete; selection counter and clear selection<br>• **Metadata**: Title, type, status, created/updated dates, created by, folder, tags, template; displayed on cards/list items |

---

## 4. NON-FUNCTIONAL REQUIREMENTS

| No | Requirement | Description |
|---|---|---|
| **NFR1** | **Performance** | • System should load dashboard pages within 2-3 seconds<br>• API endpoints should respond within 500ms for standard operations<br>• Database queries should be optimized with proper indexing<br>• Should support at least 100 concurrent users per tenant<br>• File uploads should support files up to 100MB per file<br>• Real-time updates should have latency less than 100ms |
| **NFR2** | **Security** | • Passwords must be encrypted using bcrypt (minimum 10 rounds)<br>• JWT tokens must have expiration and refresh token mechanism<br>• System must prevent SQL Injection (using parameterized queries with Mongoose)<br>• System must prevent XSS (Cross-Site Scripting) attacks<br>• System must prevent CSRF (Cross-Site Request Forgery) attacks<br>• Data encryption at rest and in transit (HTTPS/TLS)<br>• Role-based access control (RBAC) enforcement at API and UI levels<br>• Session management with automatic logout after inactivity<br>• Input validation and sanitization for all user inputs<br>• Tenant data isolation to prevent cross-tenant data access<br>• Rate limiting for authentication endpoints (5 attempts per 15 minutes)<br>• Rate limiting for general API endpoints (100 requests per 15 minutes)<br>• TLS verification for HIPAA compliance |
| **NFR3** | **Usability** | • Interface must be user-friendly and intuitive<br>• Responsive design for Desktop (1920x1080+), Tablet (768px-1024px), Mobile (320px-767px)<br>• Consistent UI/UX across all modules<br>• Accessibility compliance (WCAG 2.1 Level AA)<br>• Multi-language support (English as primary, extensible)<br>• Clear error messages and validation feedback<br>• Loading indicators for long-running operations |
| **NFR4** | **Reliability & Availability** | • System must maintain 99.5% uptime<br>• Automatic failover for critical services<br>• Graceful error handling with user-friendly error messages<br>• System should be available 24/7 with scheduled maintenance windows<br>• Health check endpoints for monitoring<br>• Transaction rollback on errors to maintain data consistency |
| **NFR5** | **Scalability** | • System should support horizontal scaling<br>• Should handle 10x growth in tenants, users, and data without major refactoring<br>• Database sharding support for large tenants<br>• Load balancing for API servers<br>• Caching strategy (Redis) for frequently accessed data<br>• Stateless API design for easy scaling |
| **NFR6** | **Maintainability** | • Code should follow MVC architecture pattern<br>• Modular code structure with clear separation of concerns<br>• Comprehensive code documentation (JSDoc)<br>• Version control using Git<br>• Easy to update and extend modules independently<br>• Unit tests and integration tests coverage (minimum 70%)<br>• Consistent coding standards and linting |
| **NFR7** | **Data Backup & Recovery** | • System should perform automated daily backups<br>• Backup retention: 30 days daily, 12 months monthly<br>• Point-in-time recovery capability<br>• Disaster recovery plan with RTO (Recovery Time Objective) < 4 hours<br>• Data replication across multiple data centers<br>• Backup verification and testing procedures |
| **NFR8** | **Compatibility** | • Should work with all major browsers (Chrome, Firefox, Edge, Safari - latest 2 versions)<br>• Cross-platform support (Windows 10/11, macOS, Linux, Android 8.0+, iOS 13+)<br>• Backward compatibility with API versions<br>• Graceful degradation for unsupported browsers |

---

## 5. SYSTEM ARCHITECTURE

### 5.1 Technical Stack

**Frontend:**
- **Framework:** React 18.x
- **State Management:** React Context API
- **Routing:** React Router v6
- **UI Components:** Ant Design, Mantine, Custom components
- **Styling:** CSS3, Tailwind CSS
- **Forms:** React Hook Form
- **API Client:** Axios
- **Real-time:** Socket.IO Client
- **Charts:** Chart.js, Recharts

**Backend:**
- **Runtime:** Node.js 18.x
- **Framework:** Express.js 4.x
- **Database:** MongoDB 7.x with Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens), Passport.js
- **Real-time:** Socket.IO
- **File Upload:** Multer, Multer-S3
- **Validation:** Express Validator, Joi
- **Email:** Nodemailer, SendGrid
- **Security:** Helmet, Express Mongo Sanitize, Express Rate Limit
- **Logging:** Winston
- **Task Queue:** BullMQ
- **Caching:** Redis (optional)
- **Monitoring:** Prometheus, Sentry
- **API Documentation:** Swagger/OpenAPI

**Infrastructure:**
- **Cloud Storage:** AWS S3
- **Authentication:** Firebase Admin (optional)
- **Deployment:** Docker, PM2
- **Web Server:** Nginx
- **Monitoring:** Grafana

### 5.2 Multi-Tenant Architecture

**Tenant Isolation Mechanism:**

The system implements tenant isolation using:
- **Tenant Identification**: Each tenant has a unique `tenantId` and `orgSlug`
- **Data Filtering**: All database queries automatically filter by `tenantId` and `orgId`
- **Middleware Enforcement**: Tenant middleware enforces tenant context on all requests
- **Module Access Control**: Middleware restricts module access based on ERP category

**Database Strategy:**

- **Shared Database**: Single MongoDB database with tenant-isolated collections
- **Tenant Filtering**: All collections include `tenantId` and `orgId` fields
- **Query Filtering**: Queries automatically filtered by tenant context
- **Indexing**: Proper indexes on tenantId and orgId for performance

### 5.3 Module Architecture

**Backend Module Structure:**

```
modules/
├── auth/          # Authentication & Authorization
├── admin/         # Supra Admin & Platform Management
├── tenant/        # Tenant Management & Organization Routes
├── core/           # Core Services (Health, Metrics, Files, Notifications)
├── business/       # Business Logic (HR, Finance, Projects, etc.)
├── monitoring/     # System Monitoring
└── integration/    # External Integrations
```

**Industry-Specific ERP Routes:**

- **Education**: `modules/tenant/erp/education/`
- **Healthcare**: `modules/tenant/erp/healthcare/`
- **Software House**: `modules/business/erp/software-house/` and `modules/tenant/erp/software-house/`

### 5.4 API Architecture

**RESTful API Design:**
- **Base URL**: `/api`
- **Authentication**: JWT tokens in Authorization header or cookies
- **Versioning**: API versioning support
- **Rate Limiting**: Per-endpoint rate limiting
- **Error Handling**: Standardized error responses

**Key API Endpoints:**

- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/supra-admin/*` - Supra Admin operations
- `/api/tenant/*` - Tenant management
- `/api/employees/*` - Employee management
- `/api/attendance/*` - Attendance management
- `/api/payroll/*` - Payroll management
- `/api/finance/*` - Finance management
- `/api/projects/*` - Project management
- `/api/clients/*` - Client management
- `/api/notifications/*` - Notifications
- `/api/files/*` - File management
- `/api/documents/*` - Document Hub (documents, folders, tags, approval, audit)

---

## 6. USE CASE SPECIFICATIONS

### Use Case: UC-01 Tenant Registration & Provisioning

**Name:** Tenant Registration & Provisioning (Self-Serve Signup Only)

**Summary:** **⚠️ SELF-SERVE ONLY** - Users register new tenant organizations through dedicated Software House ERP signup page. Supra Admin cannot create tenants from admin panel.

**Rationale:** Tenant provisioning enables new organizations to self-register and onboard quickly with Software House ERP modules and default data. Supra Admin tenant creation was disabled to enforce self-serve registration flow.

**Users:** Self-Serve Tenant Registration (Software House ERP signup page)

**Preconditions:** 
- User must access Software House ERP signup page
- MongoDB database must be accessible
- Email service must be configured for OTP verification

**Basic Course of Events:**

**Self-Serve Registration Flow:**

**Step 1: User Registration**
1. User navigates to Software House ERP signup page
2. User enters:
   - Full Name
   - Email address
   - Password (with strength validation)
3. System validates email format
4. System checks if email already exists
5. System creates user account (status: pending verification)
6. System sends 6-digit OTP code to email
7. System displays OTP entry screen

**Step 2: Email Verification**
1. User enters 6-digit OTP code from email
2. System validates OTP code (expires after 10 minutes)
3. If OTP incorrect, user can request new code (rate-limited)
4. System marks email as verified
5. System displays organization setup screen

**Step 3: Organization Setup**
1. User enters:
   - Organization Name
   - Organization Slug (auto-generated, can be customized)
2. System checks slug availability in real-time
3. User can optionally provide:
   - Team Size
   - Primary Tech Stack
   - Development Methodology
4. System validates all input data
5. User clicks "Create Workspace" button

**Step 4: Tenant Creation**
1. System generates unique tenantId
2. System creates tenant record with:
   - `erpCategory: 'software_house'`
   - `status: 'pending_setup'`
   - `subscription.plan: 'trial'`
   - `subscription.trialEndDate: 7 days from now`
3. System creates default organization record
4. System links user to organization as tenant admin/owner
5. System assigns `orgId` to user
6. System seeds default data:
   - Default departments (HR, Finance, Project Management, Operations, Sales & Marketing)
   - Default teams within departments
   - Chart of accounts
   - Sample employees and payroll setup
   - Project templates
   - Sample project with tasks
7. System updates tenant status to 'active'
8. System sends welcome email to tenant admin
9. System initializes onboarding checklist
10. System displays success message
11. System redirects user to tenant login page

**Alternative Paths:**
1. Invalid email format → System displays error: "Invalid email format"
2. Email already exists → System displays error: "Email already registered"
3. Weak password → System displays error: "Password must be at least 6 characters"
4. Invalid OTP → System displays error: "Invalid verification code"
5. OTP expired → System displays error: "Code expired, please request a new one"
6. Duplicate tenant slug → System displays error: "Slug already taken, please choose another"
7. Database creation failure → System rolls back transaction, displays error
8. Email sending failure → Tenant created successfully, but welcome email failed (logged as non-critical error)

**Postconditions:** 
- New tenant created with isolated data
- User account verified and active
- User assigned as tenant admin/owner
- Default organization created and linked
- Default data seeded
- Tenant accessible via unique subdomain/slug
- Welcome email sent to tenant admin
- Onboarding checklist initialized
- Tenant status: 'active'

**❌ DISABLED: Supra Admin Creation**
- Supra Admin routes for tenant creation are DISABLED/COMMENTED OUT
- Comments in code: "Tenants must be created through signup pages only"
- Supra Admin can only view, update, suspend, or delete existing tenants

---

### Use Case: UC-02 User Authentication & Login

**Name:** User Authentication & Login

**Summary:** Users authenticate to access the platform with role-based dashboard redirection and session management.

**Rationale:** Secure authentication ensures authorized access to platform features and tenant-specific data with proper role-based permissions.

**Users:** All user types (Supra Admin, Tenant Admin, Managers, Employees, Industry-specific roles)

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
9. System checks rate limiting (5 attempts per 15 minutes)
10. If 2FA enabled, system prompts for verification code
11. System generates JWT access token (expires in 15 minutes)
12. System generates refresh token (expires in 7 days)
13. System stores refresh token in database
14. System logs login activity in audit log
15. System updates user's last login timestamp
16. System redirects user to role-based dashboard

**Alternative Paths:**
1. Invalid credentials → System displays error: "Incorrect email or password"
2. Rate limit exceeded → System displays error: "Too many login attempts. Please try again later."
3. Account inactive → System displays error: "Account is inactive, contact administrator"
4. Account suspended → System displays error: "Account suspended, contact support"
5. Tenant inactive → System displays error: "Your organization's subscription is inactive"
6. 2FA code incorrect → System displays error: "Invalid verification code"
7. Session expired → System redirects to login page

**Postconditions:** 
- User is authenticated with active session
- JWT token stored in browser (httpOnly cookie or localStorage)
- Refresh token stored in database
- User redirected to appropriate dashboard
- Login activity logged in audit log
- Last login timestamp updated

---

### Use Case: UC-03 Industry-Specific Module Access

**Name:** Industry-Specific Module Access

**Summary:** Users access industry-specific modules based on tenant configuration and role permissions, with module access restrictions enforced.

**Rationale:** Industry-specific modules provide tailored functionality for different business domains while maintaining common ERP capabilities.

**Users:** Tenant Admin, Managers, Employees, Industry-specific roles

**Preconditions:** 
- User must be logged in
- Tenant must have industry-specific modules enabled
- User must have appropriate role permissions

**Basic Course of Events:**

**Software House Module:**
1. User navigates to Software House section
2. System checks ERP category (must be "software_house")
3. System displays Software House menu: Projects (Nucleus), Time Tracking, Client Portal, Code Quality, Development Methodology, Tech Stack, Software House Roles, Software House Attendance
4. System allows access to all common modules (HR, Finance, Projects)
5. User accesses Nucleus project management system:
   - Creates/selects workspace
   - Creates projects using templates or custom setup
   - Manages deliverables with Gantt visualization
   - Submits deliverables for sequential approval
   - Creates and manages change requests
   - Views analytics and reports
6. User manages time tracking for billable hours
7. User manages clients and project portfolios
8. System tracks development metrics and team performance

**Alternative Paths:**
1. Module not enabled → System displays message: "This module is not available for your tenant"
2. Module access restricted → System displays error: "This module is not available for your ERP category"
3. Insufficient permissions → System displays error: "You do not have permission to access this module"
4. Data not found → System displays message: "No records found"

**Postconditions:** 
- User accesses industry-specific features
- Data displayed according to role permissions
- Actions logged in audit log
- Database updated with changes
- Module access restrictions enforced

---

### Use Case: UC-04 Nucleus Project Management

**Name:** Nucleus Project Management (Software House ERP)

**Summary:** Project managers and developers use the Nucleus system to manage software projects with deliverables, approvals, and client portal access.

**Rationale:** Advanced project management system provides structured workflow for software development projects with client visibility.

**Users:** Project Manager, Developer, Client (read-only)

**Preconditions:** 
- User must be logged in
- Tenant must have Software House ERP category
- User must have appropriate role permissions
- Workspace must exist

**Basic Course of Events:**

**Creating a Project:**
1. Project Manager navigates to Nucleus section
2. Manager selects workspace or creates new workspace
3. Manager creates project using template (Web Development, Mobile App, API Development) or custom
4. System creates project with default phases and deliverables
5. Manager configures project settings (timeline, budget, team)
6. System initializes project dashboard
7. System sends notifications to team members

**Managing Deliverables:**
1. Manager creates deliverables with dates and dependencies
2. System displays deliverables in Gantt chart view
3. Developer updates deliverable status
4. System auto-calculates project progress
5. Manager submits deliverable for approval
6. System triggers sequential approval workflow
7. Approvers review and approve/reject deliverables
8. System updates deliverable status
9. System notifies stakeholders

**Change Request Management:**
1. Client or team member creates change request
2. System logs change request with details
3. Manager evaluates change request
4. Manager approves/rejects change request
5. If approved, system updates project timeline and deliverables
6. System notifies all stakeholders

**Client Portal Access:**
1. Client logs into client portal
2. System displays read-only Gantt chart (deliverables only)
3. Client views project progress
4. Client creates change requests
5. Client views invoices and billing information
6. System restricts access to internal project details

**Alternative Paths:**
1. Invalid date dependencies → System displays error: "Deliverable dates conflict with dependencies"
2. Approval workflow violation → System prevents status change
3. Insufficient permissions → System displays error: "You do not have permission"
4. Workspace not found → System displays error: "Workspace not found"

**Postconditions:** 
- Project created and managed
- Deliverables tracked with Gantt visualization
- Approval workflow executed
- Change requests processed
- Client portal updated
- Analytics updated

---

### Use Case: UC-05 Module Access Control Enforcement

**Name:** Module Access Control Enforcement

**Summary:** **⚠️ INFRASTRUCTURE EXISTS BUT NOT ACTIVELY ENFORCED** - System has middleware and logic to enforce module access restrictions based on ERP category, but currently not active since only Software House ERP exists.

**Rationale:** Module access control would ensure that tenants only access modules appropriate for their industry category when multiple ERP categories exist.

**Users:** All authenticated users (when multiple ERP categories exist)

**Preconditions:** 
- User must be logged in
- Tenant must have ERP category assigned
- Multiple ERP categories must exist (currently only Software House exists)

**Current Status:**
- **Middleware exists**: `moduleAccessControl.js` with `requireModuleAccess()` function
- **Frontend filtering exists**: `industryMenuBuilder.js` filters modules by ERP category
- **Not actively enforced**: Since only Software House ERP exists, all modules are available to all tenants
- **Future use**: If Education or Healthcare ERP were added, they would NOT have access to HR, Finance, Projects modules

**Basic Course of Events (When Multiple ERPs Exist):**
1. User attempts to access a module (e.g., HR, Finance, Projects)
2. System checks tenant's ERP category
3. System checks module access map:
   - Education: HR, Finance, Projects NOT available
   - Healthcare: HR, Finance, Projects NOT available
   - Warehouse: HR, Finance, Projects NOT available
   - Retail: Projects NOT available (HR and Finance available)
   - Software House: All modules available
   - Business: All modules available
4. If module is restricted:
   - System returns 403 Forbidden error
   - System displays helpful error message with alternative suggestions
   - System logs access attempt in audit log
5. If module is available:
   - System allows access
   - System processes request normally

**Alternative Paths:**
1. Module restricted → System returns 403 with helpful message
2. ERP category not set → System defaults to most restrictive access
3. Frontend menu filtering → System hides restricted modules from navigation

**Postconditions:** 
- Module access restrictions enforced (when multiple ERPs exist)
- Unauthorized access prevented
- Audit log updated
- User receives appropriate error message

**Note**: Currently, this use case is not active since only Software House ERP exists and all modules are available to all tenants.

---

## 7. SECURITY REQUIREMENTS

### 7.1 Authentication & Authorization

- **Secure Authentication**: JWT-based authentication with token expiration
- **Password Security**: bcrypt hashing with minimum 10 rounds
- **Rate Limiting**: 5 login attempts per 15 minutes, 3 signup attempts per hour
- **Session Management**: Refresh token mechanism with 7-day expiration
- **Role-Based Access Control**: Granular permissions at API and UI levels
- **Two-Factor Authentication**: TOTP-based 2FA support

### 7.2 Data Security

- **Data Encryption**: HTTPS/TLS for data in transit
- **Tenant Isolation**: Complete data isolation using tenantId/orgId filtering
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries with Mongoose
- **XSS Prevention**: Content sanitization
- **CSRF Protection**: CSRF tokens for state-changing operations
- **TLS Verification**: HIPAA compliance verification

### 7.3 Application Security

- **Rate Limiting**: Per-endpoint rate limiting
- **Request Size Limits**: 5MB for JSON, 100MB for file uploads
- **File Upload Security**: File type validation, size limits, virus scanning (optional)
- **API Security**: Helmet.js security headers, CORS configuration
- **Error Handling**: Secure error messages without exposing system details

### 7.4 Audit & Compliance

- **Audit Logging**: All critical operations logged
- **Security Monitoring**: Failed login tracking, suspicious activity detection
- **Compliance**: GDPR, FERPA, HIPAA, SOX compliance features
- **Data Retention**: Configurable data retention policies
- **Right to Deletion**: GDPR-compliant data deletion

---

## 8. PERFORMANCE REQUIREMENTS

### 8.1 Response Time

- **API Endpoints**: 500ms for standard operations (95th percentile)
- **Dashboard Load**: 2-3 seconds for initial load
- **Database Queries**: 500ms for 99% of queries
- **Real-Time Updates**: Less than 100ms latency

### 8.2 Scalability

- **Concurrent Users**: Minimum 100 concurrent users per tenant
- **Horizontal Scaling**: Stateless API design supports horizontal scaling
- **Database Scaling**: MongoDB sharding support
- **Caching**: Redis caching for frequently accessed data

### 8.3 Resource Requirements

**Server (Recommended):**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB+ SSD
- Network: 1Gbps

**Database (Recommended):**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: SSD-based, scalable

---

## 9. APPENDICES

### 9.1 Module Access Matrix

| ERP Category | Status | Dashboard | Users | Settings | Reports | HR | Finance | Projects |
|--------------|--------|-----------|-------|----------|---------|----|---------| --------| 
| **Software House** | ✅ Fully Implemented | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Business** | ⚠️ Infrastructure Only | ✅ | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* |
| **Warehouse** | ⚠️ Infrastructure Only | ✅ | ✅ | ✅ | ✅ | ❌* | ❌* | ❌* |
| **Education** | ❌ Legacy/Not Active | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Healthcare** | ❌ Legacy/Not Active | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Retail** | ❌ Not Implemented | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **Manufacturing** | ❌ Not Implemented | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Note**: 
- ✅* = Would be available if ERP category was implemented
- ❌* = Would be restricted if ERP category was implemented (as per module access control logic)
- Currently, only Software House ERP is active, so all modules are available to all tenants
- Module access restrictions are not enforced since there's only one ERP category
- Infrastructure exists to enforce restrictions if other ERP categories are added

### 9.2 Technology Versions

- **Node.js**: 18.x
- **Express**: 4.18.x
- **React**: 18.x
- **MongoDB**: 7.x
- **Mongoose**: 7.5.x
- **JWT**: jsonwebtoken 9.x
- **Socket.IO**: 4.7.x

### 9.3 API Endpoint Summary

**Total API Endpoints**: 300+

- **Auth Module**: ~20 endpoints
- **Admin Module**: ~50 endpoints
- **Tenant Module**: ~80 endpoints
- **Business Module**: ~100 endpoints
- **Core Module**: ~30 endpoints
- **Integration Module**: ~20 endpoints

### 9.4 Database Collections

**Core Collections:**
- `tenants` - Tenant information
- `users` - User accounts
- `organizations` - Organization data
- `roles` - Role definitions
- `permissions` - Permission definitions

**Business Collections:**
- `employees` - Employee information
- `departments` - Department definitions
- `attendance` - Attendance records
- `payroll` - Payroll data
- `accounts` - Financial accounts
- `transactions` - Financial transactions
- `projects` - Project data
- `tasks` - Task data
- `clients` - Client information

**Software House Collections:**
- `workspaces` - Nucleus workspaces for project organization
- `deliverables` - Project deliverables with Gantt chart data
- `approvals` - Deliverable approval workflow records
- `change_requests` - Change request management
- `software_house_roles` - Software House specific roles
- `development_metrics` - Development team metrics
- `time_entries` - Time tracking records
- `documents` - Document Hub documents (created and uploaded)
- `document_folders` - Document Hub folder organization
- `document_tags` - Document Hub tags/labels
- `document_versions` - Document version history
- `document_audit_logs` - Document Hub audit trail

---

## 10. DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | February 17, 2026 | TWS Development Team | Complete system state documentation based on current implementation |

---

**Status:** ✅ **CURRENT SYSTEM STATE DOCUMENTATION**

**Last Updated:** February 17, 2026

**Document Owner:** TWS Development Team

---

**END OF SOFTWARE REQUIREMENTS SPECIFICATION**
