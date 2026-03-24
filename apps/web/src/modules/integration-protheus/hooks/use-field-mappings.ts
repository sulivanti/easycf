/**
 * @contract FR-003, UX-008 §2.3
 *
 * React Query hooks for field-mapping CRUD.
 * queryKey: ['integration-protheus', 'field-mappings', routineId]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listFieldMappings,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
} from '../api/integration-protheus.api.js';
import type {
  CreateFieldMappingRequest,
  UpdateFieldMappingRequest,
} from '../types/integration-protheus.types.js';

export const MAPPINGS_KEY = ['integration-protheus', 'field-mappings'] as const;

/** @contract FR-003 — GET routine field-mappings */
export function useFieldMappings(routineId: string | null) {
  return useQuery({
    queryKey: [...MAPPINGS_KEY, routineId],
    queryFn: ({ signal }) => listFieldMappings(routineId!, signal),
    enabled: !!routineId,
  });
}

/** @contract FR-003 — POST /admin/routines/:id/field-mappings */
export function useCreateFieldMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: CreateFieldMappingRequest }) =>
      createFieldMapping(routineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MAPPINGS_KEY }),
  });
}

/** @contract FR-003 — PATCH /admin/field-mappings/:id */
export function useUpdateFieldMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFieldMappingRequest }) =>
      updateFieldMapping(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MAPPINGS_KEY }),
  });
}

/** @contract FR-003 — DELETE /admin/field-mappings/:id */
export function useDeleteFieldMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFieldMapping(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MAPPINGS_KEY }),
  });
}
