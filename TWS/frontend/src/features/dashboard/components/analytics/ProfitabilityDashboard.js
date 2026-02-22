import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Refresh,
  Download,
  Visibility,
  MoreVert
} from '@mui/icons-material';
import { format, subDays, subMonths } from 'date-fns';

const ProfitabilityDashboard = ({ orgId, projectId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedProject, setSelectedProject] = useState(projectId || 'all');

  useEffect(() => {
    fetchProfitabilityData();
  }, [orgId, selectedProject, timeframe]);

  const fetchProfitabilityData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData = {
        summary: {
          totalBudgetedRevenue: 150000,
          totalActualRevenue: 120000,
          totalBudgetedCost: 100000,
          totalActualCost: 95000,
          totalMargin: 25000,
          overallMarginPercentage: 20.8,
          projectCount: 3
        },
        projectBreakdown: [
          {
            id: '1',
            name: 'E-commerce Platform',
            status: 'active',
            margin: 15000,
            marginPercentage: 25.0,
            alerts: 0
          },
          {
            id: '2',
            name: 'Mobile App Redesign',
            status: 'active',
            margin: 5000,
            marginPercentage: 12.5,
            alerts: 2
          },
          {
            id: '3',
            name: 'SaaS Dashboard',
            status: 'completed',
            margin: 5000,
            marginPercentage: 15.0,
            alerts: 0
          }
        ],
        topPerformers: [
          {
            id: '1',
            name: 'E-commerce Platform',
            marginPercentage: 25.0,
            margin: 15000
          },
          {
            id: '3',
            name: 'SaaS Dashboard',
            marginPercentage: 15.0,
            margin: 5000
          }
        ],
        underPerformers: [
          {
            id: '2',
            name: 'Mobile App Redesign',
            marginPercentage: 12.5,
            margin: 5000
          }
        ],
        costBreakdown: {
          byEmployee: {
            'John Doe': { hours: 120, cost: 12000 },
            'Jane Smith': { hours: 80, cost: 8000 },
            'Mike Johnson': { hours: 100, cost: 10000 },
            'Sarah Wilson': { hours: 60, cost: 6000 }
          },
          byTaskType: {
            'development': { hours: 200, cost: 20000 },
            'design': { hours: 80, cost: 8000 },
            'testing': { hours: 60, cost: 6000 },
            'meeting': { hours: 20, cost: 2000 }
          }
        },
        revenueBreakdown: {
          byInvoice: {
            'INV-001': { amount: 50000, status: 'paid', date: '2024-01-15' },
            'INV-002': { amount: 30000, status: 'sent', date: '2024-01-20' },
            'INV-003': { amount: 40000, status: 'paid', date: '2024-01-25' }
          },
          byMonth: {
            '2024-01': 90000,
            '2024-02': 30000
          }
        },
        alerts: [
          {
            type: 'budget_overrun',
            severity: 'high',
            message: 'Mobile App Redesign has exceeded budget by $2,500',
            value: 2500
          },
          {
            type: 'low_margin',
            severity: 'medium',
            message: 'Mobile App Redesign margin is 12.5%',
            value: 12.5
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

  const getMarginColor = (marginPercentage) => {
    if (marginPercentage >= 20) return 'success';
    if (marginPercentage >= 10) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
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
            Project Profitability Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time financial performance and margin analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchProfitabilityData}>
            <Refresh />
          </IconButton>
          <Button startIcon={<Download />} variant="outlined">
            Export
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
                <Assessment color="error" sx={{ mr: 2 }} />
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
                <Assessment color={getMarginColor(data.summary.overallMarginPercentage)} sx={{ mr: 2 }} />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Project Performance</Typography>
                <Chip label={`${data.summary.projectCount} projects`} color="primary" />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Margin</TableCell>
                      <TableCell align="right">Margin %</TableCell>
                      <TableCell align="right">Alerts</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.projectBreakdown.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{project.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            size="small"
                            color={getStatusColor(project.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={project.margin >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(project.margin)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${project.marginPercentage.toFixed(1)}%`}
                            size="small"
                            color={getMarginColor(project.marginPercentage)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {project.alerts > 0 && (
                            <Chip
                              label={project.alerts}
                              size="small"
                              color="error"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers & Under Performers */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  {data.topPerformers.map((project) => (
                    <Box key={project.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{project.name}</Typography>
                        <Chip
                          label={`${project.marginPercentage.toFixed(1)}%`}
                          size="small"
                          color="success"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(project.margin)} margin
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Under Performers
                  </Typography>
                  {data.underPerformers.map((project) => (
                    <Box key={project.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{project.name}</Typography>
                        <Chip
                          label={`${project.marginPercentage.toFixed(1)}%`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(project.margin)} margin
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown by Employee
              </Typography>
              {Object.entries(data.costBreakdown.byEmployee).map(([employee, data]) => (
                <Box key={employee} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{employee}</Typography>
                    <Typography variant="body2">{formatCurrency(data.cost)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(data.cost / data.summary?.totalActualCost) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {data.hours} hours
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Month
              </Typography>
              {Object.entries(data.revenueBreakdown.byMonth).map(([month, amount]) => (
                <Box key={month} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{month}</Typography>
                    <Typography variant="body2">{formatCurrency(amount)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(amount / data.summary.totalActualRevenue) * 100}
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
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
                        {alert.type === 'low_margin' && `Current margin: ${alert.value}%`}
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

