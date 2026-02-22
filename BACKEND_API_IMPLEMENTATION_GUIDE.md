# Backend API Implementation Guide

## 🎯 Complete API Endpoints Reference for Tenant Organization Modules

This document provides a comprehensive guide for backend developers to implement all required API endpoints for the tenant organization system.

---

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [HRM Module APIs](#hrm-module-apis)
3. [Finance Module APIs](#finance-module-apis)
4. [Projects Module APIs](#projects-module-apis)
5. [Dashboard & Analytics APIs](#dashboard--analytics-apis)
6. [Other Module APIs](#other-module-apis)
7. [Common Patterns](#common-patterns)
8. [Data Models Reference](#data-models-reference)

---

## 🔐 Authentication & Authorization

### Base URL Pattern:
```
/api/tenant/:tenantSlug/organization/{module}/{resource}
```

### Headers Required:
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Token Management:
- Main token (education users): `localStorage.getItem('token')`
- Tenant token (tenant owners): `localStorage.getItem('tenantToken')`
- Token refresh endpoint: `/api/tenant-auth/refresh`

---

## 👥 HRM Module APIs

### Employee Management

#### Create Employee
```
POST /api/tenant/:tenantSlug/organization/hr/employees
Body: {
  employeeId?: string (auto-generated if not provided),
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  dateOfBirth?: date,
  gender?: string,
  jobTitle: string,
  department: string,
  hireDate: date,
  contractType: 'full-time' | 'part-time' | 'contract' | 'intern',
  workLocation?: string,
  salary: {
    base: number,
    currency: string,
    payFrequency: string
  },
  reportingManager?: string,
  employmentStatus: string,
  probationPeriod?: number,
  notes?: string
}
```

#### Get Employees
```
GET /api/tenant/:tenantSlug/organization/hr/employees?{params}
Query Params: search, department, status, page, limit
```

#### Get Employee by ID
```
GET /api/tenant/:tenantSlug/organization/hr/employees/:employeeId
```

#### Update Employee
```
PUT /api/tenant/:tenantSlug/organization/hr/employees/:employeeId
Body: { ...employeeData }
```

#### Delete Employee
```
DELETE /api/tenant/:tenantSlug/organization/hr/employees/:employeeId
```

---

### Recruitment APIs

#### Get Recruitment Overview
```
GET /api/tenant/:tenantSlug/organization/hr/recruitment?{params}
Response: {
  positions: Array,
  stats: {
    openPositions: number,
    activeCandidates: number,
    inReview: number,
    hiredThisMonth: number
  }
}
```

#### Job Postings

**List Job Postings**
```
GET /api/tenant/:tenantSlug/organization/hr/recruitment/jobs?{params}
Query Params: status, department, search, page, limit
```

**Get Job Posting**
```
GET /api/tenant/:tenantSlug/organization/hr/recruitment/jobs/:jobId
```

**Create Job Posting**
```
POST /api/tenant/:tenantSlug/organization/hr/recruitment/jobs
Body: {
  title: string,
  department: string,
  location: string,
  employmentType: string,
  experienceLevel: string,
  salaryRange: { min: number, max: number },
  description: string,
  requirements: Array,
  formTemplate: string (id),
  status: 'draft' | 'active' | 'paused' | 'expired',
  tags: Array,
  expiresAt?: date
}
```

**Update Job Posting**
```
PUT /api/tenant/:tenantSlug/organization/hr/recruitment/jobs/:jobId
Body: { ...jobData }
```

**Delete Job Posting**
```
DELETE /api/tenant/:tenantSlug/organization/hr/recruitment/jobs/:jobId
```

#### Job Applications

**Get Applications**
```
GET /api/tenant/:tenantSlug/organization/hr/recruitment/jobs/:jobId/applications?{params}
```

#### Interviews

**Get Interviews**
```
GET /api/tenant/:tenantSlug/organization/hr/recruitment/interviews?{params}
```

**Create Interview**
```
POST /api/tenant/:tenantSlug/organization/hr/recruitment/interviews
Body: {
  jobId: string,
  candidateId: string,
  interviewerId: string,
  scheduledDate: date,
  interviewType: string,
  status: string,
  notes?: string
}
```

**Update Interview**
```
PUT /api/tenant/:tenantSlug/organization/hr/recruitment/interviews/:interviewId
Body: { ...interviewData }
```

---

### Performance Management

**Get Performance Data**
```
GET /api/tenant/:tenantSlug/organization/hr/performance?{params}
Response: {
  employees: Array<{
    name: string,
    department: string,
    rating: number,
    lastReview: date,
    nextReview: date,
    status: string
  }>,
  stats: {
    averageRating: number,
    reviewsDue: number,
    topPerformers: number,
    improvementPlans: number
  }
}
```

---

### Payroll Management

**Get Payroll Data**
```
GET /api/tenant/:tenantSlug/organization/hr/payroll?{params}
Query Params: period, history (boolean)
Response: {
  totalAmount: number,
  employeeCount: number,
  pendingCount: number,
  cycleCount: number,
  history?: Array<{
    id: string,
    period: string,
    totalAmount: number,
    employeesPaid: number,
    status: string,
    processedDate: date
  }>
}
```

---

### Attendance Management

**Get Attendance Data**
```
GET /api/tenant/:tenantSlug/organization/hr/attendance?{params}
Query Params: date, weekly (boolean), details (boolean)
Response: {
  present: number,
  absent: number,
  late: number,
  total: number,
  employees?: Array<{
    id: string,
    name: string,
    status: string,
    checkIn: time,
    checkOut: time,
    hours: number
  }>,
  weeklySummary?: {
    totalWorkingDays: number,
    averagePresent: number,
    averageAbsent: number,
    totalHoursLogged: number
  }
}
```

---

### Leave Management

**Get Leave Requests**
```
GET /api/tenant/:tenantSlug/organization/hr/leave-requests?{params}
Query Params: status, type, search
```

**Approve Leave Request**
```
POST /api/tenant/:tenantSlug/organization/hr/leave-requests/:requestId/approve
Body: {
  approvedBy: string,
  notes?: string
}
```

**Reject Leave Request**
```
POST /api/tenant/:tenantSlug/organization/hr/leave-requests/:requestId/reject
Body: {
  rejectedBy: string,
  reason: string
}
```

---

### Training & Onboarding

**Get Training Data**
```
GET /api/tenant/:tenantSlug/organization/hr/training?{params}
```

**Get Onboarding Data**
```
GET /api/tenant/:tenantSlug/organization/hr/onboarding?{params}
```

**Get HR Overview**
```
GET /api/tenant/:tenantSlug/organization/hr
Response: {
  totalEmployees: number,
  totalDepartments: number,
  attendanceStats: Array,
  payrollStats: {
    totalAmount: number,
    employeeCount: number
  }
}
```

---

## 💰 Finance Module APIs

### Finance Overview

**Get Finance Overview**
```
GET /api/tenant/:tenantSlug/organization/finance
Response: {
  totalRevenue: number,
  totalExpenses: number,
  netIncome: number,
  accountsPayable: number,
  accountsReceivable: number,
  cashBalance: number,
  grossMargin: number,
  monthlyRecurringRevenue: number,
  utilizationRate: number,
  financialMetrics: Object
}
```

**Get Recent Transactions**
```
GET /api/tenant/:tenantSlug/organization/finance/transactions/recent?limit=10
```

**Get Overdue Invoices**
```
GET /api/tenant/:tenantSlug/organization/finance/invoices/overdue
```

**Get Upcoming Bills**
```
GET /api/tenant/:tenantSlug/organization/finance/bills/upcoming
```

**Get Project Profitability**
```
GET /api/tenant/:tenantSlug/organization/finance/projects/profitability
```

**Get Cash Flow Data**
```
GET /api/tenant/:tenantSlug/organization/finance/cash-flow?period=month
```

---

### Accounts Receivable (Invoices)

**Get Invoices**
```
GET /api/tenant/:tenantSlug/organization/finance/accounts-receivable?{params}
Query Params: status, clientId, projectId, search, page, limit
```

**Create Invoice**
```
POST /api/tenant/:tenantSlug/organization/finance/invoices
Body: {
  invoiceNumber: string,
  clientId: string,
  projectId?: string,
  billingType: 'hourly' | 'fixed' | 'retainer',
  issueDate: date,
  dueDate: date,
  paymentTerms: string,
  billingItems: Array<{
    type: string,
    description: string,
    hours?: number,
    rate?: number,
    amount: number,
    accountCode: string,
    costCenter: string
  }>,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number,
  notes?: string,
  status: 'draft' | 'sent' | 'paid' | 'overdue',
  revenueAccount: string,
  costCenter: string,
  projectSpecific: boolean,
  autoSend: boolean,
  recurring: boolean,
  recurringFrequency?: string
}
```

**Update Invoice**
```
PUT /api/tenant/:tenantSlug/organization/finance/invoices/:invoiceId
Body: { ...invoiceData }
```

**Delete Invoice**
```
DELETE /api/tenant/:tenantSlug/organization/finance/invoices/:invoiceId
```

**Record Invoice Payment**
```
POST /api/tenant/:tenantSlug/organization/finance/invoices/:invoiceId/payments
Body: {
  paymentDate: date,
  paymentMethod: string,
  amount: number,
  reference: string,
  notes?: string,
  accountCode: string
}
```

---

### Accounts Payable (Bills)

**Get Bills**
```
GET /api/tenant/:tenantSlug/organization/finance/accounts-payable?{params}
Query Params: status, vendorId, projectId, search, page, limit
```

**Create Bill**
```
POST /api/tenant/:tenantSlug/organization/finance/bills
Body: {
  billNumber: string,
  vendorId: string,
  projectId?: string,
  expenseCategory: string,
  issueDate: date,
  dueDate: date,
  paymentTerms: string,
  expenseItems: Array<{
    type: string,
    description: string,
    amount: number,
    accountCode: string,
    costCenter: string
  }>,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number,
  notes?: string,
  status: 'pending' | 'approved' | 'paid',
  expenseAccount: string,
  costCenter: string,
  projectSpecific: boolean,
  requiresApproval: boolean,
  approvedBy?: string,
  approvedDate?: date,
  recurring: boolean,
  recurringFrequency?: string
}
```

**Update Bill**
```
PUT /api/tenant/:tenantSlug/organization/finance/bills/:billId
Body: { ...billData }
```

**Delete Bill**
```
DELETE /api/tenant/:tenantSlug/organization/finance/bills/:billId
```

**Record Bill Payment**
```
POST /api/tenant/:tenantSlug/organization/finance/bills/:billId/payments
Body: {
  paymentDate: date,
  paymentMethod: string,
  amount: number,
  reference: string,
  notes?: string,
  accountCode: string
}
```

---

### Vendors & Clients

**Get Vendors**
```
GET /api/tenant/:tenantSlug/organization/finance/vendors?{params}
```

**Create Vendor**
```
POST /api/tenant/:tenantSlug/organization/finance/vendors
Body: {
  name: string,
  email?: string,
  phone?: string,
  address?: string,
  paymentTerms: string,
  taxId?: string,
  vendorType: string,
  industry: string,
  contactPerson?: string,
  creditLimit: number,
  preferredPaymentMethod: string
}
```

**Get Clients**
```
GET /api/tenant/:tenantSlug/organization/finance/clients?{params}
```

**Create Client**
```
POST /api/tenant/:tenantSlug/organization/finance/clients
Body: { ...clientData }
```

---

### Banking

**Get Banking Data**
```
GET /api/tenant/:tenantSlug/organization/finance/banking?{params}
Response: {
  accounts: Array<{
    id: string,
    name: string,
    type: string,
    balance: number,
    currency: string
  }>,
  totalBalance: number,
  transactions: number,
  pendingReconciliation: number
}
```

---

### Chart of Accounts

**Get Chart of Accounts**
```
GET /api/tenant/:tenantSlug/organization/finance/chart-of-accounts?{params}
```

---

## 📊 Projects Module APIs

### Projects

**List Projects**
```
GET /api/tenant/:tenantSlug/organization/projects?{params}
Query Params: status, priority, clientId, search, page, limit, sort
```

**Get Project**
```
GET /api/tenant/:tenantSlug/organization/projects/:projectId
```

**Create Project**
```
POST /api/tenant/:tenantSlug/organization/projects
Body: {
  name: string,
  description?: string,
  status: 'active' | 'planning' | 'on_hold' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  clientId?: string,
  budget?: {
    total: number,
    currency: 'USD' | 'EUR' | 'GBP' | 'PKR'
  },
  timeline?: {
    startDate: date,
    endDate: date,
    estimatedHours?: number
  },
  tags?: Array<string>
}
```

**Update Project**
```
PATCH /api/tenant/:tenantSlug/organization/projects/:projectId
Body: { ...projectData }
```

**Delete Project**
```
DELETE /api/tenant/:tenantSlug/organization/projects/:projectId
```

**Get Project Metrics**
```
GET /api/tenant/:tenantSlug/organization/projects/metrics
Response: {
  totalProjects: number,
  activeProjects: number,
  completedProjects: number,
  totalTeamMembers: number,
  onTrackProjects: number,
  atRiskProjects: number,
  delayedProjects: number,
  totalBudget: number,
  spentBudget: number,
  totalHours: number,
  utilization: number
}
```

---

### Tasks

**List Tasks**
```
GET /api/tenant/:tenantSlug/organization/projects/tasks?{params}
Query Params: projectId, status, priority, assigneeId, groupBy, search
```

**Get Task**
```
GET /api/tenant/:tenantSlug/organization/projects/tasks/:taskId
```

**Create Task**
```
POST /api/tenant/:tenantSlug/organization/projects/tasks
Body: {
  title: string,
  description?: string,
  status: 'todo' | 'in_progress' | 'under_review' | 'completed',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  type: 'user_story' | 'bug' | 'feature' | 'task',
  projectId?: string,
  assigneeId?: string,
  dueDate?: date,
  storyPoints?: number,
  labels?: Array<string>
}
```

**Update Task**
```
PATCH /api/tenant/:tenantSlug/organization/projects/tasks/:taskId
Body: { ...taskData }
```

**Delete Task**
```
DELETE /api/tenant/:tenantSlug/organization/projects/tasks/:taskId
```

---

### Milestones

**List Milestones**
```
GET /api/tenant/:tenantSlug/organization/projects/milestones?{params}
Query Params: projectId, status, upcoming (boolean)
```

**Create Milestone**
```
POST /api/tenant/:tenantSlug/organization/projects/milestones
Body: {
  title: string,
  description?: string,
  status: 'pending' | 'in_progress' | 'completed' | 'at_risk' | 'delayed',
  projectId?: string,
  dueDate?: date,
  ownerId?: string,
  dependencies?: Array<string>
}
```

**Update Milestone**
```
PATCH /api/tenant/:tenantSlug/organization/projects/milestones/:milestoneId
Body: { ...milestoneData }
```

**Delete Milestone**
```
DELETE /api/tenant/:tenantSlug/organization/projects/milestones/:milestoneId
```

---

### Resources

**List Resources**
```
GET /api/tenant/:tenantSlug/organization/projects/resources?{params}
```

**Create Resource**
```
POST /api/tenant/:tenantSlug/organization/projects/resources
Body: {
  name: string,
  email?: string,
  role?: string,
  department?: string,
  skills?: Array<string>,
  status: 'available' | 'fully_allocated' | 'over_allocated' | 'on_leave',
  totalAllocation: number
}
```

**Update Resource**
```
PATCH /api/tenant/:tenantSlug/organization/projects/resources/:resourceId
Body: { ...resourceData }
```

---

### Timesheets

**List Timesheets**
```
GET /api/tenant/:tenantSlug/organization/projects/timesheets?{params}
Query Params: projectId, memberId, date, status
```

**Create Timesheet**
```
POST /api/tenant/:tenantSlug/organization/projects/timesheets
Body: {
  date: date,
  projectId?: string,
  taskId?: string,
  memberId?: string,
  hours: number,
  description?: string,
  status: 'draft' | 'submitted' | 'approved' | 'rejected',
  billable: boolean
}
```

**Update Timesheet**
```
PATCH /api/tenant/:tenantSlug/organization/projects/timesheets/:timesheetId
Body: { ...timesheetData }
```

---

### Sprints

**List Sprints**
```
GET /api/tenant/:tenantSlug/organization/projects/sprints?{params}
```

**Get Sprint**
```
GET /api/tenant/:tenantSlug/organization/projects/sprints/:sprintId
```

**Create Sprint**
```
POST /api/tenant/:tenantSlug/organization/projects/sprints
Body: {
  name: string,
  sprintNumber: number,
  startDate: date,
  endDate: date,
  status: 'planning' | 'active' | 'completed' | 'cancelled',
  goal: string,
  capacity: {
    totalStoryPoints: number,
    committedStoryPoints: number,
    completedStoryPoints: number
  },
  team: Array<{
    userId: string,
    name: string,
    role: string,
    capacity: number
  }>
}
```

**Update Sprint**
```
PATCH /api/tenant/:tenantSlug/organization/projects/sprints/:sprintId
Body: { ...sprintData }
```

---

### Clients (Projects)

**List Clients**
```
GET /api/tenant/:tenantSlug/organization/projects/clients?{params}
```

**Create Client**
```
POST /api/tenant/:tenantSlug/organization/projects/clients
Body: { ...clientData }
```

**Update Client**
```
PATCH /api/tenant/:tenantSlug/organization/projects/clients/:clientId
Body: { ...clientData }
```

**Delete Client**
```
DELETE /api/tenant/:tenantSlug/organization/projects/clients/:clientId
```

---

## 📈 Dashboard & Analytics APIs

### Dashboard Overview

**Get Dashboard Overview**
```
GET /api/tenant/:tenantSlug/organization/dashboard
```

**Get Dashboard Analytics**
```
GET /api/tenant/:tenantSlug/organization/dashboard/analytics?timeRange=month
```

---

### Analytics

**Get Analytics Overview**
```
GET /api/tenant/:tenantSlug/organization/analytics
```

**Get Analytics Reports**
```
GET /api/tenant/:tenantSlug/organization/analytics/reports?{params}
Query Params: type, startDate, endDate, groupBy
```

---

### Reports

**Get Reports Overview**
```
GET /api/tenant/:tenantSlug/organization/reports
```

**Generate Report**
```
POST /api/tenant/:tenantSlug/organization/reports/generate
Body: {
  type: string,
  parameters: Object
}
```

---

## ⚙️ Settings APIs

**Get Settings**
```
GET /api/tenant/:tenantSlug/organization/settings
```

**Update Settings**
```
PUT /api/tenant/:tenantSlug/organization/settings
Body: { ...settingsData }
```

---

## 🔄 Common Patterns

### Response Format

All successful responses should follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Format

All errors should follow this format:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error message",
  "details": { ... } // Optional
}
```

### Pagination

For list endpoints, support pagination:
```
GET /api/endpoint?page=1&limit=20
Response: {
  data: Array,
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### Filtering & Sorting

Common query parameters:
- `search`: Text search
- `status`: Filter by status
- `sort`: Sort field (e.g., "updatedAt")
- `order`: Sort order ("asc" | "desc")
- `page`: Page number
- `limit`: Items per page

---

## 📝 Data Models Reference

### Employee Model
See: `TWS/backend/src/models/Employee.js`

Key fields:
- userId, employeeId, jobTitle, department
- salary (base, currency, payFrequency, components, bonuses)
- bankDetails (encrypted)
- documents, leaveBalance, performance
- emergencyContact, address, skills
- reportingManager, probation, status

### Project Model
```javascript
{
  name: string,
  description?: string,
  status: 'active' | 'planning' | 'on_hold' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  clientId?: ObjectId,
  budget?: { total: number, currency: string },
  timeline?: { startDate: Date, endDate: Date },
  metrics?: { completionRate: number },
  tags?: Array<string>
}
```

### Invoice Model
```javascript
{
  invoiceNumber: string,
  clientId: ObjectId,
  projectId?: ObjectId,
  billingType: 'hourly' | 'fixed' | 'retainer',
  issueDate: Date,
  dueDate: Date,
  billingItems: Array<{
    type: string,
    description: string,
    hours?: number,
    rate?: number,
    amount: number
  }>,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number,
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}
```

---

## 🔒 Security Considerations

1. **Tenant Isolation**: Always verify tenantSlug matches authenticated user's tenant
2. **Authorization**: Check user permissions for each operation
3. **Data Encryption**: Encrypt sensitive fields (e.g., bank details, salary)
4. **Input Validation**: Validate all input data
5. **Rate Limiting**: Implement rate limiting on all endpoints
6. **Audit Logging**: Log all sensitive operations

---

## 📊 Priority Implementation Order

### Phase 1 (Critical):
1. Employee CRUD
2. Job Posting CRUD
3. Invoice/Bill creation
4. Project CRUD
5. Task management

### Phase 2 (Important):
1. Recruitment workflows
2. Performance tracking
3. Payroll processing
4. Attendance tracking
5. Finance overview

### Phase 3 (Enhancement):
1. Advanced analytics
2. Reporting
3. Notifications
4. Real-time updates

---

## ✅ Testing Checklist

For each endpoint, verify:
- [ ] Authentication works
- [ ] Authorization checks work
- [ ] Tenant isolation works
- [ ] Input validation works
- [ ] Error handling works
- [ ] Response format is correct
- [ ] Pagination works (if applicable)
- [ ] Filtering works (if applicable)
- [ ] Sorting works (if applicable)

---

## 📚 Additional Resources

- Frontend API Service: `TWS/frontend/src/shared/services/tenantApiService.js`
- Projects API Service: `TWS/frontend/src/features/tenant/pages/tenant/org/projects/services/tenantProjectApiService.js`
- Employee Model: `TWS/backend/src/models/Employee.js`
- Integration Guides: See module-specific documentation files

---

## 🎯 Summary

**Total Endpoints Required:** 100+ endpoints
**Priority:** Phase 1 endpoints are critical for basic functionality
**Estimated Implementation Time:** 4-6 weeks for all endpoints

**Status:** Frontend is 100% ready. Backend implementation can begin immediately.

---

**Last Updated:** Current Session
**Status:** 📋 **READY FOR BACKEND IMPLEMENTATION**

