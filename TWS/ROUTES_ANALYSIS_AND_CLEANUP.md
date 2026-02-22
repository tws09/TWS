# Routes Analysis and Cleanup Plan

## 📋 Current Route Loading Status

### ✅ Routes Actually Loaded in `app.js`:
Only 4 files from `routes/` directory are loaded:
1. `educationSignup.js` - `/api/education`
2. `healthcareSignup.js` - `/api/healthcare`
3. `selfServeSignup.js` - `/api/signup`
4. `emailValidation.js` - `/api/email`

### ❌ All Other Routes in `routes/` are NOT Loaded

The active system uses **modular routes** from `modules/*/routes/`, not the legacy files in `routes/`.

## 🔍 Wolfstack Portal Association

The wolfstack portal (main portal at `http://localhost:3000`) used these modules:
- Finance (`/finance/*`)
- HR (`/hr/*`)
- Operations (`/operations/*`)
- Projects (`/projects/*`)
- Clients (`/clients/*`)
- Admin (`/admin/*`)

These frontend routes have been **DELETED**.

## 📊 Route Files Analysis

### Files to KEEP (Actually Loaded):
- ✅ `educationSignup.js` - Used for education signup
- ✅ `healthcareSignup.js` - Used for healthcare signup
- ✅ `selfServeSignup.js` - Used for tenant signup
- ✅ `emailValidation.js` - Used for email validation

### Files to DELETE (Legacy/Unused):
All other files in `routes/` are legacy and NOT loaded:

**Wolfstack Portal Related (Not Loaded):**
- ❌ `finance.js` - Legacy, not loaded
- ❌ `admin.js` - Legacy, not loaded
- ❌ `adminMessaging.js` - Legacy, not loaded
- ❌ `adminModeration.js` - Legacy, not loaded
- ❌ `projects.js` - Legacy, not loaded
- ❌ `clients.js` - Legacy, not loaded
- ❌ `clientPortal.js` - Legacy, not loaded
- ❌ `boards.js` - Legacy, not loaded
- ❌ `cards.js` - Legacy, not loaded
- ❌ `workspaces.js` - Legacy, not loaded
- ❌ `lists.js` - Legacy, not loaded
- ❌ `tasks.js` - Legacy, not loaded
- ❌ `teams.js` - Legacy, not loaded
- ❌ `sprints.js` - Legacy, not loaded
- ❌ `templates.js` - Legacy, not loaded
- ❌ `payroll.js` - Legacy, not loaded
- ❌ `employee.js` - Legacy, not loaded
- ❌ `employees.js` - Legacy, not loaded
- ❌ `tenantOrg.js` - Legacy, not loaded (active file is `modules/tenant/routes/organization.js`)
- ❌ `tenantDashboard.js` - Legacy, not loaded
- ❌ `tenantManagement.js` - Legacy, not loaded
- ❌ `tenantRouter.js` - Legacy, not loaded
- ❌ `tenantSoftwareHouse.js` - Legacy, not loaded
- ❌ `tenantSwitching.js` - Legacy, not loaded
- ❌ `tenantAuth.js` - Legacy, not loaded

**Other Legacy Files (Not Loaded):**
- ❌ `auth.js` - Legacy, modular routes used instead
- ❌ `users.js` - Legacy, modular routes used instead
- ❌ `gtsAdmin.js` - Legacy, modular routes used instead
- ❌ `twsAdmin.js` - Legacy, modular routes used instead
- ❌ `supraAdmin.js` - Legacy, modular routes used instead
- ❌ `supraAdminMessaging.js` - Legacy, modular routes used instead
- ❌ `supraAdminReports.js` - Legacy, modular routes used instead
- ❌ `supraAdminSessionManagement.js` - Legacy, modular routes used instead
- ❌ `supraAdminTenantERP.js` - Legacy, modular routes used instead
- ❌ `erpManagement.js` - Legacy, modular routes used instead
- ❌ `erpTemplates.js` - Legacy, modular routes used instead
- ❌ `formManagement.js` - Legacy, modular routes used instead
- ❌ `resources.js` - Legacy, modular routes used instead
- ❌ `sales.js` - Legacy, modular routes used instead
- ❌ `partners.js` - Legacy, modular routes used instead
- ❌ `softwareHouseRoles.js` - Legacy, modular routes used instead
- ❌ `timeTracking.js` - Legacy, modular routes used instead
- ❌ `developmentMetrics.js` - Legacy, modular routes used instead
- ❌ `projectAccess.js` - Legacy, modular routes used instead
- ❌ `mobileMessaging.js` - Legacy, modular routes used instead
- ❌ `integrations.js` - Legacy, modular routes used instead
- ❌ `calendarIntegration.js` - Legacy, modular routes used instead
- ❌ `platformIntegration.js` - Legacy, modular routes used instead
- ❌ `timezone.js` - Legacy, modular routes used instead
- ❌ `defaultContacts.js` - Legacy, modular routes used instead
- ❌ `webrtc.js` - Legacy, modular routes used instead
- ❌ `health.js` - Legacy, modular routes used instead
- ❌ `metrics.js` - Legacy, modular routes used instead
- ❌ `logs.js` - Legacy, modular routes used instead
- ❌ `security.js` - Legacy, modular routes used instead
- ❌ `compliance.js` - Legacy, modular routes used instead
- ❌ `files.js` - Legacy, modular routes used instead
- ❌ `notifications.js` - Legacy, modular routes used instead
- ❌ `webhooks.js` - Legacy, modular routes used instead
- ❌ `systemMonitoring.js` - Legacy, modular routes used instead
- ❌ `standaloneMonitoring.js` - Legacy, modular routes used instead

## ✅ Recommendation

**DELETE all files except:**
- `educationSignup.js`
- `healthcareSignup.js`
- `selfServeSignup.js`
- `emailValidation.js`

All other files are legacy/unused and the active system uses modular routes from `modules/*/routes/`.
