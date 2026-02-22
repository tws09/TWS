# Services Directory Structure

This directory contains all service layer files organized by domain/category.

## Folder Structure

```
services/
├── core/                    # Core infrastructure services
│   ├── cache.service.js
│   ├── database.service.js
│   ├── encryption.service.js
│   ├── logger.service.js
│   └── ...
│
├── auth/                    # Authentication & authorization services
│   ├── jwt.service.js
│   ├── token-blacklist.service.js
│   └── ...
│
├── tenant/                  # Tenant management services
│   ├── tenant.service.js
│   ├── tenant-provisioning.service.js
│   ├── tenant-switching.service.js
│   └── ...
│
├── finance/                 # Financial services (already exists)
│   ├── accounts-payable.service.js
│   ├── accounts-receivable.service.js
│   ├── billing.service.js
│   └── ...
│
├── hr/                      # Human Resources services (already exists)
│   ├── attendance.service.js
│   ├── employee.service.js
│   ├── payroll.service.js
│   └── ...
│
├── healthcare/              # Healthcare-specific services
│   ├── clinical-decision-support.service.js
│   ├── hl7.service.js
│   ├── patient-portal.service.js
│   └── ...
│
├── education/               # Education-specific services
│   ├── grade-calculation.service.js
│   └── ...
│
├── software-house/          # Software House services (already exists)
│   ├── code-quality.service.js
│   └── time-tracking.service.js
│
├── integrations/            # External integrations
│   ├── calendar.service.js
│   ├── email.service.js
│   ├── payment.service.js
│   └── ...
│
├── analytics/               # Analytics & reporting services
│   ├── analytics.service.js
│   ├── data-warehouse.service.js
│   └── ...
│
├── notifications/           # Notification services
│   ├── notification.service.js
│   ├── email-notification.service.js
│   └── ...
│
├── compliance/              # Compliance & security services
│   ├── audit.service.js
│   ├── ferpa-compliance.service.js
│   ├── gdpr.service.js
│   └── ...
│
└── index.js                # Main service index (exports all services)
```

## Naming Convention

- **File names**: Use kebab-case with `.service.js` suffix
  - ✅ `tenant-provisioning.service.js`
  - ✅ `email-notification.service.js`
  - ❌ `tenantProvisioningService.js`
  - ❌ `emailNotificationService.js`

- **Folder names**: Use kebab-case
  - ✅ `software-house/`
  - ✅ `patient-portal/`
  - ❌ `softwareHouse/`
  - ❌ `patientPortal/`

## Service Categories

### Core Services
Infrastructure and foundational services used across the application.

### Domain Services
Business domain-specific services organized by ERP category or feature area.

### Integration Services
Services that integrate with external systems (APIs, third-party services).

### Utility Services
Helper services that provide common functionality.
