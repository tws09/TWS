# Nucleus Utilities & Validation Implementation

## Overview

This document describes the utility functions and validation helpers added to improve code quality, reusability, and maintainability of the Nucleus Project OS codebase.

**Implementation Date:** December 2024  
**Status:** ✅ Complete

---

## Utility Functions (`backend/src/utils/nucleusHelpers.js`)

### Deliverable Utilities

#### `calculateDeliverableProgress(deliverableId)`
Calculates deliverable progress percentage from linked tasks.

**Returns:** `Promise<Number>` - Progress percentage (0-100)

**Usage:**
```javascript
const progress = await calculateDeliverableProgress(deliverableId);
// Updates deliverable.progress_percentage automatically
```

#### `isDeliverableAtRisk(deliverableId)`
Checks if deliverable is at risk based on remaining work vs. days remaining.

**Returns:** `Promise<Boolean>` - True if at risk

**Logic:**
- Calculates days remaining until target date
- Estimates work remaining (10% progress = 1 day)
- Returns true if work remaining > days remaining

#### `getDeliverableStatusSummary(deliverableId)`
Gets comprehensive status summary for a deliverable.

**Returns:** `Promise<Object>` - Status summary object

**Includes:**
- Deliverable status
- Client status (not_ready, pending_approval, approved, rejected, waiting_internal)
- Progress percentage
- At-risk indicator
- Approval counts (total, approved, pending, rejected)
- Blocking criteria status
- Days until target

**Usage:**
```javascript
const summary = await getDeliverableStatusSummary(deliverableId);
// {
//   deliverable_status: 'ready_approval',
//   client_status: 'pending_approval',
//   progress_percentage: 100,
//   is_at_risk: false,
//   approvals: { total: 3, approved: 2, pending: 1, rejected: 0 },
//   blocking_criteria_met: true,
//   days_until_target: 5
// }
```

#### `validateDeliverableStatusTransition(deliverableId, newStatus)`
Validates if deliverable can transition to new status.

**Returns:** `Promise<Object>` - `{ valid: Boolean, error?: String }`

**Valid Transitions:**
- `created` → `in_dev`
- `in_dev` → `ready_approval`, `in_rework`
- `ready_approval` → `approved`, `in_rework`
- `approved` → `shipped`
- `in_rework` → `in_dev`

**Special Validation:**
- `ready_approval` requires blocking criteria to be met

#### `formatDeliverableForClient(deliverable)`
Formats deliverable for client view (clean, no internal details).

**Returns:** `Object` - Formatted deliverable

**Removes:**
- Internal task details
- Internal notes
- Internal comments

#### `formatDeliverableForInternal(deliverable)`
Formats deliverable for internal view (full details with tasks and approvals).

**Returns:** `Promise<Object>` - Formatted deliverable with full details

**Includes:**
- All deliverable fields
- Linked tasks with details
- Approval status
- At-risk indicator

---

### Workspace Utilities

#### `getWorkspaceStatistics(workspaceId)`
Gets comprehensive statistics for a workspace.

**Returns:** `Promise<Object>` - Workspace statistics

**Includes:**
- Project counts (total, active, completed)
- Deliverable counts by status
- Task counts by status
- Metrics:
  - On-time delivery rate
  - Average progress

**Usage:**
```javascript
const stats = await getWorkspaceStatistics(workspaceId);
// {
//   workspace: { _id, name, members_count },
//   projects: { total: 10, active: 7, completed: 3 },
//   deliverables: { total: 25, by_status: {...} },
//   tasks: { total: 150, by_status: {...} },
//   metrics: { on_time_delivery_rate: 85, average_progress: 65 }
// }
```

#### `getProjectDeliverablesSummary(projectId)`
Gets summary of deliverables for a project.

**Returns:** `Promise<Object>` - Project deliverables summary

**Includes:**
- Project details
- Deliverable counts by status
- At-risk vs. on-track counts
- Average progress

---

## Validation Rules (`backend/src/validators/nucleusValidators.js`)

### Deliverable Validators

#### `deliverableValidators.create`
Validates deliverable creation request.

**Rules:**
- `project_id`: Required, valid MongoDB ID
- `name`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `start_date`: Required, valid ISO 8601 date
- `target_date`: Required, valid ISO 8601 date, must be after start_date
- `acceptance_criteria`: Optional array, each item must have description
- `ownerId`: Optional, valid MongoDB ID

#### `deliverableValidators.update`
Validates deliverable update request.

**Rules:**
- All fields optional
- Same validation rules as create for provided fields

#### `deliverableValidators.status`
Validates deliverable status update.

**Rules:**
- `status`: Required, must be one of: created, in_dev, ready_approval, approved, shipped, in_rework

---

### Approval Validators

#### `approvalValidators.createChain`
Validates approval chain creation.

**Rules:**
- `devLeadId`: Required, valid MongoDB ID
- `qaLeadId`: Required, valid MongoDB ID
- `securityId`: Optional, valid MongoDB ID
- `clientEmail`: Required, valid email format

#### `approvalValidators.approve`
Validates approval step approval.

**Rules:**
- `notes`: Optional, max 500 characters

#### `approvalValidators.reject`
Validates approval step rejection.

**Rules:**
- `reason`: Required, 10-500 characters

---

### Change Request Validators

#### `changeRequestValidators.submit`
Validates change request submission.

**Rules:**
- `description`: Required, 20-1000 characters

#### `changeRequestValidators.evaluate`
Validates change request evaluation.

**Rules:**
- `pm_notes`: Optional, max 1000 characters
- `effort_days`: Optional, positive number
- `cost_impact`: Optional, positive number
- `date_impact_days`: Optional, non-negative integer
- `pm_recommendation`: Required, one of: accept, reject, negotiate

#### `changeRequestValidators.decide`
Validates change request decision.

**Rules:**
- `decision`: Required, one of: accept, reject

---

### Template Validators

#### `templateValidators.createFromTemplate`
Validates project creation from template.

**Rules:**
- `templateType`: Required, one of: website, mobile_app, custom
- `projectName`: Required, 1-200 characters
- `clientId`: Optional, valid MongoDB ID
- `devLeadId`: Optional, valid MongoDB ID
- `qaLeadId`: Optional, valid MongoDB ID
- `clientEmail`: Optional, valid email format

#### `templateValidators.quickStart`
Validates quick start onboarding.

**Rules:**
- `workspaceName`: Required, 1-100 characters
- `projectName`: Required, 1-200 characters
- `templateType`: Required, one of: website, mobile_app, custom

---

### Parameter Validators

#### `paramValidators.workspaceId`
Validates workspace ID parameter.

**Rules:**
- Required
- Valid MongoDB ID format

#### `paramValidators.projectId`
Validates project ID parameter.

**Rules:**
- Required
- Valid MongoDB ID format

#### `paramValidators.deliverableId`
Validates deliverable ID parameter.

**Rules:**
- Required
- Valid MongoDB ID format

#### `paramValidators.approvalId`
Validates approval ID parameter.

**Rules:**
- Required
- Valid MongoDB ID format

#### `paramValidators.changeRequestId`
Validates change request ID parameter.

**Rules:**
- Required
- Valid MongoDB ID format

---

### Validation Error Handler

#### `handleValidationErrors`
Express middleware to handle validation errors.

**Usage:**
```javascript
router.post('/endpoint',
  validator1,
  validator2,
  handleValidationErrors,
  handler
);
```

**Response Format:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

---

## Integration with Routes

### Updated Routes

All Nucleus routes now use validators:

**nucleusPM.js:**
- ✅ Create deliverable (validated)
- ✅ Update deliverable status (validated)
- ✅ Create approval chain (validated)
- ✅ Approve step (validated)
- ✅ Reject step (validated)
- ✅ Evaluate change request (validated)

**nucleusClientPortal.js:**
- ✅ Approve deliverable (validated)
- ✅ Submit change request (validated)
- ✅ Decide on change request (validated)

**Benefits:**
- Consistent validation across all endpoints
- Clear error messages
- Reduced code duplication
- Type safety

---

## Usage Examples

### Using Helpers in Routes

```javascript
const { calculateDeliverableProgress, getDeliverableStatusSummary } = require('../../../utils/nucleusHelpers');

// Calculate progress
await calculateDeliverableProgress(deliverableId);

// Get status summary
const summary = await getDeliverableStatusSummary(deliverableId);
res.json({ success: true, data: summary });
```

### Using Validators in Routes

```javascript
const { deliverableValidators, handleValidationErrors } = require('../../../validators/nucleusValidators');

router.post('/deliverables',
  deliverableValidators.create,
  handleValidationErrors,
  async (req, res) => {
    // req.body is validated
  }
);
```

### Using Workspace Statistics

```javascript
const { getWorkspaceStatistics } = require('../../../utils/nucleusHelpers');

// Get workspace dashboard data
const stats = await getWorkspaceStatistics(workspaceId);
res.json({ success: true, data: stats });
```

---

## Benefits

### Code Quality
- ✅ Consistent validation logic
- ✅ Reusable utility functions
- ✅ Reduced code duplication
- ✅ Type safety with express-validator

### Maintainability
- ✅ Centralized validation rules
- ✅ Easy to update validation logic
- ✅ Clear error messages
- ✅ Well-documented functions

### Developer Experience
- ✅ Easy to use helpers
- ✅ Clear validation errors
- ✅ Consistent API responses
- ✅ Type-safe parameters

---

## Testing

### Helper Functions
- [ ] `calculateDeliverableProgress` calculates correctly
- [ ] `isDeliverableAtRisk` detects at-risk deliverables
- [ ] `getDeliverableStatusSummary` returns complete summary
- [ ] `validateDeliverableStatusTransition` validates transitions
- [ ] `getWorkspaceStatistics` calculates accurate stats

### Validators
- [ ] All validators reject invalid input
- [ ] All validators accept valid input
- [ ] Error messages are clear and helpful
- [ ] Validation errors return proper format

---

## Summary

✅ **Utilities & Validation Complete**

All utility functions and validators are implemented:
- ✅ 8 utility functions for common operations
- ✅ 5 validator sets for different entities
- ✅ Parameter validators for all ID types
- ✅ Validation error handler middleware
- ✅ Routes updated to use validators

**The codebase is now more robust, maintainable, and developer-friendly.**
