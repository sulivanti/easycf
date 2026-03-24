/**
 * @contract FR-008, UX-006
 *
 * React Query hook for the interleaved timeline.
 * queryKey: ['case-execution', 'timeline', caseId]
 */

import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '../api/case-execution.api.js';

export const TIMELINE_KEY = ['case-execution', 'timeline'] as const;

/** @contract FR-008 — GET /api/v1/cases/:id/timeline */
export function useTimeline(caseId: string | null) {
  return useQuery({
    queryKey: [...TIMELINE_KEY, caseId],
    queryFn: ({ signal }) => getTimeline(caseId!, signal),
    enabled: !!caseId,
    select: (res) => res.entries,
  });
}
