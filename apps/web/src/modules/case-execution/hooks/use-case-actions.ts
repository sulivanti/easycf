/**
 * @contract FR-002, FR-003, FR-007, UX-006
 *
 * React Query mutations for case lifecycle:
 * transition stage, hold/resume/cancel, record event.
 * Invalidates detail + cases list on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transitionStage, controlCase, recordEvent } from '../api/case-execution.api.js';
import { CASES_KEY, DETAIL_KEY } from './use-cases.js';
import { TIMELINE_KEY } from './use-timeline.js';

/** @contract FR-002 — POST /api/v1/cases/:id/transition */
export function useTransitionStage(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof transitionStage>[1]) => transitionStage(caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: CASES_KEY });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}

/** @contract FR-003 — POST /api/v1/cases/:id/hold|resume|cancel */
export function useControlCase(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      reason,
      target_stage_id,
    }: {
      action: 'hold' | 'resume' | 'cancel';
      reason?: string;
      target_stage_id?: string;
    }) => controlCase(caseId, action, { reason, target_stage_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: CASES_KEY });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}

/** @contract FR-007 — POST /api/v1/cases/:id/events */
export function useRecordEvent(caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof recordEvent>[1]) => recordEvent(caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DETAIL_KEY, caseId] });
      qc.invalidateQueries({ queryKey: [...TIMELINE_KEY, caseId] });
    },
  });
}
