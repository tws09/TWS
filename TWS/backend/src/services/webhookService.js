/**
 * Webhook Service
 * Manages webhook delivery and retry logic
 */

class WebhookService {
  constructor() {
    this.initialized = false;
    this.webhooks = new Map();
    this.deliveryQueue = [];
    this.retryQueue = [];
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    // Start delivery processor
    this.deliveryInterval = setInterval(() => {
      this.processDeliveryQueue();
    }, 5000); // Process every 5 seconds

    // Start retry processor
    this.retryInterval = setInterval(() => {
      this.processRetryQueue();
    }, 30000); // Process retries every 30 seconds

    console.log('🪝 Webhook Service initialized');
    this.initialized = true;
  }

  /**
   * Register webhook endpoint
   */
  async registerWebhook(config) {
    if (!this.initialized) throw new Error('Webhook service not initialized');

    const webhook = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: config.url,
      events: config.events || [],
      secret: config.secret,
      headers: config.headers || {},
      retryCount: config.retryCount || 3,
      timeout: config.timeout || 30000,
      status: 'active',
      createdAt: new Date().toISOString(),
      stats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        lastDelivery: null
      }
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Send webhook
   */
  async sendWebhook(webhookId, eventType, payload) {
    if (!this.initialized) throw new Error('Webhook service not initialized');

    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook '${webhookId}' not found`);
    }

    if (webhook.status !== 'active') {
      throw new Error(`Webhook '${webhookId}' is not active`);
    }

    if (!webhook.events.includes(eventType)) {
      throw new Error(`Webhook not configured for event '${eventType}'`);
    }

    const delivery = {
      id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      webhookId,
      eventType,
      payload,
      url: webhook.url,
      headers: webhook.headers,
      secret: webhook.secret,
      timeout: webhook.timeout,
      attempts: 0,
      maxAttempts: webhook.retryCount + 1,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.deliveryQueue.push(delivery);
    return delivery;
  }

  /**
   * Process delivery queue
   */
  async processDeliveryQueue() {
    if (this.deliveryQueue.length === 0) return;

    const delivery = this.deliveryQueue.shift();
    await this.attemptDelivery(delivery);
  }

  /**
   * Attempt webhook delivery
   */
  async attemptDelivery(delivery) {
    delivery.attempts++;
    delivery.lastAttemptAt = new Date().toISOString();

    try {
      // Simulate HTTP request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      // Mock success/failure (85% success rate)
      const isSuccess = Math.random() > 0.15;

      if (isSuccess) {
        delivery.status = 'delivered';
        delivery.deliveredAt = new Date().toISOString();
        delivery.responseStatus = 200;

        // Update webhook stats
        const webhook = this.webhooks.get(delivery.webhookId);
        if (webhook) {
          webhook.stats.totalDeliveries++;
          webhook.stats.successfulDeliveries++;
          webhook.stats.lastDelivery = new Date().toISOString();
        }
      } else {
        throw new Error('HTTP 500 - Internal Server Error');
      }
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error.message;
      delivery.responseStatus = 500;

      // Update webhook stats
      const webhook = this.webhooks.get(delivery.webhookId);
      if (webhook) {
        webhook.stats.totalDeliveries++;
        webhook.stats.failedDeliveries++;
        webhook.stats.lastDelivery = new Date().toISOString();
      }

      // Add to retry queue if attempts remaining
      if (delivery.attempts < delivery.maxAttempts) {
        delivery.nextRetryAt = new Date(Date.now() + (delivery.attempts * 60000)).toISOString(); // Exponential backoff
        this.retryQueue.push(delivery);
      }
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    const now = new Date().toISOString();
    const readyForRetry = this.retryQueue.filter(delivery => delivery.nextRetryAt <= now);

    for (const delivery of readyForRetry) {
      const index = this.retryQueue.indexOf(delivery);
      this.retryQueue.splice(index, 1);
      await this.attemptDelivery(delivery);
    }
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(webhookId) {
    if (!this.initialized) return null;
    return this.webhooks.get(webhookId) || null;
  }

  /**
   * List all webhooks
   */
  async listWebhooks() {
    if (!this.initialized) return [];
    return Array.from(this.webhooks.values());
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
    const webhooks = Array.from(this.webhooks.values());
    const totalDeliveries = webhooks.reduce((sum, wh) => sum + wh.stats.totalDeliveries, 0);
    const successfulDeliveries = webhooks.reduce((sum, wh) => sum + wh.stats.successfulDeliveries, 0);

    return {
      status: 'active',
      initialized: this.initialized,
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(wh => wh.status === 'active').length,
      queuedDeliveries: this.deliveryQueue.length,
      retryQueueSize: this.retryQueue.length,
      totalDeliveries,
      successfulDeliveries,
      successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries * 100).toFixed(2) : 0
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    if (this.deliveryInterval) {
      clearInterval(this.deliveryInterval);
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
    
    this.webhooks.clear();
    this.deliveryQueue = [];
    this.retryQueue = [];
    this.initialized = false;
    console.log('🪝 Webhook Service shut down');
  }
}

module.exports = new WebhookService();
