/**
 * @contract FR-006, FR-009
 * React Query mutations for save operations.
 * queryKey: ['smartgrid', 'save-batch'] / ['smartgrid', 'save-changes']
 */

import { useMutation } from '@tanstack/react-query';
import * as api from '../api/smartgrid.api';

/** @contract FR-009 — save validated rows to target module endpoint */
export function useSaveBatch() {
  return useMutation({
    mutationKey: ['smartgrid', 'save-batch'],
    mutationFn: (params: { targetEndpoint: string; rows: Record<string, unknown>[] }) =>
      api.saveBatch(params.targetEndpoint, params.rows),
  });
}

/** @contract FR-006 — save single record changes */
export function useSaveChanges() {
  return useMutation({
    mutationKey: ['smartgrid', 'save-changes'],
    mutationFn: (params: {
      targetEndpoint: string;
      recordId: string;
      changes: Record<string, unknown>;
    }) => api.saveChanges(params.targetEndpoint, params.recordId, params.changes),
  });
}
