/**
 * Integration Service
 * Manages external integrations and API connections
 */

class IntegrationService {
  constructor() {
    this.initialized = false;
    this.integrations = new Map();
    this.webhooks = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🔗 Integration Service initialized');
    this.initialized = true;
  }

  /**
   * Register an integration
   */
  async registerIntegration(name, config) {
    if (!this.initialized) throw new Error('Integration service not initialized');

    const integration = {
      name,
      config,
      status: 'active',
      registeredAt: new Date().toISOString(),
      lastUsed: null
    };

    this.integrations.set(name, integration);
    return integration;
  }

  /**
   * Get integration by name
   */
  async getIntegration(name) {
    if (!this.initialized) return null;
    return this.integrations.get(name) || null;
  }

  /**
   * List all integrations
   */
  async listIntegrations() {
    if (!this.initialized) return [];
    return Array.from(this.integrations.values());
  }

  /**
   * Test integration connection
   */
  async testIntegration(name) {
    if (!this.initialized) throw new Error('Integration service not initialized');

    const integration = this.integrations.get(name);
    if (!integration) {
      throw new Error(`Integration '${name}' not found`);
    }

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 500));

    const isSuccess = Math.random() > 0.2; // 80% success rate
    const result = {
      integration: name,
      status: isSuccess ? 'success' : 'failed',
      testedAt: new Date().toISOString(),
      message: isSuccess ? 'Connection successful' : 'Connection failed - check configuration'
    };

    if (isSuccess) {
      integration.lastUsed = new Date().toISOString();
    }

    return result;
  }

  /**
   * Register webhook
   */
  async registerWebhook(url, events, secret = null) {
    if (!this.initialized) throw new Error('Integration service not initialized');

    const webhook = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      events,
      secret,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastTriggered: null
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(webhookId, eventType, data) {
    if (!this.initialized) throw new Error('Integration service not initialized');

    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook '${webhookId}' not found`);
    }

    if (!webhook.events.includes(eventType)) {
      throw new Error(`Webhook not configured for event '${eventType}'`);
    }

    // Simulate webhook call
    const payload = {
      event: eventType,
      data,
      timestamp: new Date().toISOString(),
      webhookId
    };

    webhook.lastTriggered = new Date().toISOString();

    return {
      webhookId,
      status: 'sent',
      payload,
      sentAt: new Date().toISOString()
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
    const integrations = Array.from(this.integrations.values());
    const activeIntegrations = integrations.filter(int => int.status === 'active').length;
    const webhooks = Array.from(this.webhooks.values());
    const activeWebhooks = webhooks.filter(wh => wh.status === 'active').length;

    return {
      status: 'active',
      initialized: this.initialized,
      totalIntegrations: integrations.length,
      activeIntegrations,
      totalWebhooks: webhooks.length,
      activeWebhooks
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    this.integrations.clear();
    this.webhooks.clear();
    this.initialized = false;
    console.log('🔗 Integration Service shut down');
  }
}

module.exports = new IntegrationService();
