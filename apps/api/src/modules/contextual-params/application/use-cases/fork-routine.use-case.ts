/**
 * @contract FR-008, BR-008, DATA-007 E-006/E-009, DATA-003 EVT-009, ADR-003
 *
 * Use Case: Fork a PUBLISHED routine into a new DRAFT version.
 * Copies all items and incidence links to the new version.
 * Records version history with mandatory change_reason (min 10 chars).
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  RoutineRepository,
  RoutineItemRepository,
  RoutineIncidenceLinkRepository,
  VersionHistoryRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface ForkRoutineInput {
  readonly id: string;
  readonly changeReason: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface ForkRoutineOutput {
  readonly id: string;
  readonly codigo: string;
  readonly version: number;
  readonly status: 'DRAFT';
  readonly parentRoutineId: string;
  readonly itemsCopied: number;
  readonly linksCopied: number;
}

export class ForkRoutineUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly linkRepo: RoutineIncidenceLinkRepository,
    private readonly versionHistoryRepo: VersionHistoryRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: ForkRoutineInput): Promise<ForkRoutineOutput> {
    // BR-008: change_reason min 10 chars
    if (!input.changeReason || input.changeReason.length < 10) {
      throw new Error('change_reason deve ter no mínimo 10 caracteres.');
    }

    const existing = await this.routineRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Rotina ${input.id} não encontrada.`);
    }

    const routine = new BehaviorRoutine(existing);
    routine.assertCanFork();

    const newId = this.idGen.generate();
    const forkProps = routine.toForkProps(newId, input.createdBy);
    const now = new Date();

    const result = await this.uow.transaction(async (tx) => {
      // Create forked routine
      const forked = await this.routineRepo.create(forkProps, tx);

      // Copy items
      const copiedItems = await this.itemRepo.copyToRoutine(input.id, newId, tx);

      // Copy incidence links
      const copiedLinks = await this.linkRepo.copyToRoutine(input.id, newId, tx);

      // Record version history
      await this.versionHistoryRepo.create(
        {
          id: this.idGen.generate(),
          routineId: newId,
          previousVersionId: input.id,
          changedBy: input.createdBy,
          changeReason: input.changeReason,
          changedAt: now,
        },
        tx,
      );

      // Emit routine.forked event
      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'behavior_routine',
          entityId: newId,
          eventType: PARAM_EVENT_TYPES.ROUTINE_FORKED,
          payload: {
            id: newId,
            codigo: existing.codigo,
            version: forkProps.version,
            parentRoutineId: input.id,
            changeReason: input.changeReason.substring(0, 200),
            itemsCopied: copiedItems.length,
            linksCopied: copiedLinks.length,
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: now,
        },
        tx,
      );

      return {
        forked,
        itemsCopied: copiedItems.length,
        linksCopied: copiedLinks.length,
      };
    });

    return {
      id: newId,
      codigo: result.forked.codigo,
      version: result.forked.version,
      status: 'DRAFT',
      parentRoutineId: input.id,
      itemsCopied: result.itemsCopied,
      linksCopied: result.linksCopied,
    };
  }
}
