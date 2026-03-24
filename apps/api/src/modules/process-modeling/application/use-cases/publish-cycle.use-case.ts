/**
 * @contract FR-002, BR-001, BR-003, BR-010, DATA-003
 *
 * Use Case: Publish Process Cycle (DRAFT → PUBLISHED).
 * - Validates at least 1 macro-stage exists
 * - Validates at least 1 stage with is_initial=true (BR-003)
 * - Idempotent: already-PUBLISHED returns 422 without side-effect (FR-002)
 * - Emits process_modeling.cycle.published domain event
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { ProcessCycleRepository, ProcessStageRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface PublishCycleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly publishedBy: string;
  readonly correlationId: string;
}

export interface PublishCycleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly version: number;
  readonly status: 'PUBLISHED';
  readonly publishedAt: Date;
}

export class PublishCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: PublishCycleInput): Promise<PublishCycleOutput> {
    const existing = await this.cycleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessCycle', input.id);
    }

    const cycle = new ProcessCycle(existing);

    // FR-002: Idempotent — already PUBLISHED returns 422
    if (cycle.isPublished()) {
      throw new Error('Ciclo já está publicado.');
    }
    if (cycle.isDeprecated()) {
      throw new Error('Ciclos depreciados não podem ser publicados.');
    }

    // BR-003: Must have at least 1 initial stage
    const hasInitial = await this.stageRepo.hasInitialStage(input.id);
    cycle.assertCanPublish(hasInitial);

    // BR-010: Transition DRAFT → PUBLISHED
    cycle.transitionTo('PUBLISHED');

    const updatedProps = {
      ...existing,
      status: 'PUBLISHED' as const,
      publishedAt: cycle.publishedAt!,
      updatedAt: new Date(),
    };

    await this.uow.transaction(async (tx) => {
      await this.cycleRepo.update(updatedProps, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_PUBLISHED,
          entityType: 'process_cycle',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.publishedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            codigo: existing.codigo,
            nome: existing.nome,
            version: existing.version,
            published_at: updatedProps.publishedAt.toISOString(),
          },
        }),
        tx,
      );
    });

    return {
      id: input.id,
      codigo: existing.codigo,
      nome: existing.nome,
      version: existing.version,
      status: 'PUBLISHED',
      publishedAt: updatedProps.publishedAt,
    };
  }
}
