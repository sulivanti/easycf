/**
 * @contract FR-001, UX-005
 * React Query hooks for cycles list + CRUD mutations.
 * queryKey: ['process-modeling', 'cycles', filters]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCycles, createCycle, updateCycle, deleteCycle } from '../api/process-modeling.api.js';
import type {
  CycleListFilters,
  CreateCycleRequest,
  UpdateCycleRequest,
} from '../types/process-modeling.types.js';

export const CYCLES_KEY = ['process-modeling', 'cycles'] as const;

/** @contract FR-001 — GET /admin/cycles with cursor pagination */
export function useCycles(filters: CycleListFilters) {
  return useQuery({
    queryKey: [...CYCLES_KEY, filters],
    queryFn: ({ signal }) => fetchCycles(filters, signal),
  });
}

/** @contract FR-001 — POST /admin/cycles */
export function useCreateCycle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCycleRequest) => createCycle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
    },
  });
}

/** @contract FR-001 — PATCH /admin/cycles/:id */
export function useUpdateCycle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCycleRequest }) => updateCycle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
    },
  });
}

/** @contract FR-001 — DELETE /admin/cycles/:id */
export function useDeleteCycle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCycle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
    },
  });
}
