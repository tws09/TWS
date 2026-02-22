# Backend Route Restructuring Plan

## New Module Structure

### 1. Auth Module (`modules/auth/routes/`)
- `auth.js` → `authentication.js`
- `users.js` → `users.js`
- `sessionManagement.js` → `sessions.js`
- `tenantAuth.js` → `tenantAuth.js`

### 2. Admin Module (`modules/admin/routes/`)
- `admin.js` → `admin.js`
- `supraAdmin.js` → `supraAdmin.js`
- `twsAdmin.js` → `twsAdmin.js`
- `gtsAdmin.js` → `gtsAdmin.js` (deprecated)
- `adminMessaging.js` → `messaging.js`
- `adminModeration.js` → `moderation.js`
- `adminAttendance.js` → `attendance.js`
- `adminAttendancePanel.js` → `attendancePanel.js`
- `supraAdminMessaging.js` → `supraMessaging.js`
- `supraAdminReports.js` → `supraReports.js`
- `supraAdminSessionManagement.js` → `supraSessions.js`
- `supraAdminTenantERP.js` → `supraTenantERP.js`

### 3. Tenant Module (`modules/tenant/routes/`)
- `tenantManagement.js` → `management.js`
- `tenantDashboard.js` → `dashboard.js`
- `tenantSwitching.js` → `switching.js`
- `tenantOrg.js` → `organization.js`
- `tenantSoftwareHouse.js` → `softwareHouse.js`

### 4. Core Module (`modules/core/routes/`)
- `health.js` → `health.js`
- `metrics.js` → `metrics.js`
- `logs.js` → `logs.js`
- `security.js` → `security.js`
- `compliance.js` → `compliance.js`
- `files.js` → `files.js`
- `notifications.js` → `notifications.js`
- `webhooks.js` → `webhooks.js`

### 5. Business Module (`modules/business/routes/`)
- `employees.js` → `employees.js`
- `employee.js` → `employee.js`
- `attendance.js` → `attendance.js`
- `employeeAttendance.js` → `employeeAttendance.js`
- `modernAttendance.js` → `modernAttendance.js`
- `simpleAttendance.js` → `simpleAttendance.js`
- `softwareHouseAttendance.js` → `softwareHouseAttendance.js`
- `calendarAttendance.js` → `calendarAttendance.js`
- `attendanceIntegration.js` → `attendanceIntegration.js`
- `payroll.js` → `payroll.js`
- `finance.js` → `finance.js`
- `projects.js` → `projects.js`
- `projectAccess.js` → `projectAccess.js`
- `tasks.js` → `tasks.js`
- `clients.js` → `clients.js`
- `clientPortal.js` → `clientPortal.js`
- `teams.js` → `teams.js`
- `timeTracking.js` → `timeTracking.js`
- `messaging.js` → `messaging.js`
- `mobileMessaging.js` → `mobileMessaging.js`
- `boards.js` → `boards.js`
- `cards.js` → `cards.js`
- `lists.js` → `lists.js`
- `workspaces.js` → `workspaces.js`
- `templates.js` → `templates.js`
- `sprints.js` → `sprints.js`
- `developmentMetrics.js` → `developmentMetrics.js`
- `softwareHouseRoles.js` → `softwareHouseRoles.js`
- `erpManagement.js` → `erpManagement.js`
- `erpTemplates.js` → `erpTemplates.js`
- `masterERP.js` → `masterERP.js`
- `masterERP-fixed.js` → `masterERPFixed.js`
- `formManagement.js` → `formManagement.js`
- `resources.js` → `resources.js`
- `sales.js` → `sales.js`
- `partners.js` → `partners.js`

### 6. Monitoring Module (`modules/monitoring/routes/`)
- `systemMonitoring.js` → `system.js`
- `standaloneMonitoring.js` → `standalone.js`

### 7. Integration Module (`modules/integration/routes/`)
- `integrations.js` → `integrations.js`
- `calendarIntegration.js` → `calendar.js`
- `platformIntegration.js` → `platform.js`
- `timezone.js` → `timezone.js`
- `defaultContacts.js` → `defaultContacts.js`
- `webrtc.js` → `webrtc.js`

### 8. Portal Module (Keep existing structure)
- `portal/` → Keep as is (already well organized)

## Benefits of New Structure

1. **Feature-based Organization**: Routes are grouped by business domain
2. **Improved Maintainability**: Related functionality is co-located
3. **Better Scalability**: Easy to add new features within modules
4. **Cleaner Imports**: Module-based imports with index files
5. **Professional Structure**: Matches frontend architecture
6. **Easier Testing**: Module-specific test organization
7. **Better Documentation**: Module-level documentation possible

## Implementation Steps

1. Create module directories ✅
2. Move routes to appropriate modules
3. Create index files for each module
4. Update app.js route loading
5. Test all endpoints
6. Update documentation
