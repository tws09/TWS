# NUCLEUS PROJECT OS - PHASE 2: FRONTEND IMPLEMENTATION PLAN

## 📋 OVERVIEW

**Status:** Backend Complete ✅ | Frontend Pending ⏳  
**Estimated Time:** 3-4 weeks  
**Priority:** HIGH

This phase implements all React components needed to interact with the Nucleus Project OS backend APIs.

---

## 🎯 PHASE 2 OBJECTIVES

1. **Approval Workflow UI** - Visual approval chain with step-by-step progress
2. **Change Request Management** - Client submission and PM evaluation interfaces
3. **Date Validation System** - PM alerts and validation forms
4. **Deliverable Management** - Create/edit deliverables with Nucleus status states
5. **Integration** - Connect new components to existing project pages

---

## 📦 COMPONENTS TO BUILD

### 1. APPROVAL WORKFLOW COMPONENTS

#### 1.1 ApprovalProgress.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/approvals/ApprovalProgress.jsx`

**Purpose:** Display approval chain progress for a deliverable

**Features:**
- Visual 4-step progress indicator
- Status icons (pending ✅, approved ✅, rejected ❌)
- Timestamp display
- Approve/Reject buttons (role-based)
- Rejection reason input

**Props:**
```javascript
{
  deliverableId: string,
  isClientView?: boolean,
  onApprovalChange?: () => void
}
```

**API Integration:**
- `GET /approvals/deliverable/:deliverableId`
- `POST /approvals/:approvalId/approve`
- `POST /approvals/:approvalId/reject`

---

#### 1.2 ApprovalStep.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/approvals/ApprovalStep.jsx`

**Purpose:** Individual approval step component

**Features:**
- Step number and name (Dev Lead, QA Lead, Security, Client)
- Status badge
- Approver information
- Action buttons (if user can approve)
- Disabled state if previous step not approved

**Props:**
```javascript
{
  approval: {
    step_number: number,
    approver_type: string,
    status: 'pending' | 'approved' | 'rejected',
    signature_timestamp: Date,
    can_proceed: boolean
  },
  currentUserRole: string,
  onApprove: (approvalId, notes) => void,
  onReject: (approvalId, reason) => void
}
```

---

#### 1.3 ClientApprovalView.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/approvals/ClientApprovalView.jsx`

**Purpose:** Client-facing approval interface (for client portal)

**Features:**
- Simplified view (only client approval step visible)
- Deliverable details
- Approve/Request Changes buttons
- Comment field for rejection reason

**Props:**
```javascript
{
  deliverableId: string,
  deliverable: object,
  onApproval: () => void
}
```

---

### 2. CHANGE REQUEST COMPONENTS

#### 2.1 ChangeRequestForm.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/changeRequests/ChangeRequestForm.jsx`

**Purpose:** Client form to submit change requests

**Features:**
- Deliverable selector
- Description textarea
- Submit button
- Success/error messages

**API Integration:**
- `POST /change-requests`

---

#### 2.2 ChangeRequestDashboard.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/changeRequests/ChangeRequestDashboard.jsx`

**Purpose:** PM dashboard to view and manage change requests

**Features:**
- List of pending change requests
- Filter by status (submitted, acknowledged, evaluated)
- Acknowledge button
- Evaluate button (opens evaluation form)
- Status badges

**API Integration:**
- `GET /change-requests`
- `POST /change-requests/:id/acknowledge`
- `POST /change-requests/:id/evaluate`

---

#### 2.3 ChangeRequestEvaluationForm.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/changeRequests/ChangeRequestEvaluationForm.jsx`

**Purpose:** PM evaluation form

**Features:**
- Effort days input
- Cost impact input
- Date impact days input
- PM recommendation dropdown (accept/reject/negotiate)
- PM notes textarea
- Submit evaluation button

**Props:**
```javascript
{
  changeRequest: object,
  onSubmit: (evaluation) => void,
  onCancel: () => void
}
```

---

#### 2.4 ChangeRequestCard.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/changeRequests/ChangeRequestCard.jsx`

**Purpose:** Individual change request display card

**Features:**
- Change request details
- Status badge
- Submitted by and date
- PM evaluation summary (if evaluated)
- Client decision (if decided)
- Action buttons based on status

---

#### 2.5 ChangeRequestAuditTrail.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/changeRequests/ChangeRequestAuditTrail.jsx`

**Purpose:** Display immutable audit trail

**Features:**
- Timeline view of all actions
- Actor information
- Timestamps
- Details for each action

**API Integration:**
- `GET /change-requests/:id/audit`

---

### 3. DATE VALIDATION COMPONENTS

#### 3.1 DateValidationAlerts.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/DateValidationAlerts.jsx`

**Purpose:** PM dashboard alerts for deliverables needing validation

**Features:**
- List of deliverables needing validation (14+ days)
- Days since last validation
- At-risk indicators (30+ days = red, 14-30 = yellow)
- Quick validate button
- Link to deliverable detail

**API Integration:**
- `GET /deliverables/needing-validation`

---

#### 3.2 DateValidationForm.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/DateValidationForm.jsx`

**Purpose:** Form to validate deliverable date

**Features:**
- Confidence slider (0-100)
- Notes textarea
- Is on track checkbox
- Submit validation button

**API Integration:**
- `POST /deliverables/:id/validate-date`

---

#### 3.3 AtRiskDeliverables.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/AtRiskDeliverables.jsx`

**Purpose:** Display at-risk deliverables

**Features:**
- List of at-risk deliverables
- Work remaining vs days remaining comparison
- Visual indicators
- Action buttons (extend timeline, cut scope)

---

### 4. DELIVERABLE MANAGEMENT COMPONENTS

#### 4.1 DeliverableForm.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/DeliverableForm.jsx`

**Purpose:** Create/edit deliverable form

**Features:**
- Name input
- Description textarea
- Start date picker
- Target date picker
- Status dropdown (Nucleus states)
- Acceptance criteria list (add/remove items)
- Blocking criteria checkbox
- Link tasks selector
- Save/Cancel buttons

**API Integration:**
- `POST /projects/:projectId/deliverables` (if endpoint exists)
- `PUT /deliverables/:id` (if endpoint exists)

---

#### 4.2 DeliverableList.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/DeliverableList.jsx`

**Purpose:** List all deliverables for a project

**Features:**
- Table/card view of deliverables
- Status badges
- Progress indicators
- Filter by status
- Sort by date/progress
- Link to detail view

---

#### 4.3 DeliverableDetail.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/deliverables/DeliverableDetail.jsx`

**Purpose:** Detailed deliverable view

**Features:**
- Deliverable information
- Linked tasks list
- Approval progress component
- Change requests list
- Date validation status
- Acceptance criteria checklist
- Action buttons (edit, create approval chain)

---

### 5. INTEGRATION COMPONENTS

#### 5.1 DeliverablesPage.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/DeliverablesPage.jsx`

**Purpose:** Main deliverables page (new route)

**Features:**
- Deliverable list
- Create deliverable button
- Filters and search
- Integration with existing project layout

**Route:** `/projects/:projectId/deliverables`

---

#### 5.2 ApprovalChainSetup.jsx
**Location:** `frontend/src/features/tenant/pages/tenant/org/projects/components/approvals/ApprovalChainSetup.jsx`

**Purpose:** Setup approval chain for a deliverable

**Features:**
- Dev Lead selector
- QA Lead selector
- Security selector (optional)
- Client email input
- Create chain button

**API Integration:**
- `POST /approvals/deliverable/:deliverableId/create-chain`

---

## 🔗 INTEGRATION POINTS

### Update Existing Components

#### 1. ProjectDashboard.jsx
**Add:**
- Date validation alerts section
- At-risk deliverables section
- Pending change requests count

#### 2. ProjectMilestones.jsx
**Enhance:**
- Add "Create Approval Chain" button for each milestone
- Show approval status badge
- Link to approval progress view

#### 3. ProjectsOverview.jsx
**Add:**
- Deliverables tab
- Change requests quick view
- Approval status indicators

---

## 📁 FILE STRUCTURE

```
frontend/src/features/tenant/pages/tenant/org/projects/
├── components/
│   ├── approvals/
│   │   ├── ApprovalProgress.jsx
│   │   ├── ApprovalStep.jsx
│   │   ├── ClientApprovalView.jsx
│   │   └── ApprovalChainSetup.jsx
│   ├── changeRequests/
│   │   ├── ChangeRequestForm.jsx
│   │   ├── ChangeRequestDashboard.jsx
│   │   ├── ChangeRequestEvaluationForm.jsx
│   │   ├── ChangeRequestCard.jsx
│   │   └── ChangeRequestAuditTrail.jsx
│   └── deliverables/
│       ├── DateValidationAlerts.jsx
│       ├── DateValidationForm.jsx
│       ├── AtRiskDeliverables.jsx
│       ├── DeliverableForm.jsx
│       ├── DeliverableList.jsx
│       └── DeliverableDetail.jsx
├── DeliverablesPage.jsx (NEW)
└── services/
    └── tenantProjectApiService.js (UPDATE - add new API methods)
```

---

## 🔧 API SERVICE UPDATES

### Update tenantProjectApiService.js

Add new methods:

```javascript
// Approvals
export const getApprovalsForDeliverable = (deliverableId) => { ... }
export const approveStep = (approvalId, notes) => { ... }
export const rejectStep = (approvalId, reason) => { ... }
export const createApprovalChain = (deliverableId, config) => { ... }

// Change Requests
export const submitChangeRequest = (data) => { ... }
export const acknowledgeChangeRequest = (id) => { ... }
export const evaluateChangeRequest = (id, evaluation) => { ... }
export const decideChangeRequest = (id, decision) => { ... }
export const getChangeRequestAudit = (id) => { ... }
export const getChangeRequests = (filters) => { ... }

// Deliverables
export const validateDeliverableDate = (id, data) => { ... }
export const getDeliverablesNeedingValidation = (daysThreshold) => { ... }
export const createDeliverable = (projectId, data) => { ... }
export const updateDeliverable = (id, data) => { ... }
export const getDeliverable = (id) => { ... }
export const getDeliverables = (projectId) => { ... }
```

---

## 🛣️ ROUTE UPDATES

### Update TenantOrg.js

Add new routes:

```javascript
// Deliverables
<Route path="projects/:projectId/deliverables" element={<DeliverablesPage />} />
<Route path="projects/:projectId/deliverables/:deliverableId" element={<DeliverableDetail />} />

// Change Requests
<Route path="projects/:projectId/change-requests" element={<ChangeRequestDashboard />} />
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Week 1: Approval Workflow
- [ ] Create ApprovalProgress component
- [ ] Create ApprovalStep component
- [ ] Create ClientApprovalView component
- [ ] Create ApprovalChainSetup component
- [ ] Update tenantProjectApiService with approval methods
- [ ] Integrate into ProjectMilestones page
- [ ] Test approval workflow end-to-end

### Week 2: Change Requests
- [ ] Create ChangeRequestForm component
- [ ] Create ChangeRequestDashboard component
- [ ] Create ChangeRequestEvaluationForm component
- [ ] Create ChangeRequestCard component
- [ ] Create ChangeRequestAuditTrail component
- [ ] Update tenantProjectApiService with change request methods
- [ ] Add change request route
- [ ] Test change request workflow end-to-end

### Week 3: Date Validation & Deliverables
- [ ] Create DateValidationAlerts component
- [ ] Create DateValidationForm component
- [ ] Create AtRiskDeliverables component
- [ ] Create DeliverableForm component
- [ ] Create DeliverableList component
- [ ] Create DeliverableDetail component
- [ ] Create DeliverablesPage
- [ ] Update tenantProjectApiService with deliverable methods
- [ ] Integrate date validation alerts into ProjectDashboard
- [ ] Test date validation workflow

### Week 4: Integration & Polish
- [ ] Integrate all components into existing pages
- [ ] Add loading states and error handling
- [ ] Add toast notifications for actions
- [ ] Responsive design testing
- [ ] Accessibility audit
- [ ] End-to-end testing
- [ ] Documentation updates

---

## 🎨 UI/UX GUIDELINES

### Design System
- Use existing Tailwind CSS classes
- Follow existing component patterns
- Use Heroicons for icons
- Match existing color scheme

### Status Colors
- **Pending:** Gray (`gray-400`)
- **Approved:** Green (`green-500`)
- **Rejected:** Red (`red-500`)
- **At Risk:** Orange (`orange-500`)

### Component Patterns
- Use existing modal patterns for forms
- Use existing card patterns for lists
- Use existing badge patterns for status
- Use existing button patterns for actions

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests
- [ ] ApprovalProgress component
- [ ] ChangeRequestForm component
- [ ] DateValidationForm component
- [ ] API service methods

### Integration Tests
- [ ] Approval workflow end-to-end
- [ ] Change request workflow end-to-end
- [ ] Date validation workflow

### E2E Tests
- [ ] PM creates deliverable and approval chain
- [ ] Dev Lead approves → QA approves → Client approves
- [ ] Client submits change request → PM evaluates → Client decides
- [ ] PM validates deliverable date

---

## 📚 DOCUMENTATION NEEDED

1. **Component Documentation**
   - Props documentation
   - Usage examples
   - API integration guide

2. **User Guides**
   - How to set up approval chain
   - How to submit change request
   - How to validate deliverable dates

3. **Developer Guide**
   - Component architecture
   - API integration patterns
   - State management approach

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All components built and tested
- [ ] Routes added to TenantOrg.js
- [ ] API service methods implemented
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Code review completed

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Complex State Management
**Mitigation:** Use React hooks (useState, useEffect) and consider Context API for shared state

### Risk 2: API Integration Issues
**Mitigation:** Comprehensive error handling, retry logic, fallback states

### Risk 3: Performance with Large Lists
**Mitigation:** Implement pagination, virtual scrolling, lazy loading

### Risk 4: Client Portal Integration
**Mitigation:** Separate client-facing components, role-based rendering

---

## 📊 SUCCESS METRICS

- [ ] All approval workflow steps functional
- [ ] Change request workflow complete end-to-end
- [ ] Date validation alerts working
- [ ] Deliverable CRUD operations working
- [ ] <3 clicks to approve deliverable
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All API calls successful

---

**END OF PHASE 2 PLAN**
