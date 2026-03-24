/**
 * @contract INT-010, FR-001..FR-010, UX-MCP-001, UX-MCP-002
 *
 * HTTP client functions for the MCP Automation admin API.
 */

import type {
  McpAgent,
  CreateAgentPayload,
  CreateAgentResult,
  UpdateAgentPayload,
  RotateKeyResult,
  AgentActionLink,
  McpAction,
  CreateActionPayload,
  UpdateActionPayload,
  McpExecution,
  McpExecutionDetail,
  PaginatedResponse,
  AgentStatus,
  ExecutionPolicy,
  ActionStatus,
  ExecutionStatus,
} from '../types/mcp-automation.types.js';

const AGENTS_BASE = '/api/v1/admin/mcp-agents';
const ACTIONS_BASE = '/api/v1/admin/mcp-actions';
const EXECUTIONS_BASE = '/api/v1/admin/mcp-executions';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-correlation-id': crypto.randomUUID(),
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(error.detail ?? res.statusText), {
      status: res.status,
      correlationId: res.headers.get('x-correlation-id'),
      ...error,
    });
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ── Agents ──────────────────────────────────────────────────────────────────

export function listAgents(params: {
  cursor?: string;
  limit?: number;
  status?: AgentStatus;
  owner_user_id?: string;
}): Promise<PaginatedResponse<McpAgent>> {
  return apiFetch(
    `${AGENTS_BASE}${qs({
      cursor: params.cursor,
      limit: params.limit?.toString(),
      status: params.status,
      owner_user_id: params.owner_user_id,
    })}`,
  );
}

export function createAgent(body: CreateAgentPayload): Promise<CreateAgentResult> {
  return apiFetch(AGENTS_BASE, { method: 'POST', body: JSON.stringify(body) });
}

export function updateAgent(id: string, body: UpdateAgentPayload): Promise<McpAgent> {
  return apiFetch(`${AGENTS_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function revokeAgent(id: string, reason: string): Promise<McpAgent> {
  return apiFetch(`${AGENTS_BASE}/${id}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function rotateAgentKey(id: string): Promise<RotateKeyResult> {
  return apiFetch(`${AGENTS_BASE}/${id}/rotate-key`, { method: 'POST' });
}

export function enablePhase2(
  id: string,
  reason: string,
): Promise<{
  agent_id: string;
  phase2_create_enabled: true;
  enabled_by: string;
  enabled_at: string;
  reason: string;
}> {
  return apiFetch(`${AGENTS_BASE}/${id}/enable-phase2`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function grantAgentAction(
  agentId: string,
  body: {
    action_id: string;
    valid_until?: string;
  },
): Promise<AgentActionLink> {
  return apiFetch(`${AGENTS_BASE}/${agentId}/actions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function revokeAgentAction(agentId: string, actionId: string): Promise<void> {
  return apiFetch(`${AGENTS_BASE}/${agentId}/actions/${actionId}`, { method: 'DELETE' });
}

// ── Actions ─────────────────────────────────────────────────────────────────

export function listActions(params: {
  cursor?: string;
  limit?: number;
  action_type_id?: string;
  execution_policy?: ExecutionPolicy;
  status?: ActionStatus;
}): Promise<PaginatedResponse<McpAction>> {
  return apiFetch(
    `${ACTIONS_BASE}${qs({
      cursor: params.cursor,
      limit: params.limit?.toString(),
      action_type_id: params.action_type_id,
      execution_policy: params.execution_policy,
      status: params.status,
    })}`,
  );
}

export function createAction(body: CreateActionPayload): Promise<McpAction> {
  return apiFetch(ACTIONS_BASE, { method: 'POST', body: JSON.stringify(body) });
}

export function updateAction(id: string, body: UpdateActionPayload): Promise<McpAction> {
  return apiFetch(`${ACTIONS_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

// ── Executions ──────────────────────────────────────────────────────────────

export function listExecutions(params: {
  cursor?: string;
  limit?: number;
  agent_id?: string;
  action_id?: string;
  status?: ExecutionStatus;
  policy_applied?: ExecutionPolicy;
  received_at_from?: string;
  received_at_to?: string;
}): Promise<PaginatedResponse<McpExecution>> {
  return apiFetch(
    `${EXECUTIONS_BASE}${qs({
      cursor: params.cursor,
      limit: params.limit?.toString(),
      agent_id: params.agent_id,
      action_id: params.action_id,
      status: params.status,
      policy_applied: params.policy_applied,
      received_at_from: params.received_at_from,
      received_at_to: params.received_at_to,
    })}`,
  );
}

export function getExecution(id: string): Promise<McpExecutionDetail> {
  return apiFetch(`${EXECUTIONS_BASE}/${id}`);
}
