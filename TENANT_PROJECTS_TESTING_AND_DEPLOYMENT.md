# Tenant Projects - Testing & Deployment Guide

## 🧪 Testing & Deployment Complete Guide

---

## 📋 Quick Start Testing

### Option 1: Manual API Testing

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Use the Testing Guide**
   - Follow `TENANT_PROJECTS_TESTING_GUIDE.md`
   - Test each endpoint with curl/Postman
   - Verify responses match API specification

### Option 2: Seed Test Data

1. **Run Seed Script**
   ```bash
   cd backend
   node src/scripts/seedTenantProjects.js <tenantSlug>
   ```

2. **Test with Frontend**
   - Start frontend development server
   - Navigate to project pages
   - Verify data displays correctly

---

## ✅ Testing Checklist

### Backend API Tests
- [ ] **Projects**
  - [ ] Create project
  - [ ] Get all projects (with filters)
  - [ ] Get single project
  - [ ] Update project
  - [ ] Delete project
  - [ ] Get project metrics

- [ ] **Tasks**
  - [ ] Create task
  - [ ] Get tasks (flat list)
  - [ ] Get tasks (grouped by status)
  - [ ] Update task status (drag-and-drop)
  - [ ] Delete task

- [ ] **Milestones**
  - [ ] Create milestone
  - [ ] Get milestones
  - [ ] Update milestone

- [ ] **Resources**
  - [ ] Get resources
  - [ ] Create resource
  - [ ] Update resource
  - [ ] Delete resource

- [ ] **Timesheets**
  - [ ] Create timesheet entry
  - [ ] Get timesheets (with period filter)
  - [ ] Update timesheet
  - [ ] Delete timesheet

- [ ] **Sprints**
  - [ ] Create sprint
  - [ ] Get sprints
  - [ ] Update sprint
  - [ ] Delete sprint

- [ ] **Clients**
  - [ ] Create client
  - [ ] Get clients
  - [ ] Update client
  - [ ] Delete client

### Frontend Integration Tests
- [ ] **Projects Overview**
  - [ ] Page loads
  - [ ] Metrics display
  - [ ] Projects list displays
  - [ ] Create project modal works
  - [ ] Project creation works

- [ ] **Tasks Kanban**
  - [ ] Board loads with columns
  - [ ] Tasks appear in correct columns
  - [ ] Drag-and-drop works
  - [ ] Create task modal works
  - [ ] Status updates persist

- [ ] **Milestones**
  - [ ] Milestones load
  - [ ] Timeline view works
  - [ ] List view works
  - [ ] Create milestone works

- [ ] **Resources**
  - [ ] Resources load
  - [ ] Utilization displays
  - [ ] Filtering works

- [ ] **Timesheets**
  - [ ] Entries load
  - [ ] Timer works
  - [ ] Create entry works
  - [ ] Period filters work

- [ ] **Sprints**
  - [ ] Sprints load
  - [ ] Active sprint displays
  - [ ] Create sprint works

### Error Handling Tests
- [ ] 401 Unauthorized handled
- [ ] 404 Not Found handled
- [ ] 400 Validation errors handled
- [ ] 500 Server errors handled
- [ ] Error messages display correctly

### Edge Cases
- [ ] Empty data states
- [ ] Large datasets (pagination)
- [ ] Invalid input handling
- [ ] Concurrent updates
- [ ] Tenant isolation

---

## 🚀 Deployment Steps

### Pre-Deployment

1. **Code Review**
   - [ ] Review all controller code
   - [ ] Check error handling
   - [ ] Verify security measures
   - [ ] Check tenant isolation

2. **Database**
   - [ ] Verify all indexes exist
   - [ ] Check migration scripts
   - [ ] Backup database

3. **Environment**
   - [ ] Set production environment variables
   - [ ] Configure CORS
   - [ ] Set up monitoring
   - [ ] Configure logging

### Deployment

1. **Backend Deployment**
   ```bash
   # Build (if needed)
   npm run build

   # Deploy to production
   # (Follow your deployment process)
   ```

2. **Database Migration**
   - Run any migration scripts
   - Verify Milestone model is created
   - Check indexes

3. **Frontend Deployment**
   ```bash
   # Build frontend
   npm run build

   # Deploy to production
   # (Follow your deployment process)
   ```

### Post-Deployment

1. **Verification**
   - [ ] Test all endpoints
   - [ ] Verify frontend works
   - [ ] Check logs for errors
   - [ ] Monitor performance

2. **Monitoring**
   - [ ] Set up error tracking
   - [ ] Monitor API response times
   - [ ] Track error rates
   - [ ] Monitor database queries

---

## 📊 Performance Considerations

### Database Indexes
Ensure these indexes exist:
- Projects: `{ orgId: 1, status: 1 }`, `{ orgId: 1, clientId: 1 }`
- Tasks: `{ orgId: 1, projectId: 1 }`, `{ orgId: 1, status: 1 }`
- Milestones: `{ orgId: 1, projectId: 1 }`, `{ orgId: 1, status: 1 }`
- Resources: `{ orgId: 1, userId: 1 }`
- Timesheets: `{ orgId: 1, date: 1 }`, `{ orgId: 1, projectId: 1 }`
- Sprints: `{ orgId: 1, projectId: 1 }`, `{ orgId: 1, status: 1 }`

### Query Optimization
- Use `select()` to limit fields
- Use `lean()` for read-only queries
- Implement pagination for large datasets
- Cache metrics calculations

### Caching Strategy
Consider caching:
- Project metrics (5-10 minute TTL)
- Resource utilization data
- Sprint velocity calculations

---

## 🔒 Security Checklist

- [ ] All endpoints require authentication
- [ ] Tenant isolation verified in all queries
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Mongoose handles)
- [ ] XSS prevention (input sanitization)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info

---

## 📝 Known Limitations

1. **TimeEntry TaskId**
   - TaskId is stored in tags field (format: "task:taskId")
   - Frontend extracts it from tags
   - Consider adding taskId field to TimeEntry schema in future

2. **Milestone Task Count**
   - Currently calculated from Task queries
   - Consider storing directly in Milestone for performance

3. **Resource Utilization**
   - Calculated on-the-fly
   - Consider caching for better performance

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Tasks not grouping by status
**Solution**: Ensure `groupBy=status` query parameter is sent

**Issue**: Timesheet entry requires clientId
**Solution**: Ensure project has a clientId assigned

**Issue**: Resource shows 0% allocation
**Solution**: Check workload.currentProjects array is populated

**Issue**: Sprint velocity is 0
**Solution**: Ensure sprint status is 'completed' and completedStoryPoints > 0

---

## ✅ Final Checklist

### Before Going Live
- [ ] All tests passing
- [ ] Security review complete
- [ ] Performance tested
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

## 🎯 Success Metrics

Track these metrics post-deployment:
- API response times
- Error rates
- User adoption
- Feature usage
- Performance metrics

---

**The system is ready for testing and deployment!** 🚀

