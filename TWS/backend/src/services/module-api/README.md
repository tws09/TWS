# Module API Layer - ERP Module Boundaries

## Architecture Principle

**No direct database access across modules.** Each module owns its models and exposes a well-defined API for cross-module communication.

## Module Boundaries

| Module | Owns | API Service | Used By |
|--------|------|-------------|---------|
| **Projects** | Project, Task, Milestone, Sprint, ProjectMember, ProjectAccess | `project-api.service.js` | Finance, HR, Analytics |
| **Finance** | Invoice, Bill, TimeEntry, Client, Transaction, ChartOfAccounts | `finance-api.service.js` | Projects, HR, Billing |
| **HR** | User, ProjectMember, Attendance | `hr-api.service.js` | Projects, Finance |
| **Clients** | Client (ProjectClient) | `client-api.service.js` | Projects, Finance |

## Usage

```javascript
// ❌ WRONG - Direct cross-module access
const Project = require('../../models/Project');
const project = await Project.findOne({ _id: projectId });

// ✅ CORRECT - Use Module API
const projectApi = require('../module-api/project-api.service');
const project = await projectApi.getProjectById(orgId, projectId);
```

## API Contracts

### ProjectModuleAPI
- `getProjectById(orgId, projectId)` - Get project with optional population
- `getProjectWithClient(orgId, projectId)` - Get project + client for billing
- `getProjectsByOrg(orgId, filters)` - List projects with filters
- `validateProjectExists(orgId, projectId)` - Validation only

### FinanceModuleAPI
- `getTimeEntriesForProject(orgId, projectId, options)` - Time entries for billing
- `getClientById(orgId, clientId)` - Client for project billing
- `getClientForProject(orgId, projectId)` - Resolve client from project
- `getExpensesForProject(orgId, projectId, options)` - Expenses for billing

### ClientModuleAPI
- `getClientById(orgId, clientId)` - Unified client lookup (Finance or ProjectClient)
