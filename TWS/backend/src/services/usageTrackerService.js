/**
 * Usage Tracker Service
 * Tracks system usage and user activity
 */

class UsageTrackerService {
  constructor() {
    this.initialized = false;
    this.usageData = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('📊 Usage Tracker Service initialized');
    this.initialized = true;
  }

  /**
   * Track user activity
   */
  async trackActivity(userId, activity, metadata = {}) {
    if (!this.initialized) return;

    const activityData = {
      userId,
      activity,
      metadata,
      timestamp: new Date().toISOString()
    };

    // Store activity data
    if (!this.usageData.has(userId)) {
      this.usageData.set(userId, []);
    }
    this.usageData.get(userId).push(activityData);

    return activityData;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId = null) {
    if (userId) {
      return {
        userId,
        activities: this.usageData.get(userId) || [],
        totalActivities: (this.usageData.get(userId) || []).length
      };
    }

    return {
      totalUsers: this.usageData.size,
      totalActivities: Array.from(this.usageData.values()).reduce((sum, activities) => sum + activities.length, 0),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.initialized;
  }

  /**
   * Get service metrics
   */
  async getMetrics() {
    return {
      status: 'active',
      initialized: this.initialized,
      trackedUsers: this.usageData.size,
      totalActivities: Array.from(this.usageData.values()).reduce((sum, activities) => sum + activities.length, 0)
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    this.usageData.clear();
    this.initialized = false;
    console.log('📊 Usage Tracker Service shut down');
  }
}

module.exports = new UsageTrackerService();
