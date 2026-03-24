/**
 * @contract BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-012, BR-015, DATA-010
 *
 * Aggregate Root: McpAgent
 * Encapsulates the governed technical identity of an MCP agent:
 * identity (codigo, nome), scopes (with blocklist enforcement),
 * lifecycle (ACTIVE → INACTIVE → REVOKED), and owner binding.
 *
 * Invariants:
 * - codigo is immutable after creation (BR-005)
 * - allowed_scopes never contain blocked patterns (BR-002)
 * - *:create scopes require phase2_create_enabled (BR-003)
 * - REVOKED status is terminal and irreversible (BR-006)
 * - revocation_reason is mandatory when revoking (BR-015)
 * - Agent scopes are own — never inherited from owner (BR-001)
 */

import type { AgentStatus } from '../value-objects/agent-status.js';
import { isValidAgentTransition } from '../value-objects/agent-status.js';
import { ScopeBlocklistValidator } from '../domain-services/scope-blocklist-validator.js';
import {
  AgentRevokedCannotReactivateError,
  AgentRevokedError,
  InvalidAgentTransitionError,
  RevocationReasonRequiredError,
} from '../errors/mcp-errors.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface McpAgentProps {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly ownerUserId: string;
  readonly apiKeyHash: string;
  readonly allowedScopes: readonly string[];
  readonly status: AgentStatus;
  readonly phase2CreateEnabled: boolean;
  readonly lastUsedAt: Date | null;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly revokedAt: Date | null;
  readonly revocationReason: string | null;
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------
export class McpAgent {
  private readonly props: McpAgentProps;

  constructor(props: McpAgentProps) {
    this.props = props;
  }

  // --- Getters ---
  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get codigo(): string {
    return this.props.codigo;
  }
  get nome(): string {
    return this.props.nome;
  }
  get ownerUserId(): string {
    return this.props.ownerUserId;
  }
  get apiKeyHash(): string {
    return this.props.apiKeyHash;
  }
  get allowedScopes(): readonly string[] {
    return this.props.allowedScopes;
  }
  get status(): AgentStatus {
    return this.props.status;
  }
  get phase2CreateEnabled(): boolean {
    return this.props.phase2CreateEnabled;
  }
  get lastUsedAt(): Date | null {
    return this.props.lastUsedAt;
  }
  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }
  get revocationReason(): string | null {
    return this.props.revocationReason;
  }

  // --- Domain logic ---

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  isRevoked(): boolean {
    return this.props.status === 'REVOKED';
  }

  /**
   * Validates that agent has all required scopes for an action.
   * Agent scopes are own — never inherited from owner (BR-001).
   */
  hasScopes(requiredScopes: readonly string[]): boolean {
    return requiredScopes.every((s) => this.props.allowedScopes.includes(s));
  }

  /**
   * Validates proposed scopes against blocklist and phase2 rules.
   * Returns validation result from ScopeBlocklistValidator.
   */
  static validateScopes(
    scopes: readonly string[],
    phase2CreateEnabled: boolean,
  ): { valid: boolean; blockedScopes: string[]; reason?: string } {
    return ScopeBlocklistValidator.validate(scopes, phase2CreateEnabled);
  }

  /**
   * Transition to a new status.
   * Enforces BR-006 (REVOKED is terminal).
   */
  transitionTo(newStatus: AgentStatus): McpAgent {
    if (this.isRevoked() && newStatus !== 'REVOKED') {
      throw new AgentRevokedCannotReactivateError(this.props.id);
    }

    if (!isValidAgentTransition(this.props.status, newStatus)) {
      throw new InvalidAgentTransitionError(this.props.id, this.props.status, newStatus);
    }

    return new McpAgent({
      ...this.props,
      status: newStatus,
      updatedAt: new Date(),
    });
  }

  /**
   * Revoke this agent. Irreversible (BR-006).
   * reason is mandatory (BR-015).
   */
  revoke(reason: string): McpAgent {
    if (!reason || reason.trim().length === 0) {
      throw new RevocationReasonRequiredError();
    }

    if (this.isRevoked()) {
      throw new AgentRevokedCannotReactivateError(this.props.id);
    }

    const now = new Date();
    return new McpAgent({
      ...this.props,
      status: 'REVOKED',
      revokedAt: now,
      revocationReason: reason.trim(),
      updatedAt: now,
    });
  }

  /**
   * Update allowed scopes with blocklist validation (BR-002, BR-003).
   * Throws if agent is REVOKED (BR-006).
   */
  updateScopes(newScopes: readonly string[]): McpAgent {
    if (this.isRevoked()) {
      throw new AgentRevokedError(this.props.id);
    }

    return new McpAgent({
      ...this.props,
      allowedScopes: newScopes,
      updatedAt: new Date(),
    });
  }

  /**
   * Record that the agent was used (gateway step 1).
   */
  markUsed(): McpAgent {
    return new McpAgent({
      ...this.props,
      lastUsedAt: new Date(),
    });
  }

  /**
   * Rotate API key hash.
   * Throws if agent is REVOKED.
   */
  rotateKey(newApiKeyHash: string): McpAgent {
    if (this.isRevoked()) {
      throw new AgentRevokedError(this.props.id);
    }

    return new McpAgent({
      ...this.props,
      apiKeyHash: newApiKeyHash,
      updatedAt: new Date(),
    });
  }
}
