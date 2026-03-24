/**
 * @contract DATA-007, DOC-GNP-00, DOC-FND-000
 *
 * Repository port interfaces for the Contextual Params module (MOD-007).
 * Defines the boundary between application and infrastructure layers.
 * 9 repositories matching the 9 Drizzle tables.
 */

import type { ContextFramerProps } from '../../domain/entities/context-framer.js';
import type { IncidenceRuleProps } from '../../domain/entities/incidence-rule.js';
import type { BehaviorRoutineProps } from '../../domain/aggregates/behavior-routine.js';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  readonly cursor?: string;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export type TransactionContext = unknown;

export interface UnitOfWork {
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// ContextFramerTypeRecord — raw DB shape
// ---------------------------------------------------------------------------
export interface ContextFramerTypeRecord {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// TargetObjectRecord
// ---------------------------------------------------------------------------
export interface TargetObjectRecord {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly moduloEcf: string | null;
  readonly descricao: string | null;
  readonly tenantId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// TargetFieldRecord
// ---------------------------------------------------------------------------
export interface TargetFieldRecord {
  readonly id: string;
  readonly targetObjectId: string;
  readonly fieldKey: string;
  readonly fieldLabel: string | null;
  readonly fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';
  readonly isSystem: boolean;
  readonly tenantId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// RoutineItemRecord
// ---------------------------------------------------------------------------
export interface RoutineItemRecord {
  readonly id: string;
  readonly routineId: string;
  readonly itemType: string;
  readonly targetFieldId: string | null;
  readonly action: string;
  readonly value: unknown;
  readonly conditionExpr: string | null;
  readonly validationMessage: string | null;
  readonly isBlocking: boolean;
  readonly ordem: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// RoutineIncidenceLinkRecord
// ---------------------------------------------------------------------------
export interface RoutineIncidenceLinkRecord {
  readonly id: string;
  readonly routineId: string;
  readonly incidenceRuleId: string;
  readonly createdAt: Date;
}

// ---------------------------------------------------------------------------
// RoutineVersionHistoryRecord
// ---------------------------------------------------------------------------
export interface RoutineVersionHistoryRecord {
  readonly id: string;
  readonly routineId: string;
  readonly previousVersionId: string;
  readonly changedBy: string;
  readonly changeReason: string;
  readonly changedAt: Date;
}

// ---------------------------------------------------------------------------
// FramerTypeRepository
// ---------------------------------------------------------------------------
export interface FramerTypeRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<ContextFramerTypeRecord | null>;
  list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ContextFramerTypeRecord>>;
  create(
    record: ContextFramerTypeRecord,
    tx?: TransactionContext,
  ): Promise<ContextFramerTypeRecord>;
}

// ---------------------------------------------------------------------------
// FramerRepository
// ---------------------------------------------------------------------------
export interface FramerRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<ContextFramerProps | null>;
  list(
    tenantId: string,
    params: PaginationParams & {
      status?: 'ACTIVE' | 'INACTIVE';
      framerTypeId?: string;
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ContextFramerProps>>;
  create(record: ContextFramerProps, tx?: TransactionContext): Promise<ContextFramerProps>;
  update(record: ContextFramerProps, tx?: TransactionContext): Promise<ContextFramerProps>;
  softDelete(tenantId: string, id: string, tx?: TransactionContext): Promise<void>;
  findExpired(
    tenantId: string,
    now: Date,
    tx?: TransactionContext,
  ): Promise<readonly ContextFramerProps[]>;
}

// ---------------------------------------------------------------------------
// TargetObjectRepository
// ---------------------------------------------------------------------------
export interface TargetObjectRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<TargetObjectRecord | null>;
  list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<TargetObjectRecord>>;
  create(record: TargetObjectRecord, tx?: TransactionContext): Promise<TargetObjectRecord>;
}

// ---------------------------------------------------------------------------
// TargetFieldRepository
// ---------------------------------------------------------------------------
export interface TargetFieldRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<TargetFieldRecord | null>;
  listByTargetObject(
    tenantId: string,
    targetObjectId: string,
    tx?: TransactionContext,
  ): Promise<readonly TargetFieldRecord[]>;
  create(record: TargetFieldRecord, tx?: TransactionContext): Promise<TargetFieldRecord>;
}

// ---------------------------------------------------------------------------
// IncidenceRuleRepository
// ---------------------------------------------------------------------------
export interface IncidenceRuleRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<IncidenceRuleProps | null>;
  list(
    tenantId: string,
    params: PaginationParams & {
      framerId?: string;
      targetObjectId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<IncidenceRuleProps>>;
  findByFramerAndObject(
    tenantId: string,
    framerId: string,
    targetObjectId: string,
    tx?: TransactionContext,
  ): Promise<IncidenceRuleProps | null>;
  countByFramer(tenantId: string, framerId: string, tx?: TransactionContext): Promise<number>;
  create(record: IncidenceRuleProps, tx?: TransactionContext): Promise<IncidenceRuleProps>;
  update(record: IncidenceRuleProps, tx?: TransactionContext): Promise<IncidenceRuleProps>;
  /**
   * Find active incidence rules for given framer IDs.
   * Used by the evaluation engine (FR-009 step 1).
   */
  findActiveByFramerIds(
    tenantId: string,
    framerIds: readonly string[],
    now: Date,
    tx?: TransactionContext,
  ): Promise<readonly IncidenceRuleProps[]>;
}

// ---------------------------------------------------------------------------
// RoutineRepository
// ---------------------------------------------------------------------------
export interface RoutineRepository {
  findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<BehaviorRoutineProps | null>;
  list(
    tenantId: string,
    params: PaginationParams & {
      status?: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
      routineType?: 'BEHAVIOR' | 'INTEGRATION';
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<BehaviorRoutineProps>>;
  create(record: BehaviorRoutineProps, tx?: TransactionContext): Promise<BehaviorRoutineProps>;
  update(record: BehaviorRoutineProps, tx?: TransactionContext): Promise<BehaviorRoutineProps>;
}

// ---------------------------------------------------------------------------
// RoutineItemRepository
// ---------------------------------------------------------------------------
export interface RoutineItemRepository {
  findById(id: string, tx?: TransactionContext): Promise<RoutineItemRecord | null>;
  listByRoutine(routineId: string, tx?: TransactionContext): Promise<readonly RoutineItemRecord[]>;
  countByRoutine(routineId: string, tx?: TransactionContext): Promise<number>;
  create(record: RoutineItemRecord, tx?: TransactionContext): Promise<RoutineItemRecord>;
  update(record: RoutineItemRecord, tx?: TransactionContext): Promise<RoutineItemRecord>;
  delete(id: string, tx?: TransactionContext): Promise<void>;
  /**
   * Bulk copy items from one routine to another (fork).
   * Returns created items with new IDs.
   */
  copyToRoutine(
    sourceRoutineId: string,
    targetRoutineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineItemRecord[]>;
}

// ---------------------------------------------------------------------------
// RoutineIncidenceLinkRepository
// ---------------------------------------------------------------------------
export interface RoutineIncidenceLinkRepository {
  findByRoutineAndRule(
    routineId: string,
    incidenceRuleId: string,
    tx?: TransactionContext,
  ): Promise<RoutineIncidenceLinkRecord | null>;
  listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineIncidenceLinkRecord[]>;
  /**
   * Find PUBLISHED routines linked to given incidence rule IDs.
   * Used by the evaluation engine (FR-009 step 2).
   */
  findPublishedRoutineIdsByRuleIds(
    ruleIds: readonly string[],
    tx?: TransactionContext,
  ): Promise<readonly { routineId: string; incidenceRuleId: string }[]>;
  create(
    record: RoutineIncidenceLinkRecord,
    tx?: TransactionContext,
  ): Promise<RoutineIncidenceLinkRecord>;
  delete(id: string, tx?: TransactionContext): Promise<void>;
  deleteByRoutineAndRule(
    routineId: string,
    incidenceRuleId: string,
    tx?: TransactionContext,
  ): Promise<void>;
  /**
   * Bulk copy links from one routine to another (fork).
   */
  copyToRoutine(
    sourceRoutineId: string,
    targetRoutineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineIncidenceLinkRecord[]>;
}

// ---------------------------------------------------------------------------
// VersionHistoryRepository
// ---------------------------------------------------------------------------
export interface VersionHistoryRepository {
  listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineVersionHistoryRecord[]>;
  create(
    record: RoutineVersionHistoryRecord,
    tx?: TransactionContext,
  ): Promise<RoutineVersionHistoryRecord>;
}

// ---------------------------------------------------------------------------
// DomainEventRepository (reused from Foundation pattern)
// ---------------------------------------------------------------------------
export interface DomainEventRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly causationId: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
}

export interface DomainEventRepository {
  create(event: DomainEventRecord, tx?: TransactionContext): Promise<void>;
}
