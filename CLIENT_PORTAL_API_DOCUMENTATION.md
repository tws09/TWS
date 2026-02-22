# Client Portal API Documentation

## Overview

The Client Portal API allows administrators and project managers to configure client portal access for projects. All endpoints are secured with role-based access control, rate limiting, and comprehensive validation.

**Base URL:** `/api/tenant/:tenantSlug/organization/projects`

---

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

**Token Types:**
- `tenantToken` - For tenant owners and organization members
- `client_portal` - For client portal users (limited access)

---

## Endpoints

### 1. Get Client Portal Settings

Retrieve the current client portal configuration for a project.

**Endpoint:** `GET /projects/:id/client-portal`

**Permissions Required:** `view` client portal settings
- ✅ Admin, Super Admin, Org Manager
- ✅ Project Manager, PMO
- ✅ Team Lead, Developer, Employee (read-only)
- ❌ Client

**Request:**
```http
GET /api/tenant/test-tenant/organization/projects/507f1f77bcf86cd799439011/client-portal
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projectId": "507f1f77bcf86cd799439011",
    "projectName": "E-commerce Platform",
    "clientId": "507f1f77bcf86cd799439012",
    "portalSettings": {
      "isPortalProject": true,
      "portalVisibility": "detailed",
      "allowClientPortal": true,
      "clientCanCreateCards": false,
      "clientCanEditCards": true,
      "requireClientApproval": false,
      "autoNotifyClient": true,
      "syncWithERP": true,
      "features": {
        "projectProgress": true,
        "timeTracking": false,
        "invoices": true,
        "documents": true,
        "communication": true
      }
    }
  },
  "message": "Client portal settings retrieved successfully"
}
```

**Error Responses:**

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You do not have permission to view client portal settings",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required": "view",
  "current": "client"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}
```

---

### 2. Update Client Portal Settings

Update the client portal configuration for a project.

**Endpoint:** `PATCH /projects/:id/client-portal`

**Permissions Required:** `edit` client portal settings
- ✅ Admin, Super Admin, Org Manager
- ✅ Project Manager, PMO
- ❌ Team Lead, Developer, Employee, Client

**Rate Limit:** 5 requests per 5 minutes per user+project

**Request:**
```http
PATCH /api/tenant/test-tenant/organization/projects/507f1f77bcf86cd799439011/client-portal
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "visibilityLevel": "detailed",
  "features": {
    "projectProgress": true,
    "timeTracking": false,
    "invoices": true,
    "documents": true,
    "communication": true
  }
}
```

**Request Body Schema:**
```typescript
{
  enabled: boolean;              // Required: Enable/disable client portal
  visibilityLevel?: string;      // Optional: 'none' | 'basic' | 'detailed' | 'full' (default: 'basic')
  features?: {                   // Optional: Feature toggles
    projectProgress?: boolean;   // Default: true
    timeTracking?: boolean;      // Default: false
    invoices?: boolean;          // Default: true
    documents?: boolean;          // Default: true
    communication?: boolean;     // Default: true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projectId": "507f1f77bcf86cd799439011",
    "projectName": "E-commerce Platform",
    "clientId": "507f1f77bcf86cd799439012",
    "portalSettings": {
      "isPortalProject": true,
      "portalVisibility": "detailed",
      "allowClientPortal": true,
      "features": {
        "projectProgress": true,
        "timeTracking": false,
        "invoices": true,
        "documents": true,
        "communication": true
      }
    }
  },
  "message": "Client portal settings updated successfully"
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "visibilityLevel",
      "message": "\"visibilityLevel\" must be one of [none, basic, detailed, full]"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "message": "You do not have permission to edit client portal settings",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required": "edit",
  "current": "developer"
}
```

**429 Too Many Requests - Rate Limit:**
```json
{
  "success": false,
  "message": "Too many changes to client portal settings. Please wait before making another change.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": "5 minutes"
}
```

---

## Visibility Levels

### Basic
- Project name
- Project status
- Deadline
- Basic progress percentage

### Detailed
- Everything in Basic
- Individual tasks
- Progress breakdown
- Milestones
- Timeline

### Full
- Everything in Detailed
- Time tracking data
- Budget information
- Invoices
- Documents
- Communication history

---

## Feature Toggles

### projectProgress
Allows clients to view project progress, completion rates, and status updates.

### timeTracking
Allows clients to view time entries and hours logged on the project.

### invoices
Allows clients to view and download invoices related to the project.

### documents
Allows clients to access project documents and files.

### communication
Allows clients to send messages and provide feedback on the project.

---

## Security Features

### 1. Permission Matrix

| Role | View | Edit | Enable | Disable |
|------|------|------|--------|---------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| Org Manager | ✅ | ✅ | ✅ | ✅ |
| Project Manager | ✅ | ✅ | ✅ | ✅ |
| PMO | ✅ | ✅ | ✅ | ✅ |
| Team Lead | ✅ | ❌ | ❌ | ❌ |
| Developer | ✅ | ❌ | ❌ | ❌ |
| Employee | ✅ | ❌ | ❌ | ❌ |
| Client | ❌ | ❌ | ❌ | ❌ |

### 2. Data Isolation

- **Tenant Isolation:** Users can only access projects within their tenant
- **Client Isolation:** Clients can only access their own projects
- **Project Access:** All requests verify project belongs to user's organization

### 3. Rate Limiting

- **Settings Updates:** 5 changes per 5 minutes per user+project
- **Admins Bypass:** Admins, Super Admins, and Org Managers bypass rate limiting
- **Rate Limit Headers:** Standard `RateLimit-*` headers included

### 4. Audit Logging

All changes are logged with:
- User ID and email
- Timestamp
- IP address
- User agent
- Before/after values
- Action type

### 5. Notifications

When client portal access is enabled or disabled:
- Email notification sent to all client portal users
- In-app notification created
- Audit log entry created

---

## Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_PERMISSIONS` | User doesn't have required permission |
| `PROJECT_NOT_FOUND` | Project doesn't exist |
| `VALIDATION_ERROR` | Request body validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests in time window |
| `TENANT_MISMATCH` | Project doesn't belong to user's tenant |
| `CLIENT_MISMATCH` | Client trying to access another client's project |
| `CLIENT_PORTAL_DISABLED` | Client portal not enabled for project |
| `FEATURE_DISABLED` | Requested feature not enabled |
| `ORG_CONTEXT_UNAVAILABLE` | Organization context missing |
| `INVALID_PROJECT_ID` | Project ID format invalid |

---

## Examples

### Enable Client Portal with Full Access

```javascript
const response = await fetch('/api/tenant/test-tenant/organization/projects/507f1f77bcf86cd799439011/client-portal', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enabled: true,
    visibilityLevel: 'full',
    features: {
      projectProgress: true,
      timeTracking: true,
      invoices: true,
      documents: true,
      communication: true
    }
  })
});

const data = await response.json();
```

### Disable Client Portal

```javascript
const response = await fetch('/api/tenant/test-tenant/organization/projects/507f1f77bcf86cd799439011/client-portal', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enabled: false
  })
});
```

### Get Current Settings

```javascript
const response = await fetch('/api/tenant/test-tenant/organization/projects/507f1f77bcf86cd799439011/client-portal', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <token>'
  }
});

const data = await response.json();
console.log(data.data.portalSettings);
```

---

## Best Practices

1. **Always check permissions** before attempting to update settings
2. **Validate input** on the client side before sending requests
3. **Handle rate limits** gracefully with retry logic
4. **Cache settings** to reduce API calls
5. **Notify users** when settings change
6. **Log all changes** for audit purposes
7. **Test feature toggles** before enabling for clients

---

## Support

For issues or questions:
- Check error codes and messages
- Review audit logs for access attempts
- Contact support with trace ID from error response
