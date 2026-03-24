/**
 * @contract FR-004, UX-008 §2.3
 *
 * React Query hooks for integration params CRUD.
 * queryKey: ['integration-protheus', 'params', routineId]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listParams, createParam, updateParam } from '../api/integration-protheus.api.js';
import type {
  CreateParamRequest,
  UpdateParamRequest,
} from '../types/integration-protheus.types.js';

export const PARAMS_KEY = ['integration-protheus', 'params'] as const;

/** @contract FR-004 — GET routine params */
export function useIntegrationParams(routineId: string | null) {
  return useQuery({
    queryKey: [...PARAMS_KEY, routineId],
    queryFn: ({ signal }) => listParams(routineId!, signal),
    enabled: !!routineId,
  });
}

/** @contract FR-004 — POST /admin/routines/:id/params */
export function useCreateParam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: CreateParamRequest }) =>
      createParam(routineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARAMS_KEY }),
  });
}

/** @contract FR-004 — PATCH /admin/integration-params/:id */
export function useUpdateParam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParamRequest }) => updateParam(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARAMS_KEY }),
  });
}
