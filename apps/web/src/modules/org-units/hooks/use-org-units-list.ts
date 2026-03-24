/**
 * @contract FR-005
 * React Query hook for flat org-units list with cursor pagination.
 * queryKey: ['org-units', 'list', filters]
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOrgUnits } from '../api/org-units.api.js';
import type { OrgUnitFilters } from '../types/org-units.types.js';

export const ORG_UNITS_LIST_KEY = ['org-units', 'list'] as const;

export function useOrgUnitsList(filters: OrgUnitFilters) {
  return useQuery({
    queryKey: [...ORG_UNITS_LIST_KEY, filters],
    queryFn: ({ signal }) => fetchOrgUnits(filters, signal),
  });
}

export function useInvalidateOrgUnitsList() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ORG_UNITS_LIST_KEY });
}
