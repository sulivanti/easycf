/**
 * @contract FR-004, FR-005, FR-011, UX-006
 *
 * React Query hooks for gates: list, resolve, waive.
 * queryKey: ['case-execution', 'gates', caseId]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listGates, resolveGate, waiveGate } from '../api/case-execution.api.js';
import { DETAIL_KEY } from './use-cases.js';
import { TIMELINE_KEY } from './use-timeline.js';

export const GATES_KEY = ['case-execution', 'gates'] as const;

/** @contract FR-011 — GET /api/v1/cases/:id/gates */
export function useGates(caseId: string, stageId?: string) {
  return useQuery({
    queryKey: [...GATES_KEY, caseId, stageId],
    queryFn: ({ signal }) => listGates(caseId, stageId, signal),
    select: (res) => res.data,
  });
}

/** @contract FR-004 — POST /api/v1/cases/:id/gates/:gateId/resolve */
export function useResolveGate(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      gateInstanceId,
      body,
    }: {
      gateInstanceId: string;
      body: Parameters<typeof resolveGate>[2];
    }) => resolveGate(caseId, gateInstanceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...GATES_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}

/** @contract FR-005 — POST /api/v1/cases/:id/gates/:gateId/waive */
export function useWaiveGate(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ gateInstanceId, motivo }: { gateInstanceId: string; motivo: string }) =>
      waiveGate(caseId, gateInstanceId, { motivo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...GATES_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}
