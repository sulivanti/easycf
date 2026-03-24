/**
 * @contract FR-011, UX-008 §3.3
 *
 * React Query hook for 24h metrics with 60s polling.
 * queryKey: ['integration-protheus', 'metrics']
 */

import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '../api/integration-protheus.api.js';

export const METRICS_KEY = ['integration-protheus', 'metrics'] as const;

/** @contract FR-011 — GET /admin/integration-logs/metrics (polling 60s) */
export function useCallLogMetrics() {
  return useQuery({
    queryKey: [...METRICS_KEY],
    queryFn: ({ signal }) => getMetrics(signal),
    refetchInterval: 60_000,
  });
}
