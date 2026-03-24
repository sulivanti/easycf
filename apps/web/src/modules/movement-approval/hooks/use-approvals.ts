/**
 * @contract UX-APROV-001, FR-004, FR-005
 *
 * React Query hooks for approval inbox, approve/reject, and pending count.
 * queryKey: ['movement-approval', 'approvals', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movementApprovalApi } from '../api/movement-approval.api.js';
import { MOVEMENTS_KEY, MOVEMENT_DETAIL_KEY } from './use-movements.js';
import type { ApproveRequest, RejectRequest } from '../types/movement-approval.types.js';

export const APPROVALS_KEY = ['movement-approval', 'approvals'] as const;
export const PENDING_COUNT_KEY = ['movement-approval', 'pending-count'] as const;

/** @contract FR-004 — GET /approvals/mine */
export function useMyApprovals(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: [...APPROVALS_KEY, params],
    queryFn: () => movementApprovalApi.listMyApprovals(params),
  });
}

/** @contract FR-005 — POST /movements/:id/approve */
export function useApproveMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, data }: { movementId: string; data: ApproveRequest }) =>
      movementApprovalApi.approveMovement(movementId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPROVALS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENT_DETAIL_KEY });
      qc.invalidateQueries({ queryKey: PENDING_COUNT_KEY });
    },
  });
}

/** @contract FR-005 — POST /movements/:id/reject */
export function useRejectMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, data }: { movementId: string; data: RejectRequest }) =>
      movementApprovalApi.rejectMovement(movementId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPROVALS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENT_DETAIL_KEY });
      qc.invalidateQueries({ queryKey: PENDING_COUNT_KEY });
    },
  });
}

/** @contract UX-APROV-001 — GET /approvals/pending-count (polls every 60s) */
export function usePendingCount() {
  return useQuery({
    queryKey: [...PENDING_COUNT_KEY],
    queryFn: () => movementApprovalApi.getPendingCount(),
    refetchInterval: 60_000,
  });
}
