# Tenant Project Management - Backend API Specification

## Overview

This document specifies the backend API endpoints required to support the tenant project management system.

## Base URL

All endpoints are prefixed with: `/api/tenant/:tenantSlug/organization`

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Response Format

All successful responses should follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

---

## Projects Endpoints

### GET /projects
Get all projects for the tenant organization.

**Query Parameters:**
- `status` (optional): Filter by status (active, planning, on_hold, completed, cancelled)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `clientId` (optional): Filter by client ID
- `limit` (optional): Limit results (default: 50)
- `skip` (optional): Skip results for pagination
- `sort` (optional): Sort field (default: updatedAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "status": "active",
        "priority": "high",
        "clientId": {
          "_id": "string",
          "name": "string"
        },
        "budget": {
          "total": 50000,
          "currency": "USD"
        },
        "timeline": {
          "startDate": "2025-01-01T00:00:00.000Z",
          "endDate": "2025-06-01T00:00:00.000Z",
          "estimatedHours": 1200
        },
        "metrics": {
          "completionRate": 65
        },
        "tags": ["web", "react"],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "total": 10
  }
}
```

### GET /projects/:id
Get a single project by ID.

### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "planning",
  "priority": "medium",
  "clientId": "client-id",
  "budget": {
    "total": 50000,
    "currency": "USD"
  },
  "timeline": {
    "startDate": "2025-01-01",
    "endDate": "2025-06-01",
    "estimatedHours": 1200
  },
  "tags": ["web", "react"]
}
```

### PATCH /projects/:id
Update a project.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "status": "active",
  "metrics": {
    "completionRate": 70
  }
}
```

### DELETE /projects/:id
Delete a project.

### GET /projects/metrics
Get aggregated project metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 25,
    "activeProjects": 12,
    "completedProjects": 10,
    "onTrackProjects": 8,
    "atRiskProjects": 3,
    "delayedProjects": 1,
    "totalTeamMembers": 15,
    "totalBudget": 500000,
    "spentBudget": 250000,
    "totalHours": 5000,
    "utilization": 75
  }
}
```

---

## Tasks Endpoints

### GET /projects/tasks
Get all tasks.

**Query Parameters:**
- `projectId` (optional): Filter by project
- `status` (optional): Filter by status
- `assigneeId` (optional): Filter by assignee
- `groupBy` (optional): Group by status (returns object with status keys)
- `limit`, `skip`, `sort` (optional): Pagination

**Response (grouped by status):**
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

**Response (normal list):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "string",
        "title": "Task title",
        "description": "Task description",
        "status": "todo",
        "priority": "high",
        "type": "feature",
        "projectId": {
          "_id": "string",
          "name": "string"
        },
        "assigneeId": {
          "_id": "string",
          "name": "string"
        },
        "dueDate": "2025-01-20T00:00:00.000Z",
        "storyPoints": 5,
        "labels": ["frontend", "ui"]
      }
    ]
  }
}
```

### POST /projects/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "type": "task",
  "projectId": "project-id",
  "assigneeId": "user-id",
  "dueDate": "2025-01-20",
  "storyPoints": 3,
  "labels": ["tag1", "tag2"]
}
```

### PATCH /projects/tasks/:id
Update a task (used for drag-and-drop status changes).

**Request Body:** (all fields optional)
```json
{
  "status": "in_progress",
  "assigneeId": "new-user-id",
  "priority": "urgent"
}
```

---

## Milestones Endpoints

### GET /projects/milestones
Get all milestones.

**Query Parameters:**
- `projectId` (optional): Filter by project
- `upcoming` (optional): Get upcoming milestones only
- `status` (optional): Filter by status
- `limit` (optional): Limit results

**Response:**
```json
{
  "success": true,
  "data": {
    "milestones": [
      {
        "_id": "string",
        "title": "Milestone title",
        "description": "Description",
        "status": "pending",
        "projectId": {
          "_id": "string",
          "name": "string"
        },
        "dueDate": "2025-02-01T00:00:00.000Z",
        "tasks": {
          "total": 10,
          "completed": 7
        },
        "ownerId": {
          "_id": "string",
          "name": "string"
        },
        "dependencies": ["milestone-id-1"]
      }
    ]
  }
}
```

### POST /projects/milestones
Create a milestone.

### PATCH /projects/milestones/:id
Update a milestone.

---

## Resources Endpoints

### GET /projects/resources
Get all project resources with allocation data.

**Response:**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "_id": "string",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Senior Developer",
        "department": "Engineering",
        "skills": ["React", "Node.js"],
        "status": "available",
        "totalAllocation": 75,
        "projects": [
          {
            "name": "Project A",
            "allocation": 50,
            "role": "Lead Developer"
          }
        ],
        "availableHours": 10,
        "hoursThisWeek": 30,
        "hoursThisMonth": 120
      }
    ]
  }
}
```

---

## Timesheets Endpoints

### GET /projects/timesheets
Get timesheet entries.

**Query Parameters:**
- `projectId` (optional): Filter by project
- `period` (optional): Filter by period (today, this_week, last_week, this_month, last_month)
- `memberId` (optional): Filter by team member
- `startDate`, `endDate` (optional): Date range

**Response:**
```json
{
  "success": true,
  "data": {
    "timesheets": [
      {
        "_id": "string",
        "date": "2025-01-15",
        "projectId": {
          "_id": "string",
          "name": "Project A"
        },
        "taskId": {
          "_id": "string",
          "title": "Task title"
        },
        "memberId": {
          "_id": "string",
          "name": "John Doe"
        },
        "hours": 8.5,
        "description": "Work description",
        "status": "approved",
        "billable": true
      }
    ]
  }
}
```

### POST /projects/timesheets
Submit a timesheet entry.

**Request Body:**
```json
{
  "projectId": "project-id",
  "taskId": "task-id",
  "hours": 8.5,
  "date": "2025-01-15",
  "description": "Work description",
  "billable": true,
  "status": "submitted"
}
```

---

## Sprints Endpoints

### GET /projects/sprints
Get all sprints.

**Query Parameters:**
- `status` (optional): Filter by status (planning, active, completed)
- `projectId` (optional): Filter by project

**Response:**
```json
{
  "success": true,
  "data": {
    "sprints": [
      {
        "_id": "string",
        "name": "Sprint 1 - User Authentication",
        "sprintNumber": 1,
        "startDate": "2025-01-01",
        "endDate": "2025-01-15",
        "status": "active",
        "goal": "Implement user authentication",
        "capacity": {
          "totalStoryPoints": 40,
          "committedStoryPoints": 35,
          "completedStoryPoints": 18
        },
        "metrics": {
          "velocity": 0
        },
        "team": [
          {
            "userId": "user-id",
            "name": "John Doe",
            "role": "Developer",
            "capacity": 40
          }
        ]
      }
    ]
  }
}
```

### POST /projects/sprints
Create a sprint.

**Request Body:**
```json
{
  "name": "Sprint 1",
  "sprintNumber": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-01-15",
  "goal": "Sprint goal",
  "team": ["user-id-1", "user-id-2"]
}
```

---

## Clients Endpoints

### GET /projects/clients
Get all clients.

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "string",
        "name": "Client Name",
        "company": {
          "name": "Company Name"
        },
        "contact": {
          "primary": {
            "email": "client@example.com",
            "phone": "+1234567890"
          }
        },
        "status": "active"
      }
    ]
  }
}
```

### POST /projects/clients
Create a client.

### PATCH /projects/clients/:id
Update a client.

### DELETE /projects/clients/:id
Delete a client.

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

---

## Notes

1. All date fields should be in ISO 8601 format
2. All IDs are MongoDB ObjectIds (strings)
3. Pagination uses `limit` and `skip` parameters
4. Filtering is done via query parameters
5. Status and priority values must match constants defined in frontend
6. Nested objects (clientId, projectId, etc.) can be populated or just IDs
7. All endpoints should handle tenant isolation (filter by tenantSlug)

