# Client Portal One-Time Token System Documentation

## Overview

**SECURITY FIX:** This document describes the one-time token system for client portal access, implemented as recommended in the security audit. This system provides secure, time-limited access to specific projects without requiring full client portal user accounts.

---

## Architecture

### Two Authentication Systems

The client portal now supports **two separate authentication mechanisms**:

1. **JWT-Based Authentication** (Existing)
   - For registered client portal users
   - Long-lived tokens (7 days)
   - Full client portal access
   - Route: `/api/tenant/:tenantSlug/client-portal/*`

2. **One-Time Token Authentication** (NEW - Security Fix)
   - For project-specific access
   - Short-lived tokens (24 hours default)
   - Project-scoped access only
   - Route: `/api/client-portal/projects/:projectId/:clientToken/*`

---

## Token Generation (PM Invites Client)

### Endpoint

```
POST /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens
```

### Authentication

- Requires: `verifyERPToken` middleware
- Requires Role: `project_manager`, `admin`, `super_admin`, `org_manager`, or `pmo`
- Rate Limited: 100 requests per 15 minutes per IP

### Request Body

```json
{
  "clientEmail": "client@example.com",
  "accessLevel": "view_only",  // or "can_approve"
  "expiresInHours": 24  // Optional, default: 24, max: 168 (7 days)
}
```

### Response

```json
{
  "success": true,
  "message": "Client portal token generated successfully",
  "data": {
    "token": "a1b2c3d4e5f6...",  // 64-character hex string (ONLY RETURNED ONCE)
    "accessUrl": "/client-portal/projects/507f1f77bcf86cd799439011/a1b2c3d4e5f6...",
    "expiresAt": "2024-12-20T12:00:00.000Z",
    "accessLevel": "view_only",
    "clientEmail": "client@example.com"
  }
}
```

### Security Features

- ✅ Token is hashed (SHA-256) before storage
- ✅ Plaintext token only returned once (client must save it)
- ✅ Existing tokens for same project/client are automatically revoked
- ✅ Token expiration enforced (24 hours default)
- ✅ Audit logging for all token operations

---

## Token Management

### Get Active Tokens

```
GET /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens
```

Returns all active (non-expired, non-revoked) tokens for the project.

### Get Token Statistics

```
GET /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens/statistics
```

Returns:
```json
{
  "success": true,
  "data": {
    "active": 3,
    "expired": 5,
    "revoked": 2,
    "total": 10
  }
}
```

### Revoke All Tokens for a Client

```
DELETE /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens
```

Request Body:
```json
{
  "clientEmail": "client@example.com"
}
```

### Revoke a Specific Token

```
DELETE /api/tenant/:tenantSlug/organization/projects/:id/client-portal-tokens/:token
```

---

## Client Access (Using Token)

### Access URL Format

```
/client-portal/projects/:projectId/:clientToken
```

Example:
```
/client-portal/projects/507f1f77bcf86cd799439011/a1b2c3d4e5f6789...
```

### Available Endpoints

All endpoints require the token in the URL path.

#### 1. Get Project Details

```
GET /api/client-portal/projects/:projectId/:clientToken
```

Returns filtered project data (sensitive data removed).

#### 2. Get Deliverables

```
GET /api/client-portal/projects/:projectId/:clientToken/deliverables
```

Returns list of deliverables for the project.

#### 3. Get Deliverable Details

```
GET /api/client-portal/projects/:projectId/:clientToken/deliverables/:deliverableId
```

#### 4. Approve Deliverable (if accessLevel is 'can_approve')

```
POST /api/client-portal/projects/:projectId/:clientToken/deliverables/:deliverableId/approve
```

Request Body:
```json
{
  "approved": true,
  "comments": "Looks good!"
}
```

**Note:** Read-only clients (`accessLevel: 'view_only'`) cannot approve deliverables.

#### 5. Get Gantt Chart Data

```
GET /api/client-portal/projects/:projectId/:clientToken/gantt
```

Returns Gantt chart data (deliverables only, clean view).

---

## Security Features

### Token Security

1. **Hashing**: Tokens are hashed using SHA-256 before storage
2. **One-Time Display**: Plaintext token only shown once during generation
3. **Expiration**: Tokens expire after configured time (default: 24 hours)
4. **Revocation**: Tokens can be revoked individually or in bulk
5. **Auto-Revocation**: New tokens automatically revoke old ones for same project/client

### Access Control

1. **Project Scoping**: Tokens are scoped to specific projects
2. **Workspace Isolation**: Tokens verify workspace membership
3. **Access Levels**: 
   - `view_only`: Read-only access
   - `can_approve`: Can approve deliverables
4. **Read-Only Enforcement**: Middleware prevents modifications for view-only clients

### Audit Logging

All operations are logged:
- Token generation
- Token revocation
- Token usage
- Access attempts
- Failed authentications

---

## Usage Flow

### 1. PM Invites Client

```javascript
// PM generates token
const response = await fetch(
  `/api/tenant/${tenantSlug}/organization/projects/${projectId}/client-portal-tokens`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pmToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientEmail: 'client@example.com',
      accessLevel: 'view_only',
      expiresInHours: 24
    })
  }
);

const { token, accessUrl } = response.data.data;

// Send accessUrl to client via email
await sendEmail({
  to: 'client@example.com',
  subject: 'Project Access Invitation',
  body: `Click here to access your project: ${accessUrl}`
});
```

### 2. Client Accesses Project

```javascript
// Client clicks link: /client-portal/projects/:projectId/:token
// Frontend makes API calls with token in URL

const project = await fetch(
  `/api/client-portal/projects/${projectId}/${token}`
);

const deliverables = await fetch(
  `/api/client-portal/projects/${projectId}/${token}/deliverables`
);
```

### 3. PM Revokes Access (if needed)

```javascript
// Revoke all tokens for a client
await fetch(
  `/api/tenant/${tenantSlug}/organization/projects/${projectId}/client-portal-tokens`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${pmToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientEmail: 'client@example.com'
    })
  }
);
```

---

## Database Schema

### ClientPortalToken Model

```javascript
{
  projectId: ObjectId,        // Project this token grants access to
  workspaceId: ObjectId,      // Workspace/Tenant ID
  clientEmail: String,        // Client email (lowercase)
  tokenHash: String,          // SHA-256 hash of token (unique, indexed)
  accessLevel: String,        // 'view_only' or 'can_approve'
  expiresAt: Date,            // Token expiration (auto-delete after)
  usedAt: Date,               // First use timestamp
  revokedAt: Date,            // Revocation timestamp (null if active)
  createdBy: ObjectId,        // PM who created token
  createdFromIP: String,       // IP address of creator
  lastAccessAt: Date,          // Last access timestamp
  lastAccessIP: String         // Last access IP
}
```

**Indexes:**
- `tokenHash` (unique)
- `projectId + clientEmail`
- `expiresAt` (TTL index for auto-deletion)

---

## Error Responses

### Invalid Token

```json
{
  "success": false,
  "message": "Invalid or expired client token",
  "code": "INVALID_CLIENT_TOKEN"
}
```

### Token Expired

```json
{
  "success": false,
  "message": "Invalid or expired client token",
  "code": "INVALID_CLIENT_TOKEN"
}
```

### Read-Only Access Violation

```json
{
  "success": false,
  "message": "Read-only access: Modification not allowed",
  "code": "READ_ONLY_ACCESS"
}
```

### Project Not Found

```json
{
  "success": false,
  "message": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}
```

---

## Best Practices

### For Project Managers

1. **Set Appropriate Expiration**: Use shorter expiration (1-24 hours) for sensitive projects
2. **Revoke When Done**: Revoke tokens when project access is no longer needed
3. **Monitor Usage**: Check token statistics regularly
4. **Use Appropriate Access Levels**: 
   - `view_only` for most clients
   - `can_approve` only when client needs to approve deliverables

### For Clients

1. **Save Token Immediately**: Token is only shown once during generation
2. **Use HTTPS**: Always access via HTTPS
3. **Don't Share Tokens**: Each token is unique and should not be shared
4. **Report Issues**: Contact PM if token doesn't work

---

## Comparison: JWT vs One-Time Tokens

| Feature | JWT Authentication | One-Time Token |
|---------|-------------------|----------------|
| **Use Case** | Registered client users | Project-specific access |
| **Token Lifetime** | 7 days | 24 hours (default) |
| **Scope** | All client projects | Single project |
| **Revocation** | Manual (logout) | Automatic (expiration) |
| **Setup Required** | Client portal user account | None (token only) |
| **Security** | High | Very High (time-limited) |
| **Best For** | Regular client access | Temporary project access |

---

## Implementation Files

### Backend

- `TWS/backend/src/models/ClientPortalToken.js` - Token model
- `TWS/backend/src/middleware/auth/verifyClientPortalToken.js` - Token verification middleware
- `TWS/backend/src/services/clientPortalTokenService.js` - Token service
- `TWS/backend/src/controllers/clientPortalTokenController.js` - Token controller
- `TWS/backend/src/modules/tenant/routes/clientPortalOneTime.js` - Client access routes
- `TWS/backend/src/modules/tenant/routes/projects.js` - Token management routes

### Frontend (To Be Implemented)

- Token generation UI (PM dashboard)
- Client access page (token-based)
- Token management interface

---

## Security Audit Compliance

This implementation addresses **Vulnerability 3** from the security audit:

✅ **Separate Authentication**: Client portal uses one-time tokens, not ERP authentication  
✅ **Time-Limited Access**: Tokens expire after 24 hours (configurable)  
✅ **Project Scoping**: Tokens are scoped to specific projects  
✅ **Revocable**: Tokens can be revoked at any time  
✅ **Read-Only Enforcement**: View-only clients cannot modify data  
✅ **Audit Logging**: All operations are logged  

---

*Last Updated: [Current Date]*  
*Status: ✅ Production Ready*

