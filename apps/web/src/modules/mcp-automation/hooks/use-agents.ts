/**
 * @contract FR-001..FR-006, UX-MCP-001
 *
 * React Query hooks for MCP Agent data fetching and mutations.
 * queryKey: ['mcp-automation', 'agents', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/mcp-automation.api.js';
import type {
  CreateAgentPayload,
  UpdateAgentPayload,
  AgentStatus,
} from '../types/mcp-automation.types.js';

export const AGENTS_KEY = ['mcp-automation', 'agents'] as const;

/** @contract FR-001 — GET /admin/mcp-agents with cursor pagination */
export function useAgentList(params: { status?: AgentStatus; owner_user_id?: string }) {
  return useQuery({
    queryKey: [...AGENTS_KEY, params],
    queryFn: () => api.listAgents(params),
  });
}

/** @contract FR-001 — POST /admin/mcp-agents */
export function useCreateAgent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAgentPayload) => api.createAgent(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-001 — PATCH /admin/mcp-agents/:id */
export function useUpdateAgent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAgentPayload }) =>
      api.updateAgent(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-002 — POST /admin/mcp-agents/:id/revoke */
export function useRevokeAgent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.revokeAgent(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-003 — POST /admin/mcp-agents/:id/rotate-key */
export function useRotateKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.rotateAgentKey(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-010 — POST /admin/mcp-agents/:id/enable-phase2 */
export function useEnablePhase2() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.enablePhase2(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-006 — POST /admin/mcp-agents/:id/actions */
export function useGrantAgentAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      agentId,
      actionId,
      validUntil,
    }: {
      agentId: string;
      actionId: string;
      validUntil?: string;
    }) => api.grantAgentAction(agentId, { action_id: actionId, valid_until: validUntil }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** @contract FR-006 — DELETE /admin/mcp-agents/:id/actions/:actionId */
export function useRevokeAgentAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, actionId }: { agentId: string; actionId: string }) =>
      api.revokeAgentAction(agentId, actionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}
