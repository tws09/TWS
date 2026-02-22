import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  CalendarIcon,
  FlagIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  PlayIcon,
  StopIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import tenantProjectApiService from './services/tenantProjectApiService';
import { CARD_TYPE, CARD_STATUS, PROJECT_PRIORITY, PRIORITY_COLORS } from './constants/projectConstants';
import CreateTaskModal from './components/CreateTaskModal';
import QuickAddTask from './components/QuickAddTask';
import { showSuccess, showError } from './utils/toastNotifications';
import { PROJECT_WORKSPACE_EVENTS } from '../../../../components/ProjectWorkspaceLayout';

const ProjectTasks = ({ scopeProjectId = null, defaultView = 'kanban', hideScopedHeader = false }) => {
  const { tenantSlug } = useParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState(defaultView); // 'kanban', 'list', 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState(scopeProjectId || 'all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    under_review: [],
    completed: []
  });
  const [projects, setProjects] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedColumnForTask, setSelectedColumnForTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [orgUsers, setOrgUsers] = useState([]);
  const [timerTaskId, setTimerTaskId] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [, setTimerTick] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!timerTaskId || !timerStartedAt) return;
    const interval = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerTaskId, timerStartedAt]);

  const fetchDepartments = async () => {
    try {
      // SECURITY FIX: Use credentials: 'include' to send HttpOnly cookies
      const response = await fetch(`/api/tenant/${tenantSlug}/departments`, {
        method: 'GET',
        credentials: 'include', // SECURITY FIX: Include cookies (HttpOnly tokens)
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDepartments(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    if (tenantSlug) {
      fetchTasks();
      fetchProjects();
      fetchDepartments();
    }
  }, [tenantSlug]);

  // When scopeProjectId is set, keep filter locked to that project
  useEffect(() => {
    if (scopeProjectId) setFilterProject(scopeProjectId);
  }, [scopeProjectId]);

  // Listen for global "Add task" event from header and URL params
  useEffect(() => {
    const handleOpenCreateTask = () => {
      setIsCreateTaskModalOpen(true);
    };
    
    window.addEventListener('openCreateTaskModal', handleOpenCreateTask);
    return () => {
      window.removeEventListener('openCreateTaskModal', handleOpenCreateTask);
    };
  }, []);

  // Check URL params for create action
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('create') === 'task') {
      setIsCreateTaskModalOpen(true);
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, location.pathname]);

  // Header Search / Filter events (from ProjectWorkspaceLayout)
  useEffect(() => {
    const onFocusSearch = () => searchInputRef.current?.focus();
    const onToggleFilter = () => setFilterPanelOpen((v) => !v);
    window.addEventListener(PROJECT_WORKSPACE_EVENTS.FOCUS_SEARCH, onFocusSearch);
    window.addEventListener(PROJECT_WORKSPACE_EVENTS.TOGGLE_FILTER, onToggleFilter);
    return () => {
      window.removeEventListener(PROJECT_WORKSPACE_EVENTS.FOCUS_SEARCH, onFocusSearch);
      window.removeEventListener(PROJECT_WORKSPACE_EVENTS.TOGGLE_FILTER, onToggleFilter);
    };
  }, []);

  // Fetch org users (and fallback to project resources) for assignee dropdown when in project scope
  useEffect(() => {
    if (!tenantSlug || !scopeProjectId) return;
    let cancelled = false;
    const setUsers = (list) => {
      if (cancelled) return;
      setOrgUsers(Array.isArray(list) ? list : []);
    };
    tenantProjectApiService.getUsers(tenantSlug, { limit: 100 })
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.users || data?.data || data?.list || []);
        const list = Array.isArray(raw) ? raw : [];
        if (list.length > 0) {
          setUsers(list);
          return;
        }
        // Fallback: use org resources as assignable users (userId populated)
        return tenantProjectApiService.getProjectResources(tenantSlug).then((res) => {
          const resources = res?.resources ?? res?.data?.resources ?? (Array.isArray(res) ? res : []);
          const seen = new Set();
          const fromResources = (resources || [])
            .map((r) => r.userId)
            .filter(Boolean)
            .filter((u) => {
              const id = u._id || u.id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            })
            .map((u) => ({ ...u, name: u.name || u.fullName }));
          setUsers(fromResources.length ? fromResources : list);
        });
      })
      .catch(() => {
        tenantProjectApiService.getProjectResources(tenantSlug).then((res) => {
          const resources = res?.resources ?? res?.data?.resources ?? (Array.isArray(res) ? res : []);
          const seen = new Set();
          const fromResources = (resources || [])
            .map((r) => r.userId)
            .filter(Boolean)
            .filter((u) => {
              const id = u._id || u.id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            })
            .map((u) => ({ ...u, name: u.name || u.fullName }));
          setUsers(fromResources);
        }).catch(() => setUsers([]));
      });
    return () => { cancelled = true; };
  }, [tenantSlug, scopeProjectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { groupBy: 'status' };
      if (scopeProjectId || filterProject !== 'all') {
        params.projectId = scopeProjectId || filterProject;
      }
      
      // Add department filter to API call
      if (filterDepartment !== 'all') {
        params.departmentId = filterDepartment;
      }
      
      const data = await tenantProjectApiService.getProjectTasks(tenantSlug, params);
      
      if (data && data.tasks) {
        // Backend returns data.tasks with keys: todo, in_progress, under_review, completed
        const tasksByStatus = {
          todo: data.tasks[CARD_STATUS.TODO] || data.tasks.todo || [],
          in_progress: data.tasks[CARD_STATUS.IN_PROGRESS] || data.tasks.in_progress || [],
          under_review: data.tasks[CARD_STATUS.UNDER_REVIEW] || data.tasks.under_review || [],
          completed: data.tasks[CARD_STATUS.COMPLETED] || data.tasks.completed || []
        };
        setTasks(tasksByStatus);
      } else if (data && data.grouped) {
        // Legacy: backend may return data.grouped with hyphenated keys
        const g = data.grouped;
        setTasks({
          todo: g.todo || g['to-do'] || [],
          in_progress: g.in_progress || g['in-progress'] || [],
          under_review: g.under_review || g['under-review'] || [],
          completed: g.completed || []
        });
      } else if (Array.isArray(data)) {
        // If tasks come as array, group them
        const grouped = data.reduce((acc, task) => {
          const status = task.status || CARD_STATUS.TODO;
          if (!acc[status]) acc[status] = [];
          acc[status].push(task);
          return acc;
        }, {});
        setTasks({
          todo: grouped[CARD_STATUS.TODO] || [],
          in_progress: grouped[CARD_STATUS.IN_PROGRESS] || [],
          under_review: grouped[CARD_STATUS.UNDER_REVIEW] || [],
          completed: grouped[CARD_STATUS.COMPLETED] || []
        });
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks({ todo: [], in_progress: [], under_review: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await tenantProjectApiService.getProjects(tenantSlug);
      setProjects(Array.isArray(data) ? data : (data.projects || []));
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Card type display mapping
  const getCardTypeDisplay = (type) => {
    const types = {
      'user_story': 'User Story',
      'epic': 'Epic',
      'bug': 'Bug',
      'feature': 'Feature',
      'technical_task': 'Technical Task',
      'code_review': 'Code Review',
      'story': 'Story',
      'task': 'Task',
      'improvement': 'Improvement',
      'custom': 'Custom'
    };
    return types[type] || 'Task';
  };

  const getCardTypeIcon = (type) => {
    const icons = {
      'user_story': '👤',
      'epic': '🎯',
      'bug': '🐛',
      'feature': '✨',
      'technical_task': '⚙️',
      'code_review': '👀',
      'story': '📖',
      'task': '📋',
      'improvement': '🔧',
      'custom': '📌'
    };
    return icons[type] || '📋';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = PRIORITY_COLORS[priority];
    if (priorityColors) {
      return `${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`;
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask({ task, sourceColumn: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleQuickAddTask = async (taskData) => {
    try {
      // Require a project when creating a task (backend requires projectId)
      const projectId = scopeProjectId || (filterProject !== 'all' ? filterProject : null);
      if (!projectId) {
        showError('Please select a project to add a task.');
        throw new Error('Project ID is required');
      }

      // Get departmentId - try from project first, then use filter, then first available
      let departmentId = taskData.departmentId;
      
      if (!departmentId && projectId) {
        try {
          const project = await tenantProjectApiService.getProject(tenantSlug, projectId);
          const firstDept = project?.departments?.[0];
          departmentId = project?.primaryDepartmentId
            || (firstDept && (typeof firstDept === 'object' ? (firstDept._id || firstDept.id) : firstDept));
        } catch (err) {
          console.error('Error fetching project for department:', err);
        }
      }
      
      // Use department filter if available
      if (!departmentId && filterDepartment !== 'all') {
        departmentId = filterDepartment;
      }
      
      // Fallback to first available department
      if (!departmentId && departments.length > 0) {
        departmentId = departments[0]._id || departments[0].id;
      }
      
      if (!departmentId) {
        showError('Please select a department or project with a department to create a task.');
        throw new Error('Department ID is required');
      }
      
      // API expects priority: low | medium | high | critical (map 'urgent' -> 'critical')
      const priority = (taskData.priority === 'urgent') ? 'critical' : (taskData.priority || PROJECT_PRIORITY.MEDIUM);
      const fullTaskData = {
        ...taskData,
        projectId,
        departmentId,
        priority,
        type: CARD_TYPE.TASK
      };
      
      await tenantProjectApiService.createTask(tenantSlug, fullTaskData);
      showSuccess('Task created successfully!');
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      if (error?.message?.includes('Department ID is required')) {
        showError(error.message);
      } else {
        const msg = error?.data?.message || error?.data?.error || error?.message || 'Failed to create task. Please try again.';
        showError(msg);
      }
      throw error;
    }
  };

  const handleAssigneeChange = async (task, assigneeId) => {
    const id = task._id || task.id;
    if (!id) return;
    try {
      await tenantProjectApiService.updateTask(tenantSlug, id, { assigneeId: assigneeId || undefined });
      showSuccess('Assignee updated');
      fetchTasks();
    } catch (err) {
      showError(err?.message || 'Failed to update assignee');
    }
  };

  const handleTimerStart = (task) => {
    setTimerTaskId(task._id || task.id);
    setTimerStartedAt(Date.now());
  };
  const handleTimerStop = async (task) => {
    if (!timerStartedAt) return;
    const elapsedHours = (Date.now() - timerStartedAt) / (1000 * 60 * 60);
    setTimerTaskId(null);
    setTimerStartedAt(null);
    const projectId = task.projectId?._id || task.projectId?.id || task.projectId || scopeProjectId;
    const taskId = task._id || task.id;
    try {
      const tenantData = JSON.parse(localStorage.getItem('tenantData') || '{}');
      const memberId = tenantData?.user?._id || tenantData?.user?.id;
      if (!memberId) {
        showError('Could not determine current user for time log. Please log in again.');
        return;
      }
      await tenantProjectApiService.submitTimesheet(tenantSlug, {
        date: new Date().toISOString().slice(0, 10),
        projectId: projectId || undefined,
        taskId: taskId || undefined,
        memberId,
        hours: Math.round(elapsedHours * 100) / 100,
        description: `Time on: ${(task.title || task.name || '').slice(0, 50)}`,
        billable: true
      });
      showSuccess(`Logged ${elapsedHours.toFixed(2)}h`);
      fetchTasks();
    } catch (err) {
      showError(err?.message || 'Failed to log time');
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const { task, sourceColumn } = draggedTask;

    if (sourceColumn === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    try {
      // Optimistically update UI
      setTasks(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(t => (t._id || t.id) !== (task._id || task.id)),
        [targetColumnId]: [...prev[targetColumnId], { ...task, status: targetColumnId }]
      }));

      // Update via API
      await tenantProjectApiService.updateTask(tenantSlug, task._id || task.id, {
        status: targetColumnId
      });

      setDraggedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      fetchTasks();
      setDraggedTask(null);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'from-gray-500 to-gray-600', count: tasks.todo.length },
    { id: 'in_progress', title: 'Started', color: 'from-blue-500 to-indigo-600', count: tasks.in_progress.length },
    { id: 'under_review', title: 'Under Review', color: 'from-yellow-500 to-orange-600', count: tasks.under_review.length },
    { id: 'completed', title: 'Done', color: 'from-green-500 to-emerald-600', count: tasks.completed.length }
  ];

  const filteredTasksByColumn = (columnTasks, columnId) => {
    return columnTasks.filter(task => {
      const matchesSearch = (task.title || task.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.projectId?.name || task.project || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || 
                            (task.projectId?._id || task.projectId?.id || task.projectId) === filterProject ||
                            (task.project || '') === filterProject;
      const matchesPriority = filterPriority === 'all' || (task.priority || 'medium') === filterPriority;
      const matchesDepartment = filterDepartment === 'all' || 
                               (task.departmentId?._id || task.departmentId?.id || task.departmentId) === filterDepartment;
      return matchesSearch && matchesProject && matchesPriority && matchesDepartment;
    });
  };
  
  useEffect(() => {
    if (tenantSlug && filterDepartment !== 'all') {
      fetchTasks();
    }
  }, [filterDepartment]);

  const totalTasks = Object.values(tasks).reduce((acc, col) => acc + col.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - hidden when embedded in project workspace */}
      {!hideScopedHeader && (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Project Tasks
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage project tasks and assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSelectedColumnForTask(null);
              setIsCreateTaskModalOpen(true);
            }}
            className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Create Task</span>
          </button>
        </div>
      </div>
      )}

      {/* Controls: view mode only (stats shown on project dashboard only) */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`glass-button px-4 py-2 rounded-xl hover-scale ${
              viewMode === 'kanban' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`glass-button px-4 py-2 rounded-xl hover-scale ${
              viewMode === 'list' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters - hide project selector when scoped to one project; toggled by header Filter button */}
      {filterPanelOpen && (
      <div className="glass-card-premium p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
            />
          </div>
          {!scopeProjectId && (
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id || project.id} value={project._id || project.id}>
                {project.name || project.title}
              </option>
            ))}
          </select>
          )}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl"
          >
            <option value="all">All Priorities</option>
            <option value={PROJECT_PRIORITY.URGENT}>Urgent</option>
            <option value={PROJECT_PRIORITY.HIGH}>High</option>
            <option value={PROJECT_PRIORITY.MEDIUM}>Medium</option>
            <option value={PROJECT_PRIORITY.LOW}>Low</option>
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              {/* Column Header */}
              <div className={`glass-card-premium p-4 mb-4 bg-gradient-to-r ${column.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-sm">{column.title}</h3>
                  <span className="bg-white/30 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {filteredTasksByColumn(tasks[column.id], column.id).length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div
                className="flex-1 space-y-3 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {filteredTasksByColumn(tasks[column.id], column.id).map((task) => {
                  const taskId = task._id || task.id;
                  const isTimerRunning = timerTaskId === taskId;
                  return (
                  <div
                    key={taskId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="glass-card-premium p-4 hover-glow cursor-move group relative"
                  >
                    {/* Card menu: Edit */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit task"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {/* Card Type and Priority */}
                    <div className="flex items-start justify-between mb-2 pr-8">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCardTypeIcon(task.type || task.cardType || 'task')}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {getCardTypeDisplay(task.type || task.cardType || 'task')}
                        </span>
                        {task.storyPoints && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold">
                            {task.storyPoints}pts
                          </span>
                        )}
                      </div>
                      <FlagIcon className={`w-4 h-4 ${
                        task.priority === PROJECT_PRIORITY.URGENT ? 'text-red-600' :
                        task.priority === PROJECT_PRIORITY.HIGH ? 'text-orange-600' :
                        task.priority === PROJECT_PRIORITY.MEDIUM ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    
                    {/* Priority and Department Badges */}
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(task.priority || PROJECT_PRIORITY.MEDIUM)}`}>
                        {(task.priority || PROJECT_PRIORITY.MEDIUM).toUpperCase()}
                      </span>
                      {task.departmentId && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <UserGroupIcon className="w-3 h-3" />
                          {task.departmentId?.name || task.departmentId?.code || 'Dept'}
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                      {task.title || task.name}
                    </h4>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Project */}
                    {(task.projectId?.name || task.project) && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        📁 {task.projectId?.name || task.project}
                      </p>
                    )}

                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.labels.map((label, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                          >
                            {typeof label === 'string' ? label : label.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer: assignee, timer, due date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 min-w-0">
                        {scopeProjectId && orgUsers.length > 0 ? (
                          <select
                            value={String(task.assignee?._id || task.assignee?.id || task.assigneeId || '')}
                            onChange={(e) => handleAssigneeChange(task, e.target.value || null)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2 max-w-[120px]"
                            title="Assign to"
                          >
                            <option value="">Unassigned</option>
                            {orgUsers.map((u) => (
                              <option key={u._id || u.id} value={u._id || u.id}>
                                {(u.fullName || u.name || u.email || 'User').slice(0, 18)}
                              </option>
                            ))}
                          </select>
                        ) : (task.assigneeId || task.assignee) ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                              {(task.assignee?.fullName || task.assignee?.name || task.assigneeId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {task.assignee?.fullName || task.assignee?.name || task.assigneeId?.name || 'Unassigned'}
                            </span>
                          </div>
                        ) : scopeProjectId ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                            title="Assign task"
                          >
                            <UserPlusIcon className="w-3.5 h-3.5" />
                            Assign
                          </button>
                        ) : null}
                        {isTimerRunning ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleTimerStop(task); }}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium"
                            title="Stop timer"
                          >
                            <StopIcon className="w-3.5 h-3.5" />
                            {timerStartedAt ? `${((Date.now() - timerStartedAt) / 60000).toFixed(0)}m` : 'Stop'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleTimerStart(task); }}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                            title="Start timer"
                          >
                            <PlayIcon className="w-3.5 h-3.5" />
                            Time
                          </button>
                        )}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
                {filteredTasksByColumn(tasks[column.id], column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    No tasks
                  </div>
                )}
                
                {/* Quick Add Task - Trello Style */}
                <QuickAddTask
                  columnId={column.id}
                  onAddTask={handleQuickAddTask}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="glass-card-premium p-6">
          <div className="space-y-2">
            {Object.entries(tasks).flatMap(([column, columnTasks]) =>
              filteredTasksByColumn(columnTasks, column).map((task) => (
                <div key={task._id || task.id} className="glass-card p-4 hover-glow flex items-center gap-4">
                  <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(task.priority || PROJECT_PRIORITY.MEDIUM)}`}>
                    {(task.priority || PROJECT_PRIORITY.MEDIUM).toUpperCase()}
                  </span>
                    {task.departmentId && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        <UserGroupIcon className="w-3 h-3" />
                        {task.departmentId?.name || task.departmentId?.code || 'Dept'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{task.title || task.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{task.projectId?.name || task.project || 'No project'}</p>
                  </div>
                  {(task.assigneeId || task.assignee) && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                      {(task.assignee?.name || task.assigneeId?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    column === 'todo' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                    column === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    column === 'under_review' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {columns.find(c => c.id === column)?.title}
                  </span>
                </div>
              ))
            )}
            {totalTasks === 0 && (
              <div className="text-center py-12">
                <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No tasks found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Create your first task to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setSelectedColumnForTask(null);
        }}
        onTaskCreated={() => {
          fetchTasks();
          setIsCreateTaskModalOpen(false);
          setSelectedColumnForTask(null);
        }}
        defaultStatus={selectedColumnForTask || CARD_STATUS.TODO}
        projectId={scopeProjectId || (filterProject !== 'all' ? filterProject : undefined)}
      />
      {/* Edit Task Modal */}
      <CreateTaskModal
        isOpen={!!editingTask}
        initialTask={editingTask}
        onClose={() => setEditingTask(null)}
        onTaskCreated={() => {
          fetchTasks();
          setEditingTask(null);
        }}
        projectId={scopeProjectId || (editingTask?.projectId?._id || editingTask?.projectId?.id || editingTask?.projectId)}
      />
    </div>
  );
};

export default ProjectTasks;
