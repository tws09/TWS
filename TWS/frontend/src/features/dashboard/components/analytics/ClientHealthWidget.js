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
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Person,
  AttachMoney,
  Assessment,
  Notifications,
  Refresh,
  Visibility,
  Phone,
  Email,
  Schedule
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

const ClientHealthWidget = ({ orgId, clientId, compact = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientHealthData();
  }, [orgId, clientId]);

  const fetchClientHealthData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData = {
        client: {
          id: clientId || '1',
          name: 'TechCorp Inc.',
          email: 'contact@techcorp.com',
          phone: '+1 (555) 123-4567',
          industry: 'Technology',
          size: 'Enterprise'
        },
        health: {
          healthScore: 75,
          healthStatus: 'good',
          lastUpdated: new Date()
        },
        engagement: {
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          loginFrequency: 8, // per month
          projectInteractions: 12, // per month
          supportTickets: 2, // per month
          responseTime: 4 // hours
        },
        financial: {
          totalSpent: 150000,
          averageInvoiceTime: 15, // days
          paymentReliability: 95, // percentage
          outstandingAmount: 5000,
          creditScore: 'excellent'
        },
        projectHealth: {
          activeProjects: 2,
          completedProjects: 5,
          onTimeDelivery: 90, // percentage
          budgetAdherence: 85, // percentage
          satisfactionScore: 4.2 // out of 5
        },
        churnRisk: {
          riskLevel: 'low',
          riskScore: 25,
          riskFactors: [
            {
              factor: 'Low Engagement',
              impact: 6,
              description: 'Client has not logged in for over 30 days'
            }
          ]
        },
        satisfaction: {
          overallScore: 4.2,
          npsScore: 8,
          recentSurveys: 1,
          recentComplaints: 0
        },
        renewal: {
          contractEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          renewalProbability: 85,
          expansionOpportunity: 'medium',
          expansionValue: 25000
        },
        alerts: [
          {
            type: 'engagement_low',
            severity: 'medium',
            message: 'Client has not logged in for 2 days',
            triggeredAt: new Date()
          }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching client health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
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
        Failed to load client health data. Please try again.
      </Alert>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{data.client.name}</Typography>
            <Chip
              label={data.health.healthStatus}
              color={getHealthColor(data.health.healthScore)}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={data.health.healthScore}
                color={getHealthColor(data.health.healthScore)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="h6">{data.health.healthScore}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Risk: {data.churnRisk.riskLevel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.alerts.length} alerts
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Client Health Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {data.client.name} • {data.client.industry} • {data.client.size}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={fetchClientHealthData}>
            <Refresh />
          </IconButton>
          <Button startIcon={<Visibility />} variant="outlined">
            View Details
          </Button>
        </Box>
      </Box>

      {/* Health Score Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color={getHealthColor(data.health.healthScore)} sx={{ mr: 2 }} />
                <Typography variant="h6">Health Score</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h2" color={`${getHealthColor(data.health.healthScore)}.main`}>
                  {data.health.healthScore}
                </Typography>
                <Chip
                  label={data.health.healthStatus}
                  color={getHealthColor(data.health.healthScore)}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={data.health.healthScore}
                color={getHealthColor(data.health.healthScore)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color={getRiskColor(data.churnRisk.riskLevel)} sx={{ mr: 2 }} />
                <Typography variant="h6">Churn Risk</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h2" color={`${getRiskColor(data.churnRisk.riskLevel)}.main`}>
                  {data.churnRisk.riskScore}%
                </Typography>
                <Chip
                  label={data.churnRisk.riskLevel}
                  color={getRiskColor(data.churnRisk.riskLevel)}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={data.churnRisk.riskScore}
                color={getRiskColor(data.churnRisk.riskLevel)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">Total Spent</Typography>
              </Box>
              <Typography variant="h3" color="success.main" gutterBottom>
                {formatCurrency(data.financial.totalSpent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment reliability: {data.financial.paymentReliability}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Engagement Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement Metrics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Login"
                    secondary={format(data.engagement.lastLogin, 'MMM dd, yyyy')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Login Frequency"
                    secondary={`${data.engagement.loginFrequency} times per month`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Interactions"
                    secondary={`${data.engagement.projectInteractions} per month`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Support Tickets"
                    secondary={`${data.engagement.supportTickets} per month`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Health
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Outstanding Amount"
                    secondary={formatCurrency(data.financial.outstandingAmount)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Average Payment Time"
                    secondary={`${data.financial.averageInvoiceTime} days`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit Score"
                    secondary={data.financial.creditScore}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment Reliability"
                    secondary={`${data.financial.paymentReliability}%`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Health
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {data.projectHealth.activeProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Projects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {data.projectHealth.completedProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Projects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    On-Time Delivery
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={data.projectHealth.onTimeDelivery}
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption">{data.projectHealth.onTimeDelivery}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Budget Adherence
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={data.projectHealth.budgetAdherence}
                    color="warning"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption">{data.projectHealth.budgetAdherence}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Renewal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Renewal Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contract End Date"
                    secondary={format(data.renewal.contractEndDate, 'MMM dd, yyyy')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Renewal Probability"
                    secondary={`${data.renewal.renewalProbability}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Expansion Opportunity"
                    secondary={data.renewal.expansionOpportunity}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Expansion Value"
                    secondary={formatCurrency(data.renewal.expansionValue)}
                  />
                </ListItem>
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
                  Active Alerts
                </Typography>
                <Grid container spacing={2}>
                  {data.alerts.map((alert, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Alert severity={getSeverityColor(alert.severity)}>
                        <AlertTitle>{alert.message}</AlertTitle>
                        Triggered: {format(alert.triggeredAt, 'MMM dd, yyyy HH:mm')}
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Risk Factors */}
        {data.churnRisk.riskFactors.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Factors
                </Typography>
                <List>
                  {data.churnRisk.riskFactors.map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={factor.factor}
                        secondary={factor.description}
                      />
                      <Chip
                        label={`Impact: ${factor.impact}/10`}
                        size="small"
                        color="warning"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ClientHealthWidget;

