# Nucleus Project OS - Deployment & Testing Guide

## Overview

This guide provides step-by-step instructions for deploying and testing the Nucleus Project OS MVP.

**Status:** Ready for Beta Launch

---

## Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] MongoDB connection configured
- [ ] Environment variables set
- [ ] Slack webhook URLs configured (optional)
- [ ] JWT secrets configured

### Database Setup
- [ ] MongoDB indexes created
- [ ] Workspace schema validated
- [ ] Test data seeded (optional)

### Code Quality
- [ ] No linter errors
- [ ] All tests passing
- [ ] Environment variables documented

---

## Deployment Steps

### 1. Environment Configuration

Create `.env` file with required variables:

```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Server
PORT=5000
NODE_ENV=production

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Database Indexes

The indexes are automatically created by Mongoose, but you can verify:

```bash
# Connect to MongoDB and verify indexes
mongosh "your_connection_string"
use your_database
db.workspaces.getIndexes()
db.deliverables.getIndexes()
db.approvals.getIndexes()
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Verify Deployment

```bash
# Health check
curl http://localhost:5000/api/health

# Test workspace creation (requires auth)
# Use Postman or your API client
```

---

## Testing Guide

### Manual Testing Checklist

#### Workspace Isolation
1. **Create Workspace A**
   - Create workspace "Gamma Tech"
   - Add user as owner
   - Create project "Project 1"

2. **Create Workspace B**
   - Create workspace "Acme Corp"
   - Add same user as owner
   - Create project "Project 2"

3. **Verify Isolation**
   - User in Workspace A should NOT see Workspace B's projects
   - User in Workspace B should NOT see Workspace A's projects
   - ✅ **Expected**: Hard isolation enforced

#### Approval Workflow
1. **Create Deliverable**
   - Create deliverable "Authentication System"
   - Status: `created`

2. **Create Approval Chain**
   - Dev Lead: User A
   - QA Lead: User B
   - Client: client@example.com

3. **Test Sequential Approval**
   - Try to approve Step 2 (QA) before Step 1 (Dev)
   - ✅ **Expected**: Error - previous step must be approved
   - Approve Step 1 (Dev)
   - Approve Step 2 (QA)
   - Approve Step 4 (Client)
   - ✅ **Expected**: Deliverable status = `approved`

#### Change Requests
1. **Submit Change Request**
   - Client submits: "Add password strength meter"
   - Status: `submitted`

2. **PM Evaluates**
   - PM evaluates: 2 days, $1,200, +2 days
   - Recommendation: `accept`
   - Status: `evaluated`

3. **Client Decides**
   - Client accepts
   - ✅ **Expected**: Deliverable target date updated (+2 days)
   - Status: `accepted`

#### Templates
1. **Create Project from Website Template**
   - Use template: `website`
   - Project name: "Test Website"
   - ✅ **Expected**: 4 deliverables created with tasks

2. **Quick Start Onboarding**
   - Workspace name: "Test Workspace"
   - Project name: "Test Project"
   - Template: `mobile_app`
   - ✅ **Expected**: Workspace + project + 4 deliverables created

#### Auto-Calculation
1. **Link Task to Deliverable**
   - Create task
   - Link to deliverable
   - ✅ **Expected**: Deliverable progress updates

2. **Complete Task**
   - Mark task as completed
   - ✅ **Expected**: Deliverable progress recalculated
   - If all tasks complete: Deliverable status → `ready_approval`

---

## API Testing Examples

### 1. Create Workspace

```bash
POST /api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Gamma Tech Solutions",
  "description": "Software development agency",
  "type": "agency",
  "settings": {
    "timezone": "America/Los_Angeles",
    "currency": "USD",
    "approvalWorkflow": {
      "defaultSteps": "dev_qa_client"
    }
  }
}
```

### 2. Quick Start Onboarding

```bash
POST /api/nucleus-templates/onboarding/quick-start
Authorization: Bearer <token>
Content-Type: application/json

{
  "workspaceName": "Gamma Tech Solutions",
  "projectName": "Client Portal App",
  "templateType": "website",
  "devLeadId": "...",
  "qaLeadId": "...",
  "clientEmail": "client@example.com"
}
```

### 3. Create Deliverable

```bash
POST /api/nucleus-pm/workspaces/:workspaceId/deliverables
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "...",
  "name": "Authentication System",
  "description": "User login and registration",
  "start_date": "2024-01-01",
  "target_date": "2024-01-31",
  "acceptance_criteria": [
    {
      "description": "User can register with email",
      "met": false
    }
  ]
}
```

### 4. Create Approval Chain

```bash
POST /api/nucleus-pm/workspaces/:workspaceId/deliverables/:deliverableId/approvals/create-chain
Authorization: Bearer <token>
Content-Type: application/json

{
  "devLeadId": "...",
  "qaLeadId": "...",
  "clientEmail": "client@example.com"
}
```

### 5. Approve Step (Internal)

```bash
POST /api/nucleus-pm/workspaces/:workspaceId/approvals/:approvalId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Code review complete, looks good"
}
```

### 6. Client Approve Deliverable

```bash
POST /api/nucleus-client-portal/workspaces/:workspaceId/deliverables/:deliverableId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "notes": "Looks great!"
}
```

---

## Integration Testing

### Test Scenarios

#### Scenario 1: Complete Workflow
1. Create workspace
2. Create project from template
3. Create deliverable
4. Link tasks to deliverable
5. Complete tasks (auto-updates progress)
6. Mark deliverable as ready_approval
7. Create approval chain
8. Approve internal steps (Dev → QA)
9. Client approves
10. Deliverable status = `approved`

**Expected Result:** All steps complete successfully

#### Scenario 2: Change Request Flow
1. Client submits change request
2. PM evaluates (effort, cost, timeline)
3. Client decides (accept/reject)
4. If accepted: Deliverable target date updates

**Expected Result:** Change request processed, date updated if accepted

#### Scenario 3: At-Risk Detection
1. Create deliverable with target date 10 days away
2. Link tasks with 20 days of work
3. Check at-risk status

**Expected Result:** Deliverable marked as at-risk

---

## Performance Testing

### Load Testing

```bash
# Test workspace statistics endpoint
ab -n 1000 -c 10 \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/nucleus-analytics/workspaces/:workspaceId/statistics
```

### Database Query Performance

```javascript
// Test workspace-scoped queries
db.deliverables.find({ workspaceId: ObjectId("...") }).explain("executionStats")
```

**Expected:**
- Index used: `workspaceId_1_status_1`
- Query time: < 50ms for 1000 deliverables

---

## Security Testing

### Workspace Isolation Tests

1. **Cross-Workspace Access Test**
   ```javascript
   // User in Workspace A tries to access Workspace B's project
   GET /api/nucleus-pm/workspaces/:workspaceBId/projects/:projectId/deliverables
   ```
   **Expected:** 403 Forbidden

2. **Resource Ownership Test**
   ```javascript
   // User tries to approve deliverable from different workspace
   POST /api/nucleus-pm/workspaces/:workspaceId/approvals/:approvalId/approve
   ```
   **Expected:** 403 Forbidden if not workspace member

### Input Validation Tests

1. **Invalid Status Transition**
   ```javascript
   POST /api/nucleus-pm/workspaces/:workspaceId/deliverables/:deliverableId/status
   { "status": "invalid_status" }
   ```
   **Expected:** 400 Bad Request

2. **Missing Required Fields**
   ```javascript
   POST /api/nucleus-pm/workspaces/:workspaceId/deliverables
   { "name": "Test" } // Missing project_id, dates
   ```
   **Expected:** 400 Bad Request with validation errors

---

## Monitoring & Logging

### Key Metrics to Monitor

1. **API Response Times**
   - Workspace statistics: < 200ms
   - Deliverable list: < 100ms
   - Gantt data: < 150ms

2. **Error Rates**
   - 4xx errors: < 5%
   - 5xx errors: < 1%

3. **Database Performance**
   - Query time: < 100ms (p95)
   - Connection pool usage: < 80%

### Logging

All Nucleus operations log:
- Workspace access attempts
- Approval actions
- Change request submissions
- Status transitions

**Log Format:**
```
[INFO] Workspace access verified: workspaceId=..., userId=...
[INFO] Deliverable status updated: deliverableId=..., oldStatus=..., newStatus=...
[ERROR] Approval chain creation failed: deliverableId=..., error=...
```

---

## Troubleshooting

### Common Issues

#### Issue: Workspace isolation not working
**Symptoms:** Users can see other workspaces' data

**Solution:**
1. Verify `verifyWorkspaceAccess` middleware is applied
2. Check `workspaceId` is set on all resources
3. Verify database indexes exist

#### Issue: Deliverable progress not updating
**Symptoms:** Progress stays at 0% even when tasks complete

**Solution:**
1. Verify tasks are linked to deliverable (`milestoneId` set)
2. Check auto-calculation service is called
3. Manually trigger: `batchUpdateWorkspaceProgress`

#### Issue: Approval workflow not sequential
**Symptoms:** Can approve step 2 before step 1

**Solution:**
1. Verify `isPreviousStepApproved` check is working
2. Check approval chain created correctly
3. Verify `can_proceed` flag logic

---

## Rollback Plan

If issues occur:

1. **Disable Nucleus Routes**
   ```javascript
   // In app.js, comment out:
   // app.use('/api/nucleus-client-portal', ...);
   // app.use('/api/nucleus-pm', ...);
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   mongorestore --db your_database backup/
   ```

3. **Code Rollback**
   ```bash
   git checkout <previous_commit>
   npm install
   npm start
   ```

---

## Post-Deployment

### Immediate Actions
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify workspace isolation
- [ ] Test approval workflow end-to-end

### First Week
- [ ] Collect user feedback
- [ ] Monitor performance metrics
- [ ] Fix any critical bugs
- [ ] Optimize slow queries

### First Month
- [ ] Analyze usage patterns
- [ ] Optimize based on real usage
- [ ] Add missing features based on feedback
- [ ] Prepare for scale

---

## Support

For deployment issues:
1. Check logs: `backend/logs/`
2. Verify environment variables
3. Test database connection
4. Check MongoDB indexes

For API issues:
1. Verify authentication token
2. Check workspace membership
3. Validate request body
4. Review error messages

---

## Summary

✅ **Deployment Guide Complete**

The system is ready for:
- ✅ Production deployment
- ✅ Beta testing
- ✅ Pilot customers
- ✅ Performance monitoring

**Next Step: Deploy to staging environment and run full test suite**
