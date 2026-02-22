# Tenant Project Management System

A comprehensive project management system for tenant software houses, built with React and integrated with the TWS Premium Design System.

## 📁 Directory Structure

```
projects/
├── components/          # Reusable UI components
│   ├── CreateProjectModal.js
│   ├── CreateTaskModal.js
│   ├── ConfirmDialog.js
│   ├── ProjectCard.js
│   ├── ErrorBoundary.js
│   ├── LoadingSkeleton.js
│   ├── EmptyState.js
│   └── index.js
├── constants/          # Constants and configuration
│   └── projectConstants.js
├── services/          # API service layer
│   └── tenantProjectApiService.js
├── utils/             # Utility functions
│   ├── errorHandler.js
│   ├── dateUtils.js
│   ├── validation.js
│   └── index.js
├── hooks/             # Custom React hooks
│   └── useProjectData.js
├── ProjectsOverview.js
├── ProjectTasks.js
├── ProjectMilestones.js
├── ProjectResources.js
├── ProjectTimesheets.js
├── SprintManagement.js
├── INTEGRATION_GUIDE.md
└── README.md
```

## 🚀 Quick Start

### Importing Components

```javascript
// Import from centralized index
import { ProjectCard, CreateProjectModal, ErrorBoundary } from './components';
import { useProjects, useTasks } from './hooks/useProjectData';
import { formatDate, validateProjectName } from './utils';
```

### Using Custom Hooks

```javascript
import { useProjects } from './hooks/useProjectData';

function MyComponent() {
  const { projects, loading, error, refresh } = useProjects(tenantSlug, {
    status: 'active'
  });

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorDisplay />;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}
```

### Using Loading Skeletons

```javascript
import { PageSkeleton, ProjectCardSkeleton } from './components/LoadingSkeleton';

function ProjectsList({ loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    );
  }
  // ... render actual projects
}
```

### Using Empty States

```javascript
import { EmptyProjects, EmptyTasks } from './components/EmptyState';

function ProjectsPage({ projects, onCreateProject }) {
  if (projects.length === 0) {
    return <EmptyProjects onCreateProject={onCreateProject} />;
  }
  // ... render projects
}
```

## 📄 Pages Overview

### ProjectsOverview
Main dashboard showing project metrics, health status, and recent projects.

**Route**: `/tenant/:tenantSlug/org/projects`

### ProjectTasks
Kanban board for task management with drag-and-drop support.

**Route**: `/tenant/:tenantSlug/org/projects/tasks`

### ProjectMilestones
Timeline and list views for milestone tracking.

**Route**: `/tenant/:tenantSlug/org/projects/milestones`

### ProjectResources
Resource allocation and utilization tracking.

**Route**: `/tenant/:tenantSlug/org/projects/resources`

### ProjectTimesheets
Time tracking with integrated timer and entry management.

**Route**: `/tenant/:tenantSlug/org/projects/timesheets`

### SprintManagement
Agile sprint planning and velocity tracking.

**Route**: `/tenant/:tenantSlug/org/projects/sprints`

## 🔧 Utilities

### Error Handler
Centralized error handling with toast notifications:

```javascript
import { handleApiError, handleSuccess } from './utils/errorHandler';

try {
  await apiCall();
  handleSuccess('Operation successful!');
} catch (error) {
  handleApiError(error, 'Operation failed');
}
```

### Date Utils
Date formatting and manipulation:

```javascript
import { formatDate, formatCardDueDate, isOverdue } from './utils/dateUtils';

const formatted = formatDate(new Date());
const relative = formatCardDueDate(new Date('2025-12-31'));
const overdue = isOverdue(new Date('2025-01-01'));
```

### Validation
Form validation functions:

```javascript
import { validateProjectName, validateProjectForm } from './utils/validation';

const result = validateProjectName('My Project');
if (!result.isValid) {
  console.error(result.error);
}
```

## 🎨 Components

### ProjectCard
Reusable project card component:

```javascript
import { ProjectCard } from './components';

<ProjectCard 
  project={project} 
  tenantSlug={tenantSlug}
/>
```

### Modals
Create project or task modals:

```javascript
import { CreateProjectModal, CreateTaskModal } from './components';

<CreateProjectModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onProjectCreated={refreshProjects}
/>
```

### ErrorBoundary
React error boundary wrapper:

```javascript
import { ErrorBoundary } from './components';

<ErrorBoundary message="Failed to load projects">
  <ProjectsList />
</ErrorBoundary>
```

## 📡 API Service

All API calls go through the centralized service:

```javascript
import tenantProjectApiService from './services/tenantProjectApiService';

// Get projects
const projects = await tenantProjectApiService.getProjects(tenantSlug, filters);

// Create project
const newProject = await tenantProjectApiService.createProject(tenantSlug, data);

// Update task
await tenantProjectApiService.updateTask(tenantSlug, taskId, { status: 'completed' });
```

## 🔐 Constants

All constants are centralized:

```javascript
import { 
  PROJECT_STATUS, 
  PROJECT_PRIORITY, 
  CARD_STATUS,
  STATUS_COLORS,
  API_ENDPOINTS
} from './constants/projectConstants';
```

## 🎯 Best Practices

1. **Always use custom hooks** for data fetching to ensure consistency
2. **Use loading skeletons** instead of simple loading spinners
3. **Show empty states** when no data is available
4. **Handle errors gracefully** using ErrorBoundary and error handlers
5. **Validate forms** before submission using validation utilities
6. **Use constants** instead of hardcoded strings
7. **Follow the design system** - use glass-card-premium, glass-button classes

## 📚 Documentation

- **INTEGRATION_GUIDE.md** - Complete integration guide for developers
- **TENANT_PROJECTS_BACKEND_API_SPEC.md** - Backend API specifications
- **TENANT_PROJECT_MANAGEMENT_REBUILD_ANALYSIS.md** - System analysis

## 🚦 Status

✅ All components implemented
✅ Routes configured
✅ Navigation integrated
✅ API service layer complete
✅ Utilities and helpers ready
✅ Documentation complete

**Ready for backend API integration!**

