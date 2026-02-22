import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  People,
  AttachMoney,
  Assessment,
  Notifications,
  Refresh,
  MoreVert,
  Person,
  Project,
  Timer,
  AlertCircle
} from '@mui/icons-material';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import axiosInstance from '../../../shared/utils/axiosInstance';
import { handleApiError } from '../utils/errorHandler';
import { REFRESH_INTERVALS } from '../constants/projectConstants';
import ErrorBoundary from '../components/ErrorBoundary';

const ProjectManagerCockpit = () => {
  const [dashboardData, setDashboardData] = useState({
    todayDeliverables: [],
    teamStatus: [],
    clientAlerts: [],
    budgetStatus: [],
    riskIndicators: [],
    quickStats: {
      activeProjects: 0,
      teamMembers: 0,
      overdueTasks: 0,
      budgetBurnRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Refresh at configured interval
    const interval = setInterval(fetchDashboardData, REFRESH_INTERVALS.DASHBOARD);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch real dashboard data from API
      const response = await axiosInstance.get('/api/projects/manager/cockpit');
      
      if (response.data?.success && response.data?.data) {
        setDashboardData({
          todayDeliverables: response.data.data.todayDeliverables || [],
          teamStatus: response.data.data.teamStatus || [],
          clientAlerts: response.data.data.clientAlerts || [],
          budgetStatus: response.data.data.budgetStatus || [],
          riskIndicators: response.data.data.riskIndicators || [],
          quickStats: response.data.data.quickStats || {
            activeProjects: 0,
            teamMembers: 0,
            overdueTasks: 0,
            budgetBurnRate: 0
          }
        });
      } else {
        // Fallback to empty data if API fails
        setDashboardData({
          todayDeliverables: [],
          teamStatus: [],
          clientAlerts: [],
          budgetStatus: [],
          riskIndicators: [],
          quickStats: {
            activeProjects: 0,
            teamMembers: 0,
            overdueTasks: 0,
            budgetBurnRate: 0
          }
        });
      }
      setLastUpdated(new Date());
    } catch (error) {
      handleApiError(error, 'Failed to load dashboard data', { showToast: false });
      // Set empty data on error
      setDashboardData({
        todayDeliverables: [],
        teamStatus: [],
        clientAlerts: [],
        budgetStatus: [],
        riskIndicators: [],
        quickStats: {
          activeProjects: 0,
          teamMembers: 0,
          overdueTasks: 0,
          budgetBurnRate: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTeamStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'in_meeting': return 'info';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'success';
      case 'at_risk': return 'warning';
      case 'over_budget': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Project Manager Cockpit...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Project Manager Cockpit
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Daily operational command center - {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </Typography>
          <IconButton onClick={fetchDashboardData} size="small">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Project color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.quickStats.activeProjects}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.quickStats.teamMembers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.quickStats.overdueTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dashboardData.quickStats.budgetBurnRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Budget Burn Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Deliverables */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Today's Deliverables</Typography>
                <Badge badgeContent={dashboardData.todayDeliverables.length} color="primary">
                  <Schedule />
                </Badge>
              </Box>
              <List>
                {dashboardData.todayDeliverables.map((deliverable) => (
                  <ListItem key={deliverable.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Person fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{deliverable.title}</Typography>
                          <Chip
                            label={deliverable.priority}
                            size="small"
                            color={getPriorityColor(deliverable.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {deliverable.project} • {deliverable.client} • Due: {deliverable.dueTime}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={deliverable.progress}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{deliverable.progress}%</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Team Status</Typography>
                <Badge badgeContent={dashboardData.teamStatus.length} color="secondary">
                  <People />
                </Badge>
              </Box>
              <List>
                {dashboardData.teamStatus.map((member) => (
                  <ListItem key={member.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{member.name}</Typography>
                          <Chip
                            label={member.status.replace('_', ' ')}
                            size="small"
                            color={getTeamStatusColor(member.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.role} • {member.currentTask}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="caption">Workload:</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={member.workload}
                              color={member.workload > 90 ? 'error' : member.workload > 75 ? 'warning' : 'success'}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{member.workload}%</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Client Alerts</Typography>
                <Badge badgeContent={dashboardData.clientAlerts.length} color="error">
                  <Notifications />
                </Badge>
              </Box>
              <List>
                {dashboardData.clientAlerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AlertCircle color={getSeverityColor(alert.severity)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{alert.message}</Typography>
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {alert.project}
                          </Typography>
                          <Button size="small" sx={{ mt: 1 }}>
                            {alert.action}
                          </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Budget Status</Typography>
                <Badge badgeContent={dashboardData.budgetStatus.length} color="success">
                  <AttachMoney />
                </Badge>
              </Box>
              <List>
                {dashboardData.budgetStatus.map((budget, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Assessment color={getBudgetStatusColor(budget.status)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{budget.project}</Typography>
                          <Chip
                            label={budget.status.replace('_', ' ')}
                            size="small"
                            color={getBudgetStatusColor(budget.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Spent: ${budget.spent.toLocaleString()} / ${budget.budget.toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={budget.burnRate}
                              color={getBudgetStatusColor(budget.status)}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{budget.burnRate}%</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Indicators */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Risk Indicators</Typography>
                <Badge badgeContent={dashboardData.riskIndicators.length} color="warning">
                  <Warning />
                </Badge>
              </Box>
              <Grid container spacing={2}>
                {dashboardData.riskIndicators.map((risk, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Alert
                      severity={getSeverityColor(risk.severity)}
                      sx={{ height: '100%' }}
                    >
                      <AlertTitle>{risk.message}</AlertTitle>
                      {risk.impact}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </ErrorBoundary>
  );
};

export default ProjectManagerCockpit;
