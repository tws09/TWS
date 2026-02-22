/**
 * Gantt Chart Component
 * Main container for Gantt chart visualization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import GanttChartHeader from './GanttChartHeader';
import GanttTimeline from './GanttTimeline';
import GanttTaskRow from './GanttTaskRow';
import GanttDependencyLine from './GanttDependencyLine';
import GanttLegend from './GanttLegend';
import tenantProjectApiService from '../../services/tenantProjectApiService';
import { handleApiError } from '../../utils/errorHandler';

const GanttChart = ({ projectId: propProjectId }) => {
  const { tenantSlug, projectId: routeProjectId } = useParams();
  const projectId = propProjectId || routeProjectId;
  
  const [tasks, setTasks] = useState([]);
  const [criticalPath, setCriticalPath] = useState([]);
  const [settings, setSettings] = useState({
    showCriticalPath: true,
    showMilestones: true,
    showProgressIndicator: true,
    showDependencies: true,
    showResourceAllocation: false,
    viewType: 'weekly',
    zoomLevel: 1
  });
  const [filters, setFilters] = useState({
    category: 'all',
    sprint: 'all',
    assignee: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  const ganttContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Calculate date range from tasks
  useEffect(() => {
    if (tasks.length > 0) {
      const dates = tasks
        .map(task => [
          task.startDate ? new Date(task.startDate) : null,
          task.endDate || task.dueDate ? new Date(task.endDate || task.dueDate) : null
        ])
        .flat()
        .filter(Boolean);
      
      if (dates.length > 0) {
        const start = new Date(Math.min(...dates));
        const end = new Date(Math.max(...dates));
        // Add padding
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);
        setDateRange({ start, end });
      }
    }
  }, [tasks]);

  // Generate comprehensive sample data for software house projects (DEPRECATED - no longer used)
  const generateSampleData_DEPRECATED = () => {
    const today = new Date();
    const sampleTasks = [
      // Phase 1: Planning & Requirements
      {
        _id: 'sample-1',
        title: 'Project Kickoff & Requirements Gathering',
        startDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        status: 'completed',
        priority: 'high',
        progress: 100,
        assignee: { name: 'Project Manager', email: 'pm@example.com' },
        category: 'planning',
        estimatedHours: 40,
        actualHours: 38,
        dependencies: { predecessors: [], successors: [{ taskId: 'sample-2', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-2',
        title: 'Technical Architecture Design',
        startDate: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        priority: 'critical',
        progress: 100,
        assignee: { name: 'Tech Lead', email: 'techlead@example.com' },
        category: 'design',
        estimatedHours: 32,
        actualHours: 30,
        dependencies: { predecessors: [{ taskId: 'sample-1', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-3', dependencyType: 'finish-to-start', lagTime: 0 }, { taskId: 'sample-4', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-3',
        title: 'UI/UX Design & Wireframes',
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'high',
        progress: 75,
        assignee: { name: 'UI/UX Designer', email: 'designer@example.com' },
        category: 'design',
        estimatedHours: 60,
        actualHours: 45,
        dependencies: { predecessors: [{ taskId: 'sample-2', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-5', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-4',
        title: 'Database Schema Design',
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'high',
        progress: 80,
        assignee: { name: 'Backend Developer', email: 'backend@example.com' },
        category: 'backend',
        estimatedHours: 24,
        actualHours: 19,
        dependencies: { predecessors: [{ taskId: 'sample-2', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-6', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      // Phase 2: Development
      {
        _id: 'sample-5',
        title: 'Frontend Development - Sprint 1',
        startDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'critical',
        progress: 35,
        assignee: { name: 'Frontend Developer 1', email: 'frontend1@example.com' },
        category: 'frontend',
        estimatedHours: 80,
        actualHours: 28,
        sprint: 'Sprint 1',
        dependencies: { predecessors: [{ taskId: 'sample-3', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-7', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-6',
        title: 'Backend API Development - Sprint 1',
        startDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'critical',
        progress: 45,
        assignee: { name: 'Backend Developer', email: 'backend@example.com' },
        category: 'backend',
        estimatedHours: 100,
        actualHours: 45,
        sprint: 'Sprint 1',
        dependencies: { predecessors: [{ taskId: 'sample-4', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-8', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-7',
        title: 'Frontend Development - Sprint 2',
        startDate: new Date(today.getTime() + 23 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 37 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 37 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'critical',
        progress: 0,
        assignee: { name: 'Frontend Developer 2', email: 'frontend2@example.com' },
        category: 'frontend',
        estimatedHours: 80,
        actualHours: 0,
        sprint: 'Sprint 2',
        dependencies: { predecessors: [{ taskId: 'sample-5', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-10', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-8',
        title: 'Backend API Development - Sprint 2',
        startDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 33 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 33 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'critical',
        progress: 0,
        assignee: { name: 'Backend Developer', email: 'backend@example.com' },
        category: 'backend',
        estimatedHours: 100,
        actualHours: 0,
        sprint: 'Sprint 2',
        dependencies: { predecessors: [{ taskId: 'sample-6', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-11', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-9',
        title: 'Third-Party Integrations',
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'high',
        progress: 25,
        assignee: { name: 'Integration Specialist', email: 'integration@example.com' },
        category: 'integration',
        estimatedHours: 56,
        actualHours: 14,
        dependencies: { predecessors: [{ taskId: 'sample-6', dependencyType: 'start-to-start', lagTime: 5 }], successors: [{ taskId: 'sample-11', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      // Phase 3: Testing
      {
        _id: 'sample-10',
        title: 'Frontend Unit & Integration Testing',
        startDate: new Date(today.getTime() + 38 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'high',
        progress: 0,
        assignee: { name: 'QA Engineer', email: 'qa@example.com' },
        category: 'testing',
        estimatedHours: 40,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-7', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-13', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-11',
        title: 'Backend API Testing',
        startDate: new Date(today.getTime() + 34 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 41 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 41 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'high',
        progress: 0,
        assignee: { name: 'QA Engineer', email: 'qa@example.com' },
        category: 'testing',
        estimatedHours: 32,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-8', dependencyType: 'finish-to-start', lagTime: 0 }, { taskId: 'sample-9', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-13', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-12',
        title: 'End-to-End Testing',
        startDate: new Date(today.getTime() + 46 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 53 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 53 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'critical',
        progress: 0,
        assignee: { name: 'QA Lead', email: 'qalead@example.com' },
        category: 'testing',
        estimatedHours: 48,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-10', dependencyType: 'finish-to-start', lagTime: 0 }, { taskId: 'sample-11', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-14', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      // Phase 4: Deployment & Documentation
      {
        _id: 'sample-13',
        title: 'Performance Optimization',
        startDate: new Date(today.getTime() + 42 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 49 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 49 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'medium',
        progress: 0,
        assignee: { name: 'DevOps Engineer', email: 'devops@example.com' },
        category: 'optimization',
        estimatedHours: 24,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-10', dependencyType: 'finish-to-start', lagTime: 0 }, { taskId: 'sample-11', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [] }
      },
      {
        _id: 'sample-14',
        title: 'Staging Environment Deployment',
        startDate: new Date(today.getTime() + 54 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 56 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 56 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'critical',
        progress: 0,
        assignee: { name: 'DevOps Engineer', email: 'devops@example.com' },
        category: 'deployment',
        estimatedHours: 16,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-12', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [{ taskId: 'sample-15', dependencyType: 'finish-to-start', lagTime: 2 }] }
      },
      {
        _id: 'sample-15',
        title: 'User Acceptance Testing (UAT)',
        startDate: new Date(today.getTime() + 59 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 66 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 66 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'high',
        progress: 0,
        assignee: { name: 'Client Representative', email: 'client@example.com' },
        category: 'testing',
        estimatedHours: 40,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-14', dependencyType: 'finish-to-start', lagTime: 2 }], successors: [{ taskId: 'sample-16', dependencyType: 'finish-to-start', lagTime: 0 }] }
      },
      {
        _id: 'sample-16',
        title: 'Production Deployment',
        startDate: new Date(today.getTime() + 67 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 69 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 69 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'critical',
        progress: 0,
        assignee: { name: 'DevOps Engineer', email: 'devops@example.com' },
        category: 'deployment',
        estimatedHours: 16,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-15', dependencyType: 'finish-to-start', lagTime: 0 }], successors: [] }
      },
      {
        _id: 'sample-17',
        title: 'Technical Documentation',
        startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'medium',
        progress: 50,
        assignee: { name: 'Technical Writer', email: 'writer@example.com' },
        category: 'documentation',
        estimatedHours: 64,
        actualHours: 32,
        dependencies: { predecessors: [], successors: [] }
      },
      {
        _id: 'sample-18',
        title: 'User Manual & Training Materials',
        startDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000),
        status: 'todo',
        priority: 'medium',
        progress: 0,
        assignee: { name: 'Technical Writer', email: 'writer@example.com' },
        category: 'documentation',
        estimatedHours: 40,
        actualHours: 0,
        dependencies: { predecessors: [{ taskId: 'sample-17', dependencyType: 'start-to-start', lagTime: 30 }], successors: [] }
      }
    ];
    return sampleTasks;
  };

  // Fetch Gantt data
  useEffect(() => {
    if (!projectId || !tenantSlug) {
      // If no projectId, show empty state (no demo data)
      setTasks([]);
      setCriticalPath([]);
      setLoading(false);
      return;
    }

    const fetchGanttData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await tenantProjectApiService.getGanttTimeline(tenantSlug, projectId);
        
        if (response.success && response.data) {
          const fetchedTasks = response.data.tasks || [];
          setTasks(fetchedTasks);
          setCriticalPath(response.data.criticalPath || []);
          if (response.data.settings) {
            setSettings(prev => ({ ...prev, ...response.data.settings }));
          }
        } else {
          // No data available
          setTasks([]);
          setCriticalPath([]);
        }
      } catch (err) {
        console.error('Error fetching Gantt data:', err);
        handleApiError(err, 'Failed to load Gantt chart data');
        setError('Failed to load Gantt chart data');
        setTasks([]);
        setCriticalPath([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGanttData();
  }, [projectId, tenantSlug]);

  // Handle view type change
  const handleViewTypeChange = useCallback((viewType) => {
    setSettings(prev => ({ ...prev, viewType }));
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((zoomLevel) => {
    setSettings(prev => ({ ...prev, zoomLevel }));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Filter tasks based on current filters
  const filteredTasks = React.useMemo(() => {
    let filtered = tasks;
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category);
    }
    
    if (filters.sprint && filters.sprint !== 'all') {
      filtered = filtered.filter(task => task.sprint === filters.sprint);
    }
    
    if (filters.assignee && filters.assignee !== 'all') {
      filtered = filtered.filter(task => 
        task.assignee?.email === filters.assignee || 
        task.assignee?.name === filters.assignee
      );
    }
    
    return filtered;
  }, [tasks, filters]);

  // Handle task reschedule
  const handleTaskReschedule = useCallback(async (taskId, newStartDate, newEndDate, autoAdjust = false) => {
    try {
      await tenantProjectApiService.rescheduleTask(tenantSlug, taskId, {
        startDate: newStartDate,
        endDate: newEndDate,
        autoAdjustDependents: autoAdjust
      });
      
      // Refresh data
      const response = await tenantProjectApiService.getGanttTimeline(tenantSlug, projectId);
      if (response.success && response.data) {
        setTasks(response.data.tasks || []);
        setCriticalPath(response.data.criticalPath || []);
      }
    } catch (err) {
      handleApiError(err, 'Failed to reschedule task');
      throw err;
    }
  }, [tenantSlug, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading Gantt chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks found for this project</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add tasks with start and end dates to see them on the Gantt chart
          </p>
        </div>
      </div>
    );
  }

  if (!dateRange.start || !dateRange.end) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks with dates available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Tasks need start and end dates to be displayed on the Gantt chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-chart-container h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      <GanttChartHeader
        viewType={settings.viewType}
        zoomLevel={settings.zoomLevel}
        onViewTypeChange={handleViewTypeChange}
        onZoomChange={handleZoomChange}
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="flex-1 overflow-auto" ref={ganttContainerRef}>
        <div className="gantt-content relative">
          <GanttTimeline
            startDate={dateRange.start}
            endDate={dateRange.end}
            viewType={settings.viewType}
            zoomLevel={settings.zoomLevel}
          />
          
          <div className="gantt-tasks-container relative">
            {filteredTasks.map((task, index) => (
              <GanttTaskRow
                key={task._id}
                task={task}
                index={index}
                startDate={dateRange.start}
                endDate={dateRange.end}
                viewType={settings.viewType}
                zoomLevel={settings.zoomLevel}
                isCritical={criticalPath.includes(task._id.toString())}
                showProgress={settings.showProgressIndicator}
                onReschedule={handleTaskReschedule}
              />
            ))}
            
            {/* Render dependency lines */}
            {settings.showDependencies && filteredTasks.map((task, taskIndex) => 
              task.dependencies?.successors?.map((dep, idx) => {
                const targetTask = filteredTasks.find(t => t._id.toString() === dep.taskId?.toString());
                const targetIndex = filteredTasks.findIndex(t => t._id.toString() === dep.taskId?.toString());
                if (!targetTask) return null;
                
                return (
                  <GanttDependencyLine
                    key={`${task._id}-${dep.taskId}-${idx}`}
                    sourceTask={task}
                    sourceRowIndex={taskIndex}
                    targetTask={targetTask}
                    targetRowIndex={targetIndex}
                    dependencyType={dep.dependencyType}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    viewType={settings.viewType}
                    zoomLevel={settings.zoomLevel}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
      
      <GanttLegend settings={settings} />
    </div>
  );
};

export default GanttChart;
