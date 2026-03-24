/**
 * @contract UX-APROV-001, FR-006, FR-007, FR-008
 *
 * React Query hooks for movement list, detail, cancel, override, retry.
 * queryKey: ['movement-approval', 'movements', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movementApprovalApi } from '../api/movement-approval.api.js';
import type { MovementListParams, OverrideRequest } from '../types/movement-approval.types.js';

export const MOVEMENTS_KEY = ['movement-approval', 'movements'] as const;
export const MOVEMENT_DETAIL_KEY = ['movement-approval', 'movement-detail'] as const;

/** @contract FR-008 — GET /movements */
export function useMovements(params: MovementListParams = {}) {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY, params],
    queryFn: () => movementApprovalApi.listMovements(params),
  });
}

/** @contract FR-008 — GET /movements/:id */
export function useMovementDetail(id: string | null) {
  return useQuery({
    queryKey: [...MOVEMENT_DETAIL_KEY, id],
    queryFn: () => movementApprovalApi.getMovement(id!),
    enabled: !!id,
  });
}

/** @contract FR-006 — POST /movements/:id/cancel */
export function useCancelMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => movementApprovalApi.cancelMovement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENT_DETAIL_KEY });
    },
  });
}

/** @contract FR-007 — POST /movements/:id/override */
export function useOverrideMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OverrideRequest }) =>
      movementApprovalApi.overrideMovement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENT_DETAIL_KEY });
    },
  });
}

/** @contract UX-APROV-001 — POST /movements/:id/retry */
export function useRetryMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => movementApprovalApi.retryMovement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
      qc.invalidateQueries({ queryKey: MOVEMENT_DETAIL_KEY });
    },
  });
}
