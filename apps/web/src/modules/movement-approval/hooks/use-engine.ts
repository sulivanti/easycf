/**
 * @contract UX-APROV-002, FR-003
 *
 * React Query hook for the approval engine evaluate / dry-run endpoint.
 * queryKey: ['movement-approval', 'engine']
 */

import { useMutation } from '@tanstack/react-query';
import { movementApprovalApi } from '../api/movement-approval.api.js';
import type { EvaluateRequest } from '../types/movement-approval.types.js';

/** @contract FR-003 — POST /movement-engine/evaluate */
export function useEvaluate() {
  return useMutation({
    mutationFn: (data: EvaluateRequest) => movementApprovalApi.evaluate(data),
  });
}
