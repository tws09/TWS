# ERP Module Auth Migration - Quick Reference

## 🎯 Goal

Migrate from complex multi-middleware auth system to simple ERP module auth.

---

## 📋 Migration Steps

### Step 1: Create ERP Token Verification Middleware

**File:** `backend/src/middleware/verifyERPToken.js`

```javascript
const jwt = require('jsonwebtoken');

// Get ERP public key (cache it)
let erpPublicKey = null;
async function getERPPublicKey() {
  if (erpPublicKey) return erpPublicKey;
  erpPublicKey = process.env.ERP_PUBLIC_KEY;
  if (!erpPublicKey) {
    throw new Error('ERP_PUBLIC_KEY not configured');
  }
  return erpPublicKey;
}

module.exports = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.substring(7);

    // 2. Verify token (ERP's public key)
    const publicKey = await getERPPublicKey();
    const decoded = jwt.verify(token, publicKey, {
      issuer: process.env.ERP_ISSUER || 'erp.company.com',
      audience: 'nucleus-module'
    });

    // 3. Validate claims
    if (!decoded.userId || !decoded.workspaceId) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }

    // 4. Load user from ERP (read-only)
    const user = await erpDatabase.users.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // 5. Load workspace from ERP
    const workspace = await erpDatabase.workspaces.findById(decoded.workspaceId);
    if (!workspace || workspace.status !== 'active') {
      return res.status(403).json({ error: 'Workspace not active' });
    }

    // 6. Verify membership
    const membership = await erpDatabase.workspaceMembers.findOne({
      workspaceId: workspace.id,
      userId: user.id
    });
    if (!membership) {
      return res.status(403).json({ error: 'User not member of workspace' });
    }

    // 7. Set context (NO FALLBACKS)
    req.user = {
      id: user.id,
      email: user.email,
      role: membership.role,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId
    };
    req.workspace = workspace;
    req.tenantId = workspace.id; // Alias
    req.orgId = workspace.organizationId; // Alias

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
```

---

### Step 2: Update Routes

**Before:**
```javascript
router.get('/projects',
  verifyTenantOrgAccess,
  TenantMiddleware.setTenantContext,
  buildTenantContext,
  authenticateToken,
  requireRole(['admin']),
  controller.listProjects
);
```

**After:**
```javascript
const verifyERPToken = require('../../middleware/verifyERPToken');
const requireRole = require('../../middleware/requireRole');

router.get('/projects',
  verifyERPToken,
  requireRole(['admin']), // Optional
  controller.listProjects
);
```

---

### Step 3: Update Controllers

**Before:**
```javascript
async function listProjects(req, res) {
  const orgId = await getOrgId(req); // Complex fallback
  const projects = await Project.find({ orgId });
  res.json(projects);
}
```

**After:**
```javascript
async function listProjects(req, res) {
  const projects = await Project.find({
    workspace_id: req.workspace.id, // From middleware
    deleted_at: null
  });
  res.json(projects);
}
```

---

### Step 4: Update Repository Pattern

**File:** `backend/src/repositories/ProjectRepository.js`

```javascript
class ProjectRepository {
  async listProjects(workspaceId) {
    // ALWAYS include workspace_id filter
    return await Project.find({
      workspace_id: workspaceId,
      deleted_at: null
    });
  }

  async getProject(projectId, workspaceId) {
    // ALWAYS include workspace_id filter
    const project = await Project.findOne({
      _id: projectId,
      workspace_id: workspaceId,
      deleted_at: null
    });
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return project;
  }

  async createProject(data, workspaceId) {
    // ALWAYS set workspace_id on creation
    return await Project.create({
      ...data,
      workspace_id: workspaceId,
      created_at: new Date()
    });
  }
}
```

---

### Step 5: Update Frontend

**File:** `frontend/src/shared/services/apiService.js`

**Before:**
```javascript
const token = localStorage.getItem('token') || localStorage.getItem('tenantToken');
```

**After:**
```javascript
const token = localStorage.getItem('erpToken');
```

**Remove:**
- Token priority logic
- Token refresh logic (ERP handles it)
- Multiple token storage keys

---

## 🔄 Route Migration Examples

### Projects Routes

```javascript
// OLD
router.get('/api/tenant/:tenantSlug/organization/projects',
  verifyTenantOrgAccess,
  TenantMiddleware.setTenantContext,
  buildTenantContext,
  authenticateToken,
  projectController.listProjects
);

// NEW
router.get('/api/projects',
  verifyERPToken,
  projectController.listProjects
);
```

### Deliverables Routes

```javascript
// OLD
router.post('/api/tenant/:tenantSlug/organization/projects/:projectId/deliverables/:id/approve',
  verifyTenantOrgAccess,
  TenantMiddleware.setTenantContext,
  buildTenantContext,
  authenticateToken,
  requireRole(['admin', 'project_manager']),
  deliverableController.approveDeliverable
);

// NEW
router.post('/api/projects/:projectId/deliverables/:id/approve',
  verifyERPToken,
  requireRole(['admin', 'project_manager']),
  deliverableController.approveDeliverable
);
```

---

## 🗄️ Database Changes

### Add workspace_id to All Tables

```javascript
// Project model
const projectSchema = new mongoose.Schema({
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  // ... other fields
});

// Add index
projectSchema.index({ workspace_id: 1, deleted_at: 1 });
```

### Update All Queries

**Before:**
```javascript
const projects = await Project.find({ orgId: req.user.orgId });
```

**After:**
```javascript
const projects = await Project.find({ 
  workspace_id: req.workspace.id,
  deleted_at: null
});
```

---

## ✅ Checklist

### Backend:
- [ ] Create `verifyERPToken.js` middleware
- [ ] Set up ERP database connection (read-only)
- [ ] Configure `ERP_PUBLIC_KEY` environment variable
- [ ] Update all routes to use `verifyERPToken`
- [ ] Remove old middleware from routes
- [ ] Update all controllers to use `req.workspace.id`
- [ ] Update all repositories to filter by `workspace_id`
- [ ] Add `workspace_id` to all models
- [ ] Add indexes on `workspace_id`
- [ ] Test with real ERP tokens

### Frontend:
- [ ] Update to use single `erpToken`
- [ ] Remove token priority logic
- [ ] Remove token refresh logic
- [ ] Update API service to use single token
- [ ] Update all API calls

### Testing:
- [ ] Test token verification
- [ ] Test workspace isolation
- [ ] Test role-based access
- [ ] Test error handling
- [ ] Performance testing

---

## 🚨 Security Rules

1. **Always filter by workspace_id**
   - Every query must include `workspace_id`
   - Repository pattern enforces this
   - No exceptions

2. **No fallbacks**
   - If token invalid → 401
   - If user not found → 401
   - If workspace not found → 403
   - Fail fast, no guessing

3. **Single verification point**
   - All auth in `verifyERPToken`
   - No duplicate checks
   - Clear security boundary

---

## 📝 Environment Variables

```bash
# ERP Configuration
ERP_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
ERP_ISSUER=erp.company.com
ERP_DATABASE_URL=mongodb://erp-db:27017/erp

# Nucleus Configuration
NUCLEUS_DATABASE_URL=mongodb://nucleus-db:27017/nucleus
```

---

## 🔍 Testing

### Test Token Verification

```javascript
// Test with valid token
const token = 'valid_erp_token';
const response = await fetch('/api/projects', {
  headers: { Authorization: `Bearer ${token}` }
});
expect(response.status).toBe(200);

// Test with invalid token
const invalidToken = 'invalid_token';
const response2 = await fetch('/api/projects', {
  headers: { Authorization: `Bearer ${invalidToken}` }
});
expect(response2.status).toBe(401);
```

### Test Workspace Isolation

```javascript
// User in workspace A should not see workspace B's data
const tokenA = 'token_for_workspace_a';
const projectsA = await fetch('/api/projects', {
  headers: { Authorization: `Bearer ${tokenA}` }
});
// Should only return workspace A's projects

const tokenB = 'token_for_workspace_b';
const projectsB = await fetch('/api/projects', {
  headers: { Authorization: `Bearer ${tokenB}` }
});
// Should only return workspace B's projects
// Should NOT include workspace A's projects
```

---

## 📚 Key Files to Update

### Backend:
- `backend/src/middleware/verifyERPToken.js` (NEW)
- `backend/src/modules/tenant/routes/organization.js` (UPDATE)
- `backend/src/modules/tenant/routes/projects.js` (UPDATE)
- `backend/src/controllers/tenant/projectsController.js` (UPDATE)
- `backend/src/repositories/ProjectRepository.js` (UPDATE)
- All route files (UPDATE)

### Frontend:
- `frontend/src/shared/services/apiService.js` (UPDATE)
- `frontend/src/shared/services/tenantApiService.js` (UPDATE)
- `frontend/src/features/tenant/pages/tenant/org/projects/services/tenantProjectApiService.js` (UPDATE)
- `frontend/src/shared/utils/axiosInstance.js` (UPDATE)

---

**Status:** Ready for Implementation  
**Estimated Time:** 2-3 days for full migration

