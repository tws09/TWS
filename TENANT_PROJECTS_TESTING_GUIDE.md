# Tenant Projects - Testing Guide

## 🧪 Complete Testing Guide for Backend Integration

---

## 📋 Pre-Testing Checklist

### Backend Setup
- [ ] Backend server is running
- [ ] Database connection is working
- [ ] Authentication middleware is configured
- [ ] Tenant organization exists
- [ ] Test user has access to tenant

### Frontend Setup
- [ ] Frontend development server is running
- [ ] API service is configured
- [ ] Authentication token is available
- [ ] Base URL matches backend

---

## 🔧 Testing Setup

### 1. Get Authentication Token

First, authenticate and get a Bearer token:

```bash
# Example using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

Save the token for use in subsequent requests.

### 2. Get Tenant Slug

You need the tenant slug for all requests. Example: `tenant-slug`

---

## 📝 Endpoint Testing

### Projects Endpoints

#### 1. Create Project
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Test project description",
    "status": "planning",
    "priority": "high",
    "budget": {
      "total": 50000,
      "currency": "USD"
    },
    "timeline": {
      "startDate": "2025-01-01",
      "endDate": "2025-06-01",
      "estimatedHours": 1200
    },
    "tags": ["test", "development"]
  }'
```

**Expected**: 201 Created with project data

#### 2. Get All Projects
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects?status=active&limit=10" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with projects array

#### 3. Get Project Metrics
```bash
curl -X GET http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/metrics \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with metrics object

#### 4. Get Single Project
```bash
curl -X GET http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/{projectId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with project data

#### 5. Update Project
```bash
curl -X PATCH http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/{projectId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "metrics": {
      "completionRate": 25
    }
  }'
```

**Expected**: 200 OK with updated project

#### 6. Delete Project
```bash
curl -X DELETE http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/{projectId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with success message

---

### Tasks Endpoints

#### 1. Create Task
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/tasks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Task description",
    "status": "todo",
    "priority": "high",
    "type": "task",
    "projectId": "{projectId}",
    "storyPoints": 5,
    "labels": ["frontend", "ui"]
  }'
```

**Expected**: 201 Created with task data

#### 2. Get Tasks (Grouped by Status - for Kanban)
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/tasks?groupBy=status" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with tasks grouped by status
```json
{
  "success": true,
  "data": {
    "tasks": {
      "todo": [...],
      "in_progress": [...],
      "under_review": [...],
      "completed": [...]
    }
  }
}
```

#### 3. Get Tasks (Flat List)
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/tasks?projectId={projectId}" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with tasks array

#### 4. Update Task (Drag-and-Drop Status Change)
```bash
curl -X PATCH http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/tasks/{taskId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**Expected**: 200 OK with updated task

---

### Milestones Endpoints

#### 1. Create Milestone
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/milestones \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phase 1 Complete",
    "description": "Complete user authentication",
    "projectId": "{projectId}",
    "status": "pending",
    "dueDate": "2025-02-01"
  }'
```

**Expected**: 201 Created with milestone data

#### 2. Get Milestones
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/milestones?upcoming=true" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with milestones array

---

### Resources Endpoints

#### 1. Get Resources
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/resources?role=Developer" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with resources and utilization data

---

### Timesheets Endpoints

#### 1. Create Timesheet Entry
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/timesheets \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{projectId}",
    "hours": 8.5,
    "date": "2025-01-15",
    "description": "Worked on authentication feature",
    "billable": true,
    "status": "submitted"
  }'
```

**Expected**: 201 Created with timesheet entry

#### 2. Get Timesheets (Period Filter)
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/timesheets?period=this_week" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with timesheet entries

---

### Sprints Endpoints

#### 1. Create Sprint
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/sprints \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 1 - Authentication",
    "projectId": "{projectId}",
    "sprintNumber": 1,
    "startDate": "2025-01-01",
    "endDate": "2025-01-15",
    "goal": "Implement user authentication",
    "team": [
      {
        "userId": "{userId}",
        "role": "Developer",
        "capacity": 40
      }
    ]
  }'
```

**Expected**: 201 Created with sprint data

#### 2. Get Sprints
```bash
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/sprints?status=active" \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with sprints array

---

### Clients Endpoints

#### 1. Create Client
```bash
curl -X POST http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/clients \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "company": {
      "name": "Acme Corporation"
    },
    "contact": {
      "primary": {
        "email": "contact@acme.com",
        "phone": "+1234567890"
      }
    }
  }'
```

**Expected**: 201 Created with client data

#### 2. Get Clients
```bash
curl -X GET http://localhost:5000/api/tenant/{tenantSlug}/organization/projects/clients \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with clients array

---

## 🧪 Frontend Integration Testing

### 1. Test Projects Overview Page

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects`
2. Verify page loads without errors
3. Check if metrics are displayed
4. Verify project list appears
5. Test "New Project" button opens modal
6. Create a project via modal
7. Verify project appears in list

**Expected Results:**
- Page loads successfully
- Metrics cards show data
- Projects list displays
- Modal works correctly
- New project appears after creation

### 2. Test Tasks Kanban Board

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects/tasks`
2. Verify Kanban board loads
3. Check if tasks are grouped by status
4. Test drag-and-drop functionality
5. Create a new task
6. Move task between columns (drag-and-drop)
7. Verify task status updates

**Expected Results:**
- Kanban board displays with columns
- Tasks appear in correct columns
- Drag-and-drop updates task status
- New tasks can be created
- Status changes persist

### 3. Test Milestones Page

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects/milestones`
2. Verify milestones list loads
3. Test timeline view
4. Test list view
5. Create a milestone
6. Verify milestone appears

**Expected Results:**
- Milestones load successfully
- View toggle works
- New milestones can be created
- Progress bars display correctly

### 4. Test Resources Page

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects/resources`
2. Verify resources list loads
3. Check utilization percentages
4. Test filtering by role/department
5. Verify project allocations display

**Expected Results:**
- Resources list loads
- Utilization data displays
- Filters work correctly
- Project allocations show

### 5. Test Timesheets Page

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects/timesheets`
2. Verify timesheet entries load
3. Test time tracker (start/stop)
4. Create a time entry
5. Test period filtering
6. Verify billable hours tracking

**Expected Results:**
- Timesheet entries display
- Timer works correctly
- New entries can be created
- Filters work
- Billable/non-billable tracked

### 6. Test Sprints Page

**Steps:**
1. Navigate to `/tenant/{tenantSlug}/org/projects/sprints`
2. Verify sprints list loads
3. Check active sprint overview
4. Create a sprint
5. Verify velocity tracking

**Expected Results:**
- Sprints load successfully
- Active sprint displays
- New sprints can be created
- Velocity calculates correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Cause**: Missing or invalid token
**Solution**: 
- Check Authorization header format: `Bearer {token}`
- Verify token hasn't expired
- Re-authenticate to get new token

### Issue 2: 404 Not Found
**Cause**: Invalid tenant slug or endpoint
**Solution**:
- Verify tenant slug is correct
- Check endpoint URL matches specification
- Ensure routes are registered

### Issue 3: 400 Bad Request
**Cause**: Validation error or missing required fields
**Solution**:
- Check request body matches schema
- Verify all required fields are provided
- Check data types are correct

### Issue 4: 500 Internal Server Error
**Cause**: Server-side error
**Solution**:
- Check backend logs for error details
- Verify database connection
- Check model schemas match data

### Issue 5: Empty Arrays Returned
**Cause**: No data or tenant isolation issue
**Solution**:
- Verify tenant has data
- Check orgId filtering is working
- Create test data

---

## 📊 Test Data Setup

### Create Test Data Script

You may want to create a script to seed test data:

```javascript
// Example test data structure
const testData = {
  project: {
    name: "E-Commerce Platform",
    status: "active",
    priority: "high",
    budget: { total: 100000, currency: "USD" },
    timeline: {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
      estimatedHours: 2000
    }
  },
  tasks: [
    { title: "Setup project", status: "completed" },
    { title: "Design UI", status: "in_progress" },
    { title: "Implement authentication", status: "todo" }
  ],
  // ... more test data
};
```

---

## ✅ Testing Checklist

### Backend API Testing
- [ ] All 29 endpoints respond correctly
- [ ] Error handling works
- [ ] Validation works
- [ ] Tenant isolation works
- [ ] Data population works
- [ ] Filtering works
- [ ] Pagination works

### Frontend Integration Testing
- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] CRUD operations work
- [ ] Modals work
- [ ] Drag-and-drop works
- [ ] Filters work
- [ ] Search works
- [ ] Error messages display
- [ ] Loading states work
- [ ] Empty states display

### User Workflow Testing
- [ ] Create project → Add tasks → Track time
- [ ] Create milestone → Link tasks → Track progress
- [ ] Assign resources → Track utilization
- [ ] Create sprint → Add tasks → Track velocity
- [ ] Create client → Assign to project

---

## 🚀 Next Steps After Testing

1. **Fix Any Issues Found**
   - Update controller logic
   - Fix validation
   - Adjust response formats

2. **Performance Testing**
   - Test with large datasets
   - Optimize slow queries
   - Add indexes if needed

3. **Production Deployment**
   - Code review
   - Security audit
   - Performance optimization
   - Documentation updates

---

**Ready to start testing!** 🧪

