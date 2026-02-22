# Tenant Provisioning Service - Refactored Structure

This service has been refactored from a single 2500+ line file into a modular structure for better maintainability and error tracking.

## Structure

```
tenantProvisioningService/
├── index.js                    # Main service class (entry point)
├── utils.js                    # Utility functions
├── tenantCreation.js           # Tenant record and database creation
├── userAndOrgCreation.js       # Admin user and organization creation
├── onboarding.js               # Onboarding status management
├── tenantManagement.js         # Tenant activation/deactivation
├── emailService.js             # Email sending functionality
├── seeders/
│   ├── index.js                # Seeder router
│   ├── educationSeeder.js      # Education-specific seeding (TODO: extract from original)
│   ├── healthcareSeeder.js     # Healthcare-specific seeding (TODO: extract from original)
│   ├── retailSeeder.js         # Retail-specific seeding (TODO: extract from original)
│   ├── manufacturingSeeder.js  # Manufacturing-specific seeding (TODO: extract from original)
│   └── defaultSeeder.js        # Default ERP seeding (TODO: extract from original)
└── defaultDataCreators/        # Default data creation modules (TODO: create)
    ├── departmentsAndTeams.js
    ├── chartOfAccounts.js
    ├── clientsAndVendors.js
    ├── meetingTemplates.js
    ├── notificationTemplates.js
    ├── employeesAndPayroll.js
    ├── auditLogs.js
    ├── attendancePolicy.js
    ├── projectTemplates.js
    ├── sampleProject.js
    └── financeTransactions.js
```

## Migration Status

✅ **Completed:**
- Folder structure created
- Core modules (utils, tenantCreation, userAndOrgCreation)
- Onboarding and tenant management modules
- Email service
- Main index.js with backward-compatible API

⏳ **In Progress:**
- Seeder files need to be extracted from original `tenantProvisioningService.js`
- Default data creators need to be extracted

## Next Steps

1. Extract seeder code from original file into individual seeder modules
2. Extract default data creation code into defaultDataCreators modules
3. Update all imports to use new structure
4. Remove original `tenantProvisioningService.js` file
5. Test all functionality

## Usage

The service maintains backward compatibility - existing code using `require('../services/tenantProvisioningService')` will continue to work.

```javascript
const tenantProvisioningService = require('../services/tenantProvisioningService');

// All existing methods work the same way
await tenantProvisioningService.provisionTenant(tenantData, masterERPId, createdBy);
```

## Benefits

- **Easier error tracking**: Errors can be traced to specific modules
- **Better maintainability**: Smaller, focused files
- **Improved testability**: Each module can be tested independently
- **Clearer organization**: Related functionality grouped together

