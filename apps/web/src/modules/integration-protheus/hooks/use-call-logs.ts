/**
 * @contract FR-005..FR-009, UX-008 §3
 *
 * React Query hooks for call logs (list, detail, reprocess, execute).
 * queryKey: ['integration-protheus', 'call-logs', ...filters]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCallLogs,
  getCallLogDetail,
  reprocessCallLog,
  executeIntegration,
} from '../api/integration-protheus.api.js';
import type {
  CallLogListFilters,
  ReprocessRequest,
  ExecuteIntegrationRequest,
} from '../types/integration-protheus.types.js';
import { METRICS_KEY } from './use-metrics.js';

export const LOGS_KEY = ['integration-protheus', 'call-logs'] as const;
export const LOG_DETAIL_KEY = ['integration-protheus', 'call-log-detail'] as const;

/** @contract FR-009 — GET /admin/integration-logs */
export function useCallLogsList(filters: CallLogListFilters) {
  return useQuery({
    queryKey: [...LOGS_KEY, filters],
    queryFn: ({ signal }) => listCallLogs(filters, signal),
  });
}

/** @contract FR-009 — GET /admin/integration-logs/:id */
export function useCallLogDetail(id: string | null) {
  return useQuery({
    queryKey: [...LOG_DETAIL_KEY, id],
    queryFn: ({ signal }) => getCallLogDetail(id!, signal),
    enabled: !!id,
  });
}

/** @contract FR-007 — POST /admin/integration-logs/:id/reprocess */
export function useReprocessCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }: { logId: string; data: ReprocessRequest }) =>
      reprocessCallLog(logId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGS_KEY });
      qc.invalidateQueries({ queryKey: LOG_DETAIL_KEY });
      qc.invalidateQueries({ queryKey: METRICS_KEY });
    },
  });
}

/** @contract FR-006 — POST /integration-engine/execute */
export function useExecuteIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExecuteIntegrationRequest) => executeIntegration(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGS_KEY });
      qc.invalidateQueries({ queryKey: METRICS_KEY });
    },
  });
}
