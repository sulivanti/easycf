/**
 * @contract FR-009, BR-005, SEC-008
 *
 * Use Case: List and get detail for integration call logs.
 * - Cursor-based pagination
 * - Sensitive data already sanitized at write time (BR-005)
 */

import type { CallLogRepository, CallLogRow, CallLogListFilters } from '../ports/repositories.js';
import type {
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';

export interface ListCallLogsInput {
  readonly tenantId: string;
  readonly routineId?: string;
  readonly status?: string;
  readonly serviceId?: string;
  readonly correlationId?: string;
  readonly periodStart?: Date;
  readonly periodEnd?: Date;
  readonly cursor?: string;
  readonly limit: number;
}

export interface CallLogOutput {
  readonly id: string;
  readonly routineId: string;
  readonly caseId: string | null;
  readonly correlationId: string;
  readonly status: string;
  readonly attemptNumber: number;
  readonly parentLogId: string | null;
  readonly requestPayload: Record<string, unknown> | null;
  readonly requestHeaders: Record<string, unknown> | null;
  readonly responseStatus: number | null;
  readonly responseBody: Record<string, unknown> | null;
  readonly errorMessage: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly durationMs: number | null;
  readonly queuedAt: Date;
  readonly reprocessReason: string | null;
  readonly reprocessedBy: string | null;
  readonly createdAt: Date;
}

export class ListCallLogsUseCase {
  constructor(private readonly callLogRepo: CallLogRepository) {}

  async execute(input: ListCallLogsInput): Promise<PaginatedResult<CallLogOutput>> {
    const filters: CallLogListFilters = {
      tenantId: input.tenantId,
      routineId: input.routineId,
      status: input.status,
      serviceId: input.serviceId,
      correlationId: input.correlationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    };

    const pagination: PaginationParams = {
      cursor: input.cursor,
      limit: input.limit,
    };

    const result = await this.callLogRepo.list(filters, pagination);

    return {
      data: result.data.map(toOutput),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}

export class GetCallLogUseCase {
  constructor(private readonly callLogRepo: CallLogRepository) {}

  async execute(id: string, tenantId: string): Promise<CallLogOutput> {
    const log = await this.callLogRepo.findById(id);
    if (!log || log.tenantId !== tenantId) {
      throw new Error(`Call log not found: ${id}`);
    }
    return toOutput(log);
  }
}

function toOutput(row: CallLogRow): CallLogOutput {
  return {
    id: row.id,
    routineId: row.routineId,
    caseId: row.caseId,
    correlationId: row.correlationId,
    status: row.status,
    attemptNumber: row.attemptNumber,
    parentLogId: row.parentLogId,
    requestPayload: row.requestPayload,
    requestHeaders: row.requestHeaders,
    responseStatus: row.responseStatus,
    responseBody: row.responseBody,
    errorMessage: row.errorMessage,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    durationMs: row.durationMs,
    queuedAt: row.queuedAt,
    reprocessReason: row.reprocessReason,
    reprocessedBy: row.reprocessedBy,
    createdAt: row.createdAt,
  };
}
