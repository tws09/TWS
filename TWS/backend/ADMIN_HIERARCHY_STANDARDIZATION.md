# TWS Admin Hierarchy Standardization

## Current Issues Identified:
1. **SupraAdmin** and **GTSAdmin** models are identical - redundant
2. **super_admin** role vs **SupraAdmin** model confusion
3. Mixed naming conventions across the system
4. Unclear hierarchy between platform-level and tenant-level admins

## Proposed Standardized Hierarchy:

### Platform Level (TWS System Administrators)
- **TWSAdmin** (renamed from SupraAdmin/GTSAdmin)
  - Manages the entire TWS platform
  - Creates and manages tenants
  - System-wide configuration
  - Roles: `platform_super_admin`, `platform_admin`, `platform_support`, `platform_billing`

### Tenant Level (Organization Administrators)
- **TenantAdmin** (organization-level admins)
  - Manages within their organization/tenant
  - User management within tenant
  - Tenant-specific configuration
  - Roles: `super_admin`, `admin`, `hr`, `finance`, `pmo`, etc.

## Implementation Plan:
1. Rename SupraAdmin/GTSAdmin to TWSAdmin
2. Update all references and routes
3. Clarify role hierarchy
4. Update authentication middleware
5. Update frontend references
