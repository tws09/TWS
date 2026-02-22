# Service Organization Mapping

This file maps all services to their target folders and new names.

## Core Services (core/)
- cacheService.js → cache.service.js
- connectionPoolService.js → connection-pool.service.js
- databaseProvisioningService.js → database-provisioning.service.js
- encryptionService.js → encryption.service.js
- e2eEncryptionService.js → e2e-encryption.service.js
- loggerService.js → logger.service.js (if exists)
- redisService.js → redis.service.js
- socketHandler.js → socket-handler.service.js

## Auth Services (auth/)
- jwtService.js → jwt.service.js
- tokenBlacklistService.js → token-blacklist.service.js

## Tenant Services (tenant/)
- tenantService.js → tenant.service.js
- tenantLifecycleService.js → tenant-lifecycle.service.js
- tenantProvisioningService/ → tenant-provisioning/ (keep folder structure)
- tenantSwitchingService.js → tenant-switching.service.js
- tenantDataService.js → tenant-data.service.js
- tenantOrgService.js → tenant-org.service.js
- tenantConnectionPool.js → tenant-connection-pool.service.js
- tenantModelService.js → tenant-model.service.js
- selfServeSignupService.js → self-serve-signup.service.js
- platformAdminAccessService.js → platform-admin-access.service.js

## Finance Services (finance/) - Already exists, just rename files
- accountsPayableService.js → accounts-payable.service.js
- accountsReceivableService.js → accounts-receivable.service.js
- bankingService.js → banking.service.js
- billingEngineService.js → billing-engine.service.js
- cashFlowService.js → cash-flow.service.js
- chartOfAccountsService.js → chart-of-accounts.service.js
- projectCostingService.js → project-costing.service.js
- billingService.js → billing.service.js (root)
- financeDashboardService.js → finance-dashboard.service.js
- financeExportService.js → finance-export.service.js
- financeRealtimeService.js → finance-realtime.service.js

## HR Services (hr/) - Already exists, just rename files
- attendanceService.js → attendance.service.js
- employeeService.js → employee.service.js
- payrollService.js → payroll.service.js
- recruitmentService.js → recruitment.service.js
- attendanceService.js (root) → move to hr/attendance-root.service.js or merge
- attendanceIntegrationService.js → attendance-integration.service.js
- attendanceSocketService.js → attendance-socket.service.js
- hrPerformanceService.js → hr-performance.service.js
- aiPayrollService.js → ai-payroll.service.js

## Healthcare Services (healthcare/)
- clinicalDecisionSupport.js → clinical-decision-support.service.js
- hl7Service.js → hl7.service.js
- patientPortalService.js → patient-portal.service.js
- healthcareAnalyticsService.js → healthcare-analytics.service.js
- healthcareDashboardService.js → healthcare-dashboard.service.js
- healthcareNotificationService.js → healthcare-notification.service.js
- healthcareOnboardingService.js → healthcare-onboarding.service.js
- claimsService.js → claims.service.js

## Education Services (education/)
- gradeCalculationService.js → grade-calculation.service.js

## Software House Services (software-house/) - Already exists, just rename
- codeQualityService.js → code-quality.service.js
- timeTrackingService.js → time-tracking.service.js

## Integration Services (integrations/)
- calendarIntegration.js → calendar-integration.service.js
- calendarService.js → calendar.service.js
- emailService.js → email.service.js
- emailValidationService.js → email-validation.service.js
- emailVerificationService.js → email-verification.service.js
- integrationService.js → integration.service.js
- paymentService.js → payment.service.js
- platformIntegration.js → platform-integration.service.js
- portalERPIntegrationService.js → portal-erp-integration.service.js
- projectIntegrationService.js → project-integration.service.js
- slackService.js → slack.service.js
- SlackIntegration.js → slack-integration.service.js
- webrtcService.js → webrtc.service.js
- timezoneService.js → timezone.service.js
- BankingService.js → banking-integration.service.js
- TimeTrackingService.js → time-tracking-integration.service.js

## Analytics Services (analytics/)
- analyticsService.js → analytics.service.js
- dataWarehouseService.js → data-warehouse.service.js
- departmentDashboardService.js → department-dashboard.service.js
- meetingAnalyticsService.js → meeting-analytics.service.js
- metricsService.js → metrics.service.js

## Notification Services (notifications/)
- notificationService.js → notification.service.js
- notificationBatchingService.js → notification-batching.service.js
- messagingNotificationService.js → messaging-notification.service.js
- meetingReminderService.js → meeting-reminder.service.js
- pushNotificationService.js → push-notification.service.js

## Compliance Services (compliance/)
- auditService.js → audit.service.js
- auditLogService.js → audit-log.service.js
- complianceService.js → compliance.service.js
- ferpaComplianceService.js → ferpa-compliance.service.js
- gdprDataDeletionService.js → gdpr-data-deletion.service.js
- gdprDataExportService.js → gdpr-data-export.service.js
- retentionService.js → retention.service.js

## Other Services (keep in root or create new category)
- aiInsightsService.js → ai-insights.service.js (could go to analytics/)
- biometricService.js → biometric.service.js
- clientHealthService.js → client-health.service.js
- clientPortalTokenService.js → client-portal-token.service.js
- exportService.js → export.service.js
- file.service.js → file.service.js (already correct)
- fileValidationService.js → file-validation.service.js
- ganttChartService.js → gantt-chart.service.js
- masterERPService.js → master-erp.service.js
- messageForwardingService.js → message-forwarding.service.js
- messagePaginationService.js → message-pagination.service.js
- MonitoringWebSocketService.js → monitoring-websocket.service.js
- nucleusAutoCalculationService.js → nucleus-auto-calculation.service.js
- nucleusDateValidationService.js → nucleus-date-validation.service.js
- nucleusOnboardingService.js → nucleus-onboarding.service.js
- nucleusSlackService.js → nucleus-slack.service.js
- nucleusTemplateService.js → nucleus-template.service.js
- onboardingChecklistService.js → onboarding-checklist.service.js
- partnerService.js → partner.service.js
- pricingService.js → pricing.service.js
- projectProfitabilityService.js → project-profitability.service.js
- reportService.js → report.service.js (if exists)
- sentryService.js → sentry.service.js
- StandaloneMonitoringService.js → standalone-monitoring.service.js
- SystemMonitoringService.js → system-monitoring.service.js
- usageTrackerService.js → usage-tracker.service.js
- webhookService.js → webhook.service.js
- websocketRateLimitService.js → websocket-rate-limit.service.js
- equityCalculationService.js → equity-calculation.service.js
- cachingService.js → caching.service.js (duplicate of cache?)
