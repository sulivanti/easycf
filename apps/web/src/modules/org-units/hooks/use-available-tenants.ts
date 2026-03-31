/**
 * @contract UX-001-C04, FR-003, FR-008
 * Hook to fetch ACTIVE tenants available for linking to an N4 org unit.
 * Reuses foundation tenants API, filtering out already-linked tenant IDs.
 */

import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '../../foundation/api/tenants.api.js';
import type { TenantListItem } from '../../foundation/types/tenant.types.js';

export const AVAILABLE_TENANTS_KEY = ['available-tenants'] as const;

interface UseAvailableTenantsOptions {
  enabled: boolean;
  linkedTenantIds: string[];
}

export function useAvailableTenants({ enabled, linkedTenantIds }: UseAvailableTenantsOptions) {
  const query = useQuery<TenantListItem[]>({
    queryKey: [...AVAILABLE_TENANTS_KEY, linkedTenantIds],
    queryFn: async () => {
      const res = await tenantsApi.list({ limit: 200 });
      return res.data.filter((t) => t.status === 'ACTIVE' && !linkedTenantIds.includes(t.id));
    },
    enabled,
  });

  return {
    tenants: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
