# Quick Start Testing Guide

## ✅ Basic Tests: PASSED

All structural tests have passed:
- ✅ All 29 controller functions exist
- ✅ All models import correctly
- ✅ Routes are registered
- ✅ No syntax errors
- ✅ No linting errors

---

## 🚀 Quick Test Options

### Option 1: Test Structure (Already Done ✅)
```bash
cd backend
node src/scripts/testTenantProjects.js
```
**Result**: ✅ All tests passed

### Option 2: Test with Real Server (Recommended)

#### Step 1: Start Backend Server
```bash
cd backend
npm start
```

#### Step 2: Get Authentication Token
You need to login first to get a Bearer token:

**Option A: Using curl**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

**Option B: Using Postman**
1. Create new POST request
2. URL: `http://localhost:5000/api/auth/login`
3. Body: `{"email": "...", "password": "..."}`
4. Copy the token from response

#### Step 3: Test an Endpoint

**Test Get Projects:**
```bash
curl -X GET "http://localhost:5000/api/tenant/YOUR_TENANT_SLUG/organization/projects" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Get Project Metrics:**
```bash
curl -X GET "http://localhost:5000/api/tenant/YOUR_TENANT_SLUG/organization/projects/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 3: Seed Test Data First

Before testing, you may want to create test data:

```bash
cd backend
node src/scripts/seedTenantProjects.js YOUR_TENANT_SLUG
```

This will create:
- Sample projects
- Sample tasks
- Sample milestones
- Sample sprints
- Sample timesheets
- Sample resources
- Test client

### Option 4: Use Postman Collection

Create a Postman collection with all endpoints:

**Base URL**: `http://localhost:5000/api/tenant/{tenantSlug}/organization/projects`

**Endpoints to test:**
1. GET `/projects`
2. GET `/projects/metrics`
3. GET `/projects/tasks?groupBy=status`
4. GET `/projects/milestones`
5. GET `/projects/resources`
6. GET `/projects/timesheets`
7. GET `/projects/sprints`
8. GET `/projects/clients`

---

## 📋 Minimal Test Checklist

### Quick Verification (5 minutes)

1. **Start Server**
   ```bash
   cd backend
   npm start
   ```

2. **Test One Endpoint**
   - Use Postman or curl
   - Test GET `/projects/metrics`
   - Verify you get a response (even if 401, that's expected without auth)

3. **Verify Frontend Connection**
   - Start frontend: `cd frontend && npm start`
   - Navigate to projects page
   - Check browser console for errors

### Full Test (30 minutes)

1. **Seed Test Data**
   ```bash
   node src/scripts/seedTenantProjects.js YOUR_TENANT_SLUG
   ```

2. **Test All GET Endpoints**
   - Projects, Tasks, Milestones, Resources, Timesheets, Sprints, Clients
   - Verify data structure matches expectations

3. **Test CRUD Operations**
   - Create a project
   - Update it
   - Verify changes
   - Delete it

4. **Test Frontend Integration**
   - All pages load
   - Data displays
   - Modals work
   - CRUD operations work from UI

---

## 🔍 What to Look For

### ✅ Good Signs
- Endpoints return 200 status
- Data structure matches API spec
- No console errors
- Frontend loads data correctly
- CRUD operations work

### ⚠️ Issues to Watch For
- 401 Unauthorized → Need valid token
- 404 Not Found → Check tenant slug or endpoint URL
- 500 Server Error → Check backend logs
- Empty arrays → No data or tenant isolation issue
- CORS errors → Backend CORS not configured

---

## 💡 Quick Debugging

### If endpoints return 401:
- Check Authorization header format: `Bearer {token}`
- Verify token is valid and not expired
- Re-authenticate to get new token

### If endpoints return 404:
- Verify tenant slug is correct
- Check endpoint URL matches specification
- Ensure routes are registered

### If endpoints return 500:
- Check backend console for error details
- Verify database connection
- Check model schemas match data

### If frontend shows errors:
- Check browser console
- Verify API base URL is correct
- Check network tab for API calls
- Verify authentication token is set

---

## ✅ Test Status

**Structure Tests**: ✅ PASSED
**Ready for**: Functional API Testing

**Next**: Start server and test with real API calls!

---

*All basic structure tests passed! Ready for functional testing.* 🚀

