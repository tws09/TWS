# TWS Project Structure Flow Diagram

This diagram shows the structure and relationships between frontend and backend files.

## Mermaid Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend"]
        direction TB
        subgraph FE_pages["Pages"]
            FE_pages_features_admin_pages_admin_AdminMessagingDashboard_js["AdminMessagingDashboard"]
            FE_pages_features_admin_pages_admin_ModerationDashboard_js["ModerationDashboard"]
            FE_pages_features_admin_pages_admin_ProjectManagement_js["ProjectManagement"]
            FE_pages_features_admin_pages_admin_projects_Milestones_js["Milestones"]
            FE_pages_features_admin_pages_admin_projects_MyProjects_js["MyProjects"]
            FE_pages_features_admin_pages_admin_projects_ProjectOverview_js["ProjectOverview"]
            FE_pages_features_admin_pages_admin_projects_Resources_js["Resources"]
            FE_pages_features_admin_pages_admin_projects_TaskBoard_js["TaskBoard"]
            FE_pages_features_admin_pages_admin_projects_Templates_js["Templates"]
            FE_pages_features_admin_pages_admin_projects_Timesheets_js["Timesheets"]
            FE_pages_features_admin_pages_admin_projects_Workspaces_js["Workspaces"]
            FE_pages_features_admin_pages_PartnerManagement_js["PartnerManagement"]
            FE_pages_features_admin_pages_RoleManagement_js["RoleManagement"]
            FE_pages_features_admin_pages_SupraAdmin_Analytics_js["Analytics"]
            FE_pages_features_admin_pages_SupraAdmin_BillingManagement_js["BillingManagement"]
            FE_pages_features_admin_pages_SupraAdmin_CreateOrganization_js["CreateOrganization"]
            FE_pages_features_admin_pages_SupraAdmin_CreateTenantWizard_js["CreateTenantWizard"]
            FE_pages_features_admin_pages_SupraAdmin_Dashboard_js["Dashboard"]
            FE_pages_features_admin_pages_SupraAdmin_DebugMenu_js["DebugMenu"]
            FE_pages_features_admin_pages_SupraAdmin_DefaultContactManagement_js["DefaultContactManagement"]
        end
        subgraph FE_components["Components"]
            FE_components_components_finance_RoleBasedAccessInfo_js["RoleBasedAccessInfo"]
            FE_components_features_admin_components_admin_AdminChatInterface_js["AdminChatInterface"]
            FE_components_features_admin_components_admin_AdminDashboard_js["AdminDashboard"]
            FE_components_features_admin_components_admin_AdminPageTemplate_js["AdminPageTemplate"]
            FE_components_features_admin_components_admin_MessagingSettings_js["MessagingSettings"]
            FE_components_features_admin_components_ai_SupraAIInsights_js["SupraAIInsights"]
            FE_components_features_auth_components_LoginNavbar_js["LoginNavbar"]
            FE_components_features_auth_components_RoleGuard_js["RoleGuard"]
            FE_components_features_dashboard_components_analytics_ClientHealthWidget_js["ClientHealthWidget"]
            FE_components_features_dashboard_components_analytics_ProfitabilityDashboard_js["ProfitabilityDashboard"]
            FE_components_features_dashboard_components_WorkforceAnalyticsDashboard_js["WorkforceAnalyticsDashboard"]
            FE_components_features_employees_components_Attendance_AdminAttendanceDashboard_js["AdminAttendanceDashboard"]
            FE_components_features_employees_components_Attendance_AdminAttendancePanel_js["AdminAttendancePanel"]
            FE_components_features_employees_components_Attendance_AttendanceAnalytics_js["AttendanceAnalytics"]
            FE_components_features_employees_components_Attendance_AttendanceApproval_js["AttendanceApproval"]
            FE_components_features_employees_components_Attendance_AttendanceCalendar_js["AttendanceCalendar"]
            FE_components_features_employees_components_Attendance_AttendanceCheckInOut_js["AttendanceCheckInOut"]
            FE_components_features_employees_components_Attendance_AttendanceDashboard_js["AttendanceDashboard"]
            FE_components_features_employees_components_Attendance_AttendanceForecasting_js["AttendanceForecasting"]
            FE_components_features_employees_components_Attendance_AttendanceHeatmap_js["AttendanceHeatmap"]
        end
        subgraph FE_services["Services"]
            FE_services_features_projects_services_listApiService_js["listApiService"]
            FE_services_features_projects_services_portalApiService_js["portalApiService"]
            FE_services_features_projects_services_projectApiService_js["projectApiService"]
            FE_services_shared_services_aiInsightsService_js["aiInsightsService"]
            FE_services_shared_services_analyticsService_js["analyticsService"]
            FE_services_shared_services_billingService_js["billingService"]
            FE_services_shared_services_equityService_js["equityService"]
            FE_services_shared_services_formManagementService_js["formManagementService"]
            FE_services_shared_services_industry_config_apiConfig_js["apiConfig"]
            FE_services_shared_services_industry_educationApi_js["educationApi"]
            FE_services_shared_services_industry_healthcareApi_js["healthcareApi"]
            FE_services_shared_services_industry_index_js["index"]
            FE_services_shared_services_industry_softwareHouseApi_js["softwareHouseApi"]
            FE_services_shared_services_industry_utils_apiClientFactory_js["apiClientFactory"]
            FE_services_shared_services_industry_utils_tokenUtils_js["tokenUtils"]
            FE_services_shared_services_partnerService_js["partnerService"]
            FE_services_shared_services_resourceService_js["resourceService"]
            FE_services_shared_services_taskService_js["taskService"]
            FE_services_shared_services_tenantApiService_js["tenantApiService"]
            FE_services_shared_services_usageTrackingService_js["usageTrackingService"]
        end
        subgraph FE_utils["Utils"]
            FE_utils_features_projects_utils_dateUtils_js["dateUtils"]
            FE_utils_features_projects_utils_errorHandler_js["errorHandler"]
            FE_utils_features_projects_utils_validation_js["validation"]
            FE_utils_features_tenant_utils_industryMenuBuilder_js["industryMenuBuilder"]
            FE_utils_shared_utils_AccessibilityUtils_js["AccessibilityUtils"]
            FE_utils_shared_utils_apiClient_js["apiClient"]
            FE_utils_shared_utils_auth_js["auth"]
            FE_utils_shared_utils_axiosInstance_js["axiosInstance"]
            FE_utils_shared_utils_debugExternalScripts_js["debugExternalScripts"]
            FE_utils_shared_utils_errorHandler_js["errorHandler"]
            FE_utils_shared_utils_logger_js["logger"]
            FE_utils_shared_utils_performance_js["performance"]
            FE_utils_shared_utils_setupMockAuth_js["setupMockAuth"]
            FE_utils_shared_utils_statusUtils_js["statusUtils"]
            FE_utils_shared_utils_websocket_js["websocket"]
        end
        subgraph FE_layouts["Layouts"]
            FE_layouts_layouts_SupraAdminLayout_js["SupraAdminLayout"]
            FE_layouts_layouts_UnifiedLayout_js["UnifiedLayout"]
            FE_layouts_layouts_UnifiedResponsiveLayout_js["UnifiedResponsiveLayout"]
        end
        subgraph FE_providers["Providers"]
            FE_providers_app_providers_AuthContext_js["AuthContext"]
            FE_providers_app_providers_DemoAuthContext_js["DemoAuthContext"]
            FE_providers_app_providers_HybridAuthContext_js["HybridAuthContext"]
            FE_providers_app_providers_SocketContext_js["SocketContext"]
            FE_providers_app_providers_TenantAuthContext_js["TenantAuthContext"]
            FE_providers_app_providers_TenantContext_js["TenantContext"]
            FE_providers_app_providers_ThemeContext_js["ThemeContext"]
        end
        subgraph FE_hooks["Hooks"]
            FE_hooks_shared_hooks_useFocusTrap_js["useFocusTrap"]
            FE_hooks_shared_hooks_useKeyboardShortcuts_js["useKeyboardShortcuts"]
            FE_hooks_shared_hooks_useLongPress_js["useLongPress"]
            FE_hooks_shared_hooks_useMonitoringWebSocket_js["useMonitoringWebSocket"]
            FE_hooks_shared_hooks_useResponsive_js["useResponsive"]
            FE_hooks_shared_hooks_useRoleBasedUI_js["useRoleBasedUI"]
            FE_hooks_shared_hooks_useSocket_js["useSocket"]
            FE_hooks_shared_hooks_useSwipe_js["useSwipe"]
        end
        subgraph FE_config["Config"]
            FE_config_app_config_api_js["api"]
            FE_config_app_config_firebase_js["firebase"]
        end
    end
    
    subgraph Backend["Backend"]
        direction TB
        subgraph BE_routes["Routes"]
            BE_routes_modules_admin_routes_admin_js["admin"]
            BE_routes_modules_admin_routes_attendancePanel_js["attendancePanel"]
            BE_routes_modules_admin_routes_gtsAdmin_js["gtsAdmin"]
            BE_routes_modules_admin_routes_index_js["index"]
            BE_routes_modules_admin_routes_messaging_js["messaging"]
            BE_routes_modules_admin_routes_messagingCompatibility_js["messagingCompatibility"]
            BE_routes_modules_admin_routes_moderation_js["moderation"]
            BE_routes_modules_admin_routes_supraAdmin_js["supraAdmin"]
            BE_routes_modules_admin_routes_supraMessaging_js["supraMessaging"]
            BE_routes_modules_admin_routes_supraReports_js["supraReports"]
            BE_routes_modules_admin_routes_supraSessions_js["supraSessions"]
            BE_routes_modules_admin_routes_supraTenantERP_js["supraTenantERP"]
            BE_routes_modules_admin_routes_twsAdmin_js["twsAdmin"]
            BE_routes_modules_auth_routes_authentication_js["authentication"]
            BE_routes_modules_auth_routes_index_js["index"]
            BE_routes_modules_auth_routes_sessions_js["sessions"]
            BE_routes_modules_auth_routes_tenantAuth_js["tenantAuth"]
            BE_routes_modules_auth_routes_users_js["users"]
            BE_routes_modules_business_routes_attendance_js["attendance"]
            BE_routes_modules_business_routes_attendanceIntegration_js["attendanceIntegration"]
        end
        subgraph BE_controllers["Controllers"]
            BE_controllers_controllers_tenant_projectsController_js["projectsController"]
        end
        subgraph BE_models["Models"]
            BE_models_models_Activity_js["Activity"]
            BE_models_models_AIPayroll_js["AIPayroll"]
            BE_models_models_Analytics_js["Analytics"]
            BE_models_models_Attendance_js["Attendance"]
            BE_models_models_AttendanceAudit_js["AttendanceAudit"]
            BE_models_models_AttendancePolicy_js["AttendancePolicy"]
            BE_models_models_AttendanceShift_js["AttendanceShift"]
            BE_models_models_AuditLog_js["AuditLog"]
            BE_models_models_Billing_js["Billing"]
            BE_models_models_Board_js["Board"]
            BE_models_models_Card_js["Card"]
            BE_models_models_Chat_js["Chat"]
            BE_models_models_Client_js["Client"]
            BE_models_models_ClientHealth_js["ClientHealth"]
            BE_models_models_ClientTouchpoint_js["ClientTouchpoint"]
            BE_models_models_DefaultContact_js["DefaultContact"]
            BE_models_models_Department_js["Department"]
            BE_models_models_DepartmentAccess_js["DepartmentAccess"]
            BE_models_models_DevelopmentMetrics_js["DevelopmentMetrics"]
            BE_models_models_DeviceToken_js["DeviceToken"]
        end
        subgraph BE_services["Services"]
            BE_services_services_aiInsightsService_js["aiInsightsService"]
            BE_services_services_aiPayrollService_js["aiPayrollService"]
            BE_services_services_analyticsService_js["analyticsService"]
            BE_services_services_attendanceIntegrationService_js["attendanceIntegrationService"]
            BE_services_services_attendanceService_js["attendanceService"]
            BE_services_services_attendanceSocketService_js["attendanceSocketService"]
            BE_services_services_auditLogService_js["auditLogService"]
            BE_services_services_auditService_js["auditService"]
            BE_services_services_billingService_js["billingService"]
            BE_services_services_biometricService_js["biometricService"]
            BE_services_services_cacheService_js["cacheService"]
            BE_services_services_cachingService_js["cachingService"]
            BE_services_services_calendarIntegration_js["calendarIntegration"]
            BE_services_services_calendarService_js["calendarService"]
            BE_services_services_clientHealthService_js["clientHealthService"]
            BE_services_services_complianceService_js["complianceService"]
            BE_services_services_connectionPoolService_js["connectionPoolService"]
            BE_services_services_databaseProvisioningService_js["databaseProvisioningService"]
            BE_services_services_dataWarehouseService_js["dataWarehouseService"]
            BE_services_services_e2eEncryptionService_js["e2eEncryptionService"]
        end
        subgraph BE_middleware["Middleware"]
            BE_middleware_middleware_auditLog_js["auditLog"]
            BE_middleware_middleware_auditLogger_js["auditLogger"]
            BE_middleware_middleware_auth_js["auth"]
            BE_middleware_middleware_csrfProtection_js["csrfProtection"]
            BE_middleware_middleware_errorHandler_js["errorHandler"]
            BE_middleware_middleware_featureGate_js["featureGate"]
            BE_middleware_middleware_formValidation_js["formValidation"]
            BE_middleware_middleware_inputSanitization_js["inputSanitization"]
            BE_middleware_middleware_inputValidation_js["inputValidation"]
            BE_middleware_middleware_metricsMiddleware_js["metricsMiddleware"]
            BE_middleware_middleware_moduleAccessControl_js["moduleAccessControl"]
            BE_middleware_middleware_observability_js["observability"]
            BE_middleware_middleware_portalAuth_js["portalAuth"]
            BE_middleware_middleware_rateLimiter_js["rateLimiter"]
            BE_middleware_middleware_rbac_js["rbac"]
            BE_middleware_middleware_security_js["security"]
            BE_middleware_middleware_securityHeaders_js["securityHeaders"]
            BE_middleware_middleware_tenantMiddleware_js["tenantMiddleware"]
            BE_middleware_middleware_upload_js["upload"]
            BE_middleware_middleware_uploadRateLimiter_js["uploadRateLimiter"]
        end
        subgraph BE_utils["Utils"]
            BE_utils_utils_errorHandler_js["errorHandler"]
            BE_utils_utils_logger_js["logger"]
            BE_utils_utils_modelSchemaHelper_js["modelSchemaHelper"]
            BE_utils_utils_pagination_js["pagination"]
            BE_utils_utils_tenantModelHelper_js["tenantModelHelper"]
        end
        subgraph BE_config["Config"]
            BE_config_config_environment_js["environment"]
            BE_config_config_firebase_admin_js["firebase-admin"]
            BE_config_config_logging_js["logging"]
            BE_config_config_redis_js["redis"]
            BE_config_config_s3_js["s3"]
            BE_config_config_security_js["security"]
            BE_config_config_swagger_js["swagger"]
        end
        subgraph BE_modules["Modules"]
            BE_modules_modules_index_js["index"]
        end
    end
    
    %% Key Relationships
    Frontend -->|API Calls| Backend
    FE_other_App_js -.->|uses| FE_providers_app_providers_AuthContext_js
    FE_other_App_js -.->|uses| FE_providers_app_providers_SocketContext_js
    FE_other_App_js -.->|uses| FE_providers_app_providers_ThemeContext_js
    FE_other_App_js -.->|uses| FE_hooks_shared_hooks_useRoleBasedUI_js
    FE_other_App_js -.->|uses| FE_utils_shared_utils_errorHandler_js
    FE_other_App_js -.->|uses| FE_layouts_layouts_UnifiedLayout_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_Login_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_SupraAdminLogin_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_EducationSignup_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_EducationLogin_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_EmployeeLogin_js
    FE_other_App_js -.->|uses| FE_pages_features_auth_pages_TenantLogin_js
    FE_other_App_js -.->|uses| FE_components_shared_components_layout_Layout_js
    FE_other_App_js -.->|uses| FE_components_shared_components_layout_EmployeeLayout_js
    FE_other_App_js -.->|uses| FE_components_features_auth_components_RoleGuard_js
    FE_other_App_js -.->|uses| FE_components_shared_components_feedback_LoadingSpinner_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_LandingPage_js
    FE_other_App_js -.->|uses| FE_components_shared_components_monitoring_BackendHealthCheck_js
    FE_other_App_js -.->|uses| FE_components_shared_components_monitoring_MonitoringSystemStatus_js
    FE_other_App_js -.->|uses| FE_components_shared_components_feedback_AccessDenied_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_Dashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_Projects_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_ProjectBoard_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_Templates_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_Employees_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_EmployeeProfile_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_Attendance_js
    FE_other_App_js -.->|uses| FE_pages_features_admin_pages_RoleManagement_js
    FE_other_App_js -.->|uses| FE_pages_features_admin_pages_SystemAdmin_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Payroll_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_MasterFinanceDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_ChartOfAccounts_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_AccountsReceivable_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_AccountsPayable_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_ProjectCosting_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_TimeExpenses_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_BillingEngine_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_CashFlow_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_Banking_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_Reporting_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_Integrations_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_Security_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_Settings_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_Settings_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_EmployeePortal_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_ProfileManagement_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_FinancePayroll_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_PersonalExpenses_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_NotificationsHub_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_LearningDevelopment_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_DocumentStorage_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_InternalCommunication_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_employee_EmployeeAttendance_js
    FE_other_App_js -.->|uses| FE_components_features_employees_components_Attendance_SimpleEmployeeCheckInOut_js
    FE_other_App_js -.->|uses| FE_components_features_employees_components_Attendance_SimpleAdminCheckInOut_js
    FE_other_App_js -.->|uses| FE_pages_features_employees_pages_EmployeeLanding_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_WorkSpaces_js
    FE_other_App_js -.->|uses| FE_pages_features_admin_pages_admin_AdminMessagingDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_TenantDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_tenant_org_TenantOrg_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HREmployees_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRPayroll_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRLeaveRequests_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRPerformance_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRRecruitment_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HROnboarding_js
    FE_other_App_js -.->|uses| FE_pages_features_hr_pages_hr_HRTraining_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_FinanceBudgeting_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_FinanceTax_js
    FE_other_App_js -.->|uses| FE_pages_features_finance_pages_Finance_EquityCapTable_js
    FE_other_App_js -.->|uses| FE_pages_features_admin_pages_admin_ProjectManagement_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_ProjectOverview_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_MyProjects_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_ProjectTasks_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_ProjectMilestones_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_ProjectResources_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_ProjectTimesheets_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_SprintManagement_js
    FE_other_App_js -.->|uses| FE_pages_features_projects_pages_projects_DevelopmentAnalytics_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_SoftwareHouseDashboard_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsDashboard_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsWorkflows_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsAssets_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsVendors_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsCompliance_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsQuality_js
    FE_other_App_js -.->|uses| FE_pages_shared_pages_operations_OperationsDocumentation_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsContracts_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsCommunications_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsBilling_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsSupport_js
    FE_other_App_js -.->|uses| FE_pages_features_tenant_pages_clients_ClientsFeedback_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_reports_ReportsDashboard_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_reports_ReportsDepartmental_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_reports_ReportsKPIs_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_reports_ReportsAnalytics_js
    FE_other_App_js -.->|uses| FE_pages_features_dashboard_pages_reports_ReportsCustom_js

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1

```

## How to View

1. Copy the mermaid code above
2. Paste it into [Mermaid Live Editor](https://mermaid.live)
3. Or use a Markdown viewer that supports Mermaid (like GitHub, GitLab, or VS Code with Mermaid extension)

## File Categories

### Frontend
- **Pages**: Main page components
- **Components**: Reusable UI components
- **Services**: API service layers
- **Utils**: Utility functions
- **Layouts**: Layout components
- **Providers**: Context providers
- **Hooks**: Custom React hooks
- **Config**: Configuration files

### Backend
- **Routes**: API route definitions
- **Controllers**: Request handlers
- **Models**: Database models
- **Services**: Business logic services
- **Middleware**: Express middleware
- **Utils**: Utility functions
- **Config**: Configuration files
- **Modules**: Feature modules

## Notes

- The diagram shows key relationships between files
- Due to the large number of files, only representative samples are shown
- Solid arrows indicate direct dependencies
- Dotted arrows indicate usage relationships
