import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Assessment,
  People,
  AttachMoney,
  Schedule,
  Refresh,
  ExpandMore,
  Lightbulb,
  Psychology,
  Analytics,
  Insights
} from '@mui/icons-material';
import { format } from 'date-fns';

const SupraAIInsights = ({ orgId, compact = false }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAIInsights();
    // Refresh every 10 minutes
    const interval = setInterval(fetchAIInsights, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [orgId]);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockInsights = {
        projectInsights: {
          overrunPredictions: [
            {
              projectId: '1',
              projectName: 'Mobile App Redesign',
              overrunRisk: true,
              overrunAmount: 2500,
              predictedTotalCost: 27500,
              currentBurnRate: 1200,
              daysRemaining: 15,
              confidence: 85,
              recommendations: [
                {
                  type: 'budget',
                  priority: 'high',
                  message: 'Project is predicted to exceed budget by $2,500',
                  action: 'Review scope and consider reducing features or extending timeline'
                }
              ]
            }
          ],
          profitabilityAnalysis: [
            {
              projectId: '1',
              projectName: 'Mobile App Redesign',
              currentMargin: 12.5,
              marginTrend: 'declining',
              costEfficiency: 45,
              revenueOptimization: 7.5,
              recommendations: [
                {
                  type: 'margin',
                  priority: 'high',
                  message: 'Project margin is below 10%',
                  action: 'Review pricing strategy and cost structure'
                }
              ]
            }
          ],
          resourceOptimization: [],
          timelineRisks: [
            {
              projectId: '1',
              projectName: 'Mobile App Redesign',
              riskLevel: 'high',
              riskFactors: ['Budget overrun', 'Resource constraints', 'Scope creep']
            }
          ]
        },
        clientInsights: {
          churnPredictions: [
            {
              clientId: '1',
              riskLevel: 'medium',
              riskScore: 65,
              timeToChurn: '3-6 months',
              retentionProbability: 35,
              recommendations: [
                {
                  type: 'engagement',
                  priority: 'medium',
                  message: 'Client has not logged in recently',
                  action: 'Send personalized outreach and training materials'
                }
              ]
            }
          ],
          expansionOpportunities: [
            {
              clientId: '1',
              opportunityLevel: 'high',
              potentialValue: 25000,
              factors: ['High satisfaction score', 'Excellent payment history'],
              recommendations: [
                {
                  type: 'expansion',
                  priority: 'high',
                  message: 'High expansion opportunity identified',
                  action: 'Schedule strategic review meeting to discuss growth plans'
                }
              ]
            }
          ],
          satisfactionTrends: [],
          engagementAlerts: []
        },
        resourceInsights: {
          utilizationAnalysis: [
            {
              employeeId: '1',
              employeeName: 'John Doe',
              utilization: 95,
              totalHours: 160,
              billableHours: 152,
              efficiency: 88,
              recommendations: [
                {
                  type: 'workload',
                  priority: 'high',
                  message: 'Over-utilized employee',
                  action: 'Reduce workload or consider hiring additional resources'
                }
              ]
            }
          ],
          skillGaps: [],
          hiringRecommendations: [],
          workloadBalancing: []
        },
        financialInsights: {
          revenueForecast: {
            currentRevenue: 120000,
            pipelineRevenue: 45000,
            projectedRevenue: 80000,
            totalForecast: 245000,
            growthRate: 15,
            confidence: 78
          },
          costOptimization: [],
          cashFlowPrediction: {
            currentCashFlow: 15000,
            predictedCashFlow: 25000,
            confidence: 82
          },
          profitabilityTrends: []
        },
        generatedAt: new Date(),
        confidence: 78
      };

      setInsights(mockInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp color="success" />;
      case 'declining': return <TrendingDown color="error" />;
      case 'stable': return <Assessment color="info" />;
      default: return <Assessment color="default" />;
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

  if (!insights) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Failed to load AI insights. Please try again.
      </Alert>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">SupraAI Insights</Typography>
            <Chip
              label={`${insights.confidence}% confidence`}
              color="primary"
              size="small"
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Key Insights
            </Typography>
            <List dense>
              {insights.projectInsights.overrunPredictions.slice(0, 2).map((prediction, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Warning color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={prediction.projectName}
                    secondary={`${prediction.overrunRisk ? 'Budget overrun risk' : 'On track'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {format(lastUpdated, 'HH:mm')}
            </Typography>
            <IconButton onClick={fetchAIInsights} size="small">
              <Refresh />
            </IconButton>
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
            SupraAI Insights
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered business intelligence and predictive analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<Psychology />}
            label={`${insights.confidence}% confidence`}
            color="primary"
          />
          <IconButton onClick={fetchAIInsights}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Project Insights */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment color="primary" />
            <Typography variant="h6">Project Insights</Typography>
            <Badge badgeContent={insights.projectInsights.overrunPredictions.length} color="error">
              <Warning />
            </Badge>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Overrun Predictions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Budget Overrun Predictions
                  </Typography>
                  {insights.projectInsights.overrunPredictions.map((prediction, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{prediction.projectName}</Typography>
                        <Chip
                          label={prediction.overrunRisk ? 'At Risk' : 'On Track'}
                          color={prediction.overrunRisk ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                      {prediction.overrunRisk && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          <AlertTitle>Budget Overrun Risk</AlertTitle>
                          Predicted overrun: {formatCurrency(prediction.overrunAmount)}
                          <br />
                          Confidence: {prediction.confidence}%
                        </Alert>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Days remaining: {prediction.daysRemaining}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Profitability Analysis */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profitability Analysis
                  </Typography>
                  {insights.projectInsights.profitabilityAnalysis.map((analysis, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{analysis.projectName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTrendIcon(analysis.marginTrend)}
                          <Typography variant="body2">
                            {analysis.currentMargin.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={analysis.currentMargin}
                        color={analysis.currentMargin >= 20 ? 'success' : analysis.currentMargin >= 10 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Cost efficiency: ${analysis.costEfficiency.toFixed(2)}/hour
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Client Insights */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <People color="secondary" />
            <Typography variant="h6">Client Insights</Typography>
            <Badge badgeContent={insights.clientInsights.churnPredictions.length} color="warning">
              <Warning />
            </Badge>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Churn Predictions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Churn Risk Predictions
                  </Typography>
                  {insights.clientInsights.churnPredictions.map((prediction, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Client #{prediction.clientId}</Typography>
                        <Chip
                          label={prediction.riskLevel}
                          color={getRiskColor(prediction.riskLevel)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Risk Score: {prediction.riskScore}% | Time to churn: {prediction.timeToChurn}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Retention probability: {prediction.retentionProbability}%
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Expansion Opportunities */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expansion Opportunities
                  </Typography>
                  {insights.clientInsights.expansionOpportunities.map((opportunity, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Client #{opportunity.clientId}</Typography>
                        <Chip
                          label={opportunity.opportunityLevel}
                          color={opportunity.opportunityLevel === 'high' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" color="success.main" gutterBottom>
                        {formatCurrency(opportunity.potentialValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Factors: {opportunity.factors.join(', ')}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Resource Insights */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <People color="info" />
            <Typography variant="h6">Resource Insights</Typography>
            <Badge badgeContent={insights.resourceInsights.utilizationAnalysis.length} color="info">
              <Assessment />
            </Badge>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Utilization Analysis */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Employee Utilization Analysis
                  </Typography>
                  {insights.resourceInsights.utilizationAnalysis.map((analysis, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{analysis.employeeName}</Typography>
                        <Chip
                          label={`${analysis.utilization.toFixed(1)}%`}
                          color={analysis.utilization > 90 ? 'error' : analysis.utilization < 60 ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={analysis.utilization}
                        color={analysis.utilization > 90 ? 'error' : analysis.utilization < 60 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {analysis.billableHours}/{analysis.totalHours} hours billable | Efficiency: {analysis.efficiency}%
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Financial Insights */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AttachMoney color="success" />
            <Typography variant="h6">Financial Insights</Typography>
            <Chip
              label={`${insights.financialInsights.revenueForecast.confidence}% confidence`}
              color="success"
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Revenue Forecast */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Forecast
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {formatCurrency(insights.financialInsights.revenueForecast.totalForecast)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Growth rate: {insights.financialInsights.revenueForecast.growthRate}%
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Current Revenue</Typography>
                    <Typography variant="body2">
                      {formatCurrency(insights.financialInsights.revenueForecast.currentRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pipeline Revenue</Typography>
                    <Typography variant="body2">
                      {formatCurrency(insights.financialInsights.revenueForecast.pipelineRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Projected Revenue</Typography>
                    <Typography variant="body2">
                      {formatCurrency(insights.financialInsights.revenueForecast.projectedRevenue)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cash Flow Prediction */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cash Flow Prediction
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      {formatCurrency(insights.financialInsights.cashFlowPrediction.predictedCashFlow)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current: {formatCurrency(insights.financialInsights.cashFlowPrediction.currentCashFlow)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={insights.financialInsights.cashFlowPrediction.confidence}
                    color="primary"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Confidence: {insights.financialInsights.cashFlowPrediction.confidence}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Recommendations Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            Key Recommendations
          </Typography>
          <List>
            {[
              ...insights.projectInsights.overrunPredictions.flatMap(p => p.recommendations),
              ...insights.clientInsights.churnPredictions.flatMap(c => c.recommendations),
              ...insights.resourceInsights.utilizationAnalysis.flatMap(u => u.recommendations)
            ].slice(0, 5).map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Chip
                    label={recommendation.priority}
                    color={getPriorityColor(recommendation.priority)}
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={recommendation.message}
                  secondary={recommendation.action}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')} | 
          Generated by SupraAI with {insights.confidence}% confidence
        </Typography>
      </Box>
    </Box>
  );
};

export default SupraAIInsights;

