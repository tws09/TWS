# Nucleus Project OS - Complete API Documentation

## Overview

This document provides comprehensive API documentation for all Nucleus Project OS endpoints, organized by feature area.

**Base URL:** `/api`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Workspace Management](#workspace-management)
2. [Client Portal](#client-portal)
3. [PM & Internal Team](#pm--internal-team)
4. [Templates & Onboarding](#templates--onboarding)
5. [Error Responses](#error-responses)

---

## Workspace Management

### Get Workspace
**GET** `/workspaces/:workspaceId`

Get workspace details including settings, members, and subscription.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Gamma Tech Solutions",
    "slug": "gamma-tech-solutions",
    "settings": {
      "approvalWorkflow": { ... },
      "timezone": "UTC",
      "currency": "USD"
    },
    "members": [ ... ],
    "subscription": { ... }
  }
}
```

---

## Client Portal

### Get Deliverables (Client View)
**GET** `/nucleus-client-portal/workspaces/:workspaceId/projects/:projectId/deliverables`

Get deliverables for a project (read-only, clean view for clients).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Authentication System",
      "description": "...",
      "start_date": "2024-01-01",
      "target_date": "2024-01-31",
      "status": "ready_approval",
      "progress_percentage": 100,
      "client_status": "pending_approval",
      "approvals": [
        {
          "step_number": 1,
          "approver_type": "dev_lead",
          "status": "approved",
          "signature_timestamp": "2024-01-15T10:00:00Z"
        },
        {
          "step_number": 2,
          "approver_type": "qa_lead",
          "status": "approved",
          "signature_timestamp": "2024-01-20T10:00:00Z"
        },
        {
          "step_number": 4,
          "approver_type": "client",
          "status": "pending"
        }
      ]
    }
  ]
}
```

### Get Gantt Chart Data
**GET** `/nucleus-client-portal/workspaces/:workspaceId/projects/:projectId/gantt`

Get Gantt chart data formatted for visualization (deliverables only).

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "...",
      "name": "Acme Website Redesign"
    },
    "deliverables": [
      {
        "id": "...",
        "name": "Authentication System",
        "start": "2024-01-01",
        "end": "2024-01-31",
        "progress": 100,
        "status": "ready_approval",
        "statusColor": "#f59e0b",
        "isAtRisk": false
      }
    ]
  }
}
```

### Approve Deliverable (Client)
**POST** `/nucleus-client-portal/workspaces/:workspaceId/deliverables/:deliverableId/approve`

Client approves or rejects a deliverable (Step 4 in workflow).

**Body:**
```json
{
  "approved": true,
  "notes": "Looks great!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deliverable approved successfully",
  "data": {
    "deliverable": {
      "_id": "...",
      "name": "Authentication System",
      "status": "approved"
    },
    "approval": {
      "step_number": 4,
      "status": "approved",
      "signature_timestamp": "2024-01-25T10:00:00Z"
    }
  }
}
```

### Submit Change Request
**POST** `/nucleus-client-portal/workspaces/:workspaceId/deliverables/:deliverableId/change-requests`

Client submits a formal change request.

**Body:**
```json
{
  "description": "Add password strength meter to authentication form"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Change request submitted successfully",
  "data": {
    "change_request": {
      "_id": "...",
      "deliverable_id": "...",
      "description": "Add password strength meter...",
      "status": "submitted",
      "submitted_at": "2024-01-25T10:00:00Z"
    }
  }
}
```

### Decide on Change Request (Client)
**POST** `/nucleus-client-portal/workspaces/:workspaceId/change-requests/:changeRequestId/decide`

Client decides on PM's evaluation (accept/reject).

**Body:**
```json
{
  "decision": "accept"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Change request accepted successfully",
  "data": {
    "change_request": {
      "_id": "...",
      "status": "accepted",
      "client_decision": "accept",
      "decided_at": "2024-01-26T10:00:00Z"
    }
  }
}
```

---

## PM & Internal Team

### Get Deliverables (Internal View)
**GET** `/nucleus-pm/workspaces/:workspaceId/projects/:projectId/deliverables`

Get deliverables with full internal details including tasks.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Authentication System",
      "status": "ready_approval",
      "progress_percentage": 100,
      "isAtRisk": false,
      "tasks_count": 4,
      "completed_tasks_count": 4,
      "tasks": [
        {
          "_id": "...",
          "title": "Design login/register UI",
          "status": "completed",
          "estimatedHours": 4,
          "actualHours": 4
        }
      ],
      "approvals": [ ... ]
    }
  ]
}
```

### Create Deliverable
**POST** `/nucleus-pm/workspaces/:workspaceId/deliverables`

Create a new deliverable.

**Body:**
```json
{
  "project_id": "...",
  "name": "Payment Integration",
  "description": "Stripe payment gateway integration",
  "start_date": "2024-02-01",
  "target_date": "2024-02-28",
  "acceptance_criteria": [
    {
      "description": "Payment processing works",
      "met": false
    }
  ],
  "ownerId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deliverable created successfully",
  "data": {
    "_id": "...",
    "name": "Payment Integration",
    "status": "created"
  }
}
```

### Update Deliverable Status
**POST** `/nucleus-pm/workspaces/:workspaceId/deliverables/:deliverableId/status`

Update deliverable status with workflow validation.

**Body:**
```json
{
  "status": "ready_approval"
}
```

**Valid Statuses:**
- `created` - Just created
- `in_dev` - In development
- `ready_approval` - Ready for approval workflow
- `approved` - Approved by client
- `shipped` - Delivered to client
- `in_rework` - Rejected, needs rework

**Response:**
```json
{
  "success": true,
  "message": "Deliverable status updated to ready_approval",
  "data": {
    "_id": "...",
    "name": "Authentication System",
    "status": "ready_approval"
  }
}
```

### Create Approval Chain
**POST** `/nucleus-pm/workspaces/:workspaceId/deliverables/:deliverableId/approvals/create-chain`

Create approval workflow chain for a deliverable.

**Body:**
```json
{
  "devLeadId": "...",
  "qaLeadId": "...",
  "securityId": "...",  // Optional
  "clientEmail": "client@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approval chain created successfully",
  "data": {
    "deliverable": {
      "_id": "...",
      "name": "Authentication System"
    },
    "approvals": [
      {
        "step_number": 1,
        "approver_type": "dev_lead",
        "approver_id": "...",
        "status": "pending"
      },
      {
        "step_number": 2,
        "approver_type": "qa_lead",
        "approver_id": "...",
        "status": "pending"
      },
      {
        "step_number": 4,
        "approver_type": "client",
        "approver_id": "client@example.com",
        "status": "pending"
      }
    ]
  }
}
```

### Approve Step (Internal)
**POST** `/nucleus-pm/workspaces/:workspaceId/approvals/:approvalId/approve`

Internal team member approves their step (dev_lead, qa_lead, security).

**Body:**
```json
{
  "notes": "Code review complete, looks good"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approval step approved successfully",
  "data": {
    "approval": {
      "step_number": 1,
      "approver_type": "dev_lead",
      "status": "approved",
      "signature_timestamp": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Reject Step
**POST** `/nucleus-pm/workspaces/:workspaceId/approvals/:approvalId/reject`

Reject an approval step (sends deliverable back to rework).

**Body:**
```json
{
  "reason": "Security vulnerabilities found, needs fixes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approval step rejected",
  "data": {
    "approval": {
      "step_number": 2,
      "approver_type": "qa_lead",
      "status": "rejected",
      "rejection_reason": "Security vulnerabilities found..."
    }
  }
}
```

### Link Task to Deliverable
**POST** `/nucleus-pm/workspaces/:workspaceId/deliverables/:deliverableId/tasks/:taskId/link`

Link an existing task to a deliverable (for progress tracking).

**Response:**
```json
{
  "success": true,
  "message": "Task linked to deliverable successfully",
  "data": {
    "deliverable": {
      "_id": "...",
      "name": "Authentication System",
      "progress_percentage": 75
    },
    "task": {
      "_id": "...",
      "title": "Implement JWT tokens",
      "milestoneId": "..."
    }
  }
}
```

### Evaluate Change Request (PM)
**POST** `/nucleus-pm/workspaces/:workspaceId/change-requests/:changeRequestId/evaluate`

PM evaluates a change request and provides recommendation.

**Body:**
```json
{
  "pm_notes": "This adds 2 days of work",
  "effort_days": 2,
  "cost_impact": 1200,
  "date_impact_days": 2,
  "pm_recommendation": "accept"
}
```

**PM Recommendation Options:**
- `accept` - Recommend accepting the change
- `reject` - Recommend rejecting the change
- `negotiate` - Recommend negotiating terms

**Response:**
```json
{
  "success": true,
  "message": "Change request evaluated successfully",
  "data": {
    "change_request": {
      "_id": "...",
      "status": "evaluated",
      "pm_recommendation": "accept",
      "effort_days": 2,
      "cost_impact": 1200,
      "date_impact_days": 2
    }
  }
}
```

### Get Change Requests (PM View)
**GET** `/nucleus-pm/workspaces/:workspaceId/change-requests`

Get all change requests for workspace (PM dashboard view).

**Query Parameters:**
- `status` - Filter by status (submitted, evaluated, accepted, rejected)
- `deliverable_id` - Filter by deliverable

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "deliverable_id": {
        "_id": "...",
        "name": "Authentication System"
      },
      "submitted_by": "client@example.com",
      "description": "Add password strength meter...",
      "status": "evaluated",
      "pm_recommendation": "accept",
      "effort_days": 2,
      "cost_impact": 1200,
      "date_impact_days": 2
    }
  ]
}
```

---

## Templates & Onboarding

### Create Project from Template
**POST** `/nucleus-templates/workspaces/:workspaceId/projects/from-template`

Create a project from a prebuilt template.

**Body:**
```json
{
  "templateType": "website",
  "projectName": "Acme Website Redesign",
  "clientId": "...",
  "devLeadId": "...",
  "qaLeadId": "...",
  "clientEmail": "client@example.com"
}
```

**Template Types:**
- `website` - Website development template (4 deliverables)
- `mobile_app` - Mobile app template (4 deliverables)
- `custom` - Custom template (1 deliverable)

**Response:**
```json
{
  "success": true,
  "message": "Project created from website template successfully",
  "data": {
    "project": {
      "_id": "...",
      "name": "Acme Website Redesign",
      "slug": "acme-website-redesign"
    },
    "deliverables": [
      {
        "_id": "...",
        "name": "Homepage Design & Development",
        "target_date": "2024-02-14",
        "status": "created"
      }
      // ... 3 more deliverables
    ]
  }
}
```

### Quick Start Onboarding
**POST** `/nucleus-templates/onboarding/quick-start`

Complete quick start onboarding (creates workspace + project in one step).

**Body:**
```json
{
  "workspaceName": "Gamma Tech Solutions",
  "projectName": "Client Portal App",
  "templateType": "mobile_app",
  "devLeadId": "...",
  "qaLeadId": "...",
  "clientEmail": "client@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quick start onboarding completed successfully",
  "data": {
    "workspace": {
      "_id": "...",
      "name": "Gamma Tech Solutions",
      "slug": "gamma-tech-solutions"
    },
    "project": {
      "_id": "...",
      "name": "Client Portal App",
      "slug": "client-portal-app"
    },
    "deliverables_count": 4,
    "checklist": {
      "checklist": {
        "workspace_created": true,
        "project_created": true,
        "deliverable_created": true,
        "approval_workflow_setup": true,
        "team_member_invited": false,
        "client_portal_configured": false,
        "first_approval_completed": false
      },
      "progress": 57,
      "nextStep": {
        "action": "invite_team_member",
        "title": "Invite Team Members",
        "description": "Add your team to start working on tasks"
      }
    }
  }
}
```

### Get Onboarding Checklist
**GET** `/nucleus-templates/workspaces/:workspaceId/onboarding/checklist`

Get onboarding checklist and progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "checklist": {
      "workspace_created": true,
      "project_created": true,
      "deliverable_created": true,
      "approval_workflow_setup": true,
      "team_member_invited": false,
      "client_portal_configured": false,
      "first_approval_completed": false
    },
    "progress": 57,
    "completed": 4,
    "total": 7,
    "nextStep": {
      "action": "invite_team_member",
      "title": "Invite Team Members",
      "description": "Add your team to start working on tasks"
    }
  }
}
```

### Get Available Templates
**GET** `/nucleus-templates/templates/list`

Get list of available project templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "website",
      "name": "Website",
      "description": "Complete website development template...",
      "category": "web_development",
      "deliverables_count": 4,
      "estimated_duration": "60-90 days",
      "features": [
        "Homepage Design & Development",
        "Product Catalog",
        "Checkout System",
        "User Authentication"
      ]
    },
    {
      "id": "mobile_app",
      "name": "Mobile App",
      "description": "Mobile app development template...",
      "category": "mobile_development",
      "deliverables_count": 4,
      "estimated_duration": "90-120 days",
      "features": [
        "App Authentication",
        "Core Features",
        "Payment Integration",
        "Push Notifications"
      ]
    },
    {
      "id": "custom",
      "name": "Custom",
      "description": "Start with a blank project...",
      "category": "custom",
      "deliverables_count": 1,
      "estimated_duration": "Flexible",
      "features": [
        "Blank project structure",
        "Custom deliverables",
        "Flexible timeline"
      ]
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: created, in_dev, ready_approval"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied: You are not a member of this workspace"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Deliverable not found or access denied"
}
```

---

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained through the standard authentication endpoints.

---

## Workspace Isolation

All Nucleus endpoints enforce workspace isolation:
- User must be a member of the workspace
- All resources are scoped to workspace
- Cross-workspace access is prevented

---

## Rate Limiting

API endpoints may be rate-limited. Check response headers:
- `X-RateLimit-Limit` - Request limit per window
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time

---

## Webhooks & Notifications

Slack notifications are sent automatically when:
- Deliverable is ready for client approval
- Client approves/rejects deliverable
- Change request is submitted
- Change request is evaluated
- Change request is decided

Configure Slack webhook in workspace settings.

---

## Support

For API support, contact: support@nucleus.com
