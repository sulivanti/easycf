/**
 * @contract FR-006, BR-005, DATA-007 E-007, DATA-003 EVT-011
 *
 * Use Case: Add an item to a DRAFT routine.
 * BR-005: PUBLISHED routines are immutable — items cannot be added.
 * Checks configurable limit per routine (PEN-007/PENDENTE-005).
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type { ItemType } from '../../domain/value-objects/item-type.js';
import type { ItemAction } from '../../domain/value-objects/item-action.js';
import type {
  RoutineRepository,
  RoutineItemRepository,
  RoutineItemRecord,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

/** Default max items per routine (configurable per tenant) */
const DEFAULT_MAX_ITEMS_PER_ROUTINE = 50;

export interface CreateRoutineItemInput {
  readonly routineId: string;
  readonly itemType: ItemType;
  readonly action: ItemAction;
  readonly targetFieldId?: string;
  readonly value?: unknown;
  readonly conditionExpr?: string;
  readonly validationMessage?: string;
  readonly isBlocking?: boolean;
  readonly ordem: number;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
  readonly maxItemsPerRoutine?: number;
}

export interface CreateRoutineItemOutput {
  readonly id: string;
  readonly routineId: string;
  readonly itemType: string;
  readonly action: string;
  readonly ordem: number;
}

export class CreateRoutineItemUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateRoutineItemInput): Promise<CreateRoutineItemOutput> {
    // Validate routine exists and is DRAFT (BR-005)
    const routineProps = await this.routineRepo.findById(input.tenantId, input.routineId);
    if (!routineProps) {
      throw new Error(`Rotina ${input.routineId} não encontrada.`);
    }
    const routine = new BehaviorRoutine(routineProps);
    routine.assertMutable();

    // PEN-007/PENDENTE-005: check configurable limit
    const maxItems = input.maxItemsPerRoutine ?? DEFAULT_MAX_ITEMS_PER_ROUTINE;
    const currentCount = await this.itemRepo.countByRoutine(input.routineId);
    if (currentCount >= maxItems) {
      const err = new Error('LIMIT_EXCEEDED') as Error & {
        code: string;
        statusCode: number;
        current: number;
        max: number;
        configurable: boolean;
      };
      err.code = 'LIMIT_EXCEEDED';
      err.statusCode = 422;
      err.current = currentCount;
      err.max = maxItems;
      err.configurable = true;
      throw err;
    }

    const now = new Date();
    const record: RoutineItemRecord = {
      id: this.idGen.generate(),
      routineId: input.routineId,
      itemType: input.itemType,
      targetFieldId: input.targetFieldId ?? null,
      action: input.action,
      value: input.value ?? null,
      conditionExpr: input.conditionExpr ?? null,
      validationMessage: input.validationMessage ?? null,
      isBlocking: input.isBlocking ?? false,
      ordem: input.ordem,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.uow.transaction(async (tx) => {
      const result = await this.itemRepo.create(record, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'routine_item',
          entityId: result.id,
          eventType: PARAM_EVENT_TYPES.ROUTINE_ITEM_ADDED,
          payload: {
            routineId: input.routineId,
            itemType: input.itemType,
            action: input.action,
            ordem: input.ordem,
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: now,
        },
        tx,
      );

      return result;
    });

    return {
      id: created.id,
      routineId: created.routineId,
      itemType: created.itemType,
      action: created.action,
      ordem: created.ordem,
    };
  }
}
