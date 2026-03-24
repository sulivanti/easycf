/**
 * @contract FR-006, UX-007
 *
 * React Query hooks for routine items CRUD.
 * Invalidates routine detail on mutation success for auto-refresh.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRoutineItem,
  updateRoutineItem,
  deleteRoutineItem,
} from '../api/contextual-params.api.js';
import type {
  CreateRoutineItemRequest,
  UpdateRoutineItemRequest,
} from '../types/contextual-params.types.js';
import { ROUTINE_DETAIL_KEY } from './use-routines.js';

/** @contract FR-006 — POST /admin/routines/:id/items */
export function useCreateRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: CreateRoutineItemRequest }) =>
      createRoutineItem(routineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINE_DETAIL_KEY }),
  });
}

/** @contract FR-006 — PATCH /admin/routine-items/:id */
export function useUpdateRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateRoutineItemRequest }) =>
      updateRoutineItem(itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINE_DETAIL_KEY }),
  });
}

/** @contract FR-006 — DELETE /admin/routine-items/:id */
export function useDeleteRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteRoutineItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINE_DETAIL_KEY }),
  });
}
