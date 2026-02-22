import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useTenantAuth } from '../../../../../../app/providers/TenantAuthContext';
import tenantProjectApiService from '../projects/services/tenantProjectApiService';
import CreateTaskModal from '../projects/components/CreateTaskModal';
import { CARD_STATUS } from '../projects/constants/projectConstants';

const MyWork = () => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState({
    todo: [],
    in_progress: [],
    under_review: [],
    completed: []
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    if (tenantSlug && user?.id) {
      fetchMyTasks();
      fetchRecentProjects();
    }
  }, [tenantSlug, user?.id]);

  const fetchMyTasks = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Fetch tasks assigned to current user
      const params = {
        groupBy: 'status',
        assigneeId: user.id // Filter by current user
      };
      
      const data = await tenantProjectApiService.getProjectTasks(tenantSlug, params);
      
      if (data && data.tasks) {
        const tasksByStatus = {
          todo: data.tasks[CARD_STATUS.TODO] || [],
          in_progress: data.tasks[CARD_STATUS.IN_PROGRESS] || [],
          under_review: data.tasks[CARD_STATUS.UNDER_REVIEW] || [],
          completed: data.tasks[CARD_STATUS.COMPLETED] || []
        };
        setMyTasks(tasksByStatus);
        
        // Calculate stats
        const total = Object.values(tasksByStatus).flat().length;
        const completed = tasksByStatus.completed.length;
        const inProgress = tasksByStatus.in_progress.length;
        const overdue = Object.values(tasksByStatus)
          .flat()
          .filter(task => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate) < new Date() && task.status !== CARD_STATUS.COMPLETED;
          }).length;
        
        setStats({
          totalTasks: total,
          completedTasks: completed,
          inProgressTasks: inProgress,
          overdueTasks: overdue
        });
      } else if (Array.isArray(data)) {
        // Handle array response
        const userTasks = data.filter(task => 
          task.assigneeId === user.id || 
          task.assignee?.id === user.id ||
          task.assignee?._id === user.id
        );
        
        const grouped = userTasks.reduce((acc, task) => {
          const status = task.status || CARD_STATUS.TODO;
          if (!acc[status]) acc[status] = [];
          acc[status].push(task);
          return acc;
        }, {});
        
        setMyTasks({
          todo: grouped[CARD_STATUS.TODO] || [],
          in_progress: grouped[CARD_STATUS.IN_PROGRESS] || [],
          under_review: grouped[CARD_STATUS.UNDER_REVIEW] || [],
          completed: grouped[CARD_STATUS.COMPLETED] || []
        });
        
        const total = userTasks.length;
        const completed = grouped[CARD_STATUS.COMPLETED]?.length || 0;
        const inProgress = grouped[CARD_STATUS.IN_PROGRESS]?.length || 0;
        const overdue = userTasks.filter(task => {
          if (!task.dueDate) return false;
          return new Date(task.dueDate) < new Date() && task.status !== CARD_STATUS.COMPLETED;
        }).length;
        
        setStats({ totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, overdueTasks: overdue });
      }
    } catch (err) {
      console.error('Error fetching my tasks:', err);
      setMyTasks({ todo: [], in_progress: [], under_review: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProjects = async () => {
    if (!user?.id) {
      setRecentProjects([]);
      return;
    }
    
    try {
      const data = await tenantProjectApiService.getProjects(tenantSlug);
      const projects = Array.isArray(data) ? data : (data.projects || []);
      // Get projects where user is assigned or involved
      const userProjects = projects.filter(project => 
        project.teamMembers?.some(member => 
          member.userId === user.id || member.user?._id === user.id || member.user?.id === user.id
        ) || project.createdBy === user.id
      ).slice(0, 5);
      setRecentProjects(userProjects);
    } catch (err) {
      console.error('Error fetching recent projects:', err);
      setRecentProjects([]);
    }
  };

  const handleTaskCreated = () => {
    setIsCreateTaskModalOpen(false);
    fetchMyTasks();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      [CARD_STATUS.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      [CARD_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      [CARD_STATUS.UNDER_REVIEW]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      [CARD_STATUS.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[status] || colors[CARD_STATUS.TODO];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your work...</p>
        </div>
      </div>
    );
  }

  const allMyTasks = [...myTasks.todo, ...myTasks.in_progress, ...myTasks.under_review, ...myTasks.completed];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            My Work
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Your tasks, time, and work overview
          </p>
        </div>
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Add Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-premium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="glass-card-premium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Tasks</h2>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/projects/tasks?assigneeId=${user?.id || ''}`)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            {allMyTasks.length > 0 ? (
              <div className="space-y-3">
                {allMyTasks.slice(0, 8).map((task) => (
                  <div
                    key={task._id || task.id}
                    className="glass-card p-4 hover-glow cursor-pointer"
                    onClick={() => navigate(`/${tenantSlug}/org/projects/tasks?taskId=${task._id || task.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {task.title || task.name}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status?.replace('_', ' ') || 'Todo'}
                          </span>
                          {task.priority && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.project?.name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-3">No tasks assigned to you</p>
                <button
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Add Your First Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Links */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/${tenantSlug}/org/software-house/time-tracking`)}
                className="w-full glass-card p-4 hover-glow text-left flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Log Time</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Track your work hours</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate(`/${tenantSlug}/org/software-house/hr/leave-requests`)}
                className="w-full glass-card p-4 hover-glow text-left flex items-center gap-3"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Request Leave</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Submit leave request</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate(`/${tenantSlug}/org/software-house/hr/attendance`)}
                className="w-full glass-card p-4 hover-glow text-left flex items-center gap-3"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Attendance</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Check in/out</p>
                </div>
              </button>
            </div>
          </div>

          {/* My Links */}
          <div className="glass-card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Links</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/${tenantSlug}/org/software-house/hr/leave-requests`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Leave Requests
              </button>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/software-house/hr/payroll`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Payroll
              </button>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/finance/time-expenses`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Expenses
              </button>
              <button
                onClick={() => navigate(`/${tenantSlug}/org/profile`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                My Profile
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="glass-card-premium p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Projects</h2>
              <div className="space-y-2">
                {recentProjects.map((project) => (
                  <button
                    key={project._id || project.id}
                    onClick={() => navigate(`/${tenantSlug}/org/projects/${project._id || project.id}/board`)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>{project.name || project.title}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateTaskModalOpen && (
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onTaskCreated={handleTaskCreated}
          defaultAssigneeId={user?.id}
        />
      )}
    </div>
  );
};

export default MyWork;
