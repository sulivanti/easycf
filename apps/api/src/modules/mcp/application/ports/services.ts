/**
 * @contract DOC-GNP-00, INT-010, SEC-010
 *
 * Service port interfaces for the MCP Automation module (MOD-010).
 * These abstract external/cross-module dependencies so use cases
 * remain framework-agnostic.
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// DomainEventRepository
// ---------------------------------------------------------------------------

export interface DomainEventRepository {
  create(event: DomainEventBase, tx?: unknown): Promise<void>;
  createMany(events: readonly DomainEventBase[], tx?: unknown): Promise<void>;
}

// ---------------------------------------------------------------------------
// IdGeneratorService
// ---------------------------------------------------------------------------

export interface IdGeneratorService {
  generate(): string;
}

// ---------------------------------------------------------------------------
// ApiKeyService — generates and hashes API keys (SEC-010 §1.2, BR-004)
// ---------------------------------------------------------------------------

export interface ApiKeyGenerateResult {
  /** Plaintext key (256 bits base64url, 44 chars) — returned ONCE */
  readonly plaintext: string;
  /** bcrypt hash (rounds >= 12) — stored in DB */
  readonly hash: string;
}

export interface ApiKeyService {
  /** Generate new API key + bcrypt hash */
  generate(): Promise<ApiKeyGenerateResult>;
  /** Compare plaintext key against stored hash */
  compare(plaintext: string, hash: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// MovementEngineGateway — port for MOD-009 (BR-008, INT-010)
// ---------------------------------------------------------------------------

export interface CreateMovementRequest {
  readonly tenantId: string;
  readonly objectType: string;
  readonly objectId?: string;
  readonly operationType: string;
  readonly operationPayload: Record<string, unknown>;
  readonly requesterId: string;
  readonly requesterOrigin: 'MCP';
  readonly originAgentId: string;
  readonly correlationId: string;
}

export interface CreateMovementResult {
  readonly controlled: boolean;
  readonly movementId: string;
}

export interface MovementEngineGateway {
  evaluate(request: CreateMovementRequest): Promise<CreateMovementResult>;
}

// ---------------------------------------------------------------------------
// RoutineEvaluatorPort — port for MOD-007 (FR-007, INT-010)
// ---------------------------------------------------------------------------

export interface RoutineEvaluationRequest {
  readonly routineId: string;
  readonly tenantId: string;
  readonly context: Record<string, unknown>;
}

export interface RoutineEvaluationResult {
  readonly params: Record<string, unknown>;
}

export interface RoutineEvaluatorPort {
  evaluate(request: RoutineEvaluationRequest): Promise<RoutineEvaluationResult>;
}

// ---------------------------------------------------------------------------
// IntegrationQueuePort — port for MOD-008 (FR-007, INT-010)
// ---------------------------------------------------------------------------

export interface IntegrationJobRequest {
  readonly integrationId: string;
  readonly tenantId: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
}

export interface IntegrationQueuePort {
  enqueue(request: IntegrationJobRequest): Promise<void>;
}

// ---------------------------------------------------------------------------
// ActionExecutorRegistry — strategy pattern for DIRECT dispatch (FR-007)
// ---------------------------------------------------------------------------

export interface ActionExecutionContext {
  readonly agentId: string;
  readonly tenantId: string;
  readonly actionCode: string;
  readonly payload: Record<string, unknown>;
  readonly routineParams?: Record<string, unknown>;
  readonly correlationId: string;
}

export interface ActionExecutionResult {
  readonly resultPayload: Record<string, unknown>;
}

export interface ActionExecutor {
  execute(context: ActionExecutionContext): Promise<ActionExecutionResult>;
}

export interface ActionExecutorRegistry {
  get(actionCode: string): ActionExecutor | undefined;
}
