import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  FlagIcon,
  TagIcon,
  Bars3Icon,
  Squares2X2Icon,
  TableCellsIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { taskService } from '../../../services/taskService';
import { useAuth } from '../../../context/AuthContext';

const TaskBoard = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isAddingTask, setIsAddingTask] = useState(null); // column id or null
  const [draggedTask, setDraggedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    labels: []
  });

  // Real data from API
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    under_review: [],
    completed: []
  });

  // Load tasks and projects on component mount
  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [searchTerm, filterProject, filterPriority]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterProject !== 'all') params.projectId = filterProject;
      if (filterPriority !== 'all') params.priority = filterPriority;
      
      const response = await taskService.getKanbanTasks(params);
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // This would typically come from a project service
      // For now, we'll use a simple mock
      setProjects([
        { _id: '1', name: 'E-Commerce Platform' },
        { _id: '2', name: 'Mobile Banking App' },
        { _id: '3', name: 'CRM System' }
      ]);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'from-gray-500 to-gray-600', count: tasks.todo.length },
    { id: 'in_progress', title: 'In Progress', color: 'from-blue-500 to-indigo-600', count: tasks.in_progress.length },
    { id: 'under_review', title: 'Under Review', color: 'from-yellow-500 to-orange-600', count: tasks.under_review.length },
    { id: 'completed', title: 'Completed', color: 'from-green-500 to-emerald-600', count: tasks.completed.length }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
    }
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask({ task, sourceColumn: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
      // Update task status via API
      await taskService.updateTaskStatus(task._id, targetColumnId);
      
      // Update local state optimistically
      setTasks(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(t => t._id !== task._id),
        [targetColumnId]: [...prev[targetColumnId], { ...task, status: targetColumnId }]
      }));

      setDraggedTask(null);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
      // Reload tasks to get the correct state
      loadTasks();
    }
  };

  const totalTasks = Object.values(tasks).reduce((acc, col) => acc + col.length, 0);

  // Task form handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...taskForm,
        status: isAddingTask || 'todo'
      };
      
      const response = await taskService.createTask(taskData);
      if (response.success) {
        setShowTaskForm(false);
        setTaskForm({
          title: '',
          description: '',
          projectId: '',
          assignee: '',
          priority: 'medium',
          dueDate: '',
          labels: []
        });
        setIsAddingTask(null);
        loadTasks(); // Reload tasks
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId?._id || '',
      assignee: task.assignee?._id || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      labels: task.labels || []
    });
    setShowTaskForm(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await taskService.updateTask(editingTask._id, taskForm);
      if (response.success) {
        setShowTaskForm(false);
        setEditingTask(null);
        setTaskForm({
          title: '',
          description: '',
          projectId: '',
          assignee: '',
          priority: 'medium',
          dueDate: '',
          labels: []
        });
        loadTasks(); // Reload tasks
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await taskService.deleteTask(taskId);
        if (response.success) {
          loadTasks(); // Reload tasks
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  const openTaskForm = (columnId) => {
    setIsAddingTask(columnId);
    setTaskForm({
      title: '',
      description: '',
      projectId: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      labels: []
    });
    setShowTaskForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4">
          <div className="glass-card-premium px-4 py-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
          </div>
          <div className="glass-card-premium px-4 py-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{tasks.in_progress.length}</p>
          </div>
          <div className="glass-card-premium px-4 py-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">{tasks.completed.length}</p>
          </div>
        </div>

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
          <button
            onClick={() => setViewMode('calendar')}
            className={`glass-button px-4 py-2 rounded-xl hover-scale ${
              viewMode === 'calendar' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-premium p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input"
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

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
                    {column.count}
                  </span>
                </div>
                <button
                  onClick={() => openTaskForm(column.id)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  type="button"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {/* Tasks Container */}
              <div
                className="flex-1 space-y-3 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {tasks[column.id]
                  .filter(task => {
                    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesProject = filterProject === 'all' || task.projectId?._id === filterProject;
                    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
                    return matchesSearch && matchesProject && matchesPriority;
                  })
                  .map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                      className="glass-card-premium p-4 hover-glow cursor-move group"
                    >
                      {/* Priority Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <FlagIcon className={`w-4 h-4 ${
                          task.priority === 'critical' ? 'text-red-600' :
                          task.priority === 'high' ? 'text-orange-600' :
                          task.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                      </div>

                      {/* Task Title */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex-1">
                          {task.title}
                        </h4>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <PencilIcon className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                          >
                            <TrashIcon className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Project */}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        📁 {task.projectId?.name || 'No Project'}
                      </p>

                      {/* Labels */}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                {task.assignee.fullName?.charAt(0) || 'U'}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {task.assignee.fullName}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              Unassigned
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          📎 {task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
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
              columnTasks
                .filter(task => {
                  const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesProject = filterProject === 'all' || task.projectId?._id === filterProject;
                  const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
                  return matchesSearch && matchesProject && matchesPriority;
                })
                .map((task) => (
                  <div key={task._id} className="glass-card p-4 hover-glow flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{task.project}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {task.assignee.avatar}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">{task.dueDate}</span>
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
          </div>
        </div>
      )}

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <div className="glass-card-premium p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Calendar View
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Calendar view with task scheduling coming soon
          </p>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card-premium p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full glass-input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({...taskForm, projectId: e.target.value})}
                  className="w-full glass-input"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full glass-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full glass-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 glass-button bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-2 px-4 rounded-xl hover-scale"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                    setIsAddingTask(null);
                  }}
                  className="flex-1 glass-button text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-xl hover-scale"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card-premium p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
