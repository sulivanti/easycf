/**
 * @contract DATA-008, FR-001..FR-009, SEC-008, INT-008
 *
 * Repository port interfaces for the Integration Protheus module (MOD-008).
 * Reuses Foundation's UnitOfWork, TransactionContext, PaginationParams, PaginatedResult.
 */

import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';
import type { IntegrationServiceProps } from '../../domain/entities/integration-service.entity.js';

// ---------------------------------------------------------------------------
// Shared row types
// ---------------------------------------------------------------------------

export interface IntegrationRoutineRow {
  readonly id: string;
  readonly tenantId: string;
  readonly routineId: string;
  readonly serviceId: string;
  readonly httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly endpointTpl: string;
  readonly contentType: string | null;
  readonly timeoutMs: number | null;
  readonly retryMax: number;
  readonly retryBackoffMs: number;
  readonly triggerEvents: string[] | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface FieldMappingRow {
  readonly id: string;
  readonly tenantId: string;
  readonly routineId: string;
  readonly sourceField: string;
  readonly targetField: string;
  readonly mappingType: 'FIELD' | 'PARAM' | 'HEADER' | 'FIXED_VALUE' | 'DERIVED';
  readonly required: boolean;
  readonly transformExpr: string | null;
  readonly conditionExpr: string | null;
  readonly defaultValue: string | null;
  readonly ordem: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface IntegrationParamRow {
  readonly id: string;
  readonly tenantId: string;
  readonly routineId: string;
  readonly paramKey: string;
  readonly paramType: 'FIXED' | 'DERIVED_FROM_TENANT' | 'DERIVED_FROM_CONTEXT' | 'HEADER';
  readonly value: string | null;
  readonly derivationExpr: string | null;
  readonly isSensitive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CallLogRow {
  readonly id: string;
  readonly tenantId: string;
  readonly routineId: string;
  readonly caseId: string | null;
  readonly caseEventId: string | null;
  readonly correlationId: string;
  readonly status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'DLQ' | 'REPROCESSED';
  readonly attemptNumber: number;
  readonly parentLogId: string | null;
  readonly requestPayload: Record<string, unknown> | null;
  readonly requestHeaders: Record<string, unknown> | null;
  readonly responseStatus: number | null;
  readonly responseBody: Record<string, unknown> | null;
  readonly responseProtocol: string | null;
  readonly errorMessage: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly durationMs: number | null;
  readonly queuedAt: Date;
  readonly reprocessReason: string | null;
  readonly reprocessedBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ReprocessRequestRow {
  readonly id: string;
  readonly tenantId: string;
  readonly originalLogId: string;
  readonly requestedBy: string;
  readonly requestedAt: Date;
  readonly reason: string;
  readonly newLogId: string | null;
  readonly status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface ServiceListFilters {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly environment?: 'PROD' | 'HML' | 'DEV';
}

export interface CallLogListFilters {
  readonly tenantId: string;
  readonly routineId?: string;
  readonly status?: string;
  readonly serviceId?: string;
  readonly correlationId?: string;
  readonly periodStart?: Date;
  readonly periodEnd?: Date;
}

// ---------------------------------------------------------------------------
// IntegrationServiceRepository
// ---------------------------------------------------------------------------
export interface IntegrationServiceRepository {
  findById(id: string, tx?: TransactionContext): Promise<IntegrationServiceProps | null>;

  list(
    filters: ServiceListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<IntegrationServiceProps>>;

  create(
    service: IntegrationServiceProps,
    tx?: TransactionContext,
  ): Promise<IntegrationServiceProps>;
  update(
    service: IntegrationServiceProps,
    tx?: TransactionContext,
  ): Promise<IntegrationServiceProps>;

  /** Soft delete — sets deleted_at */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** Count active (non-deleted) routines referencing this service (BR-003) */
  countActiveRoutines(serviceId: string, tx?: TransactionContext): Promise<number>;
}

// ---------------------------------------------------------------------------
// IntegrationRoutineRepository
// ---------------------------------------------------------------------------
export interface IntegrationRoutineRepository {
  findById(id: string, tx?: TransactionContext): Promise<IntegrationRoutineRow | null>;

  findByRoutineId(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<IntegrationRoutineRow | null>;

  create(routine: IntegrationRoutineRow, tx?: TransactionContext): Promise<IntegrationRoutineRow>;
  update(routine: IntegrationRoutineRow, tx?: TransactionContext): Promise<IntegrationRoutineRow>;

  /** Soft delete */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// FieldMappingRepository
// ---------------------------------------------------------------------------
export interface FieldMappingRepository {
  findById(id: string, tx?: TransactionContext): Promise<FieldMappingRow | null>;

  listByRoutine(routineId: string, tx?: TransactionContext): Promise<readonly FieldMappingRow[]>;

  create(mapping: FieldMappingRow, tx?: TransactionContext): Promise<FieldMappingRow>;
  update(mapping: FieldMappingRow, tx?: TransactionContext): Promise<FieldMappingRow>;

  /** Soft delete */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** Bulk insert for fork (BR-010) */
  createMany(mappings: readonly FieldMappingRow[], tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// IntegrationParamRepository
// ---------------------------------------------------------------------------
export interface IntegrationParamRepository {
  findById(id: string, tx?: TransactionContext): Promise<IntegrationParamRow | null>;

  listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly IntegrationParamRow[]>;

  create(param: IntegrationParamRow, tx?: TransactionContext): Promise<IntegrationParamRow>;
  update(param: IntegrationParamRow, tx?: TransactionContext): Promise<IntegrationParamRow>;

  /** Soft delete */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** Bulk insert for fork (BR-010) */
  createMany(params: readonly IntegrationParamRow[], tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// CallLogRepository
// ---------------------------------------------------------------------------
export interface CallLogRepository {
  findById(id: string, tx?: TransactionContext): Promise<CallLogRow | null>;

  list(
    filters: CallLogListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<CallLogRow>>;

  /** List DLQ logs for monitoring (DATA-008 §3.1) */
  listDlq(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<CallLogRow>>;

  /** Insert a new call log (Outbox Pattern — inside transaction) */
  create(log: CallLogRow, tx?: TransactionContext): Promise<CallLogRow>;

  /** Update status/response fields */
  update(log: CallLogRow, tx?: TransactionContext): Promise<CallLogRow>;

  /** Scan QUEUED logs for the Outbox poller */
  findQueued(limit: number, tx?: TransactionContext): Promise<readonly CallLogRow[]>;

  /** Metrics: count by status for a tenant in the given period */
  countByStatus(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    tx?: TransactionContext,
  ): Promise<Record<string, number>>;
}

// ---------------------------------------------------------------------------
// ReprocessRequestRepository
// ---------------------------------------------------------------------------
export interface ReprocessRequestRepository {
  findById(id: string, tx?: TransactionContext): Promise<ReprocessRequestRow | null>;

  create(request: ReprocessRequestRow, tx?: TransactionContext): Promise<ReprocessRequestRow>;
  update(request: ReprocessRequestRow, tx?: TransactionContext): Promise<ReprocessRequestRow>;
}

// ---------------------------------------------------------------------------
// EncryptionService — port for AES-256 auth_config encryption (ADR-004)
// ---------------------------------------------------------------------------
export interface EncryptionService {
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
}

// ---------------------------------------------------------------------------
// HttpClientPort — port for outbound HTTP calls to Protheus
// ---------------------------------------------------------------------------
export interface HttpCallOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body?: Record<string, unknown>;
  readonly queryParams?: Record<string, string>;
  readonly timeoutMs: number;
}

export interface HttpCallResult {
  readonly status: number;
  readonly body: unknown;
  readonly protocol: string;
  readonly durationMs: number;
}

export interface HttpClientPort {
  execute(options: HttpCallOptions): Promise<HttpCallResult>;
}

// ---------------------------------------------------------------------------
// QueuePort — port for BullMQ job enqueuing
// ---------------------------------------------------------------------------
export interface QueuePort {
  enqueueIntegrationCall(
    jobId: string,
    data: { callLogId: string; correlationId: string },
    delayMs?: number,
  ): Promise<void>;
}
