/**
 * Service Layer Index
 * 
 * This file provides a centralized, organized interface to all services in the application.
 * Services are organized by category for better navigation and maintainability.
 * 
 * Structure:
 * - Core: Infrastructure and foundational services
 * - Auth: Authentication & authorization services
 * - Tenant: Tenant management services
 * - Finance: Financial services
 * - HR: Human Resources services
 * - SoftwareHouse: Software House services
 * - Integrations: External integration services
 * - Analytics: Analytics & reporting services
 * - Notifications: Notification services
 * - Compliance: Compliance & security services
 * - Utilities: Utility and helper services
 */

// ============================================================================
// CORE SERVICES - Infrastructure and foundational services
// ============================================================================
const cacheService = require('./core/cache.service');
const connectionPoolService = require('./core/connection-pool.service');
const databaseProvisioningService = require('./core/database-provisioning.service');
const encryptionService = require('./core/encryption.service');
const e2eEncryptionService = require('./core/e2e-encryption.service');
const redisService = require('./core/redis.service');
const socketHandler = require('./core/socket-handler.service');
const loggerService = require('./core/logger.service');

// ============================================================================
// AUTH SERVICES - Authentication & authorization
// ============================================================================
const jwtService = require('./auth/jwt.service');
const tokenBlacklistService = require('./auth/token-blacklist.service');

// ============================================================================
// TENANT SERVICES - Tenant management
// ============================================================================
const tenantService = require('./tenant/tenant.service');
const tenantLifecycleService = require('./tenant/tenant-lifecycle.service');
const tenantProvisioningService = require('./tenantProvisioningService');
const tenantSwitchingService = require('./tenant/tenant-switching.service');
const tenantDataService = require('./tenant/tenant-data.service');
const tenantOrgService = require('./tenant/tenant-org.service');
const tenantConnectionPool = require('./tenant/tenant-connection-pool.service');
const tenantModelService = require('./tenant/tenant-model.service');
const selfServeSignupService = require('./tenant/self-serve-signup.service');
const platformAdminAccessService = require('./tenant/platform-admin-access.service');

// ============================================================================
// MODULE API - Cross-module communication (no direct model access across modules)
// ============================================================================
const moduleApi = require('./module-api');

// ============================================================================
// FINANCE SERVICES - Financial operations
// ============================================================================
const billingService = require('./billingService');
const financeDashboardService = require('./financeDashboardService');
const financeExportService = require('./financeExportService');
const financeRealtimeService = require('./financeRealtimeService');
const equityCalculationService = require('./equityCalculationService');
// Finance subfolder services
const financeAccountsPayable = require('./finance/accountsPayableService');
const financeAccountsReceivable = require('./finance/accountsReceivableService');
const financeBanking = require('./finance/bankingService');
const financeBillingEngine = require('./finance/billing-engine.service');
const financeCashFlow = require('./finance/cashFlowService');
const financeChartOfAccounts = require('./finance/chartOfAccountsService');
const financeProjectCosting = require('./finance/project-costing.service');

// ============================================================================
// HR SERVICES - Human Resources
// ============================================================================
const hrPerformanceService = require('./hrPerformanceService');
const aiPayrollService = require('./aiPayrollService');
const attendanceService = require('./attendanceService');
const attendanceIntegrationService = require('./attendanceIntegrationService');
const attendanceSocketService = require('./attendanceSocketService');
const biometricService = require('./biometricService');
// HR subfolder services
const hrAttendance = require('./hr/attendance.service');
const hrEmployee = require('./hr/employee.service');
const hrPayroll = require('./hr/payroll.service');
const hrRecruitment = require('./hr/recruitment.service');

// ============================================================================
// SOFTWARE HOUSE SERVICES - Software House specific
// ============================================================================
const softwareHouseCodeQuality = require('./softwareHouse/code-quality.service');
const softwareHouseTimeTracking = require('./softwareHouse/time-tracking.service');

// ============================================================================
// INTEGRATION SERVICES - External integrations
// ============================================================================
const calendarIntegration = require('./integrations/calendar-integration.service');
const calendarService = require('./integrations/calendar.service');
const emailService = require('./integrations/email.service');
const emailValidationService = require('./integrations/email-validation.service');
const emailVerificationService = require('./integrations/email-verification.service');
const integrationService = require('./integrations/integration.service');
const paymentService = require('./integrations/payment.service');
const platformIntegration = require('./integrations/platform-integration.service');
const portalERPIntegrationService = require('./integrations/portal-erp-integration.service');
const projectIntegrationService = require('./integrations/project-integration.service');
const webrtcService = require('./integrations/webrtc.service');
const timezoneService = require('./integrations/timezone.service');
// Integrations subfolder
const integrationsBanking = require('./integrations/banking-integration.service');
const integrationsTimeTracking = require('./integrations/time-tracking-integration.service');

// ============================================================================
// ANALYTICS SERVICES - Analytics & reporting
// ============================================================================
const analyticsService = require('./analytics/analytics.service');
const dataWarehouseService = require('./analytics/data-warehouse.service');
const departmentDashboardService = require('./analytics/department-dashboard.service');
const meetingAnalyticsService = require('./analytics/meeting-analytics.service');
const metricsService = require('./analytics/metrics.service');
const aiInsightsService = require('./analytics/ai-insights.service');

// ============================================================================
// NOTIFICATION SERVICES - Notifications
// ============================================================================
const notificationService = require('./notifications/notification.service');
const notificationBatchingService = require('./notifications/notification-batching.service');
const messagingNotificationService = require('./notifications/messaging-notification.service');
const meetingReminderService = require('./notifications/meeting-reminder.service');
const pushNotificationService = require('./notifications/push-notification.service');

// ============================================================================
// COMPLIANCE SERVICES - Compliance & security
// ============================================================================
const auditService = require('./compliance/audit.service');
const auditLogService = require('./compliance/audit-log.service');
const complianceService = require('./compliance/compliance.service');
const ferpaComplianceService = require('./compliance/ferpa-compliance.service');
const gdprDataDeletionService = require('./compliance/gdpr-data-deletion.service');
const gdprDataExportService = require('./compliance/gdpr-data-export.service');
const retentionService = require('./compliance/retention.service');

// ============================================================================
// BUSINESS SERVICES - Core business logic
// ============================================================================
const projectProfitabilityService = require('./projectProfitabilityService');
const clientHealthService = require('./clientHealthService');
const usageTrackerService = require('./usageTrackerService');
const masterERPService = require('./masterERPService');
const partnerService = require('./partnerService');
const pricingService = require('./pricingService');

// ============================================================================
// UTILITY SERVICES - Utility and helper services
// ============================================================================
const fileService = require('./file.service');
const fileValidationService = require('./fileValidationService');
const exportService = require('./exportService');
const ganttChartService = require('./ganttChartService');
const messageForwardingService = require('./messageForwardingService');
const messagePaginationService = require('./messagePaginationService');
const onboardingChecklistService = require('./onboardingChecklistService');
const webhookService = require('./webhookService');
const websocketRateLimitService = require('./websocketRateLimitService');
const MonitoringWebSocketService = require('./MonitoringWebSocketService');
const StandaloneMonitoringService = require('./StandaloneMonitoringService');
const SystemMonitoringService = require('./SystemMonitoringService');
const sentryService = require('./sentryService');
const cachingService = require('./cachingService');

// ============================================================================
// NUCLEUS SERVICES - Nucleus-specific services
// ============================================================================
const nucleusAutoCalculationService = require('./nucleusAutoCalculationService');
const nucleusDateValidationService = require('./nucleusDateValidationService');
const nucleusOnboardingService = require('./nucleusOnboardingService');
const nucleusTemplateService = require('./nucleusTemplateService');

// ============================================================================
// SERVICE CONTAINER - Dependency injection and lifecycle management
// ============================================================================
class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize core services
      await this.registerService('cache', cacheService);
      await this.registerService('redis', redisService);
      
      // Initialize business services
      await this.registerService('projectProfitability', projectProfitabilityService);
      await this.registerService('hrPerformance', hrPerformanceService);
      await this.registerService('clientHealth', clientHealthService);
      await this.registerService('aiInsights', aiInsightsService);
      await this.registerService('tenantProvisioning', tenantProvisioningService);
      await this.registerService('usageTracker', usageTrackerService);
      
      // Initialize infrastructure services
      await this.registerService('email', emailService);
      await this.registerService('notification', notificationService);
      await this.registerService('auditLog', auditLogService);
      
      // Initialize integration services
      await this.registerService('payment', paymentService);
      await this.registerService('integration', integrationService);
      await this.registerService('webhook', webhookService);
      
      // Initialize utility services
      await this.registerService('file', fileService);
      await this.registerService('export', exportService);

      this.initialized = true;
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  async registerService(name, service) {
    try {
      if (typeof service?.initialize === 'function') {
        await service.initialize();
      }
      this.services.set(name, service);
      console.log(`✅ Service registered: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to register service ${name}:`, error);
      throw error;
    }
  }

  getService(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service not found: ${name}`);
    }
    return this.services.get(name);
  }

  hasService(name) {
    return this.services.has(name);
  }

  getAllServices() {
    return Array.from(this.services.keys());
  }

  async shutdown() {
    const shutdownPromises = Array.from(this.services.values()).map(async (service) => {
      if (typeof service?.shutdown === 'function') {
        try {
          await service.shutdown();
        } catch (error) {
          console.error(`Error shutting down service:`, error);
        }
      }
    });

    await Promise.all(shutdownPromises);
    this.services.clear();
    this.initialized = false;
    console.log('✅ All services shut down');
  }
}

const serviceContainer = new ServiceContainer();

// ============================================================================
// EXPORTS - Organized by category
// ============================================================================
module.exports = {
  // Service Manager
  ServiceManager: {
    async initialize() { return await serviceContainer.initialize(); },
    getService(name) { return serviceContainer.getService(name); },
    hasService(name) { return serviceContainer.hasService(name); },
    getAllServices() { return serviceContainer.getAllServices(); },
    async shutdown() { return await serviceContainer.shutdown(); }
  },
  
  // Module API - Cross-module communication
  moduleApi,

  // Core Services
  core: {
    cacheService,
    connectionPoolService,
    databaseProvisioningService,
    encryptionService,
    e2eEncryptionService,
    redisService,
    socketHandler,
    loggerService
  },
  
  // Auth Services
  auth: {
    jwtService,
    tokenBlacklistService
  },
  
  // Tenant Services
  tenant: {
    tenantService,
    tenantLifecycleService,
    tenantProvisioningService,
    tenantSwitchingService,
    tenantDataService,
    tenantOrgService,
    tenantConnectionPool,
    tenantModelService,
    selfServeSignupService,
    platformAdminAccessService
  },
  
  // Finance Services
  finance: {
    billingService,
    financeDashboardService,
    financeExportService,
    financeRealtimeService,
    equityCalculationService,
    accountsPayable: financeAccountsPayable,
    accountsReceivable: financeAccountsReceivable,
    banking: financeBanking,
    billingEngine: financeBillingEngine,
    cashFlow: financeCashFlow,
    chartOfAccounts: financeChartOfAccounts,
    projectCosting: financeProjectCosting
  },
  
  // HR Services
  hr: {
    hrPerformanceService,
    aiPayrollService,
    attendanceService,
    attendanceIntegrationService,
    attendanceSocketService,
    biometricService,
    attendance: hrAttendance,
    employee: hrEmployee,
    payroll: hrPayroll,
    recruitment: hrRecruitment
  },
  
  // Software House Services
  softwareHouse: {
    codeQuality: softwareHouseCodeQuality,
    timeTracking: softwareHouseTimeTracking
  },
  
  // Integration Services
  integrations: {
    calendarIntegration,
    calendarService,
    emailService,
    emailValidationService,
    emailVerificationService,
    integrationService,
    paymentService,
    platformIntegration,
    portalERPIntegrationService,
    projectIntegrationService,
    webrtcService,
    timezoneService,
    banking: integrationsBanking,
    timeTracking: integrationsTimeTracking
  },
  
  // Analytics Services
  analytics: {
    analyticsService,
    dataWarehouseService,
    departmentDashboardService,
    meetingAnalyticsService,
    metricsService,
    aiInsightsService
  },
  
  // Notification Services
  notifications: {
    notificationService,
    notificationBatchingService,
    messagingNotificationService,
    meetingReminderService,
    pushNotificationService
  },
  
  // Compliance Services
  compliance: {
    auditService,
    auditLogService,
    complianceService,
    ferpaComplianceService,
    gdprDataDeletionService,
    gdprDataExportService,
    retentionService
  },
  
  // Business Services
  business: {
    projectProfitabilityService,
    clientHealthService,
    usageTrackerService,
    masterERPService,
    partnerService,
    pricingService
  },
  
  // Utility Services
  utilities: {
    fileService,
    fileValidationService,
    exportService,
    ganttChartService,
    messageForwardingService,
    messagePaginationService,
    onboardingChecklistService,
    webhookService,
    websocketRateLimitService,
    MonitoringWebSocketService,
    StandaloneMonitoringService,
    SystemMonitoringService,
    sentryService,
    cachingService
  },
  
  // Nucleus Services
  nucleus: {
    nucleusAutoCalculationService,
    nucleusDateValidationService,
    nucleusOnboardingService,
    nucleusTemplateService
  },
  
  // Direct exports for backward compatibility
  projectProfitabilityService,
  hrPerformanceService,
  clientHealthService,
  aiInsightsService,
  tenantProvisioningService,
  usageTrackerService,
  emailService,
  notificationService,
  auditLogService,
  cacheService,
  paymentService,
  integrationService,
  webhookService,
  fileService,
  exportService
};
