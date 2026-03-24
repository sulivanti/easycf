/**
 * @contract FR-006, FR-012, UX-006
 *
 * React Query hooks for assignments: list + assign/reassign.
 * queryKey: ['case-execution', 'assignments', caseId]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAssignments, assignResponsible } from '../api/case-execution.api.js';
import { DETAIL_KEY } from './use-cases.js';
import { TIMELINE_KEY } from './use-timeline.js';

export const ASSIGNMENTS_KEY = ['case-execution', 'assignments'] as const;

/** @contract FR-012 — GET /api/v1/cases/:id/assignments */
export function useAssignments(caseId: string) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, caseId],
    queryFn: ({ signal }) => listAssignments(caseId, signal),
    select: (res) => res.data,
  });
}

/** @contract FR-006 — POST /api/v1/cases/:id/assignments */
export function useAssignResponsible(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof assignResponsible>[1]) => assignResponsible(caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ASSIGNMENTS_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}
