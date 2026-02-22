/**
 * Project Management Permissions Configuration
 * 
 * Defines role-based permissions for the Software House tenant's Project Management module.
 * This extends the base permissions system with granular project management controls.
 */

const PROJECT_MANAGEMENT_PERMISSIONS = {
  super_admin: {
    // All permissions (wildcard)
    '*': true
  },
  
  project_manager: {
    // Projects
    'projects:create': true,
    'projects:view': true,
    'projects:edit': true,
    'projects:delete': true,
    'projects:archive': true,
    'projects:restore': true,
    'projects:assign_team': true,
    'projects:view_financials': true,
    'projects:view_analytics': true,
    
    // Deliverables
    'deliverables:create': true,
    'deliverables:view': true,
    'deliverables:edit': true,
    'deliverables:delete': true,
    'deliverables:update_status': true,
    'deliverables:ship': true,
    'deliverables:view_tasks': true,
    
    // Tasks
    'tasks:create': true,
    'tasks:view': true,
    'tasks:edit': true,
    'tasks:delete': true,
    'tasks:assign': true,
    'tasks:update_status': true,
    'tasks:link_to_deliverable': true,
    
    // Approvals
    'approvals:create_chain': true,
    'approvals:view': true,
    'approvals:approve': true,
    'approvals:reject': true,
    
    // Change Requests
    'change_requests:view': true,
    'change_requests:evaluate': true,
    
    // Analytics
    'analytics:view_workspace': true,
    'analytics:view_project': true,
    'analytics:view_deliverables': true,
    'analytics:export_reports': true,
    
    // Batch Operations
    'batch:update_status': true,
    'batch:assign_tasks': true
  },
  
  team_lead: {
    // Projects (assigned only)
    'projects:view': 'assigned',
    'projects:assign_team': 'assigned',
    'projects:view_analytics': 'assigned',
    
    // Deliverables (assigned only)
    'deliverables:view': 'assigned',
    'deliverables:view_tasks': 'assigned',
    
    // Tasks (assigned projects)
    'tasks:create': 'assigned',
    'tasks:view': 'assigned',
    'tasks:edit': 'assigned',
    'tasks:delete': 'assigned',
    'tasks:assign': 'assigned',
    'tasks:update_status': 'assigned',
    'tasks:link_to_deliverable': 'assigned',
    
    // Approvals (if designated approver)
    'approvals:view': 'assigned',
    'approvals:approve': 'designated', // Only if user is approver for step
    'approvals:reject': 'designated'
  },
  
  developer: {
    // Projects (assigned only)
    'projects:view': 'assigned',
    
    // Deliverables (assigned only)
    'deliverables:view': 'assigned',
    'deliverables:view_tasks': 'assigned',
    
    // Tasks (assigned only)
    'tasks:create': 'assigned',
    'tasks:view': 'assigned',
    'tasks:edit': 'assigned',
    'tasks:update_status': 'assigned'
  },
  
  qa_tester: {
    // Projects (assigned only)
    'projects:view': 'assigned',
    
    // Deliverables (assigned only)
    'deliverables:view': 'assigned',
    'deliverables:view_tasks': 'assigned',
    
    // Tasks (assigned only)
    'tasks:create': 'assigned',
    'tasks:view': 'assigned',
    'tasks:edit': 'assigned',
    'tasks:update_status': 'assigned',
    
    // Approvals (if designated QA Lead)
    'approvals:view': 'assigned',
    'approvals:approve': 'designated',
    'approvals:reject': 'designated'
  },
  
  client: {
    // Deliverables (read-only, assigned projects)
    'deliverables:view': 'assigned',
    
    // Approvals (final client step only)
    'approvals:view': 'assigned',
    'approvals:approve': 'client_step', // Only final client approval step
    
    // Change Requests
    'change_requests:create': true,
    'change_requests:view': 'assigned',
    'change_requests:decide': 'assigned' // Only for own change requests
  }
};

module.exports = PROJECT_MANAGEMENT_PERMISSIONS;

