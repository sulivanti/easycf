/**
 * @contract FR-001, FR-006
 * React Query hook for org-unit detail by ID.
 * Returns raw OrgUnitDetailDTO — consumers apply toFormVM or toDetailVM as needed.
 * queryKey: ['org-units', 'detail', id]
 */

import { useQuery } from '@tanstack/react-query';
import { fetchOrgUnitDetail } from '../api/org-units.api.js';

export const ORG_UNIT_DETAIL_KEY = ['org-units', 'detail'] as const;

export function useOrgUnitDetail(id: string | null) {
  return useQuery({
    queryKey: [...ORG_UNIT_DETAIL_KEY, id],
    queryFn: ({ signal }) => fetchOrgUnitDetail(id!, signal),
    enabled: !!id,
  });
}
