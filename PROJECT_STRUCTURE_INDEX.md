# TWS Project Structure Index

Generated: 2025-12-17T05:32:36.622Z

## Summary
- Total Files: 927
- Frontend Files: 499
- Backend Files: 428
- Files with Dependencies: 619
- Total Dependencies: 2374

## Frontend Structure

### Pages (296 files)

- features/admin/pages/admin/AdminMessagingDashboard.js
- features/admin/pages/admin/ModerationDashboard.js
- features/admin/pages/admin/ProjectManagement.js
- features/admin/pages/admin/projects/Milestones.js
- features/admin/pages/admin/projects/MyProjects.js
- features/admin/pages/admin/projects/ProjectOverview.js
- features/admin/pages/admin/projects/Resources.js
- features/admin/pages/admin/projects/TaskBoard.js
- features/admin/pages/admin/projects/Templates.js
- features/admin/pages/admin/projects/Timesheets.js
- features/admin/pages/admin/projects/Workspaces.js
- features/admin/pages/PartnerManagement.js
- features/admin/pages/RoleManagement.js
- features/admin/pages/SupraAdmin/Analytics.js
- features/admin/pages/SupraAdmin/BillingManagement.js
- features/admin/pages/SupraAdmin/CreateOrganization.js
- features/admin/pages/SupraAdmin/CreateTenantWizard.js
- features/admin/pages/SupraAdmin/Dashboard.js
- features/admin/pages/SupraAdmin/DebugMenu.js
- features/admin/pages/SupraAdmin/DefaultContactManagement.js
- features/admin/pages/SupraAdmin/DepartmentAccess.js
- features/admin/pages/SupraAdmin/DepartmentManagement.js
- features/admin/pages/SupraAdmin/Departments.js
- features/admin/pages/SupraAdmin/ERPManagement.js
- features/admin/pages/SupraAdmin/GTSAdminDashboard.js
- features/admin/pages/SupraAdmin/GTSDashboard.js
- features/admin/pages/SupraAdmin/Infrastructure.js
- features/admin/pages/SupraAdmin/InternalMessaging.js
- features/admin/pages/SupraAdmin/MasterERPManagement.js
- features/admin/pages/SupraAdmin/messaging/Analytics.js
- ... and 266 more files

### Components (139 files)

- components/finance/RoleBasedAccessInfo.js
- features/admin/components/admin/AdminChatInterface.js
- features/admin/components/admin/AdminDashboard.js
- features/admin/components/admin/AdminPageTemplate.js
- features/admin/components/admin/MessagingSettings.js
- features/admin/components/ai/SupraAIInsights.js
- features/auth/components/LoginNavbar.js
- features/auth/components/RoleGuard.js
- features/dashboard/components/analytics/ClientHealthWidget.js
- features/dashboard/components/analytics/ProfitabilityDashboard.js
- features/dashboard/components/WorkforceAnalyticsDashboard.js
- features/employees/components/Attendance/AdminAttendanceDashboard.js
- features/employees/components/Attendance/AdminAttendancePanel.js
- features/employees/components/Attendance/AttendanceAnalytics.js
- features/employees/components/Attendance/AttendanceApproval.js
- features/employees/components/Attendance/AttendanceCalendar.js
- features/employees/components/Attendance/AttendanceCheckInOut.js
- features/employees/components/Attendance/AttendanceDashboard.js
- features/employees/components/Attendance/AttendanceForecasting.js
- features/employees/components/Attendance/AttendanceHeatmap.js
- features/employees/components/Attendance/AttendanceInsights.js
- features/employees/components/Attendance/AttendanceManagement.js
- features/employees/components/Attendance/AttendanceReports.js
- features/employees/components/Attendance/AttendanceSecurity.js
- features/employees/components/Attendance/BiometricAuth.js
- features/employees/components/Attendance/BiometricEnrollment.js
- features/employees/components/Attendance/ComplianceAudit.js
- features/employees/components/Attendance/EmployeeAttendanceList.js
- features/employees/components/Attendance/EmployeeCheckInOut.js
- features/employees/components/Attendance/EmployeeRecordsView.js
- ... and 109 more files

### Services (21 files)

- features/projects/services/listApiService.js
- features/projects/services/portalApiService.js
- features/projects/services/projectApiService.js
- shared/services/aiInsightsService.js
- shared/services/analyticsService.js
- shared/services/billingService.js
- shared/services/equityService.js
- shared/services/formManagementService.js
- shared/services/industry/config/apiConfig.js
- shared/services/industry/educationApi.js
- shared/services/industry/healthcareApi.js
- shared/services/industry/index.js
- shared/services/industry/softwareHouseApi.js
- shared/services/industry/utils/apiClientFactory.js
- shared/services/industry/utils/tokenUtils.js
- shared/services/partnerService.js
- shared/services/resourceService.js
- shared/services/taskService.js
- shared/services/tenantApiService.js
- shared/services/usageTrackingService.js
- shared/services/workspaceService.js

### Utils (15 files)

- features/projects/utils/dateUtils.js
- features/projects/utils/errorHandler.js
- features/projects/utils/validation.js
- features/tenant/utils/industryMenuBuilder.js
- shared/utils/AccessibilityUtils.js
- shared/utils/apiClient.js
- shared/utils/auth.js
- shared/utils/axiosInstance.js
- shared/utils/debugExternalScripts.js
- shared/utils/errorHandler.js
- shared/utils/logger.js
- shared/utils/performance.js
- shared/utils/setupMockAuth.js
- shared/utils/statusUtils.js
- shared/utils/websocket.js

### Layouts (3 files)

- layouts/SupraAdminLayout.js
- layouts/UnifiedLayout.js
- layouts/UnifiedResponsiveLayout.js

### Providers (7 files)

- app/providers/AuthContext.js
- app/providers/DemoAuthContext.js
- app/providers/HybridAuthContext.js
- app/providers/SocketContext.js
- app/providers/TenantAuthContext.js
- app/providers/TenantContext.js
- app/providers/ThemeContext.js

### Hooks (8 files)

- shared/hooks/useFocusTrap.js
- shared/hooks/useKeyboardShortcuts.js
- shared/hooks/useLongPress.js
- shared/hooks/useMonitoringWebSocket.js
- shared/hooks/useResponsive.js
- shared/hooks/useRoleBasedUI.js
- shared/hooks/useSocket.js
- shared/hooks/useSwipe.js

### Config (2 files)

- app/config/api.js
- app/config/firebase.js

## Backend Structure

### Routes (160 files)

- modules/admin/routes/admin.js
- modules/admin/routes/attendancePanel.js
- modules/admin/routes/gtsAdmin.js
- modules/admin/routes/index.js
- modules/admin/routes/messaging.js
- modules/admin/routes/messagingCompatibility.js
- modules/admin/routes/moderation.js
- modules/admin/routes/supraAdmin.js
- modules/admin/routes/supraMessaging.js
- modules/admin/routes/supraReports.js
- modules/admin/routes/supraSessions.js
- modules/admin/routes/supraTenantERP.js
- modules/admin/routes/twsAdmin.js
- modules/auth/routes/authentication.js
- modules/auth/routes/index.js
- modules/auth/routes/sessions.js
- modules/auth/routes/tenantAuth.js
- modules/auth/routes/users.js
- modules/business/routes/attendance.js
- modules/business/routes/attendanceIntegration.js
- modules/business/routes/boards.js
- modules/business/routes/calendarAttendance.js
- modules/business/routes/cards.js
- modules/business/routes/clientPortal.js
- modules/business/routes/clients.js
- modules/business/routes/developmentMetrics.js
- modules/business/routes/employee.js
- modules/business/routes/employeeAttendance.js
- modules/business/routes/employees.js
- modules/business/routes/equity.js
- ... and 130 more files

### Controllers (1 files)

- controllers/tenant/projectsController.js

### Models (73 files)

- models/Activity.js
- models/AIPayroll.js
- models/Analytics.js
- models/Attendance.js
- models/AttendanceAudit.js
- models/AttendancePolicy.js
- models/AttendanceShift.js
- models/AuditLog.js
- models/Billing.js
- models/Board.js
- models/Card.js
- models/Chat.js
- models/Client.js
- models/ClientHealth.js
- models/ClientTouchpoint.js
- models/DefaultContact.js
- models/Department.js
- models/DepartmentAccess.js
- models/DevelopmentMetrics.js
- models/DeviceToken.js
- models/Education.js
- models/EmailVerification.js
- models/Employee.js
- models/EmployeeMetrics.js
- models/Equity.js
- models/ERPTemplate.js
- models/Expense.js
- models/File.js
- models/Finance.js
- models/GTSAdmin.js
- ... and 43 more files

### Services (100 files)

- services/aiInsightsService.js
- services/aiPayrollService.js
- services/analyticsService.js
- services/attendanceIntegrationService.js
- services/attendanceService.js
- services/attendanceSocketService.js
- services/auditLogService.js
- services/auditService.js
- services/billingService.js
- services/biometricService.js
- services/cacheService.js
- services/cachingService.js
- services/calendarIntegration.js
- services/calendarService.js
- services/clientHealthService.js
- services/complianceService.js
- services/connectionPoolService.js
- services/databaseProvisioningService.js
- services/dataWarehouseService.js
- services/e2eEncryptionService.js
- services/emailService.js
- services/emailValidationService.js
- services/emailVerificationService.js
- services/encryptionService.js
- services/equityCalculationService.js
- services/exportService.js
- services/file.service.js
- services/fileValidationService.js
- services/financeDashboardService.js
- services/financeExportService.js
- ... and 70 more files

### Middleware (21 files)

- middleware/auditLog.js
- middleware/auditLogger.js
- middleware/auth.js
- middleware/csrfProtection.js
- middleware/errorHandler.js
- middleware/featureGate.js
- middleware/formValidation.js
- middleware/inputSanitization.js
- middleware/inputValidation.js
- middleware/metricsMiddleware.js
- middleware/moduleAccessControl.js
- middleware/observability.js
- middleware/portalAuth.js
- middleware/rateLimiter.js
- middleware/rbac.js
- middleware/security.js
- middleware/securityHeaders.js
- middleware/tenantMiddleware.js
- middleware/upload.js
- middleware/uploadRateLimiter.js
- middleware/validation.js

### Utils (5 files)

- utils/errorHandler.js
- utils/logger.js
- utils/modelSchemaHelper.js
- utils/pagination.js
- utils/tenantModelHelper.js

### Config (7 files)

- config/environment.js
- config/firebase-admin.js
- config/logging.js
- config/redis.js
- config/s3.js
- config/security.js
- config/swagger.js

### Modules (1 files)

- modules/index.js

## Key Dependencies

### features/tenant/pages/tenant/org/TenantOrg.js (118 dependencies)
  - features/tenant/components/TenantOrgLayout.js
  - app/providers/TenantAuthContext.js
  - features/tenant/pages/tenant/org/dashboard/DashboardOverview.js
  - features/tenant/pages/tenant/org/dashboard/DashboardAnalytics.js
  - features/tenant/pages/tenant/org/dashboard/DynamicDashboard.js
  - features/tenant/pages/tenant/org/analytics/AnalyticsOverview.js
  - features/tenant/pages/tenant/org/analytics/AnalyticsReports.js
  - features/tenant/pages/tenant/org/users/UserList.js
  - features/tenant/pages/tenant/org/users/UserProfile.js
  - features/tenant/pages/tenant/org/users/UserCreate.js
  - ... and 108 more

### App.js (106 dependencies)
  - app/providers/AuthContext.js
  - app/providers/SocketContext.js
  - app/providers/ThemeContext.js
  - shared/hooks/useRoleBasedUI.js
  - shared/utils/errorHandler.js
  - layouts/UnifiedLayout.js
  - modules/dashboard/UnifiedDashboard.js
  - features/auth/pages/Login.js
  - features/auth/pages/SupraAdminLogin.js
  - features/auth/pages/EducationSignup.js
  - ... and 96 more

### services/tenantOrgService.js (53 dependencies)
  - models/Tenant.js
  - models/Organization.js
  - models/User.js
  - models/Employee.js
  - models/Project.js
  - models/Task.js
  - models/Finance.js
  - models/Attendance.js
  - models/Payroll.js
  - models/Department.js
  - ... and 43 more

### modules/business/routes/index.js (36 dependencies)
  - modules/business/routes/employees.js
  - modules/business/routes/employee.js
  - modules/business/routes/attendance.js
  - modules/business/routes/employeeAttendance.js
  - modules/business/routes/modernAttendance.js
  - modules/business/routes/simpleAttendance.js
  - modules/business/routes/softwareHouseAttendance.js
  - modules/business/routes/calendarAttendance.js
  - modules/business/routes/attendanceIntegration.js
  - modules/business/routes/payroll.js
  - ... and 26 more

### features/admin/pages/SupraAdmin/SupraAdmin.js (28 dependencies)
  - layouts/SupraAdminLayout.js
  - shared/utils/setupMockAuth.js
  - features/admin/pages/SupraAdmin/SupraAdminDashboard.js
  - features/admin/pages/SupraAdmin/TenantManagement.js
  - features/admin/pages/SupraAdmin/BillingManagement.js
  - features/admin/pages/SupraAdmin/Analytics.js
  - features/admin/pages/SupraAdmin/Users.js
  - features/admin/pages/SupraAdmin/Reports.js
  - features/admin/pages/SupraAdmin/SessionManagement.js
  - features/admin/pages/SupraAdmin/DepartmentAccess.js
  - ... and 18 more

### services/tenantProvisioningService.old.js (25 dependencies)
  - models/Tenant.js
  - models/User.js
  - models/Organization.js
  - models/Project.js
  - models/ProjectTemplate.js
  - models/AttendancePolicy.js
  - models/SubscriptionPlan.js
  - models/Department.js
  - models/Team.js
  - models/Client.js
  - ... and 15 more

### modules/tenant/routes/organization.js (22 dependencies)
  - models/Tenant.js
  - models/Organization.js
  - models/DepartmentAccess.js
  - models/User.js
  - models/TenantSettings.js
  - middleware/auth.js
  - services/tenantOrgService.js
  - middleware/tenantMiddleware.js
  - middleware/moduleAccessControl.js
  - services/jwtService.js
  - ... and 12 more

### modules/business/routes/messaging.js (16 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/AuditLog.js
  - models/UserBan.js
  - middleware/errorHandler.js
  - services/messagingNotificationService.js
  - services/encryptionService.js
  - ... and 6 more

### services/index.js (16 dependencies)
  - services/projectProfitabilityService.js
  - services/hrPerformanceService.js
  - services/clientHealthService.js
  - services/aiInsightsService.js
  - services/tenantProvisioningService/index.js
  - services/usageTrackerService.js
  - services/emailService.js
  - services/notificationService.js
  - services/auditLogService.js
  - services/cacheService.js
  - ... and 6 more

### jobs/scheduler.js (14 dependencies)
  - models/Tenant.js
  - models/EmployeeMetrics.js
  - models/Project.js
  - models/Attendance.js
  - services/usageTrackerService.js
  - services/projectProfitabilityService.js
  - services/hrPerformanceService.js
  - services/clientHealthService.js
  - services/aiInsightsService.js
  - services/tenantProvisioningService/index.js
  - ... and 4 more

### modules/tenant/routes/softwareHouse.js (13 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - models/Tenant.js
  - models/SoftwareHouseRole.js
  - models/Project.js
  - models/Card.js
  - models/Sprint.js
  - models/DevelopmentMetrics.js
  - models/Finance.js
  - models/Client.js
  - ... and 3 more

### modules/admin/routes/supraAdmin.js (12 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - models/TWSAdmin.js
  - models/Tenant.js
  - models/User.js
  - models/Organization.js
  - models/Billing.js
  - services/tenantService.js
  - services/analyticsService.js
  - services/billingService.js
  - ... and 2 more

### modules/auth/routes/authentication.js (12 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - models/User.js
  - models/Organization.js
  - models/TWSAdmin.js
  - models/GTSAdmin.js
  - models/Organization.js
  - models/Organization.js
  - models/Organization.js
  - models/User.js
  - ... and 2 more

### scripts/testWithoutDB.js (12 dependencies)
  - controllers/tenant/projectsController.js
  - modules/tenant/routes/projects.js
  - models/Project.js
  - models/Task.js
  - models/Milestone.js
  - models/Resource.js
  - models/Sprint.js
  - models/Finance.js
  - models/Client.js
  - controllers/tenant/projectsController.js
  - ... and 2 more

### services/messagingNotificationService.js (12 dependencies)
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/NotificationQueue.js
  - services/pushNotificationService.js
  - services/emailService.js
  - services/notificationBatchingService.js
  - workers/notificationWorker.js
  - templates/email/messageTemplate.js
  - templates/email/messageTemplate.js
  - ... and 2 more

### services/tenantProvisioningService/seeders/defaultSeeder.js (12 dependencies)
  - models/Tenant.js
  - services/tenantProvisioningService/defaultDataCreators/attendancePolicy.js
  - services/tenantProvisioningService/defaultDataCreators/departmentsAndTeams.js
  - services/tenantProvisioningService/defaultDataCreators/employeesAndPayroll.js
  - services/tenantProvisioningService/defaultDataCreators/projectTemplates.js
  - services/tenantProvisioningService/defaultDataCreators/sampleProject.js
  - services/tenantProvisioningService/defaultDataCreators/chartOfAccounts.js
  - services/tenantProvisioningService/defaultDataCreators/financeTransactions.js
  - services/tenantProvisioningService/defaultDataCreators/clientsAndVendors.js
  - services/tenantProvisioningService/defaultDataCreators/meetingTemplates.js
  - ... and 2 more

### tests/notificationSystem.test.js (12 dependencies)
  - app.js
  - models/User.js
  - models/Chat.js
  - models/Message.js
  - models/DeviceToken.js
  - models/NotificationPreference.js
  - models/NotificationQueue.js
  - services/pushNotificationService.js
  - services/emailService.js
  - services/messagingNotificationService.js
  - ... and 2 more

### modules/admin/routes/gtsAdmin.js (11 dependencies)
  - middleware/auth.js
  - models/TWSAdmin.js
  - models/Tenant.js
  - models/Billing.js
  - models/SubscriptionPlan.js
  - models/User.js
  - models/Organization.js
  - services/tenantService.js
  - services/billingService.js
  - services/analyticsService.js
  - ... and 1 more

### modules/integration/routes/platform.js (11 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - services/platformIntegration.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/User.js
  - models/User.js
  - ... and 1 more

### routes/gtsAdmin.js (11 dependencies)
  - middleware/auth.js
  - models/TWSAdmin.js
  - models/Tenant.js
  - models/Billing.js
  - models/SubscriptionPlan.js
  - models/User.js
  - models/Organization.js
  - services/tenantService.js
  - services/billingService.js
  - services/analyticsService.js
  - ... and 1 more

### routes/platformIntegration.js (11 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - services/platformIntegration.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/Meeting.js
  - models/User.js
  - models/User.js
  - ... and 1 more

### routes/portal/boards.js (11 dependencies)
  - models/Workspace.js
  - models/PortalUser.js
  - models/Board.js
  - models/List.js
  - models/Card.js
  - models/Activity.js
  - models/Project.js
  - models/Notification.js
  - middleware/auth.js
  - middleware/errorHandler.js
  - ... and 1 more

### scripts/seedTenantProjects.js (11 dependencies)
  - models/Project.js
  - models/Task.js
  - models/Milestone.js
  - models/Resource.js
  - models/Sprint.js
  - models/Finance.js
  - models/Client.js
  - models/Tenant.js
  - models/Organization.js
  - models/User.js
  - ... and 1 more

### scripts/testTenantProjects.js (11 dependencies)
  - controllers/tenant/projectsController.js
  - models/Project.js
  - models/Task.js
  - models/Milestone.js
  - models/Resource.js
  - models/Sprint.js
  - models/Finance.js
  - models/Client.js
  - models/Organization.js
  - modules/tenant/routes/projects.js
  - ... and 1 more

### services/tenantDataService.js (11 dependencies)
  - models/Tenant.js
  - models/Organization.js
  - models/Department.js
  - models/User.js
  - models/Project.js
  - models/Task.js
  - services/tenantModelService.js
  - services/tenantConnectionPool.js
  - utils/tenantModelHelper.js
  - utils/modelSchemaHelper.js
  - ... and 1 more

### features/projects/components/Portal/PortalDashboard.js (10 dependencies)
  - app/providers/AuthContext.js
  - shared/utils/axiosInstance.js
  - features/projects/components/ErrorBoundary.js
  - features/projects/components/Portal/WorkspaceSelector.js
  - features/projects/components/Portal/MemberManagement.js
  - features/projects/components/Portal/BoardCreation.js
  - features/projects/components/Portal/SprintManagement.js
  - features/projects/components/Portal/AnalyticsDashboard.js
  - features/projects/components/Portal/AutomationCenter.js
  - features/projects/components/Portal/IntegrationHub.js

### modules/admin/routes/index.js (10 dependencies)
  - modules/admin/routes/admin.js
  - modules/admin/routes/supraAdmin.js
  - modules/admin/routes/twsAdmin.js
  - modules/admin/routes/gtsAdmin.js
  - modules/admin/routes/moderation.js
  - modules/admin/routes/attendancePanel.js
  - modules/admin/routes/supraMessaging.js
  - modules/admin/routes/supraReports.js
  - modules/admin/routes/supraSessions.js
  - modules/admin/routes/supraTenantERP.js

### modules/admin/routes/messaging.js (10 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/AuditLog.js
  - middleware/errorHandler.js
  - services/auditService.js
  - services/messagePaginationService.js
  - services/cachingService.js

### modules/business/routes/projects.js (10 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - models/Project.js
  - models/Client.js
  - models/ProjectMember.js
  - models/Board.js
  - models/List.js
  - models/Card.js
  - models/ProjectTemplate.js
  - models/Activity.js

### modules/integration/routes/calendar.js (10 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - services/calendarIntegration.js
  - models/User.js
  - models/User.js
  - models/Meeting.js
  - models/User.js
  - models/Meeting.js
  - models/User.js
  - models/User.js

### routes/adminMessaging.js (10 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/AuditLog.js
  - middleware/errorHandler.js
  - services/auditService.js
  - services/messagePaginationService.js
  - services/cachingService.js

### routes/calendarIntegration.js (10 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - services/calendarIntegration.js
  - models/User.js
  - models/User.js
  - models/Meeting.js
  - models/User.js
  - models/Meeting.js
  - models/User.js
  - models/User.js

### routes/projects.js (10 dependencies)
  - middleware/auth.js
  - middleware/errorHandler.js
  - models/Project.js
  - models/Client.js
  - models/ProjectMember.js
  - models/Board.js
  - models/List.js
  - models/Card.js
  - models/ProjectTemplate.js
  - models/Activity.js

### routes/supraAdmin.js (10 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - models/TWSAdmin.js
  - models/Tenant.js
  - models/User.js
  - models/Organization.js
  - services/tenantService.js
  - services/analyticsService.js
  - middleware/validation.js
  - middleware/errorHandler.js

### services/tenantProvisioningService/index.js (10 dependencies)
  - models/Tenant.js
  - models/User.js
  - models/Organization.js
  - services/tenantProvisioningService/tenantCreation.js
  - services/tenantProvisioningService/userAndOrgCreation.js
  - services/tenantProvisioningService/seeders/index.js
  - services/tenantProvisioningService/seeders/defaultSeeder.js
  - services/tenantProvisioningService/onboarding.js
  - services/tenantProvisioningService/tenantManagement.js
  - services/tenantProvisioningService/emailService.js

### tests/security.test.js (10 dependencies)
  - app.js
  - models/User.js
  - models/Message.js
  - models/Chat.js
  - models/AuditLog.js
  - models/Organization.js
  - services/encryptionService.js
  - services/auditService.js
  - services/retentionService.js
  - middleware/rbac.js

### controllers/tenant/projectsController.js (9 dependencies)
  - models/Project.js
  - models/Task.js
  - models/Organization.js
  - models/Client.js
  - models/Milestone.js
  - models/Resource.js
  - models/Sprint.js
  - models/Finance.js
  - models/User.js

### modules/admin/routes/supraMessaging.js (9 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - middleware/errorHandler.js
  - models/Tenant.js
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/DefaultContact.js
  - models/MessagingAnalytics.js

### modules/business/routes/attendance.js (9 dependencies)
  - middleware/rbac.js
  - middleware/errorHandler.js
  - middleware/validation.js
  - models/Attendance.js
  - models/AttendancePolicy.js
  - models/AttendanceShift.js
  - models/AttendanceAudit.js
  - models/Employee.js
  - services/attendanceService.js

### modules/business/routes/employee.js (9 dependencies)
  - middleware/rbac.js
  - middleware/errorHandler.js
  - middleware/validation.js
  - models/Employee.js
  - models/Attendance.js
  - models/Expense.js
  - models/Notification.js
  - models/Project.js
  - models/User.js

### modules/tenant/routes/dashboard.js (9 dependencies)
  - models/Tenant.js
  - models/Organization.js
  - models/Department.js
  - models/User.js
  - models/Project.js
  - models/Task.js
  - services/tenantDataService.js
  - middleware/tenantMiddleware.js
  - middleware/auth.js

### routes/employee.js (9 dependencies)
  - middleware/rbac.js
  - middleware/errorHandler.js
  - middleware/validation.js
  - models/Employee.js
  - models/Attendance.js
  - models/Expense.js
  - models/Notification.js
  - models/Project.js
  - models/User.js

### routes/portal/cards.js (9 dependencies)
  - models/Workspace.js
  - models/PortalUser.js
  - models/Card.js
  - models/List.js
  - models/Board.js
  - models/Activity.js
  - models/Notification.js
  - middleware/auth.js
  - middleware/errorHandler.js

### routes/supraAdminMessaging.js (9 dependencies)
  - middleware/auth.js
  - middleware/rbac.js
  - middleware/errorHandler.js
  - models/Tenant.js
  - models/Chat.js
  - models/Message.js
  - models/User.js
  - models/DefaultContact.js
  - models/MessagingAnalytics.js

### features/projects/pages/Projects.js (8 dependencies)
  - app/providers/AuthContext.js
  - features/projects/components/ProjectPortal/ProjectCard.js
  - features/projects/components/ProjectPortal/CreateProjectModal.js
  - features/projects/components/ConfirmDialog.js
  - features/projects/components/ErrorBoundary.js
  - features/projects/services/projectApiService.js
  - features/projects/utils/errorHandler.js
  - features/projects/constants/projectConstants.js

### modules/auth/routes/sessions.js (8 dependencies)
  - middleware/auth.js
  - models/Session.js
  - models/DepartmentAccess.js
  - models/Department.js
  - models/Tenant.js
  - models/User.js
  - models/SupraAdmin.js
  - middleware/rbac.js

### modules/business/routes/attendanceIntegration.js (8 dependencies)
  - middleware/rbac.js
  - middleware/errorHandler.js
  - middleware/validation.js
  - services/attendanceIntegrationService.js
  - models/Attendance.js
  - models/Attendance.js
  - models/Attendance.js
  - models/Attendance.js

### modules/business/routes/cards.js (8 dependencies)
  - models/Card.js
  - models/List.js
  - models/Board.js
  - models/Project.js
  - models/ProjectMember.js
  - models/Activity.js
  - models/Notification.js
  - middleware/auth.js

### modules/business/routes/payroll.js (8 dependencies)
  - middleware/rbac.js
  - middleware/errorHandler.js
  - middleware/validation.js
  - models/Payroll.js
  - models/AIPayroll.js
  - models/Employee.js
  - models/User.js
  - services/aiPayrollService.js

### modules/core/routes/index.js (8 dependencies)
  - modules/core/routes/health.js
  - modules/core/routes/metrics.js
  - modules/core/routes/logs.js
  - modules/core/routes/security.js
  - modules/core/routes/compliance.js
  - modules/core/routes/files.js
  - modules/core/routes/notifications.js
  - modules/core/routes/webhooks.js

