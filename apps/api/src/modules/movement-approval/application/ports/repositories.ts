/**
 * @contract DATA-009, DOC-GNP-00, DOC-MOD-009
 *
 * Repository port interfaces for the Movement Approval module.
 * These define the boundary between application and infrastructure layers.
 * Implementations live in the infrastructure layer (Drizzle-based).
 */

import type {
  MovementControlRuleProps,
  ControlRuleStatus,
  ApprovalRuleProps,
  ControlledMovementProps,
  ApprovalInstanceProps,
  ApprovalInstanceStatus,
} from '../../domain/index.js';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Transaction context — passed to repositories that need atomic operations.
 * The concrete type is defined by the infrastructure layer (e.g. Drizzle transaction).
 */
export type TransactionContext = unknown;

export interface UnitOfWork {
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// MovementHistoryEntry
// ---------------------------------------------------------------------------

export interface MovementHistoryEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly movementId: string;
  readonly action: string;
  readonly actorId: string;
  readonly detail: Record<string, unknown>;
  readonly createdAt: Date;
}

// ---------------------------------------------------------------------------
// OverrideLogEntry
// ---------------------------------------------------------------------------

export interface OverrideLogEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly movementId: string;
  readonly actorId: string;
  readonly justification: string;
  readonly actorScopes: readonly string[];
  readonly previousStatus: string;
  readonly createdAt: Date;
}

// ---------------------------------------------------------------------------
// MovementExecution
// ---------------------------------------------------------------------------

export interface MovementExecutionEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly movementId: string;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly errorMessage: string | null;
  readonly executedAt: Date;
  readonly createdAt: Date;
}

// ---------------------------------------------------------------------------
// ControlRuleRepository
// ---------------------------------------------------------------------------

export interface ControlRuleRepository {
  findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps | null>;
  findByCodigo(
    codigo: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps | null>;
  list(
    params: {
      tenantId: string;
      page: number;
      pageSize: number;
      status?: ControlRuleStatus;
      objectType?: string;
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<MovementControlRuleProps>>;
  /** Returns active rules matching objectType+operationType, ordered by priority ASC */
  findActiveRules(
    tenantId: string,
    objectType: string,
    operationType: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps[]>;
  create(
    entity: MovementControlRuleProps,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps>;
  update(
    entity: MovementControlRuleProps,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps>;
}

// ---------------------------------------------------------------------------
// ApprovalRuleRepository
// ---------------------------------------------------------------------------

export interface ApprovalRuleRepository {
  findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalRuleProps | null>;
  /** Returns approval rules for a control rule, ordered by level ASC */
  findByControlRule(
    controlRuleId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalRuleProps[]>;
  create(entity: ApprovalRuleProps, tx?: TransactionContext): Promise<ApprovalRuleProps>;
  update(entity: ApprovalRuleProps, tx?: TransactionContext): Promise<ApprovalRuleProps>;
}

// ---------------------------------------------------------------------------
// MovementRepository
// ---------------------------------------------------------------------------

export interface MovementRepository {
  findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps | null>;
  list(
    params: {
      tenantId: string;
      page: number;
      pageSize: number;
      status?: string;
      requesterId?: string;
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ControlledMovementProps>>;
  findByIdempotencyKey(
    key: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps | null>;
  create(
    entity: ControlledMovementProps,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps>;
  update(
    entity: ControlledMovementProps,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps>;
}

// ---------------------------------------------------------------------------
// ApprovalInstanceRepository
// ---------------------------------------------------------------------------

export interface ApprovalInstanceRepository {
  findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps | null>;
  findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]>;
  findPendingByApprover(
    approverId: string,
    tenantId: string,
    status?: ApprovalInstanceStatus,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]>;
  create(entity: ApprovalInstanceProps, tx?: TransactionContext): Promise<ApprovalInstanceProps>;
  createMany(
    entities: readonly ApprovalInstanceProps[],
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]>;
  update(entity: ApprovalInstanceProps, tx?: TransactionContext): Promise<ApprovalInstanceProps>;
}

// ---------------------------------------------------------------------------
// MovementExecutionRepository
// ---------------------------------------------------------------------------

export interface MovementExecutionRepository {
  create(entity: MovementExecutionEntry, tx?: TransactionContext): Promise<MovementExecutionEntry>;
  findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementExecutionEntry[]>;
}

// ---------------------------------------------------------------------------
// MovementHistoryRepository
// ---------------------------------------------------------------------------

export interface MovementHistoryRepository {
  /** Append-only — no update/delete */
  create(entry: MovementHistoryEntry, tx?: TransactionContext): Promise<void>;
  findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementHistoryEntry[]>;
}

// ---------------------------------------------------------------------------
// OverrideLogRepository
// ---------------------------------------------------------------------------

export interface OverrideLogRepository {
  /** Append-only, immutable — no update/delete */
  create(entry: OverrideLogEntry, tx?: TransactionContext): Promise<void>;
  findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<OverrideLogEntry[]>;
}
