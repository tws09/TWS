# Client Portal - Modules & Flow Documentation

## Overview
The Client Portal is a **separate, external-facing portal** that allows clients to access their projects, view progress, communicate with the team, and manage their relationship with the software house/tenant organization.

---

## 🔐 Authentication Flow

### 1. **Login Process**
```
Client Portal Login
├── Route: `/tenant/:tenantSlug/client-portal/login`
├── Authentication: Email + Password
├── User Model: `ClientPortalUser` (separate from main User model)
├── Token Type: `client_portal` (JWT token, 7-day expiry)
└── Redirect: `/tenant/:tenantSlug/client-portal/dashboard`
```

### 2. **User Types**
- **client_admin**: Full access to client portal features
- **client_user**: Standard access (view projects, submit feedback)
- **client_viewer**: Read-only access (view only)

### 3. **Access Control**
- Clients can **only** see projects where:
  - `project.clientId` matches their `clientId`
  - `project.settings.portalSettings.allowClientPortal === true`
- Data is filtered by `orgId` and `clientId` automatically

---

## 📦 Shared Modules & Features

### **Core Modules Available to Clients:**

#### 1. **Project Management Module** ✅
**What Clients Can Access:**
- **Project List**: View all their assigned projects
- **Project Details**: 
  - Project name, description, status
  - Timeline (start date, end date)
  - Budget information
  - Project status (active, completed, on_hold, etc.)
- **Project Progress**: 
  - Milestone tracking
  - Progress percentage
  - Status updates

**Backend Endpoints:**
- `GET /api/tenant/:tenantSlug/client-portal/projects` - List projects
- `GET /api/tenant/:tenantSlug/client-portal/projects/:projectId` - Project details

**Visibility Level:** `basic` (default) or `detailed` (if configured)

---

#### 2. **Task Management Module** ✅
**What Clients Can Access:**
- **Task List**: View tasks for their projects
- **Task Details**:
  - Task title, description, status
  - Assigned team member
  - Due dates
  - Priority levels
- **Task Progress**: Track task completion

**Backend Endpoints:**
- `GET /api/tenant/:tenantSlug/client-portal/projects/:projectId/tasks` - Get project tasks

**Note:** Clients can **view** tasks but **cannot** create, edit, or delete tasks.

---

#### 3. **Time Tracking Module** ⚙️ (Configurable)
**What Clients Can Access:**
- **Time Entries**: View time spent on their projects
- **Hours Summary**: Total hours logged per project
- **Billable Hours**: See billable vs non-billable hours

**Configuration:**
- Can be enabled/disabled per project via `features.timeTracking`
- Default: `false` (disabled)

**Backend Endpoints:**
- `GET /api/tenant/:tenantSlug/client-portal/projects/:projectId/time-entries` (if implemented)

---

#### 4. **Billing & Invoices Module** ✅
**What Clients Can Access:**
- **Invoice List**: View invoices for their projects
- **Invoice Details**: 
  - Invoice number, date, amount
  - Line items, descriptions
  - Payment status
- **Download Invoices**: PDF/Excel export
- **Payment History**: Track payments made

**Configuration:**
- Enabled via `features.invoices` (default: `true`)

**Backend Endpoints:**
- `GET /api/tenant/:tenantSlug/client-portal/invoices` (if implemented)
- `GET /api/tenant/:tenantSlug/client-portal/invoices/:invoiceId` (if implemented)

---

#### 5. **Documents & Files Module** ✅
**What Clients Can Access:**
- **Project Documents**: Access project-related files
- **Deliverables**: Download completed deliverables
- **File Sharing**: Upload files (if permissions allow)
- **Document Library**: Organized document storage

**Configuration:**
- Enabled via `features.documents` (default: `true`)

**Backend Endpoints:**
- `GET /api/tenant/:tenantSlug/client-portal/projects/:projectId/documents` (if implemented)
- `POST /api/tenant/:tenantSlug/client-portal/projects/:projectId/documents` (if implemented)

---

#### 6. **Communication Module** ✅
**What Clients Can Access:**
- **Project Messages**: Communicate with project team
- **Feedback System**: Submit project feedback and ratings
- **Notifications**: Receive project updates
- **Announcements**: View project announcements

**Configuration:**
- Enabled via `features.communication` (default: `true`)

**Backend Endpoints:**
- `POST /api/tenant/:tenantSlug/client-portal/projects/:projectId/feedback` - Submit feedback
- `GET /api/tenant/:tenantSlug/client-portal/notifications` - Get notifications

---

## 🔄 Complete Client Portal Flow

### **Step 1: Client Portal Configuration (Tenant Admin Side)**
```
Tenant Admin → Software House → Client Portal Settings
├── Enable/Disable Client Portal
├── Configure Features:
│   ├── Project Progress: ON/OFF
│   ├── Time Tracking: ON/OFF
│   ├── Invoices: ON/OFF
│   ├── Documents: ON/OFF
│   └── Communication: ON/OFF
└── Set Visibility Level (basic/detailed)
```

### **Step 2: Project Configuration**
```
Tenant Admin → Projects → Select Project → Settings
├── Enable "Allow Client Portal Access"
├── Set Client Visibility Level
└── Configure Feature Access
```

### **Step 3: Client User Creation**
```
Tenant Admin → Clients → Select Client → Create Portal User
├── Email
├── Password
├── Full Name
├── Role (client_admin, client_user, client_viewer)
└── Active Status
```

### **Step 4: Client Login Flow**
```
1. Client visits: /tenant/:tenantSlug/client-portal/login
2. Enters email + password
3. Backend validates ClientPortalUser
4. JWT token generated (type: 'client_portal')
5. Token stored in localStorage
6. Redirect to dashboard
```

### **Step 5: Client Dashboard**
```
Client Portal Dashboard
├── Summary Cards:
│   ├── Total Projects
│   ├── Active Projects
│   └── Completed Projects
└── Projects List:
    ├── Project Name
    ├── Status Badge
    ├── Description
    ├── Timeline (Start/End Dates)
    └── Click to view details
```

### **Step 6: Project Details View**
```
Project Details Page
├── Project Information:
│   ├── Name, Description, Status
│   ├── Timeline (Start/End Dates)
│   └── Budget
├── Tasks Section:
│   ├── Task List
│   ├── Task Status
│   ├── Assignee
│   └── Due Dates
└── Actions:
    └── Submit Feedback Button
```

### **Step 7: Feedback Submission**
```
Client → Project Details → Provide Feedback
├── Rating (1-5 stars)
├── Feedback Text
└── Submit
    └── Stored in project.clientFeedback[]
    └── Notification sent to project team
```

---

## 🛡️ Security & Data Isolation

### **Data Filtering:**
- All queries automatically filter by:
  - `orgId`: Organization ID
  - `clientId`: Client ID (from authenticated user)
  - `allowClientPortal: true`: Portal access enabled

### **Data Restrictions:**
- Clients **CANNOT** see:
  - Internal notes (`-internalNotes`)
  - Confidential data (`-confidentialData`)
  - Internal comments (`-internalComments`)
  - Other clients' projects
  - Employee information (except assigned team members)
  - Financial details beyond invoices

### **Access Control:**
- Token-based authentication (JWT)
- Token type validation (`client_portal`)
- User active status check
- Tenant slug verification

---

## 📊 Module Configuration Matrix

| Module | Default | Configurable | Visibility Levels |
|--------|---------|--------------|-------------------|
| **Project Progress** | ✅ Enabled | Yes | basic, detailed |
| **Time Tracking** | ❌ Disabled | Yes | basic, detailed |
| **Invoices** | ✅ Enabled | Yes | basic, detailed |
| **Documents** | ✅ Enabled | Yes | basic, detailed |
| **Communication** | ✅ Enabled | Yes | basic, detailed |

---

## 🔗 Integration Points

### **With Project Management Module:**
- Projects are shared (read-only for clients)
- Tasks are visible (read-only)
- Milestones are visible
- Progress updates are visible

### **With Finance Module:**
- Invoices are accessible
- Payment history is visible
- Billing information is shared

### **With Communication Module:**
- Messages can be sent/received
- Feedback system integrated
- Notifications delivered

### **With Document Management:**
- Project documents accessible
- File sharing enabled
- Deliverables downloadable

---

## 🚀 Future Enhancements (Potential)

1. **Gantt Chart View** (if enabled)
   - Clients can view project timeline
   - See task dependencies
   - Track critical path

2. **Sprint Visibility** (if enabled)
   - View sprint progress
   - See sprint goals
   - Track sprint velocity

3. **Milestone Sign-off**
   - Approve/reject milestones
   - Sign-off on deliverables
   - Request changes

4. **Real-time Updates**
   - WebSocket notifications
   - Live project updates
   - Instant messaging

5. **Custom Branding**
   - Tenant-specific branding
   - Custom logo/colors
   - White-label portal

---

## 📝 Summary

**Client Portal is a READ-ONLY portal** (with limited write access for feedback) that allows clients to:
- ✅ View their projects and progress
- ✅ See tasks and milestones
- ✅ Access invoices and billing
- ✅ Download documents
- ✅ Communicate with the team
- ✅ Submit feedback

**Clients CANNOT:**
- ❌ Create/edit projects
- ❌ Create/edit tasks
- ❌ Access other clients' data
- ❌ View internal notes/comments
- ❌ Modify project settings
- ❌ Access admin features

The portal is **fully isolated** by `orgId` and `clientId`, ensuring complete data security and privacy.
