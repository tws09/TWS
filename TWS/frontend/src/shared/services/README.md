# Frontend Services Directory Structure

This directory contains all frontend service layer files organized by domain/category.

## Folder Structure

```
services/
├── analytics/              # Analytics & insights services
│   ├── analytics.service.js
│   └── ai-insights.service.js
│
├── auth/                   # Authentication & token services
│   ├── secure-token.service.js
│   └── token-refresh.service.js
│
├── tenant/                 # Tenant management services
│   └── tenant-api.service.js
│
├── business/               # Business logic services
│   ├── billing.service.js
│   ├── equity.service.js
│   ├── form-management.service.js
│   ├── partner.service.js
│   ├── resource.service.js
│   ├── task.service.js
│   ├── usage-tracking.service.js
│   └── workspace.service.js
│
└── industry/               # Industry-specific APIs (Software House only)
    ├── config/
    ├── utils/
    └── softwareHouseApi.js
```

## Naming Convention

- **File names**: Use kebab-case with `.service.js` suffix
  - ✅ `tenant-api.service.js`
  - ✅ `token-refresh.service.js`
  - ❌ `tenantApiService.js`
  - ❌ `tokenRefreshService.js`

- **Folder names**: Use kebab-case
  - ✅ `analytics/`
  - ✅ `tenant/`
  - ❌ `analyticsServices/`
  - ❌ `tenantServices/`

## Service Categories

### Analytics Services
Services for analytics, reporting, and AI insights.

### Auth Services
Services for authentication, token management, and security.

### Tenant Services
Services for tenant/organization management and API calls.

### Business Services
Core business logic services for various features.

### Industry Services
Industry-specific API services (Healthcare, Education, Software House).

## Usage

### ES6 Import (Recommended)
```javascript
import tenantApiService from '@/shared/services/tenant/tenant-api.service';
import { analyticsService } from '@/shared/services/analytics/analytics.service';
```

### Through Index (Organized)
```javascript
import { tenant, analytics, business } from '@/shared/services';
const tenantService = tenant.tenantApiService;
```
