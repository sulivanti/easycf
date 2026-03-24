/**
 * @contract FR-002, BR-001, DATA-003, SEC-008
 *
 * Use Case: Configure HTTP extension for an integration routine.
 * - Routine must be in DRAFT status (BR-001 — immutability)
 * - Creates integration_routines record (1:1 with behavior_routines)
 * - Emits integration.routine_configured domain event
 */

import {
  createIntegrationEvent,
  INTEGRATION_EVENT_TYPES,
} from '../../domain/domain-events/integration-events.js';
import { IntegrationRoutineImmutableError } from '../../domain/errors/integration-errors.js';
import type {
  IntegrationRoutineRepository,
  IntegrationRoutineRow,
  IntegrationServiceRepository,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface ConfigureRoutineInput {
  readonly tenantId: string;
  readonly routineId: string;
  readonly routineStatus: string;
  readonly serviceId: string;
  readonly httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly endpointTpl: string;
  readonly contentType?: string;
  readonly timeoutMs?: number;
  readonly retryMax?: number;
  readonly retryBackoffMs?: number;
  readonly triggerEvents?: string[];
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface ConfigureRoutineOutput {
  readonly id: string;
  readonly routineId: string;
  readonly serviceId: string;
  readonly httpMethod: string;
  readonly endpointTpl: string;
  readonly retryMax: number;
  readonly retryBackoffMs: number;
}

export class ConfigureRoutineUseCase {
  constructor(
    private readonly routineRepo: IntegrationRoutineRepository,
    private readonly serviceRepo: IntegrationServiceRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: ConfigureRoutineInput): Promise<ConfigureRoutineOutput> {
    // BR-001: Only DRAFT routines can be configured
    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(input.routineId);
    }

    // Validate service exists
    const service = await this.serviceRepo.findById(input.serviceId);
    if (!service || service.tenantId !== input.tenantId) {
      throw new Error(`Integration service not found: ${input.serviceId}`);
    }

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    // Check if routine already has integration config (upsert pattern)
    const existing = await this.routineRepo.findByRoutineId(input.routineId);

    const routineRow: IntegrationRoutineRow = {
      id: existing?.id ?? id,
      tenantId: input.tenantId,
      routineId: input.routineId,
      serviceId: input.serviceId,
      httpMethod: input.httpMethod,
      endpointTpl: input.endpointTpl.trim(),
      contentType: input.contentType ?? 'application/json',
      timeoutMs: input.timeoutMs ?? null,
      retryMax: input.retryMax ?? 3,
      retryBackoffMs: input.retryBackoffMs ?? 1000,
      triggerEvents: input.triggerEvents ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.uow.transaction(async (tx) => {
      if (existing) {
        await this.routineRepo.update(routineRow, tx);
      } else {
        await this.routineRepo.create(routineRow, tx);
      }

      await this.eventRepo.create(
        createIntegrationEvent({
          eventType: INTEGRATION_EVENT_TYPES.ROUTINE_CONFIGURED,
          entityType: 'integration_routine',
          entityId: routineRow.id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          sensitivityLevel: 1,
          payload: {
            id: routineRow.id,
            routineId: routineRow.routineId,
            serviceId: routineRow.serviceId,
            httpMethod: routineRow.httpMethod,
            endpointTpl: routineRow.endpointTpl,
            retryMax: routineRow.retryMax,
            triggerEvents: routineRow.triggerEvents,
          },
        }),
        tx,
      );
    });

    return {
      id: routineRow.id,
      routineId: routineRow.routineId,
      serviceId: routineRow.serviceId,
      httpMethod: routineRow.httpMethod,
      endpointTpl: routineRow.endpointTpl,
      retryMax: routineRow.retryMax,
      retryBackoffMs: routineRow.retryBackoffMs,
    };
  }
}
