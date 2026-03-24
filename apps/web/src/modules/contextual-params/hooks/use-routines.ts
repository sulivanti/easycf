/**
 * @contract FR-005, FR-007, FR-008, UX-007
 *
 * React Query hooks for routines list, detail, create, publish, fork.
 * queryKey: ['contextual-params', 'routines', filters] / ['contextual-params', 'routine-detail', id]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRoutines,
  getRoutineDetail,
  createRoutine,
  updateRoutine,
  publishRoutine,
  forkRoutine,
} from '../api/contextual-params.api.js';
import type {
  RoutineListFilters,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  PublishRoutineRequest,
  ForkRoutineRequest,
} from '../types/contextual-params.types.js';

export const ROUTINES_KEY = ['contextual-params', 'routines'] as const;
export const ROUTINE_DETAIL_KEY = ['contextual-params', 'routine-detail'] as const;

/** @contract FR-005 — GET /admin/routines */
export function useRoutinesList(filters: RoutineListFilters) {
  return useQuery({
    queryKey: [...ROUTINES_KEY, filters],
    queryFn: ({ signal }) => listRoutines(filters, signal),
  });
}

/** @contract FR-005 — GET /admin/routines/:id */
export function useRoutineDetail(id: string | null) {
  return useQuery({
    queryKey: [...ROUTINE_DETAIL_KEY, id],
    queryFn: ({ signal }) => getRoutineDetail(id!, signal),
    enabled: !!id,
  });
}

/** @contract FR-005 — POST /admin/routines */
export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoutineRequest) => createRoutine(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINES_KEY }),
  });
}

/** @contract FR-005 — PATCH /admin/routines/:id */
export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoutineRequest }) =>
      updateRoutine(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROUTINES_KEY });
      qc.invalidateQueries({ queryKey: ROUTINE_DETAIL_KEY });
    },
  });
}

/** @contract FR-007 — POST /admin/routines/:id/publish */
export function usePublishRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: PublishRoutineRequest }) =>
      publishRoutine(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROUTINES_KEY });
      qc.invalidateQueries({ queryKey: ROUTINE_DETAIL_KEY });
    },
  });
}

/** @contract FR-008 — POST /admin/routines/:id/fork */
export function useForkRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ForkRoutineRequest }) => forkRoutine(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINES_KEY }),
  });
}
