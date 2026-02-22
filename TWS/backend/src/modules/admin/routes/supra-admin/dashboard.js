/**
 * Supra Admin - Dashboard & Analytics routes
 */

const { express } = require('./shared');
const router = express.Router();
const {
  requirePlatformPermission,
  PLATFORM_PERMISSIONS,
  Tenant,
  User,
  systemMonitoringService
} = require('./shared');

// Get dashboard overview
router.get('/dashboard', requirePlatformPermission(PLATFORM_PERMISSIONS.ANALYTICS.READ), async (req, res) => {
  const startTime = Date.now();
  try {
    const baseFilter = { status: { $ne: 'cancelled' } };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      cancelledTenants,
      previousTotalTenants,
      previousActiveTenants,
      previousTrialTenants,
      recentTenants,
      topTenants,
      totalUsers
    ] = await Promise.all([
      Tenant.countDocuments(baseFilter),
      Tenant.countDocuments({ ...baseFilter, status: 'active' }),
      Tenant.countDocuments({ ...baseFilter, 'subscription.plan': 'trial' }),
      Tenant.countDocuments({ ...baseFilter, status: 'suspended' }),
      Tenant.countDocuments({ status: 'cancelled' }),
      Tenant.countDocuments({ ...baseFilter, createdAt: { $lt: thirtyDaysAgo } }),
      Tenant.countDocuments({ ...baseFilter, status: 'active', createdAt: { $lt: thirtyDaysAgo } }),
      Tenant.countDocuments({ ...baseFilter, 'subscription.plan': 'trial', createdAt: { $lt: thirtyDaysAgo } }),
      Tenant.find(baseFilter).sort({ createdAt: -1 }).limit(5).select('name createdAt status').lean(),
      Tenant.find({ ...baseFilter, status: 'active' }).sort({ createdAt: -1 }).limit(5).select('name slug plan status').lean(),
      User.countDocuments({ status: 'active' })
    ]);

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : null;
      if (current === 0 && previous === 0) return null;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const totalTenantsChange = calculatePercentageChange(totalTenants, previousTotalTenants);
    const activeTenantsChange = calculatePercentageChange(activeTenants, previousActiveTenants);
    const trialTenantsChange = calculatePercentageChange(trialTenants, previousTrialTenants);

    const topTenantsWithRevenue = topTenants.map((tenant) => ({
      ...tenant,
      totalRevenue: 0,
      invoiceCount: 0,
      status: tenant.status || 'active'
    }));

    const currentRevenue = topTenantsWithRevenue.reduce((sum, t) => sum + (t.totalRevenue || 0), 0);
    const actualRevenue = currentRevenue > 0 ? currentRevenue : null;
    const revenueChange = totalTenantsChange !== null ? totalTenantsChange : null;

    let systemHealthData = null;
    const systemHealthPromise = systemMonitoringService.getSystemHealth()
      .then(data => { systemHealthData = data; })
      .catch(err => {
        console.warn('System health check failed (non-critical):', err.message);
        systemHealthData = null;
      });

    try {
      await Promise.race([
        systemHealthPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000))
      ]);
    } catch (err) {
      // Ignore
    }

    const systemHealth = {
      totalUsers: totalUsers > 0 ? totalUsers : null,
      avgResponseTime: systemHealthData?.responseTime && systemHealthData.responseTime > 0
        ? systemHealthData.responseTime
        : null
    };

    const dashboardData = {
      overview: {
        totalTenants,
        activeTenants,
        totalRevenue: actualRevenue,
        monthlyGrowth: revenueChange,
        trialTenants,
        cancelledTenants,
        totalTenantsChange,
        activeTenantsChange,
        trialTenantsChange
      },
      tenantStats: {
        active: activeTenants,
        trial: trialTenants,
        suspended: suspendedTenants,
        cancelled: cancelledTenants
      },
      systemHealth,
      recentActivity: {
        recentTenants: recentTenants.length > 0
          ? recentTenants.map(t => ({
              name: t.name || 'Unnamed Tenant',
              createdAt: t.createdAt,
              status: t.status
            }))
          : []
      },
      topTenants: {
        topRevenue: topTenantsWithRevenue
      }
    };

    const loadTime = Date.now() - startTime;
    console.log(`✅ Dashboard loaded in ${loadTime}ms`);
    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get system-wide analytics
router.get('/analytics', requirePlatformPermission(PLATFORM_PERMISSIONS.ANALYTICS.READ), async (req, res) => {
  try {
    const analytics = { message: 'Analytics service removed' };
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get ERP statistics
router.get('/erp/stats', requirePlatformPermission(PLATFORM_PERMISSIONS.ANALYTICS.READ), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const categoryPipeline = [
      { $group: { _id: '$erpCategory', count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ];
    const newTenantsPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$erpCategory', newCount: { $sum: 1 } } }
    ];
    const modulePipeline = [
      { $unwind: '$erpModules' },
      { $group: { _id: '$erpModules', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const [categoryStats, newTenantsByCategory, moduleStats] = await Promise.all([
      Tenant.aggregate(categoryPipeline),
      Tenant.aggregate(newTenantsPipeline),
      Tenant.aggregate(modulePipeline)
    ]);

    res.json({
      success: true,
      data: {
        categoryDistribution: categoryStats,
        newTenantsByCategory,
        moduleUsage: moduleStats,
        timeRange,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get ERP stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ERP statistics',
      error: error.message
    });
  }
});

module.exports = router;
