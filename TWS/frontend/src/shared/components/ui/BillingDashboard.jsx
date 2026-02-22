import React, { useState, useEffect } from 'react';
import { billingService } from '@/shared/services/business/billing.service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Folder,
  Zap
} from 'lucide-react';

const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usageData, plansData, invoicesData] = await Promise.all([
        billingService.getUsage(),
        billingService.getPlans(),
        billingService.getInvoices('all', 10, 0)
      ]);

      setUsage(usageData.data);
      setPlans(plansData.data.plans);
      setInvoices(invoicesData.data.invoices);
      setCurrentPlan(usageData.data.plan);
    } catch (err) {
      setError(err.message);
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planSlug) => {
    try {
      await billingService.upgradePlan(planSlug, 'monthly');
      loadBillingData(); // Refresh data
    } catch (err) {
      console.error('Error upgrading plan:', err);
    }
  };

  const handleDowngrade = async (planSlug) => {
    try {
      await billingService.downgradePlan(planSlug, 'monthly', 'end_of_period');
      loadBillingData(); // Refresh data
    } catch (err) {
      console.error('Error downgrading plan:', err);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      await billingService.downloadInvoice(invoiceId);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
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
        <div className="text-red-600 mb-4">Error loading billing data: {error}</div>
        <Button onClick={loadBillingData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription and monitor usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {currentPlan?.name} Plan
          </Badge>
          <Button onClick={loadBillingData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Plan & Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{currentPlan?.name}</h3>
                <p className="text-gray-600">${currentPlan?.pricing?.monthly}/month</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Billing Cycle:</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Billing:</span>
                  <span className="font-medium">
                    {new Date(usage?.tenant?.subscription?.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Usage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Overage Cost:</span>
                <span className="font-bold text-lg">
                  ${usage?.totalOverageCost?.toFixed(2) || 0}
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(usage?.usage || {}).map(([metric, data]) => (
                  <div key={metric} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{metric}:</span>
                      <span className={getUsageColor(data.percentage)}>
                        {data.current}/{data.limit === -1 ? '∞' : data.limit}
                      </span>
                    </div>
                    <Progress 
                      value={data.percentage} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Latest Invoice
              </Button>
              <Button className="w-full" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Payment Methods
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Usage History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(usage?.usage || {}).map(([metric, data]) => (
              <div key={metric} className="space-y-3">
                <div className="flex items-center space-x-2">
                  {metric === 'users' && <Users className="h-5 w-5 text-blue-600" />}
                  {metric === 'projects' && <Folder className="h-5 w-5 text-green-600" />}
                  {metric === 'storage' && <TrendingUp className="h-5 w-5 text-purple-600" />}
                  {metric === 'apiCalls' && <Zap className="h-5 w-5 text-yellow-600" />}
                  <h3 className="font-medium capitalize">{metric}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-medium">{data.current}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Limit:</span>
                    <span className="font-medium">
                      {data.limit === -1 ? 'Unlimited' : data.limit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Usage:</span>
                    <span className={`font-medium ${getUsageColor(data.percentage)}`}>
                      {data.percentage.toFixed(1)}%
                    </span>
                  </div>
                  {data.overage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Overage:</span>
                      <span className="font-medium text-red-600">
                        {data.overage} (${data.overageCost.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageBarColor(data.percentage)}`}
                    style={{ width: `${Math.min(data.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.slug} 
                className={`border rounded-lg p-6 ${
                  plan.isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {plan.isPopular && (
                      <Badge className="bg-blue-600">Popular</Badge>
                    )}
                    {plan.isCurrentPlan && (
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-3xl font-bold">
                    ${plan.pricing.monthly}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span>{plan.features.maxUsers === -1 ? 'Unlimited' : plan.features.maxUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects:</span>
                      <span>{plan.features.maxProjects === -1 ? 'Unlimited' : plan.features.maxProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span>{plan.features.maxStorage}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Calls:</span>
                      <span>{plan.features.maxApiCalls === -1 ? 'Unlimited' : plan.features.maxApiCalls.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    {plan.isCurrentPlan ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.upgradeRequired ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.slug)}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    ) : plan.downgradePossible ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDowngrade(plan.slug)}
                      >
                        Downgrade to {plan.name}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium">{invoice.number}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(invoice.period.start).toLocaleDateString()} - {new Date(invoice.period.end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold">${invoice.amount.toFixed(2)}</div>
                    <Badge 
                      variant="outline"
                      className={
                        invoice.status === 'paid' ? 'border-green-200 text-green-600' :
                        invoice.status === 'pending' ? 'border-yellow-200 text-yellow-600' :
                        'border-red-200 text-red-600'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadInvoice(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;
