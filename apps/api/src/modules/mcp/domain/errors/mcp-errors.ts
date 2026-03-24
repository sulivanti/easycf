/**
 * @contract BR-001 to BR-015
 *
 * Domain error hierarchy for the MCP Automation module.
 * All errors carry RFC 9457 Problem Details-compatible fields
 * so the presentation layer can map them directly to HTTP responses.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Authentication errors (401)
// ---------------------------------------------------------------------------

/** @contract BR-010 step 1 — API key invalid or agent not found */
export class McpApiKeyInvalidError extends DomainError {
  readonly type = '/problems/mcp-api-key-invalid';
  readonly statusHint = 401;

  constructor() {
    super('API key inválida ou agente não encontrado.');
  }
}

// ---------------------------------------------------------------------------
// Authorization errors (403)
// ---------------------------------------------------------------------------

/** @contract BR-006 — Agent is revoked, cannot execute */
export class AgentRevokedError extends DomainError {
  readonly type = '/problems/mcp-agent-revoked';
  readonly statusHint = 403;

  constructor(agentId: string) {
    super(`Agente revogado: ${agentId}`);
  }
}

/** @contract BR-010 step 2 — Agent is inactive */
export class AgentInactiveError extends DomainError {
  readonly type = '/problems/mcp-agent-inactive';
  readonly statusHint = 403;

  constructor(agentId: string) {
    super(`Agente inativo: ${agentId}`);
  }
}

/** @contract BR-010 step 4 — Agent-action link expired */
export class AgentActionLinkExpiredError extends DomainError {
  readonly type = '/problems/mcp-agent-action-link-expired';
  readonly statusHint = 403;

  constructor(agentId: string, actionId: string) {
    super(`Vínculo agente-ação expirado: agente=${agentId}, ação=${actionId}`);
  }
}

/** @contract BR-010 step 4 — Agent-action link not found */
export class AgentActionLinkNotFoundError extends DomainError {
  readonly type = '/problems/mcp-agent-action-link-not-found';
  readonly statusHint = 403;

  constructor(agentId: string, actionCode: string) {
    super(`Agente ${agentId} não tem vínculo com a ação ${actionCode}.`);
  }
}

/** @contract BR-010 step 5 — Agent missing required scopes */
export class AgentMissingScopesError extends DomainError {
  readonly type = '/problems/mcp-agent-missing-scopes';
  readonly statusHint = 403;

  constructor(missingScopes: readonly string[]) {
    super(`Agente não possui escopos necessários: ${missingScopes.join(', ')}`);
  }
}

/** @contract BR-001, BR-012 — Privilege escalation attempt */
export class PrivilegeEscalationError extends DomainError {
  readonly type = '/problems/mcp-privilege-escalation';
  readonly statusHint = 403;

  constructor(attemptedScopes: readonly string[]) {
    super(
      `Tentativa de escalada de privilégio detectada. Escopos bloqueados: ${attemptedScopes.join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Not Found errors (404)
// ---------------------------------------------------------------------------

/** @contract BR-010 step 3 — Action not found by action_code */
export class McpActionNotFoundError extends DomainError {
  readonly type = '/problems/mcp-action-not-found';
  readonly statusHint = 404;

  constructor(actionCode: string) {
    super(`Ação MCP não encontrada: ${actionCode}`);
  }
}

export class McpAgentNotFoundError extends DomainError {
  readonly type = '/problems/mcp-agent-not-found';
  readonly statusHint = 404;

  constructor(id: string) {
    super(`Agente MCP não encontrado: ${id}`);
  }
}

// ---------------------------------------------------------------------------
// Conflict errors (409)
// ---------------------------------------------------------------------------

/** @contract BR-011 — Duplicate agent-action link */
export class AgentActionLinkDuplicateError extends DomainError {
  readonly type = '/problems/mcp-agent-action-link-duplicate';
  readonly statusHint = 409;

  constructor(agentId: string, actionId: string) {
    super(`Vínculo já existe para este agente e ação: agente=${agentId}, ação=${actionId}`);
  }
}

// ---------------------------------------------------------------------------
// Validation errors (422)
// ---------------------------------------------------------------------------

/** @contract BR-002 — Scope blocked by Phase 1 blocklist */
export class ScopeBlockedError extends DomainError {
  readonly type = '/problems/mcp-scope-blocked';
  readonly statusHint = 422;

  constructor(reason: string) {
    super(reason);
  }
}

/** @contract BR-003 — Phase 2 create not enabled for this agent */
export class Phase2CreateNotEnabledError extends DomainError {
  readonly type = '/problems/mcp-phase2-create-not-enabled';
  readonly statusHint = 422;

  constructor(scope: string) {
    super(`Escopo *:create requer liberação Phase 2 para este agente: ${scope}`);
  }
}

/** @contract BR-007 — DIRECT policy not allowed for this action type */
export class DirectPolicyNotAllowedError extends DomainError {
  readonly type = '/problems/mcp-direct-policy-not-allowed';
  readonly statusHint = 422;

  constructor(actionTypeCodigo: string) {
    super(`Tipo de ação ${actionTypeCodigo} não permite política DIRECT.`);
  }
}

/** @contract BR-006 — REVOKED agents cannot be reactivated */
export class AgentRevokedCannotReactivateError extends DomainError {
  readonly type = '/problems/mcp-agent-revoked-cannot-reactivate';
  readonly statusHint = 422;

  constructor(agentId: string) {
    super(`Agentes revogados não podem ser reativados: ${agentId}`);
  }
}

/** @contract BR-006 — Invalid agent status transition */
export class InvalidAgentTransitionError extends DomainError {
  readonly type = '/problems/mcp-invalid-agent-transition';
  readonly statusHint = 422;

  constructor(agentId: string, from: string, to: string) {
    super(`Transição de status inválida para agente ${agentId}: ${from} → ${to}`);
  }
}

/** @contract BR-015 — Revocation reason is mandatory */
export class RevocationReasonRequiredError extends DomainError {
  readonly type = '/problems/mcp-revocation-reason-required';
  readonly statusHint = 422;

  constructor() {
    super("Campo 'reason' é obrigatório para revogação.");
  }
}

/** @contract BR-014 — can_approve must be false */
export class CanApproveInvariantError extends DomainError {
  readonly type = '/problems/mcp-can-approve-invariant';
  readonly statusHint = 422;

  constructor() {
    super('Agentes MCP não podem ter tipos de ação com capacidade de aprovação.');
  }
}
