/**
 * @contract FR-007, BR-009
 * React Query mutations for delete validation and batch deletion.
 * queryKey: ['smartgrid', 'validate-delete'] / ['smartgrid', 'delete-batch']
 */

import { useMutation } from '@tanstack/react-query';
import * as api from '../api/smartgrid.api';

/** @contract FR-007 — validate each record for soft-delete eligibility */
export function useValidateForDelete() {
  return useMutation({
    mutationKey: ['smartgrid', 'validate-delete'],
    mutationFn: (params: {
      framerId: string;
      objectType: string;
      records: Array<{ id: string; displayLabel: string; currentState: Record<string, unknown> }>;
    }) => api.validateForDelete(params.framerId, params.objectType, params.records),
  });
}

/** @contract FR-007, BR-009 — soft-delete allowed records */
export function useDeleteBatch() {
  return useMutation({
    mutationKey: ['smartgrid', 'delete-batch'],
    mutationFn: (params: { targetEndpoint: string; recordIds: string[] }) =>
      api.deleteBatch(params.targetEndpoint, params.recordIds),
  });
}
