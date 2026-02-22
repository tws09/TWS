import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  AttachMoney,
  Assessment,
  Refresh,
  Visibility,
  Project,
  People,
  Timer,
  AccountBalance
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

const ProfitabilityDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitabilityData();
  }, []);

  const fetchProfitabilityData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData = {
        summary: {
          totalBudgetedRevenue: 500000,
          totalActualRevenue: 450000,
          totalBudgetedCost: 300000,
          totalActualCost: 320000,
          totalMargin: 130000,
          overallMarginPercentage: 28.9,
          projectCount: 8
        },
        projectBreakdown: [
          {
            id: '1',
            name: 'E-commerce Platform',
            status: 'active',
            margin: 50000,
            marginPercentage: 25.0,
            alerts: 0
          },
          {
            id: '2',
            name: 'Mobile App Redesign',
            status: 'active',
            margin: 30000,
            marginPercentage: 20.0,
            alerts: 1
          },
          {
            id: '3',
            name: 'SaaS Dashboard',
            status: 'completed',
            margin: 80000,
            marginPercentage: 35.0,
            alerts: 0
          },
          {
            id: '4',
            name: 'API Integration',
            status: 'active',
            margin: 20000,
            marginPercentage: 15.0,
            alerts: 2
          }
        ],
        topPerformers: [
          {
            id: '3',
            name: 'SaaS Dashboard',
            marginPercentage: 35.0,
            margin: 80000
          },
          {
            id: '1',
            name: 'E-commerce Platform',
            marginPercentage: 25.0,
            margin: 50000
          },
          {
            id: '2',
            name: 'Mobile App Redesign',
            marginPercentage: 20.0,
            margin: 30000
          }
        ],
        underPerformers: [
          {
            id: '4',
            name: 'API Integration',
            marginPercentage: 15.0,
            margin: 20000
          }
        ],
        costBreakdown: {
          byEmployee: {
            'John Doe': { hours: 160, cost: 12000 },
            'Jane Smith': { hours: 140, cost: 10500 },
            'Mike Johnson': { hours: 120, cost: 9000 },
            'Sarah Wilson': { hours: 100, cost: 7500 }
          },
          byTaskType: {
            'development': { hours: 300, cost: 22500 },
            'design': { hours: 120, cost: 9000 },
            'testing': { hours: 80, cost: 6000 },
            'meeting': { hours: 40, cost: 3000 }
          }
        },
        revenueBreakdown: {
          byInvoice: {
            'INV-001': { amount: 50000, status: 'paid', date: '2024-01-15' },
            'INV-002': { amount: 30000, status: 'sent', date: '2024-01-20' },
            'INV-003': { amount: 25000, status: 'paid', date: '2024-01-25' }
          },
          byMonth: {
            '2024-01': 105000,
            '2024-02': 95000,
            '2024-03': 85000
          }
        },
        alerts: [
          {
            type: 'budget_overrun',
            severity: 'high',
            message: 'API Integration project has exceeded budget by $5,000',
            value: 5000
          },
          {
            type: 'low_margin',
            severity: 'medium',
            message: 'API Integration project margin is 15%',
            value: 15
          }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'on_hold': return 'warning';
      case 'cancelled': return 'error';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Failed to load profitability data. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Profitability Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Project profitability analysis and cost tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={fetchProfitabilityData}>
            <Refresh />
          </IconButton>
          <Button startIcon={<Visibility />} variant="outlined">
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{formatCurrency(data.summary.totalActualRevenue)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
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
                <AccountBalance color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{formatCurrency(data.summary.totalActualCost)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
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
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{formatCurrency(data.summary.totalMargin)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Margin
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
                <Assessment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{data.summary.overallMarginPercentage.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Margin %
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Breakdown */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Profitability Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Margin</TableCell>
                      <TableCell align="right">Margin %</TableCell>
                      <TableCell align="right">Alerts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.projectBreakdown.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Project sx={{ mr: 1 }} />
                            {project.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            color={getStatusColor(project.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(project.margin)}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <LinearProgress
                              variant="determinate"
                              value={project.marginPercentage}
                              color={project.marginPercentage > 25 ? 'success' : project.marginPercentage > 15 ? 'warning' : 'error'}
                              sx={{ width: 60, mr: 1, height: 6, borderRadius: 3 }}
                            />
                            {project.marginPercentage.toFixed(1)}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {project.alerts > 0 ? (
                            <Badge badgeContent={project.alerts} color="error">
                              <Warning />
                            </Badge>
                          ) : (
                            <CheckCircle color="success" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <List>
                {data.topPerformers.map((project, index) => (
                  <ListItem key={project.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Margin: {formatCurrency(project.margin)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={project.marginPercentage}
                            color="success"
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                          <Typography variant="caption">
                            {project.marginPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown by Employee
              </Typography>
              <List>
                {Object.entries(data.costBreakdown.byEmployee).map(([employee, data]) => (
                  <ListItem key={employee} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <People />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={employee}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {data.hours} hours • {formatCurrency(data.cost)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(data.hours / 200) * 100}
                            color="primary"
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Breakdown by Month
              </Typography>
              <List>
                {Object.entries(data.revenueBreakdown.byMonth).map(([month, amount]) => (
                  <ListItem key={month} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <AttachMoney />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={month}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(amount)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(amount / 150000) * 100}
                            color="success"
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profitability Alerts
                </Typography>
                <Grid container spacing={2}>
                  {data.alerts.map((alert, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Alert severity={getSeverityColor(alert.severity)}>
                        <AlertTitle>{alert.message}</AlertTitle>
                        {alert.type === 'budget_overrun' && `Overrun: ${formatCurrency(alert.value)}`}
                        {alert.type === 'low_margin' && `Margin: ${alert.value}%`}
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProfitabilityDashboard;

