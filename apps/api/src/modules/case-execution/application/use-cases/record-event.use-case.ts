/**
 * @contract FR-007, SEC-006
 *
 * Records a loose event (COMMENT, EXCEPTION, EVIDENCE) on a case.
 * Does not trigger stage transitions — purely informational.
 */

import type { CaseInstanceRepository } from '../ports/case-instance.repository.js';
import type { CaseEventRepository, CaseEventRow } from '../ports/case-event.repository.js';
import type { CaseEventType } from '../../domain/value-objects/case-event-type.js';
import {
  createCaseExecutionEvent,
  CASE_EXECUTION_EVENT_TYPES,
} from '../../domain/domain-events/case-events.js';

export interface RecordEventInput {
  caseId: string;
  eventType: Extract<CaseEventType, 'COMMENT' | 'EXCEPTION' | 'EVIDENCE'>;
  descricao: string;
  tenantId: string;
  userId: string;
  correlationId: string;
  metadata?: Record<string, unknown>;
}

export interface RecordEventOutput {
  event: CaseEventRow;
}

export class RecordEventUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly emitEvent: (
      event: ReturnType<typeof createCaseExecutionEvent>,
    ) => Promise<void>,
  ) {}

  async execute(input: RecordEventInput): Promise<RecordEventOutput> {
    const caseRow = await this.caseRepo.findById(input.caseId, input.tenantId);
    if (!caseRow) {
      throw new Error(`Case ${input.caseId} not found.`);
    }

    const event = await this.caseEventRepo.create({
      caseId: input.caseId,
      eventType: input.eventType,
      descricao: input.descricao,
      createdBy: input.userId,
      createdAt: new Date(),
      metadata: input.metadata ?? null,
      stageId: caseRow.currentStageId,
    });

    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: CASE_EXECUTION_EVENT_TYPES.EVENT_RECORDED,
        entityId: event.id,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          caseId: input.caseId,
          eventType: input.eventType,
          stageId: caseRow.currentStageId,
        },
      }),
    );

    return { event };
  }
}
