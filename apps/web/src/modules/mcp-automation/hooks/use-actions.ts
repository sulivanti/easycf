/**
 * @contract FR-005, UX-MCP-001
 *
 * React Query hooks for MCP Action catalog data fetching and mutations.
 * queryKey: ['mcp-automation', 'actions', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/mcp-automation.api.js';
import type {
  CreateActionPayload,
  UpdateActionPayload,
  ExecutionPolicy,
  ActionStatus,
} from '../types/mcp-automation.types.js';

export const ACTIONS_KEY = ['mcp-automation', 'actions'] as const;

/** @contract FR-005 — GET /admin/mcp-actions with cursor pagination */
export function useActionList(params: {
  action_type_id?: string;
  execution_policy?: ExecutionPolicy;
  status?: ActionStatus;
}) {
  return useQuery({
    queryKey: [...ACTIONS_KEY, params],
    queryFn: () => api.listActions(params),
  });
}

/** @contract FR-005 — POST /admin/mcp-actions */
export function useCreateAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateActionPayload) => api.createAction(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}

/** @contract FR-005 — PATCH /admin/mcp-actions/:id */
export function useUpdateAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateActionPayload }) =>
      api.updateAction(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIONS_KEY });
    },
  });
}
