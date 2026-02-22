/**
 * Export Utilities for Tenant Projects
 * Provides data export functionality (CSV, JSON, etc.)
 */

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Auto-detect headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape CSV values
  const escapeCSV = (value) => {
    if (value == null) return '';
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create CSV rows
  const rows = [
    csvHeaders.map(escapeCSV).join(','),
    ...data.map(item => 
      csvHeaders.map(header => {
        // Handle nested properties (e.g., "project.name")
        const value = header.includes('.') 
          ? header.split('.').reduce((obj, prop) => obj?.[prop], item)
          : item[header];
        return escapeCSV(value);
      }).join(',')
    )
  ];

  return rows.join('\n');
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (data, filename, headers = null) => {
  const csv = arrayToCSV(data, headers);
  if (!csv) return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'export'}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'export'}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export projects to CSV
 */
export const exportProjects = (projects) => {
  const headers = ['name', 'description', 'status', 'priority', 'client.name', 'budget.total', 'budget.currency', 'timeline.startDate', 'timeline.endDate', 'metrics.completionRate'];
  downloadCSV(projects, 'projects', headers);
};

/**
 * Export tasks to CSV
 */
export const exportTasks = (tasks) => {
  const headers = ['title', 'description', 'status', 'priority', 'type', 'project.name', 'assignee.name', 'dueDate', 'storyPoints'];
  downloadCSV(tasks, 'tasks', headers);
};

/**
 * Export timesheets to CSV
 */
export const exportTimesheets = (timesheets) => {
  const headers = ['date', 'project.name', 'task.title', 'member.name', 'hours', 'description', 'status', 'billable'];
  downloadCSV(timesheets, 'timesheets', headers);
};

/**
 * Export milestones to CSV
 */
export const exportMilestones = (milestones) => {
  const headers = ['title', 'description', 'status', 'project.name', 'dueDate', 'tasks.total', 'tasks.completed', 'owner.name'];
  downloadCSV(milestones, 'milestones', headers);
};

/**
 * Export resources to CSV
 */
export const exportResources = (resources) => {
  const headers = ['name', 'email', 'role', 'department', 'status', 'totalAllocation', 'availableHours'];
  downloadCSV(resources, 'resources', headers);
};

/**
 * Export sprints to CSV
 */
export const exportSprints = (sprints) => {
  const headers = ['name', 'sprintNumber', 'startDate', 'endDate', 'status', 'goal', 'capacity.totalStoryPoints', 'capacity.completedStoryPoints', 'metrics.velocity'];
  downloadCSV(sprints, 'sprints', headers);
};

