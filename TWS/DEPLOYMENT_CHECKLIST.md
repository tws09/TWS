# Faculty Role System - Deployment Checklist

## ✅ Pre-Deployment Verification

### Backend Verification
- [x] All models created and tested
- [x] API routes mounted correctly
- [x] Middleware updated for multi-role support
- [x] Permission checks working
- [x] Counselor privacy filtering implemented
- [x] Audit logging integrated

### Frontend Verification
- [x] Role Management page created
- [x] Role Assignment component working
- [x] User Profile integration complete
- [x] Menu items added
- [x] API service methods added

### Testing
- [x] Unit tests created
- [x] Integration tests created
- [x] Test scripts ready

---

## 🚀 Deployment Steps

### Step 1: Database Migration

```bash
# Navigate to project root
cd c:\Users\Super\Desktop\TWS\TWS

# Dry run first (recommended)
node backend/src/scripts/migrateFacultyRoles.js --dry-run

# Run actual migration
node backend/src/scripts/migrateFacultyRoles.js

# For specific tenant
node backend/src/scripts/migrateFacultyRoles.js --tenant-slug=your-tenant-slug
```

**Expected Output:**
- Creates `SchoolRoleConfig` documents for all education organizations
- Enables default roles (principal, head_teacher, teacher, student)
- Disables new faculty roles by default (can be enabled per school)

### Step 2: Verify Backend Server

```bash
# Start backend server
cd backend
npm start

# Or if using nodemon
npm run dev
```

**Verify Endpoints:**
- `GET /api/tenant/:tenantSlug/education/roles` - Should return all available roles
- `GET /api/tenant/:tenantSlug/education/roles/config` - Should return school config
- `POST /api/tenant/:tenantSlug/education/roles/assign` - Should create role request

### Step 3: Verify Frontend

```bash
# Start frontend server
cd frontend
npm start
```

**Verify Pages:**
- Navigate to: `/tenant/{tenantSlug}/org/education/roles`
- Should see Role Management page with all roles
- Should be able to enable/disable roles
- Should see pending requests section

### Step 4: Run Tests

```bash
# Unit tests
npm test -- roleSystem.test.js

# Integration tests (requires test database)
npm test -- roleManagement.test.js

# End-to-end test script
node backend/src/scripts/testRoleManagement.js --tenant-slug=your-tenant-slug
```

---

## 📋 Post-Deployment Tasks

### For Each School/Organization:

1. **Access Role Management**
   - Navigate to `/tenant/{tenantSlug}/org/education/roles`
   - Must be logged in as admin/principal

2. **Enable Required Roles**
   - Review all available roles
   - Enable roles needed for your school
   - Customize role labels if needed (e.g., "Lab Instructor" → "Science Lab Teacher")

3. **Assign Roles to Users**
   - Go to User Profile
   - Use Role Assignment section
   - Select additional roles
   - Submit for approval

4. **Approve Role Requests**
   - Go to Role Management page
   - Click "Pending Requests"
   - Review and approve/reject requests

---

## 🔍 Verification Checklist

### Backend API Tests

```bash
# Test with curl or Postman

# 1. Get available roles
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/education/roles" \
  -H "Authorization: Bearer {token}"

# 2. Get role config
curl -X GET "http://localhost:5000/api/tenant/{tenantSlug}/education/roles/config" \
  -H "Authorization: Bearer {token}"

# 3. Update role config
curl -X PUT "http://localhost:5000/api/tenant/{tenantSlug}/education/roles/config" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"enabledRoles": [{"role": "counselor", "label": "Counselor", "enabled": true}]}'

# 4. Assign role
curl -X POST "http://localhost:5000/api/tenant/{tenantSlug}/education/roles/assign" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "{userId}", "role": "sports_coach", "requestType": "add_role", "reason": "User is a coach"}'
```

### Frontend UI Tests

1. **Role Management Page**
   - [ ] Page loads without errors
   - [ ] All roles displayed correctly
   - [ ] Can toggle role enable/disable
   - [ ] Can customize role labels
   - [ ] Pending requests section works

2. **Role Assignment Component**
   - [ ] Component loads in User Profile
   - [ ] Shows only enabled roles
   - [ ] Displays custom labels
   - [ ] Can select multiple roles
   - [ ] Creates approval requests

3. **User Profile**
   - [ ] Shows primary role
   - [ ] Shows additional active roles
   - [ ] Role assignment section visible for admins

---

## 🐛 Troubleshooting

### Issue: Migration script finds 0 organizations

**Solution:** 
- Verify MongoDB connection
- Check that organizations have `erpCategory: 'education'`
- Run with specific tenant: `--tenant-slug=your-tenant`

### Issue: API returns 404

**Solution:**
- Verify routes are mounted in `education.js`
- Check that `validateTenantAccess` middleware is working
- Verify tenant slug is correct

### Issue: Frontend can't fetch roles

**Solution:**
- Check API endpoint URL
- Verify authentication token
- Check browser console for errors
- Verify CORS settings

### Issue: Role assignment not working

**Solution:**
- Verify user has permission to assign roles
- Check that role is enabled in school config
- Verify approval workflow is working
- Check backend logs for errors

---

## 📊 Monitoring

### Key Metrics to Monitor

1. **Role Assignment Requests**
   - Number of pending requests
   - Average approval time
   - Rejection rate

2. **Role Usage**
   - Most commonly assigned roles
   - Schools using new roles
   - Multi-role assignments

3. **Performance**
   - API response times
   - Database query performance
   - Frontend load times

---

## ✅ Success Criteria

- [ ] Migration script runs successfully
- [ ] All API endpoints respond correctly
- [ ] Frontend pages load without errors
- [ ] Role assignment workflow works end-to-end
- [ ] Approval process functions correctly
- [ ] Multi-role support working
- [ ] Counselor privacy filtering active
- [ ] Audit logs being created

---

## 📞 Support

If you encounter issues:
1. Check logs in `backend/logs/`
2. Review browser console for frontend errors
3. Verify database indexes are created
4. Check MongoDB connection
5. Review API response errors

---

**Status:** ✅ Ready for Deployment
**Last Updated:** [Current Date]
