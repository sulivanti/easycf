/**
 * @contract FR-011, UX-005 §2
 * React Query hook for cycle flow graph (full tree).
 * queryKey: ['process-modeling', 'flow', cycleId]
 */

import { useQuery } from '@tanstack/react-query';
import { fetchFlow } from '../api/process-modeling.api.js';

export const FLOW_KEY = ['process-modeling', 'flow'] as const;

/** @contract FR-011 — GET /admin/cycles/:id/flow */
export function useFlow(cycleId: string | null) {
  return useQuery({
    queryKey: [...FLOW_KEY, cycleId],
    queryFn: ({ signal }) => fetchFlow(cycleId!, signal),
    enabled: !!cycleId,
  });
}
