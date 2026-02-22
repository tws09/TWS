import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CodeBracketIcon,
  BugAntIcon,
  StarIcon,
  RocketLaunchIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  BoltIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import {
  Line,
  Bar,
  Doughnut,
  Pie,
  Radar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { softwareHouseApi } from '../../../shared/services/industry/softwareHouseApi';
import { tenantApiService } from '../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../app/providers/TenantAuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SoftwareHouseDashboard = () => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const { tenant, isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTeamMembers: 0,
    onTrackProjects: 0,
    atRiskProjects: 0,
    delayedProjects: 0,
    totalBudget: 0,
    spentBudget: 0,
    totalHours: 0,
    utilization: 0,
    velocity: 0,
    codeCoverage: 0,
    clientSatisfaction: 0,
    bugCount: 0,
    featuresDelivered: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [activeSprints, setActiveSprints] = useState([]);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedError, setSeedError] = useState(null);
  const [chartData, setChartData] = useState({
    projectStatus: null,
    budgetComparison: null,
    velocityTrend: null,
    teamUtilization: null,
    codeCoverageTrend: null,
    clientSatisfactionTrend: null,
    bugTrend: null,
    featuresDelivered: null,
    sprintBurndown: null,
    techStack: null,
    methodology: null,
    revenueTrend: null,
    timeTracking: null,
    teamPerformance: null
  });

  const fetchDashboardData = useCallback(async () => {
    // SECURITY FIX: Removed localStorage token check - use isAuthenticated from context
    if (!tenantSlug || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);

      // Fetch dashboard data from API
      const dashboardResponse = await softwareHouseApi.getDashboard(tenantSlug).catch((err) => {
        // If 401 or token error, return null response
        if (err.response?.status === 401 || err.message?.includes('token')) {
          return { data: null, status: 401 };
        }
        return { data: { success: false, data: {} } };
      });

      // Handle null/unauthorized response
      if (!dashboardResponse || dashboardResponse.status === 401 || dashboardResponse.data === null) {
        // Set empty metrics if unauthorized
        setMetrics({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalTeamMembers: 0,
          onTrackProjects: 0,
          atRiskProjects: 0,
          delayedProjects: 0,
          totalBudget: 0,
          spentBudget: 0,
          totalHours: 0,
          utilization: 0,
          velocity: 0,
          codeCoverage: 0,
          clientSatisfaction: 0,
          bugCount: 0,
          featuresDelivered: 0
        });
        setRecentProjects([]);
        setActiveSprints([]);
        return;
      }

      if (dashboardResponse.data?.success) {
        const dashboardData = dashboardResponse.data.data;

        // Extract metrics from nested structure
        const projectMetrics = dashboardData.metrics?.projects || {};
        const sprintMetrics = dashboardData.metrics?.sprints || {};
        const devMetrics = dashboardData.metrics?.development || {};
        const teamMetrics = dashboardData.metrics?.team || {};

        // Process projects
        const projects = dashboardData.recentProjects || [];
        const activeProjects = projects.filter(p => p.status === 'active');

        // Calculate project health based on progress
        let onTrack = 0, atRisk = 0, delayed = 0;
        activeProjects.forEach(project => {
          // Calculate progress from timeline
          const progress = project.timeline?.estimatedHours > 0
            ? ((project.timeline?.actualHours || 0) / project.timeline.estimatedHours) * 100
            : 50; // Default if no data

          if (progress >= 75) onTrack++;
          else if (progress >= 50) atRisk++;
          else delayed++;
        });

        // Format projects for display
        const formattedProjects = activeProjects.slice(0, 5).map(project => ({
          id: project._id,
          name: project.name,
          client: project.clientId?.name || 'No Client',
          status: (() => {
            const progress = project.timeline?.estimatedHours > 0
              ? ((project.timeline?.actualHours || 0) / project.timeline.estimatedHours) * 100
              : 50;
            if (progress >= 75) return 'on_track';
            if (progress >= 50) return 'at_risk';
            return 'delayed';
          })(),
          progress: project.timeline?.estimatedHours > 0
            ? Math.min(((project.timeline?.actualHours || 0) / project.timeline.estimatedHours) * 100, 100)
            : 0,
          deadline: project.timeline?.endDate || project.endDate || new Date(),
          team: project.team?.members?.length || project.team?.length || 0,
          projectType: project.projectType || 'general',
          methodology: project.methodology || 'agile',
          budget: project.budget?.total || 0,
          spent: project.budget?.spent || 0
        }));

        // Process sprints
        const sprints = dashboardData.activeSprints || [];
        const formattedSprints = sprints.slice(0, 3).map(sprint => ({
          id: sprint._id,
          name: sprint.name,
          project: sprint.projectId?.name || 'Unknown Project',
          progress: sprint.capacity?.totalStoryPoints > 0
            ? ((sprint.capacity?.completedStoryPoints || 0) / sprint.capacity.totalStoryPoints) * 100
            : 0,
          storyPoints: sprint.capacity?.completedStoryPoints || sprint.capacity?.totalStoryPoints || 0,
          team: sprint.team?.length || 0,
          endDate: sprint.endDate || new Date()
        }));

        // Update metrics state
        setMetrics({
          totalProjects: projectMetrics.totalProjects || 0,
          activeProjects: projectMetrics.activeProjects || 0,
          completedProjects: projectMetrics.completedProjects || 0,
          totalTeamMembers: teamMetrics.totalTeamMembers || 0,
          onTrackProjects: onTrack,
          atRiskProjects: atRisk,
          delayedProjects: delayed,
          totalBudget: projectMetrics.totalBudget || 0,
          spentBudget: projectMetrics.spentBudget || 0,
          totalHours: 0, // Can be calculated from time entries if needed
          utilization: 0, // Can be calculated if needed
          velocity: sprintMetrics.totalVelocity || 0,
          codeCoverage: devMetrics.avgCodeCoverage || 0,
          clientSatisfaction: devMetrics.avgClientSatisfaction || 0,
          bugCount: devMetrics.totalBugs || 0,
          featuresDelivered: devMetrics.totalFeatures || 0
        });

        setRecentProjects(formattedProjects);
        setActiveSprints(formattedSprints);

        // Generate chart data
        generateChartData(dashboardData, formattedProjects, formattedSprints);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  // Generate comprehensive chart data
  const generateChartData = (dashboardData, projects, sprints) => {
    // Generate last 6 months labels
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Project Status Distribution (Pie Chart)
    const projectStatusData = {
      labels: ['On Track', 'At Risk', 'Delayed', 'Completed'],
      datasets: [{
        data: [
          metrics.onTrackProjects,
          metrics.atRiskProjects,
          metrics.delayedProjects,
          metrics.completedProjects
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    };

    // Budget vs Spent (Bar Chart)
    const projectSlice = projects.slice(0, 5);
    const budgetData = {
      labels: projectSlice.length > 0
        ? projectSlice.map(p => p.name.substring(0, 15))
        : ['No Projects'],
      datasets: [
        {
          label: 'Budget',
          data: projectSlice.length > 0
            ? projectSlice.map(p => p.budget / 1000)
            : [0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Spent',
          data: projectSlice.length > 0
            ? projectSlice.map(p => p.spent / 1000)
            : [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    };

    // Velocity Trend (Line Chart)
    const velocityData = {
      labels: months,
      datasets: [{
        label: 'Velocity (Story Points)',
        data: months.map(() => Math.floor(Math.random() * 50) + metrics.velocity - 25),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };

    // Team Utilization (Bar Chart)
    const utilizationData = {
      labels: ['Frontend', 'Backend', 'DevOps', 'QA', 'Design', 'PM'],
      datasets: [{
        label: 'Utilization %',
        data: [85, 92, 78, 88, 75, 90],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2
      }]
    };

    // Code Coverage Trend (Area Chart)
    const codeCoverageData = {
      labels: months,
      datasets: [{
        label: 'Code Coverage %',
        data: months.map(() => Math.floor(Math.random() * 20) + metrics.codeCoverage - 10),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    // Client Satisfaction Trend (Line Chart)
    const satisfactionData = {
      labels: months,
      datasets: [{
        label: 'Client Satisfaction (1-5)',
        data: months.map(() => (Math.random() * 0.5 + metrics.clientSatisfaction - 0.25).toFixed(1)),
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5
      }]
    };

    // Bug Trend (Bar Chart)
    const bugData = {
      labels: months,
      datasets: [{
        label: 'Bugs Found',
        data: months.map(() => Math.floor(Math.random() * 30) + 10),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }]
    };

    // Features Delivered (Bar Chart)
    const featuresData = {
      labels: months,
      datasets: [{
        label: 'Features Delivered',
        data: months.map(() => Math.floor(Math.random() * 15) + 5),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      }]
    };

    // Sprint Burndown (Line Chart)
    const burndownData = {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
      datasets: [
        {
          label: 'Ideal Burndown',
          data: [100, 92, 85, 78, 71, 64, 57, 50, 43, 36, 29, 21, 14, 0],
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false
        },
        {
          label: 'Actual Burndown',
          data: [100, 95, 88, 82, 76, 70, 65, 58, 52, 45, 38, 30, 22, 15],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Technology Stack Distribution (Pie Chart)
    const techStackData = {
      labels: ['React', 'Node.js', 'Python', 'Java', 'Angular', 'Vue.js', 'Others'],
      datasets: [{
        data: [35, 28, 15, 12, 5, 3, 2],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }]
    };

    // Methodology Distribution (Doughnut Chart)
    const methodologyData = {
      labels: ['Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps'],
      datasets: [{
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2
      }]
    };

    // Revenue Trend (Line Chart)
    const revenueData = {
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data: months.map(() => Math.floor(Math.random() * 50000) + 100000),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: months.map(() => Math.floor(Math.random() * 30000) + 60000),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Time Tracking Analytics (Bar Chart)
    const timeTrackingData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Development',
          data: [8, 7.5, 8.5, 8, 7, 4, 2],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        },
        {
          label: 'Testing',
          data: [2, 2.5, 1.5, 2, 3, 1, 0.5],
          backgroundColor: 'rgba(234, 179, 8, 0.8)'
        },
        {
          label: 'Meetings',
          data: [1, 1.5, 2, 1.5, 2, 0, 0],
          backgroundColor: 'rgba(168, 85, 247, 0.8)'
        }
      ]
    };

    // Team Performance Radar Chart
    const teamPerformanceData = {
      labels: ['Velocity', 'Quality', 'Collaboration', 'Innovation', 'Efficiency', 'Reliability'],
      datasets: [
        {
          label: 'Current Performance',
          data: [85, 90, 88, 75, 92, 87],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        },
        {
          label: 'Target',
          data: [90, 95, 90, 80, 95, 90],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff'
        }
      ]
    };

    setChartData({
      projectStatus: projectStatusData,
      budgetComparison: budgetData,
      velocityTrend: velocityData,
      teamUtilization: utilizationData,
      codeCoverageTrend: codeCoverageData,
      clientSatisfactionTrend: satisfactionData,
      bugTrend: bugData,
      featuresDelivered: featuresData,
      sprintBurndown: burndownData,
      techStack: techStackData,
      methodology: methodologyData,
      revenueTrend: revenueData,
      timeTracking: timeTrackingData,
      teamPerformance: teamPerformanceData
    });
  };

  useEffect(() => {
    // SECURITY FIX: Removed localStorage token check - use isAuthenticated from context
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [fetchDashboardData, isAuthenticated, authLoading]);

  const getProjectTypeIcon = (type) => {
    const icons = {
      'web_application': '🌐',
      'mobile_app': '📱',
      'api_development': '🔌',
      'system_integration': '🔗',
      'maintenance_support': '🔧',
      'consulting': '💼',
      'general': '📋'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on_track': return 'On Track';
      case 'at_risk': return 'At Risk';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  const stats = [
    {
      label: 'Total Projects',
      value: metrics.totalProjects,
      change: `${metrics.activeProjects} active`,
      icon: FolderIcon,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      trend: 'up',
      onClick: () => navigate(`/${tenantSlug}/org/projects`)
    },
    {
      label: 'Team Members',
      value: metrics.totalTeamMembers,
      change: `${metrics.totalTeamMembers} developers`,
      icon: UsersIcon,
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      trend: 'up'
    },
    {
      label: 'Team Velocity',
      value: metrics.velocity || 0,
      change: `${metrics.velocity > 0 ? '+' : ''}${metrics.velocity} story points`,
      icon: ChartBarIcon,
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      trend: metrics.velocity > 0 ? 'up' : 'down'
    },
    {
      label: 'Code Coverage',
      value: `${Math.round(metrics.codeCoverage)}%`,
      change: `${metrics.codeCoverage >= 80 ? 'Excellent' : metrics.codeCoverage >= 60 ? 'Good' : 'Needs Improvement'}`,
      icon: CodeBracketIcon,
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
      trend: metrics.codeCoverage >= 80 ? 'up' : 'down',
      onClick: () => navigate(`/${tenantSlug}/org/analytics`)
    },
    {
      label: 'Client Satisfaction',
      value: metrics.clientSatisfaction > 0 ? metrics.clientSatisfaction.toFixed(1) : 'N/A',
      change: `${metrics.clientSatisfaction > 0 ? metrics.clientSatisfaction >= 4 ? 'Excellent' : metrics.clientSatisfaction >= 3 ? 'Good' : 'Needs Improvement' : 'No ratings yet'}`,
      icon: StarIcon,
      iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      trend: metrics.clientSatisfaction >= 4 ? 'up' : 'down'
    },
    {
      label: 'Total Budget',
      value: `$${(metrics.totalBudget / 1000).toFixed(0)}K`,
      change: `${((metrics.spentBudget / metrics.totalBudget) * 100).toFixed(0)}% spent`,
      icon: CurrencyDollarIcon,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      trend: 'up'
    },
    {
      label: 'Bugs Found',
      value: metrics.bugCount,
      change: `${metrics.bugCount > 0 ? metrics.bugCount + ' issues' : 'No bugs'}`,
      icon: BugAntIcon,
      iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
      trend: metrics.bugCount > 20 ? 'down' : 'up'
    },
    {
      label: 'Features Delivered',
      value: metrics.featuresDelivered,
      change: `${metrics.featuresDelivered} this month`,
      icon: RocketLaunchIcon,
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      trend: 'up'
    }
  ];

  const handlePopulateSampleData = async () => {
    if (seedLoading) return;
    if (!window.confirm('This will create sample projects, clients, tasks, employees, departments, and users in this organization. Continue?')) return;
    try {
      setSeedLoading(true);
      setSeedError(null);
      setSeedResult(null);
      const result = await tenantApiService.createSampleData(tenantSlug);
      setSeedResult(result);
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating sample data:', err);
      setSeedError(err.message || 'Failed to create sample data');
    } finally {
      setSeedLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0078d4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#605e5c]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Welcome to your development team's command center</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePopulateSampleData}
            disabled={seedLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-md"
          >
            {seedLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Creating sample data...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Populate sample data
              </>
            )}
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Last updated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <RocketLaunchIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
      {(seedResult || seedError) && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {seedResult && (
            <span className="text-green-600 dark:text-green-400">
              Created: {seedResult.departments} departments, {seedResult.users} users, {seedResult.clients} clients, {seedResult.projects} projects, {seedResult.tasks} tasks, {seedResult.employees} employees.
            </span>
          )}
          {seedError && <span className="text-red-600 dark:text-red-400">{seedError}</span>}
        </div>
      )}

      {/* Key Metrics - Expanded Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`glass-card-premium p-5 hover-glow transition-all duration-300 ${stat.onClick ? 'cursor-pointer' : ''}`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.iconBg} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            {/* Progress bar for visual stats */}
            {stat.label === 'Code Coverage' && (
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.codeCoverage, 100)}%` }}
                ></div>
              </div>
            )}
            {stat.label === 'Client Satisfaction' && metrics.clientSatisfaction > 0 && (
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.clientSatisfaction / 5) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1: Project Status & Budget Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Status Distribution</h3>
            <FolderIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.projectStatus && (
            <div className="h-64">
              <Pie
                data={chartData.projectStatus}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: { size: 14 },
                      bodyFont: { size: 13 }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Budget vs Spent Comparison */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget vs Spent</h3>
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.budgetComparison && (
            <div className="h-64">
              <Bar
                data={chartData.budgetComparison}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `${context.dataset.label}: $${(context.parsed.y * 1000).toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return '$' + (value * 1000) + 'K';
                        },
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Velocity Trend & Team Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Trend */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Velocity Trend (6 Months)</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.velocityTrend && (
            <div className="h-64">
              <Line
                data={chartData.velocityTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Team Utilization */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Utilization by Role</h3>
            <UsersIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.teamUtilization && (
            <div className="h-64">
              <Bar
                data={chartData.teamUtilization}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `Utilization: ${context.parsed.y}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function (value) {
                          return value + '%';
                        },
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3: Code Coverage & Client Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Coverage Trend */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Code Coverage Trend</h3>
            <CodeBracketIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.codeCoverageTrend && (
            <div className="h-64">
              <Line
                data={chartData.codeCoverageTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `Coverage: ${context.parsed.y}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function (value) {
                          return value + '%';
                        },
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Client Satisfaction Trend */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Client Satisfaction Trend</h3>
            <StarIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.clientSatisfactionTrend && (
            <div className="h-64">
              <Line
                data={chartData.clientSatisfactionTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `Rating: ${context.parsed.y}/5.0`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 4: Bug Trend & Features Delivered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bug Trend */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bug Count Trend</h3>
            <BugAntIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.bugTrend && (
            <div className="h-64">
              <Bar
                data={chartData.bugTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Features Delivered */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Features Delivered</h3>
            <RocketLaunchIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.featuresDelivered && (
            <div className="h-64">
              <Bar
                data={chartData.featuresDelivered}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 5: Sprint Burndown & Technology Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Burndown */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sprint Burndown Chart</h3>
            <RocketLaunchIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.sprintBurndown && (
            <div className="h-64">
              <Line
                data={chartData.sprintBurndown}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Technology Stack Distribution */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Technology Stack</h3>
            <CpuChipIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.techStack && (
            <div className="h-64">
              <Doughnut
                data={chartData.techStack}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${context.parsed}%`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 6: Methodology & Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Methodology Distribution */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Development Methodology</h3>
            <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.methodology && (
            <div className="h-64">
              <Doughnut
                data={chartData.methodology}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${context.parsed}%`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Revenue Trend */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.revenueTrend && (
            <div className="h-64">
              <Line
                data={chartData.revenueTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return '$' + (value / 1000).toFixed(0) + 'K';
                        },
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 7: Time Tracking & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Tracking Analytics */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Time Tracking (This Week)</h3>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.timeTracking && (
            <div className="h-64">
              <Bar
                data={chartData.timeTracking}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function (context) {
                          return `${context.dataset.label}: ${context.parsed.y} hours`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      stacked: true,
                      ticks: {
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value + 'h';
                        },
                        color: 'rgb(107, 114, 128)'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Team Performance Radar */}
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Performance Radar</h3>
            <UsersIcon className="w-5 h-5 text-gray-400" />
          </div>
          {chartData.teamPerformance && (
            <div className="h-64">
              <Radar
                data={chartData.teamPerformance}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: 'rgb(107, 114, 128)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                        color: 'rgb(107, 114, 128)',
                        backdropColor: 'transparent'
                      },
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)'
                      },
                      pointLabels: {
                        color: 'rgb(107, 114, 128)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Project Health Overview */}
      <div className="glass-card-premium p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Project Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.onTrackProjects}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">On Track</p>
            <div className="mt-2 bg-green-200 dark:bg-green-800 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.totalProjects > 0 ? (metrics.onTrackProjects / metrics.totalProjects) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.atRiskProjects}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">At Risk</p>
            <div className="mt-2 bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.totalProjects > 0 ? (metrics.atRiskProjects / metrics.totalProjects) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.delayedProjects}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Delayed</p>
            <div className="mt-2 bg-red-200 dark:bg-red-800 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.totalProjects > 0 ? (metrics.delayedProjects / metrics.totalProjects) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="glass-card-premium p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Projects</h3>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="glass-card p-4 hover-glow cursor-pointer"
                  onClick={() => navigate(`/${tenantSlug}/org/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getProjectTypeIcon(project.projectType)}</span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {project.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Client: {project.client} • {project.methodology} methodology
                      </p>
                      {project.budget > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Budget: ${project.budget.toLocaleString()} • Spent: ${project.spent.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${project.status === 'on_track' ? 'bg-green-500' :
                            project.status === 'at_risk' ? 'bg-yellow-500' :
                              'bg-red-500'
                          }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-3">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <UsersIcon className="w-3 h-3" />
                        <span>{project.team} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-3 h-3" />
                        <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No active projects</p>
                <button
                  onClick={() => navigate(`/${tenantSlug}/org/projects`)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Sprints */}
        <div className="glass-card-premium p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Sprints</h3>
          <div className="space-y-4">
            {activeSprints.length > 0 ? activeSprints.map((sprint) => (
              <div
                key={sprint.id}
                className="glass-card p-4 hover-glow cursor-pointer"
                onClick={() => navigate(`/${tenantSlug}/org/projects`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {sprint.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {sprint.project}
                    </p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold">
                    {sprint.storyPoints}pts
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Sprint Progress</span>
                    <span className="font-bold text-gray-900 dark:text-white">{sprint.progress}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                      style={{ width: `${sprint.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-3">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <UsersIcon className="w-3 h-3" />
                      <span>{sprint.team} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>Ends {new Date(sprint.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <RocketLaunchIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No active sprints</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card-premium p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects/tasks?create=task`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
                <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Add Task</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Create a new task</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/my-work`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">My Work</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">View your tasks & work</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Create Project</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Start a new development project</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/projects`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <RocketLaunchIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">View Sprints</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Manage active sprints</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/analytics`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">View Analytics</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Check development metrics</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/software-house/time-tracking`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Time Tracking</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Track time on projects</p>
          </button>

          <button
            onClick={() => navigate(`/${tenantSlug}/org/software-house/hr/employees/create`)}
            className="glass-card p-4 hover-glow text-left transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <UsersIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Add Employee</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Add a new team member</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftwareHouseDashboard;
