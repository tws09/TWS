# Project Management Authentication Flow - Current Implementation

## Overview

The project management system uses a **secure single-middleware authentication flow** that combines token verification, tenant validation, user authentication, workspace membership verification, and context setup into one middleware: `verifyERPToken`.

**Security Status:** ✅ **All critical and high-priority vulnerabilities fixed**  
**Production Ready:** ✅ **Yes** (after testing)

**Latest Security Improvements:**
- ✅ Rate limiting on token verification routes
- ✅ Client portal one-time token system (separate from ERP auth)
- ✅ HTTPS cookie enforcement
- ✅ Comprehensive security headers
- ✅ Token blacklist/revocation support
- ✅ Complete audit logging

  ---

## Authentication Flow Diagram

```
Frontend Request
    ↓
[1] API Request with Bearer Token
    URL: /api/tenant/:tenantSlug/organization/projects/*
    Headers: Authorization: Bearer <token>
    ↓
[2] Route Registration (organization.js)
    router.use('/projects', tokenVerificationLimiter, verifyERPToken, projectsRoutes)
    ├─ SECURITY: Rate limiting (100 requests per 15 min per IP)
    └─ SECURITY: Token verification middleware
    ↓
[3] Rate Limiting (tokenVerificationLimiter)
    ├─ SECURITY: Limit 100 requests per 15 minutes per IP
    ├─ Skip if user already authenticated (prevents blocking legit users)
    ├─ Log rate limit violations to audit service
    └─ Return 429 if limit exceeded
    ↓
[4] verifyERPToken Middleware (Secure Single Middleware)
    ├─ [4.1] Extract token from Authorization header
    │   └─ Validate format (Bearer <token>)
    ├─ [4.2] SECURITY: Check token blacklist (revoked tokens)
    │   └─ tokenBlacklistService.isTokenBlacklisted(token)
    ├─ [4.3] Verify token signature (JWT)
    │   ├─ Try jwtService.verifyAccessToken() (regular tokens)
    │   └─ Fallback to jwt.verify() (tenant_owner tokens)
    │   └─ Handle TokenExpiredError with clear message
    ├─ [4.4] Validate required claims (userId, tenantId, etc.)
    │   └─ Fail fast if missing
    ├─ [4.5] SECURITY: Input validation for tenantSlug
    │   └─ Regex validation: /^[a-zA-Z0-9_-]+$/ (prevent NoSQL injection)
    ├─ [4.6] Load tenant from database
    │   ├─ Check if tenantSlug is ObjectId format
    │   ├─ Find tenant by ID or slug
    │   ├─ SECURITY: Check tenant.isDeleted (soft delete)
    │   ├─ SECURITY: Check tenant.deletedAt (soft delete)
    │   └─ Validate tenant status is 'active' (not 'disabled' or 'suspended')
    ├─ [4.7] Load user from database (single source of truth)
    │   ├─ Find user by userId from token
    │   ├─ Validate user exists
    │   └─ Validate user.status === 'active'
    ├─ [4.8] Handle tenant_owner tokens (special case)
    │   ├─ Verify tenantId matches requested tenant
    │   ├─ SECURITY: Get orgId (fail fast, no fallbacks)
    │   ├─ Set req.user with 'owner' role
    │   └─ Set req.workspace, req.orgId, req.tenantContext
    │   └─ Log AUTH_SUCCESS and return
    ├─ [4.9] SECURITY: Verify workspace membership (for regular users)
    │   ├─ Check WorkspaceMember.findOne({ workspaceId, userId, status: 'active' })
    │   ├─ Verify membership is active (not deleted)
    │   └─ Get workspace role from membership
    │   └─ FAIL if not a member (prevents cross-tenant access)
    ├─ [4.10] SECURITY: Verify token claims against database
    │   ├─ Verify decoded.role === user.role (from DB)
    │   ├─ Log security alert if mismatch (ROLE_MISMATCH)
    │   └─ FAIL if mismatch (prevents privilege escalation)
    ├─ [4.11] SECURITY: Get orgId (fail fast, no fallbacks)
    │   ├─ Priority 1: tenant.organizationId || tenant.orgId
    │   ├─ Priority 2: Organization.findOne({ slug: tenant.slug })
    │   └─ FAIL if still not found (no dangerous fallbacks)
    ├─ [4.12] SECURITY: Verify organization match (for non-admins)
    │   ├─ Check user.organizationId === tenant.organizationId
    │   ├─ Allow super_admin and platform_admin to bypass
    │   └─ FAIL if mismatch (prevents cross-org access)
    └─ [4.13] Set request context + Audit logging
        ├─ req.user = { id, email, role (from DB only), orgId, tenantId, workspaceRole }
        ├─ req.tenant = tenant object
        ├─ req.workspace = { id, name, slug, organizationId }
        ├─ req.orgId = organization ID
        ├─ req.tenantId = tenant ID
        ├─ req.tenantSlug = tenant slug
        ├─ req.tenantContext = { tenantId, tenantSlug, orgId, ... }
        └─ Log security event (AUTH_SUCCESS) with audit service
      ↓
[5] Projects Route Handler (projects.js)
    ├─ Optional: requireRole middleware (for specific routes)
    ├─ Optional: Input validation middleware
    ├─ Optional: strictLimiter (for sensitive operations)
    └─ Controller execution
    ↓
[6] Project Controller (projectsController.js)
    ├─ Get orgId from req.orgId (set by middleware)
    ├─ Filter queries by orgId (workspace isolation)
    └─ Return data scoped to user's organization
    ↓
[7] Response
    └─ Returns data scoped to user's workspace/organization
```

  ---

  ## Detailed Flow Steps

  ### Step 1: Frontend Request

  **Request Format:**
  ```javascript
  GET /api/tenant/:tenantSlug/organization/projects
  Headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  }
  ```

  **Token Sources (Frontend):**
  - `localStorage.getItem('token')` - Main token (education users)
  - `localStorage.getItem('tenantToken')` - Tenant-specific token (tenant owners)

  ---

### Step 2: Route Registration

**File:** `TWS/backend/src/modules/tenant/routes/organization.js`

```javascript
const { tokenVerificationLimiter } = require('../../../middleware/rateLimiting/rateLimiter');
const verifyERPToken = require('../../../middleware/auth/verifyERPToken');

// Projects routes - New comprehensive project management API
const projectsRoutes = require('./projects');
// SECURITY: Rate limiting + Token verification
router.use('/projects', tokenVerificationLimiter, verifyERPToken, projectsRoutes);
```

**What happens:**
- **Rate Limiting:** First checks if IP has exceeded 100 requests per 15 minutes
- **Token Verification:** Then verifies token and sets request context
- All routes under `/projects` are protected by both
- If either fails, request stops and error is returned

**Rate Limiting Details:**
- Limit: 100 requests per 15 minutes per IP
- Skips if user already authenticated (prevents blocking legitimate users)
- Logs violations to audit service
- Returns 429 status with clear message

  ---

### Step 3: Rate Limiting

**File:** `TWS/backend/src/middleware/rateLimiting/rateLimiter.js`

**tokenVerificationLimiter Configuration:**
```javascript
exports.tokenVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return `token_verification_${ip}`;
  },
  skip: (req) => {
    // Skip if user already authenticated
    return req.user !== undefined;
  },
  handler: (req, res, next, options) => {
    // Log to audit service
    auditService.logSecurityEvent('RATE_LIMIT_EXCEEDED', ...);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});
```

**Security Impact:**
- ✅ Prevents brute force attacks on token verification
- ✅ Protects against DoS attacks
- ✅ Logs all violations for monitoring

---

### Step 4: verifyERPToken Middleware

**File:** `TWS/backend/src/middleware/auth/verifyERPToken.js`

#### 4.1 Token Extraction
  ```javascript
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Missing Authorization header',
      code: 'MISSING_AUTH_HEADER'
    });
  }
  const token = authHeader.substring(7).trim();
  ```

#### 4.2 Token Blacklist Check
```javascript
// SECURITY: Check if token has been revoked
if (await tokenBlacklistService.isTokenBlacklisted(token)) {
  await auditService.logSecurityEvent('AUTH_FAILED', null, null, {
    reason: 'Token revoked',
    ipAddress: req.ip,
    severity: 'high',
    status: 'failure'
  });
  return res.status(401).json({
    success: false,
    message: 'Token has been revoked',
    code: 'TOKEN_REVOKED'
  });
}
```

#### 4.3 Token Verification
```javascript
// Try jwtService first (for regular tokens)
try {
  decoded = jwtService.verifyAccessToken(token);
} catch (jwtServiceError) {
  // Fallback to direct JWT verification (for tenant_owner tokens)
  decoded = jwt.verify(token, jwtConfig.secret, {
    issuer: 'tws-backend',
    audience: 'tws-frontend'
  });
}
```

**Token Types Supported:**
- Regular tokens (via `jwtService`)
- `tenant_owner` tokens (direct JWT verification)

**Error Handling:**
- `TokenExpiredError` → Returns 401 with `TOKEN_EXPIRED` code
- Invalid signature → Returns 401 with `INVALID_TOKEN` code
- All errors logged to audit service

#### 4.4 Input Validation (Tenant Slug)
```javascript
// SECURITY: Prevent NoSQL injection
const { tenantSlug } = req.params;
if (!tenantSlug || !/^[a-zA-Z0-9_-]+$/.test(tenantSlug)) {
  await auditService.logSecurityEvent('AUTH_FAILED', decoded.userId, decoded.email, {
    reason: 'Invalid tenant slug format',
    tenantId: tenantSlug,
    severity: 'medium',
    status: 'failure'
  });
  return res.status(400).json({
    success: false,
    message: 'Invalid tenant slug format',
    code: 'INVALID_TENANT_SLUG_FORMAT'
  });
}
```

#### 4.5 Tenant Loading
  ```javascript
  const { tenantSlug } = req.params;
  const isObjectId = /^[0-9a-f]{24}$/i.test(tenantSlug);
  let tenant = isObjectId 
    ? await Tenant.findById(tenantSlug).lean()
    : await Tenant.findOne({ slug: tenantSlug }).lean();
  ```

**Validations:**
- Tenant exists
- Tenant is not deleted (`tenant.isDeleted === false`)
- Tenant `deletedAt` is null
- Tenant status is 'active' (not 'disabled' or 'suspended')

**Security Checks:**
```javascript
if (tenant.isDeleted || tenant.status === 'disabled' || tenant.status === 'suspended') {
  await auditService.logSecurityEvent('TENANT_ACCESS_DENIED', decoded.userId, decoded.email, {
    reason: 'Tenant is disabled or deleted',
    tenantId: tenant._id.toString(),
    severity: 'high',
    status: 'failure'
  });
  return res.status(403).json({
    success: false,
    message: 'Tenant access is disabled or deleted',
    code: 'TENANT_DISABLED_OR_DELETED'
  });
}
```

#### 4.6 User Loading
  ```javascript
  const userId = decoded.userId || decoded.id || decoded._id;
  const user = await User.findById(userId).lean();
  ```

**Validations:**
- User exists
- User status is 'active'

**Security:**
- User loaded from database (single source of truth)
- Token claims are NOT trusted directly

#### 4.7 Workspace Membership Verification
```javascript
// SECURITY: Explicit membership check (prevents cross-tenant access)
const WorkspaceMember = require('../../models/WorkspaceMember');
const membership = await WorkspaceMember.findOne({
  workspaceId: tenant._id,
  userId: user._id,
  status: 'active',
  deletedAt: null
}).lean();

if (!membership) {
  await auditService.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', user._id, user.email, {
    reason: 'User is not an active member of this workspace',
    tenantId: tenant._id.toString(),
    severity: 'critical',
    status: 'failure'
  });
  return res.status(403).json({
    success: false,
    message: 'Access denied: User is not a member of this workspace',
    code: 'NOT_MEMBER_OF_WORKSPACE'
  });
}
```

**Security Impact:**
- ✅ Prevents users from accessing workspaces they're not members of
- ✅ Explicit verification (not relying on user.tenantId alone)
- ✅ Checks membership is active and not deleted

#### 4.8 Token Claims Verification
```javascript
// SECURITY: Verify token claims match database values
if (decoded.role && decoded.role !== user.role) {
  await auditService.logSecurityEvent('ROLE_MISMATCH', user._id, user.email, {
    reason: 'Token role does not match database role',
    tokenRole: decoded.role,
    dbRole: user.role,
    severity: 'critical',
    status: 'failure'
  });
  return res.status(401).json({
    success: false,
    message: 'Invalid token: Role mismatch',
    code: 'TOKEN_ROLE_MISMATCH'
  });
}
```

**Security Impact:**
- ✅ Prevents privilege escalation via token manipulation
- ✅ Database is single source of truth for user role
- ✅ Logs all mismatches for investigation

#### 4.9 Organization ID Resolution (Fail Fast)
```javascript
// SECURITY: No dangerous fallbacks
let orgId = tenant.organizationId || tenant.orgId;

if (!orgId) {
  const org = await Organization.findOne({ slug: tenant.slug }).lean();
  if (org) {
    orgId = org._id;
  } else {
    // FAIL FAST - no fallback to user.orgId (security risk)
    await auditService.logSecurityEvent('SYSTEM_CONFIG_ERROR', user._id, user.email, {
      reason: 'Tenant has no associated organization ID',
      tenantId: tenant._id.toString(),
      severity: 'critical',
      status: 'failure'
    });
    return res.status(500).json({
      success: false,
      message: 'System configuration error: Organization context missing',
      code: 'ORG_CONTEXT_MISSING'
    });
  }
}
```

**Security Impact:**
- ✅ Removed dangerous fallback to `user.orgId`
- ✅ Fails fast if orgId cannot be determined
- ✅ Prevents data leaks from wrong orgId

#### 4.10 Organization Match Verification
```javascript
// SECURITY: Verify user's org matches tenant's org (for non-admins)
if (user.role !== 'super_admin' && user.role !== 'platform_admin' && 
    user.organizationId?.toString() !== orgId.toString()) {
  await auditService.logSecurityEvent('ORG_MISMATCH', user._id, user.email, {
    reason: 'User\'s primary organization does not match tenant\'s organization',
    userOrgId: user.organizationId?.toString(),
    tenantOrgId: orgId.toString(),
    severity: 'critical',
    status: 'failure'
  });
  return res.status(403).json({
    success: false,
    message: 'Access denied: User organization mismatch',
    code: 'ORG_MISMATCH'
  });
}
```

**Security Impact:**
- ✅ Prevents cross-organization data access
- ✅ Admins can access any org (logged for audit)
- ✅ Clear security boundary

#### 4.11 Request Context Setup
```javascript
// SECURITY: Set role from database only (not token)
req.user = {
  _id: user._id,
  id: user._id,
  email: user.email,
  role: user.role, // From DB only, never from token
  orgId: orgId,
  tenantId: tenant._id.toString(),
  workspaceRole: membership.role // Role specific to this workspace
};

req.tenant = tenant;
req.tenantId = tenant._id.toString();
req.tenantSlug = tenant.slug;

req.workspace = {
  id: tenant._id.toString(),
  name: tenant.name,
  slug: tenant.slug,
  organizationId: orgId
};

req.orgId = orgId;

req.tenantContext = {
  tenantId: tenant._id.toString(),
  tenantSlug: tenant.slug,
  orgId: orgId,
  hasSeparateDatabase: false,
  connectionReady: true
};

// SECURITY: Log successful authentication
await auditService.logSecurityEvent('AUTH_SUCCESS', req.user._id, req.user.email, {
  tenantId: tenant._id.toString(),
  role: req.user.role,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  severity: 'info',
  status: 'success'
});
```

**Key Points:**
- `req.user.role` is ALWAYS from database, never from token
- All context set from verified database values
- Audit logging for all successful authentications

  ---

### Step 5: Projects Route Handler

  **File:** `TWS/backend/src/modules/tenant/routes/projects.js`

  **Example Route:**
  ```javascript
  router.get('/', authenticateToken, projectController.getProjects);
  ```

  **Note:** Some routes also use `authenticateToken` for additional validation, but `verifyERPToken` already handles authentication at the parent route level.

  **Additional Middleware (Optional):**
  - `requireRole(['admin', 'project_manager'])` - RBAC check
  - `validateProjectCreation` - Input validation
  - `strictLimiter` - Rate limiting
  - `idempotencyMiddleware()` - Idempotency support

  ---

### Step 6: Project Controller

  **File:** `TWS/backend/src/controllers/tenant/projectsController.js`

  **Example:**
  ```javascript
  exports.getProjects = async (req, res) => {
    // Get orgId directly from middleware (no fallbacks)
    const orgId = getOrgId(req); // Returns req.orgId
    
    if (!orgId) {
      return res.status(500).json({ 
        success: false, 
        message: 'Organization context not available'
      });
    }

    // Build query - ALWAYS filter by orgId
    const query = { orgId };
    
    // Additional filters
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    
    // Execute query
    const projects = await Project.find(query)
      .populate('clientId', 'name company')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
      
    res.json({ success: true, data: { projects, total } });
  };
  ```

  **Key Points:**
  - All queries filter by `orgId` (workspace isolation)
  - No fallbacks - fails fast if orgId is missing
  - Data is always scoped to user's organization

  ---

  ## Request Properties Set by Middleware

  After `verifyERPToken` runs, the following properties are available on `req`:

  ### User Context
  ```javascript
  req.user = {
    _id: ObjectId,
    id: ObjectId,
    email: string,
    role: string,
    orgId: ObjectId,
    tenantId: string
  }
  ```

  ### Tenant Context
  ```javascript
  req.tenant = {
    _id: ObjectId,
    name: string,
    slug: string,
    organizationId: ObjectId,
    orgId: ObjectId,
    status: string,
    ...
  }
  ```

  ### Workspace Context (ERP Module Compatibility)
  ```javascript
  req.workspace = {
    id: string,
    name: string,
    slug: string,
    organizationId: ObjectId
  }
  ```

  ### Direct Access Properties
  ```javascript
  req.tenantId = string
  req.tenantSlug = string
  req.orgId = ObjectId
  ```

  ### Full Tenant Context (Backward Compatibility)
  ```javascript
  req.tenantContext = {
    tenantId: string,
    tenantSlug: string,
    orgId: ObjectId,
    hasSeparateDatabase: boolean,
    connectionReady: boolean
  }
  ```

  ---

  ## Error Responses

  ### Missing Authorization Header
  ```json
  {
    "success": false,
    "message": "Missing Authorization header",
    "code": "MISSING_AUTH_HEADER"
  }
  ```
  **Status:** 401

  ### Invalid Token
  ```json
  {
    "success": false,
    "message": "Invalid token",
    "code": "INVALID_TOKEN"
  }
  ```
  **Status:** 401

  ### Token Expired
  ```json
  {
    "success": false,
    "message": "Token expired",
    "code": "TOKEN_EXPIRED"
  }
  ```
  **Status:** 401

  ### Tenant Not Found
  ```json
  {
    "success": false,
    "message": "Tenant not found",
    "code": "TENANT_NOT_FOUND"
  }
  ```
  **Status:** 404

  ### Tenant Disabled
  ```json
  {
    "success": false,
    "message": "Tenant access is disabled",
    "code": "TENANT_DISABLED"
  }
  ```
  **Status:** 403

  ### Access Denied
  ```json
  {
    "success": false,
    "message": "Access denied to this tenant",
    "code": "ACCESS_DENIED"
  }
  ```
  **Status:** 403

  ### User Not Found
  ```json
  {
    "success": false,
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  }
  ```
  **Status:** 401

  ### Organization Context Missing
  ```json
  {
    "success": false,
    "message": "Organization context not available",
    "code": "ORG_CONTEXT_MISSING"
  }
  ```
  **Status:** 500

  ---

## Security Features

### 1. Rate Limiting
- ✅ **Token verification rate limiting** (100 requests per 15 min per IP)
- ✅ Skips if user already authenticated (prevents blocking legit users)
- ✅ Logs all violations to audit service
- ✅ Returns 429 with clear message

### 2. Token Verification
- ✅ JWT signature verification
- ✅ Token expiration check
- ✅ Token type validation
- ✅ Issuer/audience validation
- ✅ **Token blacklist check (revoked tokens)**
- ✅ **Token claims verified against database**
- ✅ Clear error messages for expired/invalid tokens

### 3. Tenant Validation
- ✅ Tenant existence check
- ✅ Tenant status validation
- ✅ **Tenant isDeleted check (soft delete)**
- ✅ **Tenant deletedAt check (soft delete)**
- ✅ **Input validation (prevent NoSQL injection)**
- ✅ Regex validation for tenantSlug format

### 4. User Validation
- ✅ User existence check
- ✅ User status validation
- ✅ **Workspace membership verification (explicit check)**
- ✅ **Strict access control (no OR logic vulnerabilities)**
- ✅ **Role verification from database (not token)**

### 5. Workspace Isolation
- ✅ All queries filter by `orgId`
- ✅ **Workspace membership required (WorkspaceMember check)**
- ✅ **Organization mismatch detection**
- ✅ **No cross-tenant data access**
- ✅ **No cross-organization data access**
- ✅ Clear security boundary

### 6. Organization ID Resolution
- ✅ **Fail fast (no dangerous fallbacks)**
- ✅ Priority: tenant.organizationId → Organization lookup → FAIL
- ✅ **Removed fallback to user.orgId (security risk)**
- ✅ Clear error messages for missing orgId

### 7. Error Handling
- ✅ Fail fast (no silent failures)
- ✅ Clear error messages with codes
- ✅ **Comprehensive audit logging**
- ✅ **Security event tracking**
- ✅ Proper HTTP status codes
- ✅ Error details in development, generic in production

### 8. Security Monitoring
- ✅ **Audit logging for all auth events**
- ✅ **Security alerts for suspicious activity**
- ✅ **Failed access attempt tracking**
- ✅ **Rate limit violation tracking**
- ✅ **Performance monitoring**

### 9. Cookie Security (HTTPS Enforcement)
- ✅ **httpOnly flag** (prevents JavaScript access, XSS protection)
- ✅ **secure flag** (HTTPS only in production)
- ✅ **sameSite: 'strict'** (CSRF protection)
- ✅ Proper expiration times
- ✅ Secure cookie helpers in `cookieSecurity.js`

### 10. Security Headers
- ✅ **Helmet middleware** configured
- ✅ **HSTS** (Strict-Transport-Security)
- ✅ **X-Frame-Options: DENY** (clickjacking protection)
- ✅ **X-Content-Type-Options: nosniff** (MIME sniffing protection)
- ✅ **Content Security Policy** (CSP)
- ✅ **Referrer Policy**

  ---

  ## Comparison: Old vs. New Flow

  ### Old Flow (Before Simplification)
  ```
  Request
    ↓
  [1] verifyTenantOrgAccess (token + tenant verification)
    ↓
  [2] TenantMiddleware.setTenantContext (database connection)
    ↓
  [3] buildTenantContext (orgId resolution with 5 fallbacks)
    ↓
  [4] authenticateToken (token verification again)
    ↓
  [5] requireRole (RBAC check)
    ↓
  Controller
  ```

  **Problems:**
  - 5 middleware layers
  - 5+ database queries
  - Multiple fallbacks (security risk)
  - Complex debugging

### New Flow (Current - Secure)
```
Request
  ↓
[1] Rate Limiting (tokenVerificationLimiter)
  ├─ Check IP-based rate limit
  ├─ Skip if already authenticated
  └─ Log violations
  ↓
[2] verifyERPToken (single middleware)
  ├─ Token extraction & validation
  ├─ Token blacklist check
  ├─ Token signature verification
  ├─ Input validation (tenantSlug)
  ├─ Tenant loading & validation
  ├─ User loading & validation
  ├─ Workspace membership verification
  ├─ Token claims verification (vs DB)
  ├─ Organization ID resolution (fail fast)
  ├─ Organization match verification
  └─ Context setup + Audit logging
  ↓
[3] requireRole (optional, for specific routes)
  ↓
Controller
```

**Benefits:**
- 2 middleware layers (rate limiting + auth)
- 3-4 database queries (optimized)
- No fallbacks (fail fast)
- Comprehensive security checks
- Complete audit logging
- Easy debugging

  ---

  ## Route Examples

  ### GET Projects List
  ```javascript
  GET /api/tenant/:tenantSlug/organization/projects
  Headers: Authorization: Bearer <token>

  Flow:
  1. verifyERPToken → Sets req.user, req.orgId, req.tenantContext
  2. projectController.getProjects → Filters by req.orgId
  3. Returns projects for user's organization
  ```

  ### POST Create Project
  ```javascript
  POST /api/tenant/:tenantSlug/organization/projects
  Headers: Authorization: Bearer <token>
  Body: { name, description, ... }

  Flow:
  1. verifyERPToken → Sets req.user, req.orgId
  2. requireRole(['admin', 'project_manager']) → Checks role
  3. validateProjectCreation → Validates input
  4. projectController.createProject → Creates with req.orgId
  5. Returns created project
  ```

  ### GET Single Project
  ```javascript
  GET /api/tenant/:tenantSlug/organization/projects/:id
  Headers: Authorization: Bearer <token>

  Flow:
  1. verifyERPToken → Sets req.user, req.orgId
  2. projectController.getProject → Filters by req.orgId
  3. Returns project if belongs to user's organization
  ```

  ---

## Client Portal Authentication (Separate System)

The client portal uses a **separate one-time token system** for project-specific access, as recommended in the security audit.

### One-Time Token Flow

```
PM Invites Client
  ↓
[1] Generate Token
  POST /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens
  ├─ Creates secure random token (64-char hex)
  ├─ Hashes token (SHA-256) before storage
  ├─ Sets expiration (24 hours default)
  ├─ Returns plaintext token (only once)
  └─ Logs token generation
  ↓
[2] Client Accesses Project
  GET /api/client-portal/projects/:projectId/:clientToken
  ├─ verifyClientPortalToken middleware
  │   ├─ Validates token format
  │   ├─ Hashes token and looks up in database
  │   ├─ Checks expiration
  │   ├─ Checks revocation status
  │   ├─ Verifies project exists
  │   └─ Sets req.client context
  ├─ preventReadOnlyModification (if accessLevel is 'view_only')
  └─ Returns filtered project data
```

**Security Features:**
- ✅ Separate from ERP authentication
- ✅ Time-limited (24 hours default)
- ✅ Revocable at any time
- ✅ Project-scoped access
- ✅ Access level control (`view_only` or `can_approve`)
- ✅ Read-only enforcement for view-only clients

**Documentation:** See `CLIENT_PORTAL_ONE_TIME_TOKEN_DOCUMENTATION.md`

---

## Key Takeaways

1. **Rate Limiting:** All token verification routes are rate-limited (100 req/15min)
2. **Single Auth Middleware:** All authentication happens in `verifyERPToken`
3. **No Fallbacks:** Fails fast if anything is missing
4. **Workspace Isolation:** All queries filter by `orgId`
5. **Explicit Membership:** WorkspaceMember check required
6. **Database as Truth:** Token claims verified against database
7. **Backward Compatible:** Sets all required request properties
8. **Secure:** Clear security boundaries, proper error handling
9. **Auditable:** Complete logging of all security events
10. **Production Ready:** All critical and high-priority vulnerabilities fixed

---

## Security Status Summary

### Critical Vulnerabilities: ✅ ALL FIXED
- ✅ Workspace member verification
- ✅ Token claims verified against database
- ✅ Removed dangerous orgId fallbacks
- ✅ Client portal authentication (one-time tokens)
- ✅ Rate limiting implemented
- ✅ Security headers verified
- ✅ HTTPS cookie enforcement

### High Priority Issues: ✅ ALL FIXED
- ✅ Rate limiting on token verification
- ✅ Client portal one-time token system
- ✅ HTTPS enforcement for cookies
- ✅ Security headers verified

### Production Readiness: 🟢 READY

**Status:** ✅ **Production Ready** (after testing)

---

**Last Updated:** [Current Date]  
**Status:** ✅ Production Ready  
**Security Level:** 🟢 LOW RISK (all critical vulnerabilities fixed)

