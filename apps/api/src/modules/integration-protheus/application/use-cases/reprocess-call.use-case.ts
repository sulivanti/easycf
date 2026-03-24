/**
 * @contract FR-007, BR-007, BR-008, DATA-003, SEC-008
 *
 * Use Case: Reprocess a DLQ call log.
 * - Only DLQ logs can be reprocessed (BR-007)
 * - Justification min 10 chars (BR-008)
 * - Creates new call log with parent_log_id and attempt_number=1
 * - Original log stays in DLQ (immutable — BR-009)
 * - Emits integration.call_reprocessed domain event
 */

import {
  LogNotInDlqError,
  ReprocessReasonTooShortError,
} from '../../domain/errors/integration-errors.js';
import {
  createIntegrationEvent,
  INTEGRATION_EVENT_TYPES,
} from '../../domain/domain-events/integration-events.js';
import type {
  CallLogRepository,
  CallLogRow,
  ReprocessRequestRepository,
  ReprocessRequestRow,
  QueuePort,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface ReprocessCallInput {
  readonly callLogId: string;
  readonly tenantId: string;
  readonly reason: string;
  readonly requestedBy: string;
  readonly correlationId: string;
}

export interface ReprocessCallOutput {
  readonly newCallLogId: string;
  readonly reprocessRequestId: string;
  readonly status: 'QUEUED';
}

export class ReprocessCallUseCase {
  constructor(
    private readonly callLogRepo: CallLogRepository,
    private readonly reprocessRepo: ReprocessRequestRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly queue: QueuePort,
  ) {}

  async execute(input: ReprocessCallInput): Promise<ReprocessCallOutput> {
    // Validate reason length (BR-008)
    if (input.reason.trim().length < 10) {
      throw new ReprocessReasonTooShortError(input.reason.trim().length);
    }

    // Load original log
    const originalLog = await this.callLogRepo.findById(input.callLogId);
    if (!originalLog || originalLog.tenantId !== input.tenantId) {
      throw new Error(`Call log not found: ${input.callLogId}`);
    }

    // BR-007: Only DLQ logs can be reprocessed
    if (originalLog.status !== 'DLQ') {
      throw new LogNotInDlqError(input.callLogId, originalLog.status);
    }

    const newLogId = this.hashUtil.generateUuid();
    const requestId = this.hashUtil.generateUuid();
    const now = new Date();

    // New call log — fresh attempt cycle
    const newCallLog: CallLogRow = {
      id: newLogId,
      tenantId: input.tenantId,
      routineId: originalLog.routineId,
      caseId: originalLog.caseId,
      caseEventId: originalLog.caseEventId,
      correlationId: input.correlationId,
      status: 'QUEUED',
      attemptNumber: 1,
      parentLogId: input.callLogId,
      requestPayload: originalLog.requestPayload,
      requestHeaders: originalLog.requestHeaders,
      responseStatus: null,
      responseBody: null,
      responseProtocol: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      queuedAt: now,
      reprocessReason: input.reason.trim(),
      reprocessedBy: input.requestedBy,
      createdAt: now,
      updatedAt: now,
    };

    // Reprocess request record
    const reprocessRequest: ReprocessRequestRow = {
      id: requestId,
      tenantId: input.tenantId,
      originalLogId: input.callLogId,
      requestedBy: input.requestedBy,
      requestedAt: now,
      reason: input.reason.trim(),
      newLogId: newLogId,
      status: 'EXECUTED',
      createdAt: now,
      updatedAt: now,
    };

    // Mark original as REPROCESSED + create new log + request (all in one tx)
    await this.uow.transaction(async (tx) => {
      // Update original log status
      await this.callLogRepo.update({ ...originalLog, status: 'REPROCESSED', updatedAt: now }, tx);

      await this.callLogRepo.create(newCallLog, tx);
      await this.reprocessRepo.create(reprocessRequest, tx);

      await this.eventRepo.create(
        createIntegrationEvent({
          eventType: INTEGRATION_EVENT_TYPES.CALL_REPROCESSED,
          entityType: 'integration_call_log',
          entityId: newLogId,
          tenantId: input.tenantId,
          createdBy: input.requestedBy,
          correlationId: input.correlationId,
          sensitivityLevel: 1,
          payload: {
            originalLogId: input.callLogId,
            newLogId,
            reason: input.reason.trim(),
            requestedBy: input.requestedBy,
          },
        }),
        tx,
      );
    });

    // Enqueue new job
    await this.queue.enqueueIntegrationCall(newLogId, {
      callLogId: newLogId,
      correlationId: input.correlationId,
    });

    return {
      newCallLogId: newLogId,
      reprocessRequestId: requestId,
      status: 'QUEUED',
    };
  }
}
