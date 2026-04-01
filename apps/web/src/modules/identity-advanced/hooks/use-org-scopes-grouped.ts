/**
 * @contract FR-001-M01 D4, UX-IDN-001
 * React Query hook for the grouped org scopes listing (admin_org_scopes_list).
 */

import { useQuery } from '@tanstack/react-query';
import { fetchOrgScopesGrouped } from '../api/identity-advanced.api.js';
import type { OrgScopesGroupedFilters } from '../types/identity-advanced.types.js';

export function useOrgScopesGrouped(filters: OrgScopesGroupedFilters) {
  return useQuery({
    queryKey: ['identity-advanced', 'org-scopes-grouped', filters],
    queryFn: () => fetchOrgScopesGrouped(filters),
  });
}
