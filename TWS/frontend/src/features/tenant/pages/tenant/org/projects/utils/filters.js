/**
 * Filter Utilities for Tenant Projects
 * Provides reusable filter logic and helpers
 */

/**
 * Filter projects by various criteria
 */
export const filterProjects = (projects, filters) => {
  if (!projects || !Array.isArray(projects)) return [];

  return projects.filter(project => {
    // Status filter
    if (filters.status && project.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && project.priority !== filters.priority) {
      return false;
    }

    // Client filter
    if (filters.clientId) {
      const clientId = project.clientId?._id || project.clientId || project.client?.id || project.client;
      if (clientId !== filters.clientId) {
        return false;
      }
    }

    // Search filter (name, description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = project.name?.toLowerCase().includes(searchTerm);
      const descMatch = project.description?.toLowerCase().includes(searchTerm);
      
      if (!nameMatch && !descMatch) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate && project.timeline?.startDate) {
      const projectStart = new Date(project.timeline.startDate);
      const filterStart = new Date(filters.startDate);
      if (projectStart < filterStart) {
        return false;
      }
    }

    if (filters.endDate && project.timeline?.endDate) {
      const projectEnd = new Date(project.timeline.endDate);
      const filterEnd = new Date(filters.endDate);
      if (projectEnd > filterEnd) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter tasks by various criteria
 */
export const filterTasks = (tasks, filters) => {
  if (!tasks || !Array.isArray(tasks)) return [];

  return tasks.filter(task => {
    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Project filter
    if (filters.projectId) {
      const taskProjectId = task.projectId?._id || task.projectId || task.project?.id || task.project;
      if (taskProjectId !== filters.projectId) {
        return false;
      }
    }

    // Assignee filter
    if (filters.assigneeId) {
      const assigneeId = task.assigneeId?._id || task.assigneeId || task.assignee?.id || task.assignee;
      if (assigneeId !== filters.assigneeId) {
        return false;
      }
    }

    // Type filter
    if (filters.type && task.type !== filters.type) {
      return false;
    }

    // Search filter (title, description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(searchTerm);
      const descMatch = task.description?.toLowerCase().includes(searchTerm);
      const labelMatch = task.labels?.some(label => 
        label.toLowerCase().includes(searchTerm)
      );
      
      if (!titleMatch && !descMatch && !labelMatch) {
        return false;
      }
    }

    // Due date filter
    if (filters.overdue) {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        if (dueDate >= now) {
          return false;
        }
      } else {
        return false;
      }
    }

    if (filters.dueDateFrom && task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      const filterFrom = new Date(filters.dueDateFrom);
      if (taskDueDate < filterFrom) {
        return false;
      }
    }

    if (filters.dueDateTo && task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      const filterTo = new Date(filters.dueDateTo);
      if (taskDueDate > filterTo) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter milestones by various criteria
 */
export const filterMilestones = (milestones, filters) => {
  if (!milestones || !Array.isArray(milestones)) return [];

  return milestones.filter(milestone => {
    // Status filter
    if (filters.status && milestone.status !== filters.status) {
      return false;
    }

    // Project filter
    if (filters.projectId) {
      const milestoneProjectId = milestone.projectId?._id || milestone.projectId || milestone.project?.id || milestone.project;
      if (milestoneProjectId !== filters.projectId) {
        return false;
      }
    }

    // Upcoming filter
    if (filters.upcoming) {
      if (!milestone.dueDate) return false;
      const dueDate = new Date(milestone.dueDate);
      const now = new Date();
      if (dueDate < now) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = milestone.title?.toLowerCase().includes(searchTerm);
      const descMatch = milestone.description?.toLowerCase().includes(searchTerm);
      
      if (!titleMatch && !descMatch) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate && milestone.dueDate) {
      const milestoneDate = new Date(milestone.dueDate);
      const filterStart = new Date(filters.startDate);
      if (milestoneDate < filterStart) {
        return false;
      }
    }

    if (filters.endDate && milestone.dueDate) {
      const milestoneDate = new Date(milestone.dueDate);
      const filterEnd = new Date(filters.endDate);
      if (milestoneDate > filterEnd) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter resources by various criteria
 */
export const filterResources = (resources, filters) => {
  if (!resources || !Array.isArray(resources)) return [];

  return resources.filter(resource => {
    // Role filter
    if (filters.role && resource.role !== filters.role) {
      return false;
    }

    // Department filter
    if (filters.department && resource.department !== filters.department) {
      return false;
    }

    // Availability filter
    if (filters.availability) {
      if (resource.status !== filters.availability) {
        return false;
      }
    }

    // Search filter (name, email, skills)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = resource.name?.toLowerCase().includes(searchTerm);
      const emailMatch = resource.email?.toLowerCase().includes(searchTerm);
      const skillMatch = resource.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm)
      );
      
      if (!nameMatch && !emailMatch && !skillMatch) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort array by field
 */
export const sortBy = (array, field, direction = 'asc') => {
  if (!array || !Array.isArray(array)) return [];

  const sorted = [...array].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.');
      aVal = fields.reduce((obj, f) => obj?.[f], a);
      bVal = fields.reduce((obj, f) => obj?.[f], b);
    }

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle dates
    if (aVal instanceof Date || (typeof aVal === 'string' && !isNaN(Date.parse(aVal)))) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Group items by field
 */
export const groupBy = (array, field) => {
  if (!array || !Array.isArray(array)) return {};

  return array.reduce((groups, item) => {
    let key = item[field];

    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.');
      key = fields.reduce((obj, f) => obj?.[f], item);
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

