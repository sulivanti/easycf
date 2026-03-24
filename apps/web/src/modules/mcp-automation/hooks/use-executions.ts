/**
 * @contract FR-009, UX-MCP-002
 *
 * React Query hooks for MCP Execution log data fetching.
 * queryKey: ['mcp-automation', 'executions', ...params]
 */

import { useQuery } from '@tanstack/react-query';
import * as api from '../api/mcp-automation.api.js';
import type { ExecutionStatus, ExecutionPolicy } from '../types/mcp-automation.types.js';

export const EXECUTIONS_KEY = ['mcp-automation', 'executions'] as const;
export const EXECUTION_DETAIL_KEY = ['mcp-automation', 'execution-detail'] as const;

/** @contract FR-009 — GET /admin/mcp-executions with filters and cursor pagination */
export function useExecutionList(params: {
  agent_id?: string;
  action_id?: string;
  status?: ExecutionStatus;
  policy_applied?: ExecutionPolicy;
  received_at_from?: string;
  received_at_to?: string;
}) {
  return useQuery({
    queryKey: [...EXECUTIONS_KEY, params],
    queryFn: () => api.listExecutions(params),
  });
}

/** @contract FR-009 — GET /admin/mcp-executions/:id */
export function useExecutionDetail(executionId: string | null) {
  return useQuery({
    queryKey: [...EXECUTION_DETAIL_KEY, executionId],
    queryFn: () => api.getExecution(executionId!),
    enabled: !!executionId,
  });
}
