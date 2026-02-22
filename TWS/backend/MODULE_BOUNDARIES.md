# ERP Module Boundaries - Architecture Documentation

## Overview

This document defines the module boundaries for the TWS ERP system, addressing **Issue #6.1: Module Boundaries Unclear** from the Comprehensive ERP Deep Audit Report.

## Architecture Principle

**No direct database access across modules.** Each module owns its models and exposes a well-defined API for cross-module communication.

## Module Ownership

| Module | Owns (Models) | API Service | Responsibility |
|--------|---------------|-------------|----------------|
| **Projects** | Project, Task, Milestone, Sprint, ProjectMember, ProjectAccess, ProjectTemplate | `project-api.service.js` | Project lifecycle, tasks, sprints |
| **Finance** | Invoice, Bill, TimeEntry, Client, Transaction, ChartOfAccounts, JournalEntry | `finance-api.service.js` | Billing, costing, time tracking |
| **HR** | Employee, Attendance, User | (uses project-api) | Performance, attendance |
| **Clients** | ClientHealth, ClientTouchpoint | (uses project-api, finance-api) | Client relationship health |

## Module API Layer

Location: `src/services/module-api/`

### ProjectModuleAPI
- `getProjectById(orgId, projectId, options)` - Get project
- `getProjectWithClient(orgId, projectId)` - Project + client for billing
- `getProjectsByOrg(orgId, filters)` - List projects
- `validateProjectExists(orgId, projectId)` - Validation
- `getProjectBudgetInfo(orgId, projectId)` - Budget data for costing
- `getProjectMembersForUser(userId)` - HR cross-module
- `getProjectsForClient(orgId, clientId)` - Client health cross-module

### FinanceModuleAPI
- `getTimeEntriesForProject(orgId, projectId, options)` - For billing/costing
- `getClientById(orgId, clientId)` - Client lookup
- `getClientForProject(orgId, projectId, clientId)` - Resolve client from project
- `getExpensesForProject(orgId, projectId, options)` - For billing
- `getInvoiceById(orgId, invoiceId)` - Invoice lookup

## Refactored Services

The following services now use Module APIs instead of direct cross-module model access:

| Service | Before | After |
|---------|--------|-------|
| `billing-engine.service.js` | Project, Client direct | projectApi, financeApi |
| `project-costing.service.js` | Project, TimeEntry, Expense direct | projectApi, financeApi |
| `hrPerformanceService.js` | Project, ProjectMember direct | projectApi |
| `clientHealthService.js` | Project direct | projectApi |
| `project-integration.service.js` | Project direct | projectApi |

## Usage Guidelines

### ✅ CORRECT - Use Module API
```javascript
const projectApi = require('../module-api/project-api.service');
const project = await projectApi.getProjectById(orgId, projectId);
```

### ❌ WRONG - Direct cross-module access
```javascript
const Project = require('../../models/Project');  // In Finance service!
const project = await Project.findOne({ _id: projectId });
```

### Adding New Cross-Module Access

1. Add method to appropriate Module API (`project-api.service.js` or `finance-api.service.js`)
2. Use the Module API in your service
3. Update this documentation

## Circular Dependency Prevention

- **Projects** → never requires Finance models directly
- **Finance** → uses projectApi for Project data
- **HR** → uses projectApi for ProjectMember/Project data
- **Clients** → uses projectApi for Project data, financeApi for Client data

## Testing

Module APIs can be mocked for unit testing:
```javascript
jest.mock('../module-api/project-api.service');
```
