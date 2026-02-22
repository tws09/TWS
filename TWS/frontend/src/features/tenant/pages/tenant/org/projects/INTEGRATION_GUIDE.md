# Tenant Project Management - Integration Guide

## Overview

This guide provides instructions for integrating the rebuilt tenant project management system with your backend APIs and frontend routing.

## File Structure

```
features/tenant/pages/tenant/org/projects/
├── constants/
│   └── projectConstants.js        # All constants, statuses, priorities, API endpoints
├── services/
│   └── tenantProjectApiService.js # Complete API service layer
├── components/
│   ├── ProjectCard.js             # Reusable project card component
│   └── ErrorBoundary.js           # Error handling component
├── utils/
│   ├── errorHandler.js            # Centralized error handling
│   ├── dateUtils.js               # Date formatting utilities
│   └── validation.js              # Form validation utilities
├── ProjectsOverview.js            # Main overview dashboard
├── ProjectTasks.js                # Kanban task management
├── ProjectMilestones.js           # Milestone tracking
├── ProjectResources.js            # Resource allocation
├── ProjectTimesheets.js           # Time tracking
└── SprintManagement.js            # Agile sprint management
```

## Routes Configuration

Routes have been added to `TenantOrg.js`:

```javascript
// Project Routes
<Route path="projects" element={<ProjectsOverview />} />
<Route path="projects/tasks" element={<ProjectTasks />} />
<Route path="projects/milestones" element={<ProjectMilestones />} />
<Route path="projects/resources" element={<ProjectResources />} />
<Route path="projects/timesheets" element={<ProjectTimesheets />} />
<Route path="projects/sprints" element={<SprintManagement />} />
```

## Menu Configuration

Menu items have been updated in `industryMenuBuilder.js` to include all new project management pages.

## API Endpoints Required

The following backend API endpoints need to be implemented:

### Projects
- `GET /api/tenant/:tenantSlug/organization/projects` - List all projects
- `GET /api/tenant/:tenantSlug/organization/projects/:id` - Get single project
- `POST /api/tenant/:tenantSlug/organization/projects` - Create project
- `PATCH /api/tenant/:tenantSlug/organization/projects/:id` - Update project
- `DELETE /api/tenant/:tenantSlug/organization/projects/:id` - Delete project
- `GET /api/tenant/:tenantSlug/organization/projects/metrics` - Get project metrics

### Tasks
- `GET /api/tenant/:tenantSlug/organization/projects/tasks` - List tasks
- `POST /api/tenant/:tenantSlug/organization/projects/tasks` - Create task
- `PATCH /api/tenant/:tenantSlug/organization/projects/tasks/:id` - Update task
- `DELETE /api/tenant/:tenantSlug/organization/projects/tasks/:id` - Delete task

### Milestones
- `GET /api/tenant/:tenantSlug/organization/projects/milestones` - List milestones
- `POST /api/tenant/:tenantSlug/organization/projects/milestones` - Create milestone
- `PATCH /api/tenant/:tenantSlug/organization/projects/milestones/:id` - Update milestone

### Resources
- `GET /api/tenant/:tenantSlug/organization/projects/resources` - List resources
- `POST /api/tenant/:tenantSlug/organization/projects/resources` - Create resource
- `PATCH /api/tenant/:tenantSlug/organization/projects/resources/:id` - Update resource

### Timesheets
- `GET /api/tenant/:tenantSlug/organization/projects/timesheets` - List timesheets
- `POST /api/tenant/:tenantSlug/organization/projects/timesheets` - Submit timesheet
- `PATCH /api/tenant/:tenantSlug/organization/projects/timesheets/:id` - Update timesheet

### Sprints
- `GET /api/tenant/:tenantSlug/organization/projects/sprints` - List sprints
- `POST /api/tenant/:tenantSlug/organization/projects/sprints` - Create sprint
- `PATCH /api/tenant/:tenantSlug/organization/projects/sprints/:id` - Update sprint

### Clients
- `GET /api/tenant/:tenantSlug/organization/projects/clients` - List clients
- `POST /api/tenant/:tenantSlug/organization/projects/clients` - Create client
- `PATCH /api/tenant/:tenantSlug/organization/projects/clients/:id` - Update client
- `DELETE /api/tenant/:tenantSlug/organization/projects/clients/:id` - Delete client

## Data Models Expected

### Project Model
```javascript
{
  _id: string,
  name: string,
  description?: string,
  status: 'active' | 'planning' | 'on_hold' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  clientId?: { _id: string, name: string },
  budget?: {
    total: number,
    currency: 'USD' | 'EUR' | 'GBP' | 'PKR'
  },
  timeline?: {
    startDate: Date,
    endDate: Date,
    estimatedHours?: number
  },
  metrics?: {
    completionRate: number
  },
  tags?: string[]
}
```

### Task Model
```javascript
{
  _id: string,
  title: string,
  description?: string,
  status: 'todo' | 'in_progress' | 'under_review' | 'completed',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  type: 'user_story' | 'bug' | 'feature' | 'task' | ...,
  projectId?: { _id: string, name: string },
  assigneeId?: { _id: string, name: string },
  dueDate?: Date,
  storyPoints?: number,
  labels?: string[]
}
```

### Milestone Model
```javascript
{
  _id: string,
  title: string,
  description?: string,
  status: 'pending' | 'in_progress' | 'completed' | 'at_risk' | 'delayed',
  projectId?: { _id: string, name: string },
  dueDate?: Date,
  tasks?: {
    total: number,
    completed: number
  },
  ownerId?: { _id: string, name: string },
  dependencies?: string[]
}
```

### Resource Model
```javascript
{
  _id: string,
  name: string,
  email?: string,
  role?: string,
  department?: string,
  skills?: string[],
  status: 'available' | 'fully_allocated' | 'over_allocated' | 'on_leave',
  totalAllocation: number,
  projects?: [{
    name: string,
    allocation: number,
    role: string
  }],
  availableHours?: number,
  hoursThisWeek?: number,
  hoursThisMonth?: number
}
```

### Timesheet Model
```javascript
{
  _id: string,
  date: Date,
  projectId?: { _id: string, name: string },
  taskId?: { _id: string, title: string },
  memberId?: { _id: string, name: string },
  hours: number,
  description?: string,
  status: 'draft' | 'submitted' | 'approved' | 'rejected',
  billable: boolean
}
```

### Sprint Model
```javascript
{
  _id: string,
  name: string,
  sprintNumber: number,
  startDate: Date,
  endDate: Date,
  status: 'planning' | 'active' | 'completed' | 'cancelled',
  goal: string,
  capacity: {
    totalStoryPoints: number,
    committedStoryPoints: number,
    completedStoryPoints: number
  },
  metrics: {
    velocity: number
  },
  team: [{
    userId: string,
    name: string,
    role: string,
    capacity: number
  }]
}
```

## Usage Examples

### Using the API Service

```javascript
import tenantProjectApiService from './services/tenantProjectApiService';

// Get all projects
const projects = await tenantProjectApiService.getProjects(tenantSlug, {
  status: 'active',
  limit: 10
});

// Create a task
const newTask = await tenantProjectApiService.createTask(tenantSlug, {
  title: 'Implement feature X',
  projectId: 'project-id',
  priority: 'high',
  status: 'todo'
});

// Update task status (drag and drop)
await tenantProjectApiService.updateTask(tenantSlug, taskId, {
  status: 'in_progress'
});
```

### Using Utilities

```javascript
import { formatDate, isOverdue, getDaysUntil } from './utils/dateUtils';
import { validateProjectName, validateBudget } from './utils/validation';
import { handleApiError, handleSuccess } from './utils/errorHandler';

// Date formatting
const formatted = formatDate(new Date());

// Validation
const nameValidation = validateProjectName('My Project');
if (!nameValidation.isValid) {
  console.error(nameValidation.error);
}

// Error handling
try {
  await someApiCall();
} catch (error) {
  handleApiError(error, 'Failed to load data');
}
```

### Using Components

```javascript
import ProjectCard from './components/ProjectCard';
import ErrorBoundary from './components/ErrorBoundary';

// Wrap pages with ErrorBoundary
<ErrorBoundary message="Failed to load projects">
  <ProjectsOverview />
</ErrorBoundary>

// Use ProjectCard in lists
{projects.map(project => (
  <ProjectCard 
    key={project._id} 
    project={project} 
    tenantSlug={tenantSlug} 
  />
))}
```

## Navigation

All pages are accessible via:
- `/tenant/:tenantSlug/org/projects` - Overview
- `/tenant/:tenantSlug/org/projects/tasks` - Tasks (Kanban)
- `/tenant/:tenantSlug/org/projects/milestones` - Milestones
- `/tenant/:tenantSlug/org/projects/resources` - Resources
- `/tenant/:tenantSlug/org/projects/timesheets` - Timesheets
- `/tenant/:tenantSlug/org/projects/sprints` - Sprints

## Error Handling

All API calls are wrapped with error handling. Errors are automatically displayed using toast notifications. The ErrorBoundary component catches React errors and displays user-friendly error messages.

## Constants

All constants are centralized in `constants/projectConstants.js`. This includes:
- Status values
- Priority levels
- Color mappings
- Validation rules
- API endpoints
- Error messages

## Testing Checklist

- [ ] All routes are accessible
- [ ] API endpoints return expected data format
- [ ] Error handling works correctly
- [ ] Drag-and-drop in Kanban board functions properly
- [ ] Time tracker starts and stops correctly
- [ ] Filters work on all list views
- [ ] Navigation between pages works smoothly
- [ ] Responsive design works on mobile devices
- [ ] Dark mode support works correctly

## Next Steps

1. Implement backend APIs matching the endpoint definitions
2. Test all CRUD operations
3. Add unit tests for utilities
4. Add integration tests for API service
5. Test drag-and-drop functionality
6. Verify all navigation flows
7. Test with real data scenarios

## Support

For issues or questions, refer to:
- Constants file for available options
- API service for method signatures
- Individual page components for UI structure

