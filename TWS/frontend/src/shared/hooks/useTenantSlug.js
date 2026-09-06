import { useParams } from 'react-router-dom';

/**
 * Returns the current tenant slug from the React Router :tenantSlug param.
 * Tenancy is path-based: /<tenant-slug>/org/... — the slug is always in the URL.
 */
export function useTenantSlug() {
  const params = useParams();
  return params.tenantSlug || '';
}
