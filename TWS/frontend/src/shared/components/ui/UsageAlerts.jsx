import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/Alert';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Folder, 
  HardDrive, 
  Zap,
  X,
  ExternalLink
} from 'lucide-react';
import usageTrackingService from '@/shared/services/business/usage-tracking.service';

const UsageAlerts = ({ onDismiss, showDismissButton = true }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageAlerts();
    
    // Subscribe to usage updates
    const unsubscribe = usageTrackingService.subscribe((usageData) => {
      if (usageData) {
        const newAlerts = usageTrackingService.checkUsageAlerts();
        setAlerts(newAlerts);
      }
    });

    return unsubscribe;
  }, []);

  const loadUsageAlerts = async () => {
    try {
      setLoading(true);
      const usageData = await usageTrackingService.getCachedUsage();
      const newAlerts = usageTrackingService.checkUsageAlerts();
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error loading usage alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'projects': return <Folder className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      case 'apiCalls': return <Zap className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <TrendingUp className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/billing/upgrade';
  };

  const handleViewUsage = () => {
    window.location.href = '/billing/usage';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={getAlertVariant(alert.type)}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="flex-1">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(alert.metric)}
                    <span className="font-medium capitalize">{alert.metric}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        alert.type === 'error' ? 'border-red-200 text-red-600' :
                        alert.type === 'warning' ? 'border-yellow-200 text-yellow-600' :
                        'border-blue-200 text-blue-600'
                      }
                    >
                      {alert.type}
                    </Badge>
                  </div>
                  
                  {showDismissButton && onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(alert)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <p className="mt-2 text-sm">
                  {alert.message}
                </p>
                
                <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Current: {alert.current}</span>
                  <span>Limit: {alert.limit === -1 ? 'Unlimited' : alert.limit}</span>
                  {alert.remaining !== undefined && (
                    <span>Remaining: {alert.remaining}</span>
                  )}
                  {alert.overage > 0 && (
                    <span className="text-red-600">
                      Overage: {alert.overage} (${alert.overageCost?.toFixed(2)})
                    </span>
                  )}
                </div>
                
                {alert.type === 'error' && (
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" onClick={handleUpgrade}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Upgrade Plan
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleViewUsage}>
                      View Usage
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default UsageAlerts;
