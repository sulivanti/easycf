/**
 * @contract FR-003, UX-007
 *
 * React Query hooks for target objects and target fields.
 * queryKey: ['contextual-params', 'target-objects'] / ['contextual-params', 'target-fields', objectId]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTargetObjects,
  listTargetFields,
  createTargetField,
} from '../api/contextual-params.api.js';
import type { CreateTargetFieldRequest } from '../types/contextual-params.types.js';

export const TARGET_OBJECTS_KEY = ['contextual-params', 'target-objects'] as const;
export const TARGET_FIELDS_KEY = ['contextual-params', 'target-fields'] as const;

/** @contract FR-003 — GET /admin/target-objects */
export function useTargetObjects() {
  return useQuery({
    queryKey: [...TARGET_OBJECTS_KEY],
    queryFn: ({ signal }) => listTargetObjects(signal),
  });
}

/** @contract FR-003 — GET /admin/target-objects/:id/fields */
export function useTargetFields(objectId: string | null) {
  return useQuery({
    queryKey: [...TARGET_FIELDS_KEY, objectId],
    queryFn: ({ signal }) => listTargetFields(objectId!, signal),
    enabled: !!objectId,
  });
}

/** @contract FR-003 — POST /admin/target-objects/:id/fields */
export function useCreateTargetField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, data }: { objectId: string; data: CreateTargetFieldRequest }) =>
      createTargetField(objectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TARGET_FIELDS_KEY }),
  });
}
