/**
 * @contract FR-007, BR-005, BR-006, DATA-007 E-006, DATA-003 EVT-008, EVT-010
 *
 * Use Case: Publish a routine (DRAFT → PUBLISHED).
 * BR-006: At least 1 item required.
 * FR-007: Optional auto_deprecate_previous for fork chains.
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  RoutineRepository,
  RoutineItemRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface PublishRoutineInput {
  readonly id: string;
  readonly autoDeprecatePrevious?: boolean;
  readonly tenantId: string;
  readonly approvedBy: string;
  readonly correlationId: string;
}

export interface PublishRoutineOutput {
  readonly id: string;
  readonly status: 'PUBLISHED';
  readonly publishedAt: Date;
  readonly deprecatedParentId: string | null;
}

export class PublishRoutineUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: PublishRoutineInput): Promise<PublishRoutineOutput> {
    const existing = await this.routineRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Rotina ${input.id} não encontrada.`);
    }

    const routine = new BehaviorRoutine(existing);

    // Must be DRAFT to publish
    if (!routine.isDraft()) {
      if (routine.isPublished()) {
        throw new Error('Rotina já está publicada.');
      }
      throw new Error(`Rotina deve estar em DRAFT para publicar. Status atual: ${routine.status}`);
    }

    // BR-006: must have at least 1 item
    const itemCount = await this.itemRepo.countByRoutine(input.id);
    routine.assertCanPublish(itemCount);

    const now = new Date();
    let deprecatedParentId: string | null = null;

    const published = await this.uow.transaction(async (tx) => {
      // Transition to PUBLISHED
      const publishedProps = {
        ...existing,
        status: 'PUBLISHED' as const,
        publishedAt: now,
        approvedBy: input.approvedBy,
        updatedAt: now,
      };

      const result = await this.routineRepo.update(publishedProps, tx);

      // Emit routine.published event
      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'behavior_routine',
          entityId: input.id,
          eventType: PARAM_EVENT_TYPES.ROUTINE_PUBLISHED,
          payload: {
            id: input.id,
            codigo: existing.codigo,
            version: existing.version,
            approvedBy: input.approvedBy,
            publishedAt: now.toISOString(),
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.approvedBy,
          createdAt: now,
        },
        tx,
      );

      // FR-007: auto-deprecate parent if requested and this is a fork
      if (input.autoDeprecatePrevious && existing.parentRoutineId) {
        const parent = await this.routineRepo.findById(input.tenantId, existing.parentRoutineId);
        if (parent && parent.status === 'PUBLISHED') {
          await this.routineRepo.update({ ...parent, status: 'DEPRECATED', updatedAt: now }, tx);
          deprecatedParentId = parent.id;

          await this.eventRepo.create(
            {
              id: this.idGen.generate(),
              tenantId: input.tenantId,
              entityType: 'behavior_routine',
              entityId: parent.id,
              eventType: PARAM_EVENT_TYPES.ROUTINE_DEPRECATED,
              payload: {
                id: parent.id,
                codigo: parent.codigo,
                deprecatedBy: input.id,
                tenantId: input.tenantId,
              },
              correlationId: input.correlationId,
              causationId: null,
              createdBy: input.approvedBy,
              createdAt: now,
            },
            tx,
          );
        }
      }

      return result;
    });

    return {
      id: published.id,
      status: 'PUBLISHED',
      publishedAt: now,
      deprecatedParentId,
    };
  }
}
