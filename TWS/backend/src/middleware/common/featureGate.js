const SubscriptionPlan = require('../../models/SubscriptionPlan');
const Tenant = require('../../models/Tenant');
const usageTrackerService = require('../../services/usageTrackerService');

/**
 * Feature Gate Middleware
 * Enforces subscription plan limits and feature access
 */

/**
 * Check if tenant has access to a specific feature
 * @param {string} featureName - Name of the feature to check
 * @returns {Function} Express middleware function
 */
const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant and subscription plan
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Check if feature is available in the plan
      if (!subscriptionPlan.hasFeature(featureName)) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureName}' is not available in your current plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentPlan: tenant.subscription.plan,
          upgradeRequired: true
        });
      }

      // Add plan info to request for use in route handlers
      req.subscriptionPlan = subscriptionPlan;
      req.tenant = tenant;
      
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check usage limits for a specific metric
 * @param {string} metric - Usage metric to check (users, projects, storage, apiCalls)
 * @param {number} requestedAmount - Amount being requested (optional, defaults to 1)
 * @returns {Function} Express middleware function
 */
const checkUsageLimit = (metric, requestedAmount = 1) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant and subscription plan
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Get current usage
      const currentUsage = await usageTrackerService.getCurrentUsage(tenantId, metric);
      const limit = subscriptionPlan.getUsageLimit(metric);
      
      // Check if limit is unlimited (-1)
      if (limit === -1) {
        req.subscriptionPlan = subscriptionPlan;
        req.tenant = tenant;
        req.currentUsage = currentUsage;
        return next();
      }

      // Check if adding requested amount would exceed limit
      if (currentUsage + requestedAmount > limit) {
        const overage = currentUsage + requestedAmount - limit;
        const overageCost = subscriptionPlan.calculateOverageCost(currentUsage + requestedAmount, metric);
        
        return res.status(403).json({
          success: false,
          message: `Usage limit exceeded for ${metric}`,
          code: 'USAGE_LIMIT_EXCEEDED',
          currentUsage,
          limit,
          requestedAmount,
          overage,
          overageCost,
          upgradeRequired: true,
          currentPlan: tenant.subscription.plan
        });
      }

      // Add usage info to request
      req.subscriptionPlan = subscriptionPlan;
      req.tenant = tenant;
      req.currentUsage = currentUsage;
      req.usageLimit = limit;
      req.remainingUsage = limit - currentUsage;
      
      next();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check multiple usage limits at once
 * @param {Object} limits - Object with metric names as keys and requested amounts as values
 * @returns {Function} Express middleware function
 */
const checkMultipleUsageLimits = (limits) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant and subscription plan
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      const usageChecks = {};
      const exceededLimits = [];

      // Check each limit
      for (const [metric, requestedAmount] of Object.entries(limits)) {
        const currentUsage = await usageTrackerService.getCurrentUsage(tenantId, metric);
        const limit = subscriptionPlan.getUsageLimit(metric);
        
        usageChecks[metric] = {
          currentUsage,
          limit,
          requestedAmount,
          remaining: limit === -1 ? -1 : limit - currentUsage
        };

        // Check if limit is not unlimited and would be exceeded
        if (limit !== -1 && currentUsage + requestedAmount > limit) {
          const overage = currentUsage + requestedAmount - limit;
          const overageCost = subscriptionPlan.calculateOverageCost(currentUsage + requestedAmount, metric);
          
          exceededLimits.push({
            metric,
            currentUsage,
            limit,
            requestedAmount,
            overage,
            overageCost
          });
        }
      }

      // If any limits are exceeded, return error
      if (exceededLimits.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Usage limits exceeded',
          code: 'USAGE_LIMITS_EXCEEDED',
          exceededLimits,
          upgradeRequired: true,
          currentPlan: tenant.subscription.plan
        });
      }

      // Add usage info to request
      req.subscriptionPlan = subscriptionPlan;
      req.tenant = tenant;
      req.usageChecks = usageChecks;
      
      next();
    } catch (error) {
      console.error('Error checking multiple usage limits:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if tenant can perform an action based on plan restrictions
 * @param {Object} restrictions - Object defining restrictions for different plans
 * @returns {Function} Express middleware function
 */
const checkPlanRestrictions = (restrictions) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant and subscription plan
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Check restrictions for current plan
      const planRestrictions = restrictions[tenant.subscription.plan] || restrictions['default'];
      
      if (planRestrictions) {
        // Check if action is restricted
        if (planRestrictions.restricted === true) {
          return res.status(403).json({
            success: false,
            message: planRestrictions.message || 'This action is not available in your current plan',
            code: 'ACTION_RESTRICTED',
            currentPlan: tenant.subscription.plan,
            upgradeRequired: true
          });
        }

        // Check custom restrictions
        if (planRestrictions.customCheck && typeof planRestrictions.customCheck === 'function') {
          const customResult = await planRestrictions.customCheck(req, tenant, subscriptionPlan);
          if (!customResult.allowed) {
            return res.status(403).json({
              success: false,
              message: customResult.message || 'Custom restriction check failed',
              code: 'CUSTOM_RESTRICTION_FAILED',
              currentPlan: tenant.subscription.plan,
              upgradeRequired: customResult.upgradeRequired || true
            });
          }
        }
      }

      req.subscriptionPlan = subscriptionPlan;
      req.tenant = tenant;
      
      next();
    } catch (error) {
      console.error('Error checking plan restrictions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to track API usage
 * @returns {Function} Express middleware function
 */
const trackApiUsage = () => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (tenantId) {
        // Track API call
        await usageTrackerService.trackUsage(tenantId, 'apiCalls', 1);
      }
      
      next();
    } catch (error) {
      console.error('Error tracking API usage:', error);
      // Don't fail the request if tracking fails
      next();
    }
  };
};

/**
 * Middleware to check subscription status
 * @returns {Function} Express middleware function
 */
const checkSubscriptionStatus = () => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      // Check subscription status
      if (tenant.subscription.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your subscription has been suspended. Please contact support.',
          code: 'SUBSCRIPTION_SUSPENDED',
          subscriptionStatus: tenant.subscription.status
        });
      }

      if (tenant.subscription.status === 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Your subscription has been cancelled. Please renew to continue using the service.',
          code: 'SUBSCRIPTION_CANCELLED',
          subscriptionStatus: tenant.subscription.status
        });
      }

      if (tenant.subscription.status === 'past_due') {
        return res.status(403).json({
          success: false,
          message: 'Your subscription payment is past due. Please update your payment method.',
          code: 'SUBSCRIPTION_PAST_DUE',
          subscriptionStatus: tenant.subscription.status
        });
      }

      // Check trial status
      if (tenant.subscription.status === 'trialing') {
        const trialEndDate = new Date(tenant.subscription.trialEndDate);
        const now = new Date();
        
        if (now > trialEndDate) {
          return res.status(403).json({
            success: false,
            message: 'Your trial period has expired. Please upgrade to continue using the service.',
            code: 'TRIAL_EXPIRED',
            trialEndDate: tenant.subscription.trialEndDate
          });
        }
      }

      req.tenant = tenant;
      next();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to enforce rate limiting based on plan
 * @param {Object} rateLimits - Rate limits for different plans
 * @returns {Function} Express middleware function
 */
const enforceRateLimit = (rateLimits) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }

      // Get tenant and subscription plan
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Get rate limit for current plan
      const planRateLimit = rateLimits[tenant.subscription.plan] || rateLimits['default'];
      
      if (planRateLimit) {
        // Check current rate limit usage
        const currentUsage = await usageTrackerService.getRateLimitUsage(tenantId, req.route.path);
        
        if (currentUsage >= planRateLimit.requests) {
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            limit: planRateLimit.requests,
            window: planRateLimit.window,
            currentPlan: tenant.subscription.plan,
            upgradeRequired: true
          });
        }

        // Track rate limit usage
        await usageTrackerService.trackRateLimitUsage(tenantId, req.route.path, planRateLimit.window);
      }

      req.subscriptionPlan = subscriptionPlan;
      req.tenant = tenant;
      
      next();
    } catch (error) {
      console.error('Error enforcing rate limit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Utility function to get tenant subscription info
 * @param {string} tenantId - Tenant ID
 * @returns {Object} Subscription information
 */
const getTenantSubscriptionInfo = async (tenantId) => {
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const subscriptionPlan = await SubscriptionPlan.findOne({ slug: tenant.subscription.plan });
    if (!subscriptionPlan) {
      throw new Error('Subscription plan not found');
    }

    // Get current usage for all metrics
    const usage = await usageTrackerService.getAllCurrentUsage(tenantId);

    return {
      tenant,
      subscriptionPlan,
      usage,
      limits: {
        users: subscriptionPlan.getUsageLimit('users'),
        projects: subscriptionPlan.getUsageLimit('projects'),
        storage: subscriptionPlan.getUsageLimit('storage'),
        apiCalls: subscriptionPlan.getUsageLimit('apiCalls')
      },
      features: {
        advancedAnalytics: subscriptionPlan.hasFeature('advancedAnalytics'),
        customIntegrations: subscriptionPlan.hasFeature('customIntegrations'),
        apiAccess: subscriptionPlan.hasFeature('apiAccess'),
        webhooks: subscriptionPlan.hasFeature('webhooks'),
        customBranding: subscriptionPlan.hasFeature('customBranding'),
        whiteLabel: subscriptionPlan.hasFeature('whiteLabel'),
        prioritySupport: subscriptionPlan.hasFeature('prioritySupport'),
        dedicatedSupport: subscriptionPlan.hasFeature('dedicatedSupport'),
        sso: subscriptionPlan.hasFeature('sso'),
        advancedSecurity: subscriptionPlan.hasFeature('advancedSecurity'),
        dataExport: subscriptionPlan.hasFeature('dataExport'),
        customDomain: subscriptionPlan.hasFeature('customDomain')
      }
    };
  } catch (error) {
    console.error('Error getting tenant subscription info:', error);
    throw error;
  }
};

module.exports = {
  checkFeatureAccess,
  checkUsageLimit,
  checkMultipleUsageLimits,
  checkPlanRestrictions,
  trackApiUsage,
  checkSubscriptionStatus,
  enforceRateLimit,
  getTenantSubscriptionInfo
};
