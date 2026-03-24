/**
 * @contract FR-005, FR-006, BR-003, BR-006, DATA-003, ADR-001, SEC-008
 *
 * Use Case: Queue an integration call (Outbox Pattern).
 * - Creates call_log with status=QUEUED inside the business transaction (ADR-001)
 * - Enqueues BullMQ job with jobId = call_log.id for deduplication
 * - Validates service is ACTIVE (BR-003)
 * - Builds payload from field mappings + params (BR-004)
 * - Sanitizes payload for log (BR-005)
 */

import { IntegrationService } from '../../domain/entities/integration-service.entity.js';
import {
  buildPayload,
  resolveParamHeaders,
  sanitizeForLog,
} from '../../domain/domain-services/payload-builder.service.js';
import {
  createIntegrationEvent,
  INTEGRATION_EVENT_TYPES,
} from '../../domain/domain-events/integration-events.js';
import type {
  IntegrationServiceRepository,
  IntegrationRoutineRepository,
  FieldMappingRepository,
  IntegrationParamRepository,
  CallLogRepository,
  CallLogRow,
  QueuePort,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface ExecuteIntegrationInput {
  readonly tenantId: string;
  readonly routineId: string;
  readonly caseId?: string | null;
  readonly caseEventId?: string | null;
  readonly context: Record<string, unknown>;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface ExecuteIntegrationOutput {
  readonly callLogId: string;
  readonly status: 'QUEUED';
  readonly correlationId: string;
}

export class ExecuteIntegrationUseCase {
  constructor(
    private readonly serviceRepo: IntegrationServiceRepository,
    private readonly routineRepo: IntegrationRoutineRepository,
    private readonly mappingRepo: FieldMappingRepository,
    private readonly paramRepo: IntegrationParamRepository,
    private readonly callLogRepo: CallLogRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly queue: QueuePort,
  ) {}

  async execute(input: ExecuteIntegrationInput): Promise<ExecuteIntegrationOutput> {
    // Load routine config
    const routineConfig = await this.routineRepo.findByRoutineId(input.routineId);
    if (!routineConfig || routineConfig.tenantId !== input.tenantId) {
      throw new Error(`Integration routine config not found for routine: ${input.routineId}`);
    }

    // Load and validate service
    const serviceProps = await this.serviceRepo.findById(routineConfig.serviceId);
    if (!serviceProps) {
      throw new Error(`Integration service not found: ${routineConfig.serviceId}`);
    }
    const service = new IntegrationService(serviceProps);
    service.assertActive(); // BR-003

    // Load mappings and params
    const mappings = await this.mappingRepo.listByRoutine(input.routineId);
    const params = await this.paramRepo.listByRoutine(input.routineId);

    // Build payload (BR-004: validates required fields)
    const payload = buildPayload(
      mappings.map((m) => ({
        sourceField: m.sourceField,
        targetField: m.targetField,
        mappingType: m.mappingType,
        required: m.required,
        transformExpr: m.transformExpr,
        conditionExpr: m.conditionExpr,
        defaultValue: m.defaultValue,
        ordem: m.ordem,
      })),
      input.context,
    );

    // Merge param headers
    const paramHeaders = resolveParamHeaders(
      params.map((p) => ({
        paramKey: p.paramKey,
        paramType: p.paramType,
        value: p.value,
        derivationExpr: p.derivationExpr,
        isSensitive: p.isSensitive,
      })),
      input.context,
    );
    const allHeaders = { ...payload.headers, ...paramHeaders };

    // BR-005: Sanitize for logging
    const sanitized = sanitizeForLog(
      { ...payload, headers: allHeaders },
      params.map((p) => ({
        paramKey: p.paramKey,
        paramType: p.paramType,
        value: p.value,
        derivationExpr: p.derivationExpr,
        isSensitive: p.isSensitive,
      })),
    );

    const callLogId = this.hashUtil.generateUuid();
    const now = new Date();

    const callLog: CallLogRow = {
      id: callLogId,
      tenantId: input.tenantId,
      routineId: input.routineId,
      caseId: input.caseId ?? null,
      caseEventId: input.caseEventId ?? null,
      correlationId: input.correlationId,
      status: 'QUEUED',
      attemptNumber: 1,
      parentLogId: null,
      requestPayload: sanitized.body,
      requestHeaders: sanitized.headers,
      responseStatus: null,
      responseBody: null,
      responseProtocol: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      queuedAt: now,
      reprocessReason: null,
      reprocessedBy: null,
      createdAt: now,
      updatedAt: now,
    };

    // ADR-001: Outbox Pattern — INSERT call log inside transaction
    await this.uow.transaction(async (tx) => {
      await this.callLogRepo.create(callLog, tx);

      await this.eventRepo.create(
        createIntegrationEvent({
          eventType: INTEGRATION_EVENT_TYPES.CALL_QUEUED,
          entityType: 'integration_call_log',
          entityId: callLogId,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          sensitivityLevel: 1,
          payload: {
            callLogId,
            routineId: input.routineId,
            serviceId: routineConfig.serviceId,
            caseId: input.caseId ?? null,
          },
        }),
        tx,
      );
    });

    // Enqueue BullMQ job (outside transaction — ADR-002)
    await this.queue.enqueueIntegrationCall(callLogId, {
      callLogId,
      correlationId: input.correlationId,
    });

    return {
      callLogId,
      status: 'QUEUED',
      correlationId: input.correlationId,
    };
  }
}
