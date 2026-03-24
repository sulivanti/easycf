/**
 * @contract DATA-010, INT-010, UX-MCP-001, UX-MCP-002
 *
 * TypeScript types for the MCP Automation module frontend.
 * API key is NEVER present in list/get responses (BR-004).
 */

export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';
export type ExecutionPolicy = 'DIRECT' | 'CONTROLLED' | 'EVENT_ONLY';
export type ActionStatus = 'ACTIVE' | 'INACTIVE';
export type ExecutionStatus =
  | 'RECEIVED'
  | 'DISPATCHED'
  | 'DIRECT_SUCCESS'
  | 'DIRECT_FAILED'
  | 'CONTROLLED_PENDING'
  | 'CONTROLLED_APPROVED'
  | 'CONTROLLED_REJECTED'
  | 'EVENT_EMITTED'
  | 'BLOCKED';

// ── Agents ──────────────────────────────────────────────────────────────────

export interface McpAgent {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  owner_user_id: string;
  allowed_scopes: string[];
  status: AgentStatus;
  phase2_create_enabled: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
}

export interface CreateAgentPayload {
  codigo: string;
  nome: string;
  owner_user_id: string;
  allowed_scopes: string[];
}

export interface UpdateAgentPayload {
  nome?: string;
  allowed_scopes?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateAgentResult {
  agent: McpAgent;
  api_key: string;
}

export interface RotateKeyResult {
  agent: McpAgent;
  api_key: string;
}

// ── Agent-Action Links ──────────────────────────────────────────────────────

export interface AgentActionLink {
  id: string;
  tenant_id: string;
  agent_id: string;
  action_id: string;
  granted_by: string;
  granted_at: string;
  valid_until: string | null;
}

// ── Actions ─────────────────────────────────────────────────────────────────

export interface McpAction {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  action_type_id: string;
  execution_policy: ExecutionPolicy;
  target_object_type: string;
  required_scopes: string[];
  linked_routine_id: string | null;
  linked_integration_id: string | null;
  description: string | null;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateActionPayload {
  codigo: string;
  nome: string;
  action_type_id: string;
  execution_policy: ExecutionPolicy;
  target_object_type: string;
  required_scopes: string[];
  linked_routine_id?: string;
  linked_integration_id?: string;
  description?: string;
}

export interface UpdateActionPayload {
  nome?: string;
  execution_policy?: ExecutionPolicy;
  required_scopes?: string[];
  linked_routine_id?: string | null;
  linked_integration_id?: string | null;
  description?: string | null;
  status?: ActionStatus;
}

// ── Executions ──────────────────────────────────────────────────────────────

export interface McpExecution {
  id: string;
  tenant_id: string;
  agent_id: string;
  action_id: string;
  policy_applied: ExecutionPolicy;
  correlation_id: string;
  status: ExecutionStatus;
  blocked_reason: string | null;
  linked_movement_id: string | null;
  duration_ms: number | null;
  received_at: string;
  completed_at: string | null;
}

export interface McpExecutionDetail extends McpExecution {
  origin_ip: string | null;
  request_payload: Record<string, unknown>;
  linked_integration_log_id: string | null;
  result_payload: Record<string, unknown> | null;
  error_message: string | null;
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}
