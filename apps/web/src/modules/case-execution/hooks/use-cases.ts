/**
 * @contract FR-009, FR-010, FR-001, UX-006
 *
 * React Query hooks for case list, detail, and open mutation.
 * queryKey: ['case-execution', 'cases', filters] / ['case-execution', 'detail', id]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCases, getCaseDetails, openCase } from '../api/case-execution.api.js';
import type { CaseListFilters } from '../types/case-execution.types.js';

export const CASES_KEY = ['case-execution', 'cases'] as const;
export const DETAIL_KEY = ['case-execution', 'detail'] as const;

/** @contract FR-009 — GET /api/v1/cases with cursor pagination */
export function useCaseList(filters: CaseListFilters) {
  return useQuery({
    queryKey: [...CASES_KEY, filters],
    queryFn: ({ signal }) => listCases(filters, signal),
  });
}

/** @contract FR-010 — GET /api/v1/cases/:id */
export function useCaseDetail(caseId: string | null) {
  return useQuery({
    queryKey: [...DETAIL_KEY, caseId],
    queryFn: ({ signal }) => getCaseDetails(caseId!, signal),
    enabled: !!caseId,
  });
}

/** @contract FR-001 — POST /api/v1/cases (idempotent) */
export function useOpenCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof openCase>[0]) => openCase(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CASES_KEY });
    },
  });
}
