import React, { useState, useEffect } from 'react';
import { aiInsightsService } from '@/shared/services/analytics/ai-insights.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Alert, AlertDescription } from './ui/Alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users,
  Target
} from 'lucide-react';

const AIInsightsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const [insightsData, recommendationsData] = await Promise.all([
        aiInsightsService.getSummary(10),
        aiInsightsService.getRecommendations(null, null, 20)
      ]);

      setInsights(insightsData.data);
      setRecommendations(recommendationsData.data.recommendations);
    } catch (err) {
      setError(err.message);
      console.error('Error loading AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading AI insights: {error}</div>
        <Button onClick={loadInsights}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SupraAI Insights</h1>
          <p className="text-gray-600 mt-1">
            AI-powered business intelligence and recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            Confidence: {insights?.confidence || 0}%
          </Badge>
          <Button onClick={loadInsights} variant="outline">
            Refresh Insights
          </Button>
        </div>
      </div>

      {/* Key Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Overruns */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Project Overruns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights?.projectInsights?.overrunPredictions?.length || 0}
            </div>
            <p className="text-xs text-red-600">
              Projects at risk
            </p>
          </CardContent>
        </Card>

        {/* Churn Risk */}
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Churn Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {insights?.clientInsights?.churnPredictions?.length || 0}
            </div>
            <p className="text-xs text-yellow-600">
              Clients at risk
            </p>
          </CardContent>
        </Card>

        {/* Expansion Opportunities */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Expansion Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {insights?.clientInsights?.expansionOpportunities?.length || 0}
            </div>
            <p className="text-xs text-green-600">
              Growth opportunities
            </p>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Resource Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {insights?.resourceInsights?.utilizationAnalysis?.filter(r => r.utilization < 60 || r.utilization > 95).length || 0}
            </div>
            <p className="text-xs text-blue-600">
              Utilization issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 10).map((rec, index) => (
              <Alert key={index} className={getPriorityColor(rec.priority)}>
                <div className="flex items-start space-x-3">
                  {getPriorityIcon(rec.priority)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rec.message}</span>
                        <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-80">{rec.action}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.type}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Project Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights?.projectInsights?.overrunPredictions?.slice(0, 5).map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.projectName}</h4>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Predicted overrun: ${prediction.overrunAmount?.toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500">
                    {prediction.recommendations?.map((rec, i) => (
                      <div key={i}>• {rec.message}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Client Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights?.clientInsights?.churnPredictions?.slice(0, 5).map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Client {prediction.clientId}</h4>
                    <Badge 
                      variant="outline" 
                      className={
                        prediction.riskLevel === 'high' ? 'text-red-600 border-red-200' :
                        prediction.riskLevel === 'medium' ? 'text-yellow-600 border-yellow-200' :
                        'text-green-600 border-green-200'
                      }
                    >
                      {prediction.riskLevel} risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Risk Score: {prediction.riskScore}% | Retention: {prediction.retentionProbability}%
                  </p>
                  <div className="text-xs text-gray-500">
                    {prediction.recommendations?.map((rec, i) => (
                      <div key={i}>• {rec.message}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Forecast */}
      {insights?.financialInsights?.revenueForecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${insights.financialInsights.revenueForecast.currentRevenue?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${insights.financialInsights.revenueForecast.pipelineRevenue?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Pipeline Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${insights.financialInsights.revenueForecast.projectedRevenue?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Projected Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${insights.financialInsights.revenueForecast.totalForecast?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Forecast</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline">
                Growth Rate: {insights.financialInsights.revenueForecast.growthRate}%
              </Badge>
              <Badge variant="outline" className="ml-2">
                Confidence: {insights.financialInsights.revenueForecast.confidence}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
