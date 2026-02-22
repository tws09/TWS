# Entity Relationship Diagram (ERD)
## TWS Multi-Tenant Enterprise Resource Planning (ERP) Platform

The ERD illustrates the relational architecture of the TWS Multi-Tenant ERP system, detailing how Supra Admins manage tenants, how tenants configure their organizations, and how users interact with industry-specific modules and common ERP functionalities through structured relationships.

---

## Fig 7.1 Entity Relationship Diagram

---

## Database Schema

### 1. SupraAdmin Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SupraAdminId | ObjectId | PK – Auto Generated |
| Email | String | UNIQUE, NOT NULL, Lowercase |
| Password | String | NOT NULL, Hashed (bcrypt) |
| FullName | String | NOT NULL |
| Role | String | Enum: 'super_admin', 'admin', 'support', 'billing', Default: 'admin' |
| Permissions | Object | Nested: tenantManagement, billingManagement, userManagement, systemSettings, analytics |
| Status | String | Enum: 'active', 'suspended', 'inactive', Default: 'active' |
| TwoFAEnabled | Boolean | Default: false |
| TwoFASecret | String | Optional, Hidden |
| LastLogin | Date | Optional |
| ProfilePicUrl | String | Optional |
| Phone | String | Optional |
| RefreshTokens | Array | Array of tokens with expiration |
| ActivityLog | Array | Array of activity records |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 2. Tenant Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| TenantId | ObjectId | PK – Auto Generated |
| Name | String | NOT NULL |
| Slug | String | UNIQUE, NOT NULL, Lowercase |
| Description | String | Optional |
| ContactInfo | Object | Nested: email, phone, website, address |
| BusinessInfo | Object | Nested: industry, companySize, taxId, registrationNumber |
| ErpCategory | String | Enum: 'business', 'education', 'warehouse', 'healthcare', 'retail', 'manufacturing', 'software_house', Default: 'business' |
| EducationConfig | Object | Optional, Only for education ERP |
| SoftwareHouseConfig | Object | Optional, Only for software_house ERP |
| ErpModules | Array | Array of enabled module strings |
| Subscription | Object | Nested: plan, status, billingCycle, price, currency, trialStartDate, trialEndDate, etc. |
| Features | Object | Nested: maxUsers, maxProjects, maxStorage, integrations, apiAccess, etc. |
| Branding | Object | Nested: logo, primaryColor, secondaryColor, customDomain, favicon |
| Settings | Object | Nested: timezone, dateFormat, currency, language, workingHours |
| Status | String | Enum: 'active', 'suspended', 'cancelled', 'pending_setup', Default: 'pending_setup' |
| Database | Object | Nested: name, connectionString, lastBackup, backupFrequency |
| Usage | Object | Nested: totalUsers, totalProjects, totalStorage, lastActivity, monthlyActiveUsers |
| Onboarding | Object | Nested: completed, steps, welcomeEmailSent |
| OwnerCredentials | Object | Nested: username, password (hashed), email, fullName, isActive, lastLogin |
| CreatedBy | ObjectId | FK → SupraAdmin(SupraAdminId) |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 3. Organization Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| OrganizationId | ObjectId | PK – Auto Generated |
| Name | String | NOT NULL |
| Slug | String | UNIQUE, NOT NULL, Lowercase |
| Description | String | Optional |
| Logo | String | Optional |
| Website | String | Optional |
| Industry | String | Optional |
| Size | String | Enum: '1-10', '11-50', '51-200', '201-500', '500+', Default: '1-10' |
| BillingInfo | Object | Nested: companyName, address, taxId, billingEmail, paymentMethod |
| Plan | String | Enum: 'free', 'starter', 'professional', 'enterprise', Default: 'free' |
| Settings | Object | Nested: timezone, dateFormat, currency, workingHours, features |
| Status | String | Enum: 'active', 'suspended', 'cancelled', Default: 'active' |
| Subscription | Object | Nested: status, currentPeriodStart, currentPeriodEnd, trialEndsAt |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 4. TenantSettings Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SettingsId | ObjectId | PK – Auto Generated |
| TenantId | String | NOT NULL, UNIQUE, Indexed |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL, Indexed |
| General | Object | Nested: organizationName, timezone, dateFormat, timeFormat, language, currency |
| Notifications | Object | Nested: emailNotifications, pushNotifications, smsNotifications, taskReminders, etc. |
| Security | Object | Nested: twoFactorAuth, sessionTimeout, passwordPolicy, requireStrongPassword, loginAlerts |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 5. User Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| UserId | ObjectId | PK – Auto Generated |
| Email | String | UNIQUE, NOT NULL, Lowercase |
| Password | String | NOT NULL, Hashed (bcrypt), MinLength: 6 |
| FullName | String | NOT NULL |
| Role | String | Enum: Multiple roles (super_admin, org_manager, owner, admin, employee, principal, teacher, student, doctor, patient, etc.), Default: 'employee' |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TeamIds | Array | Array of ObjectIds → Team(TeamId) |
| ManagerId | ObjectId | FK → User(UserId), Self-referencing |
| Status | String | Enum: 'active', 'suspended', 'inactive', Default: 'active' |
| TwoFAEnabled | Boolean | Default: false |
| TwoFASecret | String | Optional, Hidden |
| LastLogin | Date | Optional |
| ProfilePicUrl | String | Optional |
| Phone | String | Optional |
| Department | String | Optional |
| JobTitle | String | Optional |
| HireDate | Date | Optional |
| RefreshTokens | Array | Array of tokens with expiration |
| SoftwareHouseRole | ObjectId | FK → SoftwareHouseRole(SoftwareHouseRoleId), Optional |
| GoogleAccessToken | String | Optional, Hidden |
| GoogleRefreshToken | String | Optional, Hidden |
| MicrosoftAccessToken | String | Optional, Hidden |
| MicrosoftRefreshToken | String | Optional, Hidden |
| ZoomApiKey | String | Optional, Hidden |
| ZoomApiSecret | String | Optional, Hidden |
| Timezone | String | Default: 'UTC' |
| BusinessHours | Object | Nested: start, end, days |
| MeetingPreferences | Object | Nested: defaultDuration, defaultReminders, autoAcceptMeetings, etc. |
| ExpoPushToken | String | Optional |
| NotificationSettings | Object | Nested: email, sms, push, meetingReminders, etc. |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 6. Department Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| DepartmentId | ObjectId | PK – Auto Generated |
| Name | String | NOT NULL |
| Code | String | NOT NULL, Uppercase |
| Description | String | Optional |
| TenantId | ObjectId | FK → Tenant(TenantId), Optional |
| OrgId | ObjectId | FK → Organization(OrganizationId), Optional |
| ParentDepartment | ObjectId | FK → Department(DepartmentId), Self-referencing |
| ChildDepartments | Array | Array of ObjectIds → Department(DepartmentId) |
| DepartmentHead | ObjectId | FK → User(UserId), Optional |
| Settings | Object | Nested: allowExternalAccess, requireApproval, maxUsers, sessionTimeout, etc. |
| DefaultPermissions | Array | Array of permission strings |
| Status | String | Enum: 'active', 'inactive', 'archived', Default: 'active' |
| Stats | Object | Nested: totalUsers, activeUsers, totalSessions, lastActivity, dataSize |
| CreatedBy | ObjectId | FK → SupraAdmin(SupraAdminId), NOT NULL |
| Metadata | Object | Optional |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 7. Employee Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| EmployeeId | ObjectId | PK – Auto Generated |
| UserId | ObjectId | FK → User(UserId), NOT NULL, UNIQUE |
| EmployeeId | String | NOT NULL, UNIQUE |
| JobTitle | String | NOT NULL |
| Department | String | NOT NULL |
| HireDate | Date | NOT NULL |
| ContractType | String | Enum: 'full-time', 'part-time', 'contract', 'intern', Default: 'full-time' |
| Salary | Object | Nested: base, currency, payFrequency, components, bonuses, totalCompensation |
| BankDetails | Object | Nested: accountNumber (encrypted), bankName, routingNumber (encrypted), accountType |
| TaxId | String | Encrypted |
| Documents | Array | Array of document objects |
| LeaveBalance | Object | Nested: annual, sick, personal |
| PerformanceNotes | Array | Array of performance note objects |
| EmergencyContact | Object | Nested: name, relationship, phone, email |
| Address | Object | Nested: street, city, state, zipCode, country |
| Skills | Array | Array of skill objects |
| ReportingManager | ObjectId | FK → User(UserId), Optional |
| ProbationEndDate | Date | Optional |
| Status | String | Enum: 'active', 'probation', 'terminated', 'on-leave', 'resigned', 'retired', Default: 'active' |
| Benefits | Object | Nested: healthInsurance, dentalInsurance, visionInsurance, retirementPlan, etc. |
| WorkSchedule | Object | Nested: type, hoursPerWeek, workDays, startTime, endTime, timezone |
| PerformanceMetrics | Object | Nested: overallRating, lastReviewDate, nextReviewDate, goals, competencies, productivityScore, etc. |
| CareerDevelopment | Object | Nested: careerLevel, promotionEligibility, nextPromotionDate, careerPath, mentorship |
| Compliance | Object | Nested: backgroundCheck, drugTest, certifications |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 8. Team Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| TeamId | ObjectId | PK – Auto Generated |
| Name | String | NOT NULL |
| Description | String | Optional |
| TeamLead | ObjectId | FK → Employee(EmployeeId), Optional |
| Members | Array | Array of ObjectIds → Employee(EmployeeId) |
| Department | String | Optional |
| Project | ObjectId | FK → Project(ProjectId), Optional |
| Status | String | Enum: 'active', 'inactive', 'archived', Default: 'active' |
| Skills | Array | Array of skill strings |
| Capacity | Number | Default: 0 |
| Utilization | Number | Default: 0 |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 9. Project Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| ProjectId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| WorkspaceId | ObjectId | FK → Workspace(WorkspaceId), Optional |
| ClientId | ObjectId | FK → ProjectClient(ClientId), NOT NULL |
| Name | String | NOT NULL |
| Slug | String | NOT NULL, Lowercase, UNIQUE per org |
| Description | String | Optional |
| ProjectType | String | Enum: 'web_application', 'mobile_app', 'api_development', 'system_integration', 'maintenance_support', 'consulting', 'general', Default: 'general' |
| Methodology | String | Enum: 'agile', 'scrum', 'kanban', 'waterfall', 'hybrid', Default: 'agile' |
| TechStack | Object | Nested: frontend, backend, database, cloud, tools (all arrays) |
| Status | String | Enum: 'planning', 'active', 'on_hold', 'completed', 'cancelled', Default: 'planning' |
| Priority | String | Enum: 'low', 'medium', 'high', 'urgent', Default: 'medium' |
| Budget | Object | Nested: total, currency, spent, remaining |
| Timeline | Object | Nested: startDate, endDate, estimatedHours, actualHours |
| TemplateId | ObjectId | FK → ProjectTemplate(ProjectTemplateId), Optional |
| Settings | Object | Nested: allowClientAccess, clientCanComment, clientCanApprove, requireApproval, portalSettings |
| Tags | Array | Array of tag strings |
| CustomFields | Array | Array of custom field objects |
| Files | Array | Array of file objects |
| Metrics | Object | Nested: completionRate, onTimeDelivery, clientSatisfaction, profitMargin |
| Profitability | Object | Nested: budgetedRevenue, actualRevenue, budgetedCost, actualCost, margin, marginPercentage, hourlyRate, billableHours, nonBillableHours |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 10. Task Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| TaskId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| ProjectId | ObjectId | FK → Project(ProjectId), NOT NULL |
| BoardId | ObjectId | FK → Board(BoardId), Optional |
| ListId | ObjectId | FK → List(ListId), Optional |
| Title | String | NOT NULL |
| Description | String | Optional |
| Status | String | Enum: 'todo', 'in_progress', 'under_review', 'completed', 'cancelled', Default: 'todo' |
| Priority | String | Enum: 'low', 'medium', 'high', 'critical', Default: 'medium' |
| Assignee | ObjectId | FK → User(UserId), Optional |
| Reporter | ObjectId | FK → User(UserId), NOT NULL |
| DueDate | Date | Optional |
| StartDate | Date | Optional |
| CompletedDate | Date | Optional |
| EstimatedHours | Number | Min: 0 |
| ActualHours | Number | Default: 0, Min: 0 |
| Labels | Array | Array of label strings |
| Tags | Array | Array of tag strings |
| Attachments | Array | Array of attachment objects |
| Comments | Array | Array of comment objects |
| Subtasks | Array | Array of subtask objects |
| Dependencies | Array | Array of dependency objects |
| TimeEntries | Array | Array of time entry objects |
| CustomFields | Array | Array of custom field objects |
| Settings | Object | Nested: isPrivate, allowComments, notifyAssignee, autoArchive |
| Progress | Number | Min: 0, Max: 100, Default: 0 |
| Order | Number | Default: 0 |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 11. Client Table (ProjectClient)

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| ClientId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| Name | String | NOT NULL |
| Slug | String | NOT NULL, Lowercase, UNIQUE per org |
| Type | String | Enum: 'individual', 'company', Default: 'company' |
| Contact | Object | Nested: primary, billing, technical (each with name, email, phone, title) |
| Company | Object | Nested: name, website, industry, size, description |
| Address | Object | Nested: street, city, state, zipCode, country |
| Billing | Object | Nested: currency, paymentTerms, taxRate, discount |
| Portal | Object | Nested: enabled, accessLevel, customDomain, branding |
| Notes | String | Optional |
| Tags | Array | Array of tag strings |
| Status | String | Enum: 'active', 'inactive', 'prospect', Default: 'active' |
| LastContact | Date | Optional |
| TotalProjects | Number | Default: 0 |
| TotalRevenue | Number | Default: 0 |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 12. Finance - ChartOfAccounts Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| AccountId | ObjectId | PK – Auto Generated |
| Code | String | NOT NULL, UNIQUE |
| Name | String | NOT NULL |
| Type | String | Enum: 'asset', 'liability', 'equity', 'revenue', 'expense', NOT NULL |
| ParentAccount | ObjectId | FK → ChartOfAccounts(AccountId), Self-referencing, Optional |
| Level | Number | Default: 1 |
| IsActive | Boolean | Default: true |
| Description | String | Optional |
| Tags | Array | Array of tag strings |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 13. Finance - Transaction Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| TransactionId | ObjectId | PK – Auto Generated |
| Type | String | Enum: 'expense', 'revenue', 'investment', 'transfer', 'loan', 'payroll', 'billing', NOT NULL |
| Category | String | NOT NULL |
| Subcategory | String | Optional |
| Amount | Number | NOT NULL |
| Currency | String | Default: 'USD' |
| Date | Date | NOT NULL, Default: Date.now |
| Description | String | NOT NULL |
| Reference | String | Optional |
| AccountId | ObjectId | FK → ChartOfAccounts(AccountId), Optional |
| Tags | Array | Array of tag strings |
| RelatedInvoiceId | ObjectId | FK → Invoice(InvoiceId), Optional |
| RelatedProjectId | ObjectId | FK → Project(ProjectId), Optional |
| RelatedTimeEntryId | ObjectId | FK → TimeEntry(TimeEntryId), Optional |
| Vendor | Object | Nested: name, contact, email, vendorId |
| Client | Object | Nested: name, contact, email, clientId |
| Attachments | Array | Array of attachment objects |
| Status | String | Enum: 'pending', 'approved', 'rejected', 'paid', 'reconciled', Default: 'pending' |
| ApprovedBy | ObjectId | FK → User(UserId), Optional |
| ApprovedAt | Date | Optional |
| Recurring | Object | Nested: enabled, frequency, endDate |
| TaxDeductible | Boolean | Default: false |
| ExchangeRate | Number | Optional |
| BankReconciliation | Object | Nested: reconciled, reconciledAt, reconciledBy, bankTransactionId |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 14. Finance - Invoice Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| InvoiceId | ObjectId | PK – Auto Generated |
| InvoiceNumber | String | NOT NULL, UNIQUE |
| ClientId | ObjectId | FK → Client(ClientId), Optional |
| ClientName | String | Optional |
| ClientEmail | String | Optional |
| ClientAddress | Object | Nested: street, city, state, zipCode, country |
| IssueDate | Date | NOT NULL |
| DueDate | Date | NOT NULL |
| Items | Array | Array of item objects (description, quantity, unitPrice, total, taxRate, projectId, timeEntryIds) |
| Subtotal | Number | Optional |
| TaxAmount | Number | Optional |
| Total | Number | Optional |
| Currency | String | Default: 'USD' |
| Status | String | Enum: 'draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid', Default: 'draft' |
| PaymentTerms | String | Enum: 'net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', Default: 'net_30' |
| Notes | String | Optional |
| Attachments | Array | Array of attachment objects |
| PaidAt | Date | Optional |
| PaymentMethod | String | Optional |
| PaidAmount | Number | Default: 0 |
| RemainingAmount | Number | Optional |
| BillingType | String | Enum: 'time_materials', 'fixed_price', 'milestone', 'retainer', 'subscription', Default: 'time_materials' |
| Recurring | Object | Nested: enabled, frequency, nextBillingDate |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 15. AuditLog Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| AuditLogId | ObjectId | PK – Auto Generated |
| TenantId | String | NOT NULL, Indexed |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL, Indexed |
| UserId | ObjectId | FK → User(UserId), NOT NULL, Indexed |
| UserEmail | String | NOT NULL, Indexed |
| UserRole | String | NOT NULL |
| Action | String | Enum: Multiple actions (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.), NOT NULL |
| Resource | String | Enum: 'USER', 'ORGANIZATION', 'TENANT', 'PROJECT', 'CLIENT', etc., NOT NULL |
| ResourceId | String | Indexed |
| RequestId | String | Indexed |
| SessionId | String | Indexed |
| IpAddress | String | NOT NULL |
| UserAgent | String | Optional |
| Method | String | Enum: 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', etc. |
| Endpoint | String | Optional |
| Changes | Object | Nested: before, after, fields |
| Metadata | Object | Optional |
| Compliance | Object | Nested: gdprRelevant, dataSubject, legalBasis, retentionPeriod, dataCategories |
| Security | Object | Nested: riskLevel, suspiciousActivity, geolocation, deviceFingerprint |
| Result | Object | Nested: status, errorCode, errorMessage, responseTime, recordsAffected |
| Timestamp | Date | NOT NULL, Default: Date.now, Indexed |
| ExpiresAt | Date | Indexed (TTL) |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 16. Education - Student Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| StudentId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| StudentId | String | NOT NULL, UNIQUE |
| PersonalInfo | Object | Nested: firstName, lastName, middleName, dateOfBirth, gender, nationality, bloodGroup, emergencyContact |
| ContactInfo | Object | Nested: email (UNIQUE), phone, address |
| AcademicInfo | Object | Nested: admissionDate, admissionNumber (UNIQUE), classId, section, rollNumber, academicYear, status, previousSchool, transferCertificate |
| GuardianInfo | Object | Nested: father, mother, guardian (each with name, occupation, phone, email, address) |
| MedicalInfo | Object | Nested: allergies, medications, medicalConditions, doctorName, doctorPhone |
| Documents | Array | Array of document objects |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 17. Education - Teacher Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| TeacherId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| EmployeeId | String | NOT NULL, UNIQUE |
| PersonalInfo | Object | Nested: firstName, lastName, middleName, dateOfBirth, gender, maritalStatus, nationality |
| ContactInfo | Object | Nested: email (UNIQUE), phone, address |
| ProfessionalInfo | Object | Nested: employeeId, joiningDate, department, designation, qualification, experience, subjects, classes, status |
| SalaryInfo | Object | Nested: basicSalary, allowances, bankDetails |
| Documents | Array | Array of document objects |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 18. Education - Class Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| ClassId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| ClassName | String | NOT NULL |
| ClassCode | String | NOT NULL, UNIQUE |
| AcademicYear | String | NOT NULL |
| Section | String | Optional |
| Capacity | Number | Default: 30 |
| CurrentStrength | Number | Default: 0 |
| ClassTeacher | ObjectId | FK → Teacher(TeacherId), Optional |
| Subjects | Array | Array of subject objects (subject, teacher, weeklyHours) |
| Schedule | Array | Array of schedule objects (day, periods) |
| Room | String | Optional |
| Status | String | Enum: 'active', 'inactive', 'completed', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 19. Education - Grade Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| GradeId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| StudentId | ObjectId | FK → Student(StudentId), NOT NULL |
| ClassId | ObjectId | FK → Class(ClassId), NOT NULL |
| Subject | String | NOT NULL |
| ExamType | String | Enum: 'quiz', 'midterm', 'final', 'assignment', 'project', 'practical', NOT NULL |
| ExamDate | Date | Optional |
| MarksObtained | Number | NOT NULL |
| TotalMarks | Number | NOT NULL |
| Percentage | Number | Optional |
| Grade | String | Optional |
| Remarks | String | Optional |
| TeacherId | ObjectId | FK → Teacher(TeacherId), Optional |
| AcademicYear | String | Optional |
| Term | String | Optional |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 20. Education - Course Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| CourseId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| CourseName | String | NOT NULL |
| CourseCode | String | NOT NULL, UNIQUE |
| Description | String | Optional |
| Credits | Number | Optional |
| Duration | String | Enum: 'semester', 'year', 'quarter', 'month' |
| Prerequisites | Array | Array of prerequisite strings |
| Objectives | Array | Array of objective strings |
| Syllabus | Array | Array of syllabus objects (topic, description, duration) |
| Assessment | Object | Nested: assignments, quizzes, midterm, final, project |
| Resources | Array | Array of resource objects |
| Status | String | Enum: 'active', 'inactive', 'archived', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 21. Education - AcademicYear Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| AcademicYearId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| YearName | String | NOT NULL, UNIQUE |
| StartDate | Date | NOT NULL |
| EndDate | Date | NOT NULL |
| Terms | Array | Array of term objects (termName, startDate, endDate, isActive) |
| Holidays | Array | Array of holiday objects (name, date, type) |
| IsCurrent | Boolean | Default: false |
| Status | String | Enum: 'upcoming', 'active', 'completed', 'cancelled', Default: 'upcoming' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 22. Healthcare - Patient Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| PatientId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| PatientId | String | NOT NULL, UNIQUE |
| PersonalInfo | Object | Nested: firstName, lastName, middleName, dateOfBirth, gender, bloodGroup, maritalStatus, nationality, occupation |
| ContactInfo | Object | Nested: email, phone (NOT NULL), address, emergencyContact |
| MedicalInfo | Object | Nested: allergies, currentMedications, medicalHistory, familyHistory, vitalSigns |
| InsuranceInfo | Object | Nested: provider, policyNumber, groupNumber, coverageType, copay, deductible, expiryDate |
| RegistrationDate | Date | Default: Date.now |
| Status | String | Enum: 'active', 'inactive', 'deceased', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 23. Healthcare - Doctor Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| DoctorId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| EmployeeId | String | NOT NULL, UNIQUE |
| PersonalInfo | Object | Nested: firstName, lastName, middleName, dateOfBirth, gender, nationality |
| ContactInfo | Object | Nested: email (UNIQUE), phone, address |
| ProfessionalInfo | Object | Nested: employeeId, joiningDate, department, specialization, designation, licenseNumber (UNIQUE), licenseExpiry, qualification, experience, consultationFee, followUpFee, status |
| Schedule | Object | Nested: workingDays, workingHours, breakTime, consultationDuration, maxPatientsPerDay |
| Documents | Array | Array of document objects |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 24. Healthcare - Appointment Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| AppointmentId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| AppointmentId | String | NOT NULL, UNIQUE |
| PatientId | ObjectId | FK → Patient(PatientId), NOT NULL |
| DoctorId | ObjectId | FK → Doctor(DoctorId), NOT NULL |
| AppointmentDate | Date | NOT NULL |
| AppointmentTime | String | NOT NULL |
| Duration | Number | Default: 30 (minutes) |
| Type | String | Enum: 'consultation', 'follow_up', 'emergency', 'surgery', 'checkup', 'vaccination', Default: 'consultation' |
| Status | String | Enum: 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', Default: 'scheduled' |
| Reason | String | Optional |
| Symptoms | Array | Array of symptom strings |
| Diagnosis | String | Optional |
| Treatment | String | Optional |
| Prescription | Array | Array of prescription objects |
| FollowUpRequired | Boolean | Default: false |
| FollowUpDate | Date | Optional |
| Notes | String | Optional |
| CreatedBy | ObjectId | FK → User(UserId), Optional |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 25. Healthcare - MedicalRecord Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| MedicalRecordId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| RecordId | String | NOT NULL, UNIQUE |
| PatientId | ObjectId | FK → Patient(PatientId), NOT NULL |
| DoctorId | ObjectId | FK → Doctor(DoctorId), NOT NULL |
| AppointmentId | ObjectId | FK → Appointment(AppointmentId), Optional |
| RecordDate | Date | Default: Date.now |
| RecordType | String | Enum: 'consultation', 'lab_result', 'imaging', 'surgery', 'vaccination', 'emergency', 'other', NOT NULL |
| ChiefComplaint | String | Optional |
| HistoryOfPresentIllness | String | Optional |
| PhysicalExamination | Object | Nested: vitalSigns, generalAppearance, cardiovascular, respiratory, gastrointestinal, neurological, musculoskeletal, skin, other |
| Diagnosis | Array | Array of diagnosis objects (primary, secondary, icd10Code) |
| Treatment | Object | Nested: medications, procedures, recommendations |
| LabResults | Array | Array of lab result objects |
| ImagingResults | Array | Array of imaging result objects |
| FollowUp | Object | Nested: required, date, instructions |
| Attachments | Array | Array of attachment objects |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 26. Healthcare - Prescription Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| PrescriptionId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| PrescriptionId | String | NOT NULL, UNIQUE |
| PatientId | ObjectId | FK → Patient(PatientId), NOT NULL |
| DoctorId | ObjectId | FK → Doctor(DoctorId), NOT NULL |
| AppointmentId | ObjectId | FK → Appointment(AppointmentId), Optional |
| PrescriptionDate | Date | Default: Date.now |
| Medications | Array | Array of medication objects (name, genericName, dosage, frequency, duration, quantity, instructions, sideEffects, contraindications) |
| Instructions | String | Optional |
| FollowUpDate | Date | Optional |
| Status | String | Enum: 'active', 'completed', 'cancelled', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 27. Retail - Product Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| ProductId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| ProductId | String | NOT NULL, UNIQUE |
| Name | String | NOT NULL |
| Description | String | Optional |
| SKU | String | NOT NULL, UNIQUE |
| Barcode | String | Optional |
| Category | ObjectId | FK → Category(CategoryId), NOT NULL |
| Brand | String | Optional |
| Model | String | Optional |
| Specifications | Object | Optional (Mixed type) |
| Pricing | Object | Nested: costPrice, sellingPrice, margin, markup, currency |
| Inventory | Object | Nested: currentStock, minimumStock, maximumStock, reorderPoint, reorderQuantity, unit, location, warehouse |
| Supplier | ObjectId | FK → Supplier(SupplierId), Optional |
| Images | Array | Array of image objects |
| Dimensions | Object | Nested: length, width, height, weight, unit |
| ExpiryDate | Date | Optional |
| Warranty | Object | Nested: period, unit, terms |
| TaxInfo | Object | Nested: taxCategory, taxRate, taxable |
| Status | String | Enum: 'active', 'inactive', 'discontinued', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 28. Retail - Category Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| CategoryId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| Name | String | NOT NULL |
| Description | String | Optional |
| ParentCategory | ObjectId | FK → Category(CategoryId), Self-referencing, Optional |
| CategoryCode | String | NOT NULL, UNIQUE |
| Image | String | Optional |
| SortOrder | Number | Default: 0 |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 29. Retail - Supplier Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SupplierId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| SupplierId | String | NOT NULL, UNIQUE |
| CompanyName | String | NOT NULL |
| ContactPerson | Object | Nested: firstName, lastName, position |
| ContactInfo | Object | Nested: email, phone, fax, website, address |
| BusinessInfo | Object | Nested: taxId, registrationNumber, businessType, establishedYear |
| PaymentTerms | Object | Nested: creditLimit, paymentDays, currency |
| BankDetails | Object | Nested: accountNumber, bankName, ifscCode, swiftCode |
| Products | Array | Array of ObjectIds → Product(ProductId) |
| Rating | Number | Min: 1, Max: 5, Default: 3 |
| Status | String | Enum: 'active', 'inactive', 'blacklisted', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 30. Retail - POS Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| POSId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| POSId | String | NOT NULL, UNIQUE |
| TerminalName | String | NOT NULL |
| Location | String | Optional |
| Cashier | ObjectId | FK → User(UserId), Optional |
| Status | String | Enum: 'active', 'inactive', 'maintenance', Default: 'active' |
| Settings | Object | Nested: allowOfflineMode, requireReceipt, taxInclusive, allowDiscounts, maxDiscountPercent |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 31. Retail - Sale Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SaleId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| SaleId | String | NOT NULL, UNIQUE |
| POSId | ObjectId | FK → POS(POSId), NOT NULL |
| Cashier | ObjectId | FK → User(UserId), NOT NULL |
| Customer | ObjectId | FK → Customer(CustomerId), Optional |
| SaleDate | Date | Default: Date.now |
| Items | Array | Array of item objects (product, quantity, unitPrice, discount, tax, total) |
| Subtotal | Number | NOT NULL |
| Discount | Object | Nested: type, value, reason |
| Tax | Object | Nested: amount, rate, details |
| Total | Number | NOT NULL |
| Payment | Object | Nested: method, amount, change, transactionId, cardLast4 |
| Receipt | Object | Nested: number, printed, printedAt |
| Status | String | Enum: 'completed', 'cancelled', 'refunded', Default: 'completed' |
| Notes | String | Optional |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 32. Retail - Customer Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| CustomerId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| CustomerId | String | NOT NULL, UNIQUE |
| PersonalInfo | Object | Nested: firstName, lastName, middleName, dateOfBirth, gender |
| ContactInfo | Object | Nested: email, phone (NOT NULL), address |
| LoyaltyProgram | Object | Nested: memberId, points, tier, joinDate |
| Preferences | Object | Nested: categories, brands, communication |
| PurchaseHistory | Object | Nested: totalPurchases, totalAmount, averageOrderValue, lastPurchaseDate, favoriteCategories |
| Status | String | Enum: 'active', 'inactive', 'blacklisted', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 33. Retail - Inventory Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| InventoryId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| ProductId | ObjectId | FK → Product(ProductId), NOT NULL |
| Warehouse | ObjectId | FK → Warehouse(WarehouseId), NOT NULL |
| CurrentStock | Number | Default: 0 |
| ReservedStock | Number | Default: 0 |
| AvailableStock | Number | Default: 0 |
| LastUpdated | Date | Default: Date.now |
| Movements | Array | Array of movement objects (type, quantity, reason, reference, date, user) |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

### 34. Retail - Warehouse Table

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| WarehouseId | ObjectId | PK – Auto Generated |
| OrgId | ObjectId | FK → Organization(OrganizationId), NOT NULL |
| TenantId | String | NOT NULL |
| WarehouseId | String | NOT NULL, UNIQUE |
| Name | String | NOT NULL |
| Code | String | NOT NULL, UNIQUE |
| Address | Object | Nested: street, city, state, zipCode, country |
| ContactInfo | Object | Nested: phone, email, manager |
| Capacity | Object | Nested: total, used, unit |
| Zones | Array | Array of zone objects (name, code, capacity, temperature, humidity) |
| Status | String | Enum: 'active', 'inactive', 'maintenance', Default: 'active' |
| IsActive | Boolean | Default: true |
| CreatedAt | Date | Auto-generated |
| UpdatedAt | Date | Auto-generated |

---

## Database Relationships

### Core Platform Relationships

- **SupraAdmin ↔ Tenant** → One-to-Many
  - One SupraAdmin can create multiple Tenants
  - Each Tenant has one CreatedBy SupraAdmin

- **Tenant ↔ Organization** → One-to-One (via TenantSettings)
  - Each Tenant has one Organization
  - Each Organization belongs to one Tenant

- **Tenant ↔ TenantSettings** → One-to-One
  - Each Tenant has one TenantSettings record
  - TenantSettings references Tenant via TenantId

- **Organization ↔ User** → One-to-Many
  - One Organization can have multiple Users
  - Each User belongs to one Organization (via OrgId)

- **User ↔ User** → One-to-Many (Self-referencing)
  - One User can be a Manager of multiple Users
  - Each User can have one Manager (via ManagerId)

- **User ↔ Employee** → One-to-One
  - One User can have one Employee record
  - Each Employee belongs to one User (via UserId)

### Common ERP Module Relationships

- **Organization ↔ Department** → One-to-Many
  - One Organization can have multiple Departments
  - Each Department belongs to one Organization (via OrgId)

- **Department ↔ Department** → One-to-Many (Self-referencing)
  - One Department can have multiple Child Departments
  - Each Department can have one Parent Department

- **Department ↔ User** → One-to-Many
  - One Department can have multiple Users as Department Head
  - Each User can be Head of one Department

- **User ↔ Team** → Many-to-Many
  - One User can belong to multiple Teams (via TeamIds array)
  - One Team can have multiple Users (via Members array)

- **Team ↔ Employee** → One-to-Many
  - One Team can have multiple Employees as Members
  - Each Employee can belong to multiple Teams

- **Team ↔ Project** → One-to-Many
  - One Team can work on multiple Projects
  - Each Project can be assigned to one Team

- **Organization ↔ Project** → One-to-Many
  - One Organization can have multiple Projects
  - Each Project belongs to one Organization (via OrgId)

- **Project ↔ Client** → Many-to-One
  - Multiple Projects can belong to one Client
  - Each Project belongs to one Client (via ClientId)

- **Project ↔ Task** → One-to-Many
  - One Project can have multiple Tasks
  - Each Task belongs to one Project (via ProjectId)

- **Task ↔ User** → Many-to-One (Assignee)
  - Multiple Tasks can be assigned to one User
  - Each Task can have one Assignee User

- **Task ↔ User** → Many-to-One (Reporter)
  - Multiple Tasks can be reported by one User
  - Each Task has one Reporter User

- **Task ↔ Task** → Many-to-Many (Self-referencing via Dependencies)
  - Tasks can have dependencies on other Tasks

- **Organization ↔ Finance (ChartOfAccounts)** → One-to-Many
  - One Organization can have multiple Chart of Accounts
  - Each Account belongs to one Organization (via OrgId)

- **ChartOfAccounts ↔ ChartOfAccounts** → One-to-Many (Self-referencing)
  - One Account can have multiple Child Accounts
  - Each Account can have one Parent Account

- **Organization ↔ Transaction** → One-to-Many
  - One Organization can have multiple Transactions
  - Each Transaction belongs to one Organization (via OrgId)

- **Transaction ↔ ChartOfAccounts** → Many-to-One
  - Multiple Transactions can reference one Account
  - Each Transaction can reference one Account (via AccountId)

- **Transaction ↔ Invoice** → Many-to-One
  - Multiple Transactions can reference one Invoice
  - Each Transaction can reference one Invoice (via RelatedInvoiceId)

- **Transaction ↔ Project** → Many-to-One
  - Multiple Transactions can reference one Project
  - Each Transaction can reference one Project (via RelatedProjectId)

- **Organization ↔ Invoice** → One-to-Many
  - One Organization can have multiple Invoices
  - Each Invoice belongs to one Organization (via OrgId)

- **Invoice ↔ Client** → Many-to-One
  - Multiple Invoices can belong to one Client
  - Each Invoice can belong to one Client (via ClientId)

- **Organization ↔ AuditLog** → One-to-Many
  - One Organization can have multiple Audit Logs
  - Each Audit Log belongs to one Organization (via OrgId)

- **User ↔ AuditLog** → One-to-Many
  - One User can have multiple Audit Log entries
  - Each Audit Log entry belongs to one User (via UserId)

### Education Module Relationships

- **Organization ↔ Student** → One-to-Many
  - One Organization can have multiple Students
  - Each Student belongs to one Organization (via OrgId)

- **Student ↔ Class** → Many-to-One
  - Multiple Students can belong to one Class
  - Each Student belongs to one Class (via AcademicInfo.classId)

- **Class ↔ Teacher** → Many-to-Many
  - One Class can have multiple Teachers (via Subjects array)
  - One Teacher can teach multiple Classes (via ProfessionalInfo.classes array)

- **Class ↔ Teacher** → Many-to-One (Class Teacher)
  - Multiple Classes can have one Class Teacher
  - Each Class can have one Class Teacher

- **Student ↔ Grade** → One-to-Many
  - One Student can have multiple Grades
  - Each Grade belongs to one Student (via StudentId)

- **Grade ↔ Class** → Many-to-One
  - Multiple Grades can belong to one Class
  - Each Grade belongs to one Class (via ClassId)

- **Grade ↔ Teacher** → Many-to-One
  - Multiple Grades can be assigned by one Teacher
  - Each Grade can be assigned by one Teacher (via TeacherId)

- **Organization ↔ Course** → One-to-Many
  - One Organization can have multiple Courses
  - Each Course belongs to one Organization (via OrgId)

- **Organization ↔ AcademicYear** → One-to-Many
  - One Organization can have multiple Academic Years
  - Each Academic Year belongs to one Organization (via OrgId)

### Healthcare Module Relationships

- **Organization ↔ Patient** → One-to-Many
  - One Organization can have multiple Patients
  - Each Patient belongs to one Organization (via OrgId)

- **Organization ↔ Doctor** → One-to-Many
  - One Organization can have multiple Doctors
  - Each Doctor belongs to one Organization (via OrgId)

- **Patient ↔ Appointment** → One-to-Many
  - One Patient can have multiple Appointments
  - Each Appointment belongs to one Patient (via PatientId)

- **Doctor ↔ Appointment** → One-to-Many
  - One Doctor can have multiple Appointments
  - Each Appointment belongs to one Doctor (via DoctorId)

- **Appointment ↔ MedicalRecord** → One-to-One
  - One Appointment can have one Medical Record
  - Each Medical Record can reference one Appointment (via AppointmentId)

- **Patient ↔ MedicalRecord** → One-to-Many
  - One Patient can have multiple Medical Records
  - Each Medical Record belongs to one Patient (via PatientId)

- **Doctor ↔ MedicalRecord** → One-to-Many
  - One Doctor can create multiple Medical Records
  - Each Medical Record is created by one Doctor (via DoctorId)

- **Patient ↔ Prescription** → One-to-Many
  - One Patient can have multiple Prescriptions
  - Each Prescription belongs to one Patient (via PatientId)

- **Doctor ↔ Prescription** → One-to-Many
  - One Doctor can create multiple Prescriptions
  - Each Prescription is created by one Doctor (via DoctorId)

- **Appointment ↔ Prescription** → One-to-One
  - One Appointment can result in one Prescription
  - Each Prescription can reference one Appointment (via AppointmentId)

### Retail Module Relationships

- **Organization ↔ Product** → One-to-Many
  - One Organization can have multiple Products
  - Each Product belongs to one Organization (via OrgId)

- **Product ↔ Category** → Many-to-One
  - Multiple Products can belong to one Category
  - Each Product belongs to one Category (via Category)

- **Category ↔ Category** → One-to-Many (Self-referencing)
  - One Category can have multiple Child Categories
  - Each Category can have one Parent Category

- **Product ↔ Supplier** → Many-to-One
  - Multiple Products can be supplied by one Supplier
  - Each Product can have one Supplier (via Supplier)

- **Supplier ↔ Product** → One-to-Many
  - One Supplier can supply multiple Products
  - Supplier maintains array of Product references

- **Organization ↔ POS** → One-to-Many
  - One Organization can have multiple POS Terminals
  - Each POS belongs to one Organization (via OrgId)

- **POS ↔ User** → Many-to-One (Cashier)
  - Multiple POS Terminals can be operated by one User
  - Each POS can have one Cashier User

- **POS ↔ Sale** → One-to-Many
  - One POS Terminal can process multiple Sales
  - Each Sale is processed by one POS (via POSId)

- **Sale ↔ User** → Many-to-One (Cashier)
  - Multiple Sales can be processed by one User
  - Each Sale is processed by one Cashier User

- **Sale ↔ Customer** → Many-to-One
  - Multiple Sales can belong to one Customer
  - Each Sale can belong to one Customer (via Customer)

- **Sale ↔ Product** → Many-to-Many (via Items array)
  - One Sale can include multiple Products
  - One Product can be sold in multiple Sales

- **Organization ↔ Customer** → One-to-Many
  - One Organization can have multiple Customers
  - Each Customer belongs to one Organization (via OrgId)

- **Product ↔ Inventory** → One-to-Many
  - One Product can have multiple Inventory records (across warehouses)
  - Each Inventory record belongs to one Product (via ProductId)

- **Warehouse ↔ Inventory** → One-to-Many
  - One Warehouse can have multiple Inventory records
  - Each Inventory record belongs to one Warehouse (via Warehouse)

- **Organization ↔ Warehouse** → One-to-Many
  - One Organization can have multiple Warehouses
  - Each Warehouse belongs to one Organization (via OrgId)

---

## Summary

The TWS Multi-Tenant ERP Platform database schema consists of:

- **Core Platform Tables**: SupraAdmin, Tenant, Organization, TenantSettings, User
- **Common ERP Tables**: Department, Employee, Team, Project, Task, Client, Finance (ChartOfAccounts, Transaction, Invoice), AuditLog
- **Education Module Tables**: Student, Teacher, Class, Grade, Course, AcademicYear
- **Healthcare Module Tables**: Patient, Doctor, Appointment, MedicalRecord, Prescription
- **Retail Module Tables**: Product, Category, Supplier, POS, Sale, Customer, Inventory, Warehouse

The schema supports multi-tenancy through tenant isolation, role-based access control, and industry-specific modules while maintaining common ERP functionalities across all tenants.

