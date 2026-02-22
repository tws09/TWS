import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Alert, AlertDescription } from './ui/Alert';
import { 
  Lock, 
  Crown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  className = ""
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkFeatureAccess();
  }, [feature]);

  const checkFeatureAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get subscription info from localStorage or API
      const subscriptionData = localStorage.getItem('subscriptionInfo');
      if (subscriptionData) {
        const subscription = JSON.parse(subscriptionData);
        setSubscriptionInfo(subscription);
        
        // Check if feature is available in current plan
        const hasFeature = subscription.features?.[feature] || false;
        setHasAccess(hasFeature);
      } else {
        // If no subscription data, assume no access
        setHasAccess(false);
      }
    } catch (err) {
      setError(err.message);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureInfo = (featureName) => {
    const featureMap = {
      advancedAnalytics: {
        name: 'Advanced Analytics',
        description: 'Access to detailed analytics, custom reports, and data visualization',
        icon: <TrendingUp className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      customIntegrations: {
        name: 'Custom Integrations',
        description: 'Connect with third-party tools and build custom workflows',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      apiAccess: {
        name: 'API Access',
        description: 'Full API access for custom integrations and automation',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      webhooks: {
        name: 'Webhooks',
        description: 'Real-time notifications and event-driven integrations',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      customBranding: {
        name: 'Custom Branding',
        description: 'Customize the interface with your brand colors and logo',
        icon: <Crown className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      whiteLabel: {
        name: 'White Label',
        description: 'Complete white-label solution with custom domain',
        icon: <Crown className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      },
      prioritySupport: {
        name: 'Priority Support',
        description: 'Faster response times and dedicated support channels',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      dedicatedSupport: {
        name: 'Dedicated Support',
        description: 'Dedicated account manager and 24/7 support',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      },
      sso: {
        name: 'Single Sign-On',
        description: 'Enterprise SSO integration with SAML and OAuth',
        icon: <Lock className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      },
      advancedSecurity: {
        name: 'Advanced Security',
        description: 'Enhanced security features and compliance tools',
        icon: <Lock className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      },
      dataExport: {
        name: 'Data Export',
        description: 'Export your data in various formats',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      customDomain: {
        name: 'Custom Domain',
        description: 'Use your own domain for the application',
        icon: <Crown className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      },
      aiPoweredInsights: {
        name: 'AI-Powered Insights',
        description: 'Advanced AI analytics and predictive insights',
        icon: <TrendingUp className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      hrPerformanceIntegration: {
        name: 'HR Performance Integration',
        description: 'Advanced employee performance tracking and analytics',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      clientEngagementModule: {
        name: 'Client Engagement Module',
        description: 'Advanced client health tracking and engagement tools',
        icon: <CheckCircle className="h-5 w-5" />,
        requiredPlan: 'Professional'
      },
      partnerManagement: {
        name: 'Partner Management',
        description: 'Manage reseller partners and commission tracking',
        icon: <Crown className="h-5 w-5" />,
        requiredPlan: 'Enterprise'
      }
    };

    return featureMap[featureName] || {
      name: featureName,
      description: 'This feature is not available in your current plan',
      icon: <Lock className="h-5 w-5" />,
      requiredPlan: 'Professional'
    };
  };

  const handleUpgrade = () => {
    // Navigate to billing/upgrade page
    window.location.href = '/billing/upgrade';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const featureInfo = getFeatureInfo(feature);

  return (
    <div className={className}>
      <Card className="border-dashed border-2 border-gray-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              {featureInfo.icon}
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-700">
            {featureInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 text-sm">
            {featureInfo.description}
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {featureInfo.requiredPlan} Plan Required
            </Badge>
            {subscriptionInfo && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Current: {subscriptionInfo.plan?.name || 'Unknown'}
              </Badge>
            )}
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              This feature is not available in your current subscription plan. 
              Upgrade to {featureInfo.requiredPlan} or higher to access this feature.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center space-x-3">
            <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for feature gating
export const withFeatureGate = (feature, options = {}) => {
  return (WrappedComponent) => {
    return (props) => (
      <FeatureGate feature={feature} {...options}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
};

// Hook for checking feature access
export const useFeatureAccess = (feature) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        
        const subscriptionData = localStorage.getItem('subscriptionInfo');
        if (subscriptionData) {
          const subscription = JSON.parse(subscriptionData);
          setSubscriptionInfo(subscription);
          
          const hasFeature = subscription.features?.[feature] || false;
          setHasAccess(hasFeature);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  return { hasAccess, loading, subscriptionInfo };
};

// Component for displaying feature comparison
export const FeatureComparison = ({ features = [] }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    const subscriptionData = localStorage.getItem('subscriptionInfo');
    if (subscriptionData) {
      setSubscriptionInfo(JSON.parse(subscriptionData));
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Feature Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const featureInfo = getFeatureInfo(feature);
          const hasAccess = subscriptionInfo?.features?.[feature] || false;
          
          return (
            <div key={feature} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${hasAccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {hasAccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{featureInfo.name}</h4>
                <p className="text-xs text-gray-600">{featureInfo.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureGate;
