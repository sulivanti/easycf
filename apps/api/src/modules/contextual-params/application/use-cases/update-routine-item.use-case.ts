/**
 * @contract FR-006, BR-005, DATA-007 E-007
 *
 * Use Case: Update a routine item (only if parent routine is DRAFT).
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import type { ItemType } from '../../domain/value-objects/item-type.js';
import type { ItemAction } from '../../domain/value-objects/item-action.js';
import type {
  RoutineRepository,
  RoutineItemRepository,
  UnitOfWork,
} from '../ports/repositories.js';

export interface UpdateRoutineItemInput {
  readonly id: string;
  readonly itemType?: ItemType;
  readonly action?: ItemAction;
  readonly targetFieldId?: string | null;
  readonly value?: unknown;
  readonly conditionExpr?: string | null;
  readonly validationMessage?: string | null;
  readonly isBlocking?: boolean;
  readonly ordem?: number;
  readonly tenantId: string;
}

export interface UpdateRoutineItemOutput {
  readonly id: string;
  readonly itemType: string;
  readonly action: string;
  readonly ordem: number;
}

export class UpdateRoutineItemUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateRoutineItemInput): Promise<UpdateRoutineItemOutput> {
    const existing = await this.itemRepo.findById(input.id);
    if (!existing) {
      throw new Error(`Item de rotina ${input.id} não encontrado.`);
    }

    // Validate parent routine is DRAFT (BR-005)
    const routineProps = await this.routineRepo.findById(input.tenantId, existing.routineId);
    if (!routineProps) {
      throw new Error(`Rotina ${existing.routineId} não encontrada.`);
    }
    const routine = new BehaviorRoutine(routineProps);
    routine.assertMutable();

    const updatedRecord = { ...existing, updatedAt: new Date() };

    if (input.itemType !== undefined) updatedRecord.itemType = input.itemType;
    if (input.action !== undefined) updatedRecord.action = input.action;
    if (input.targetFieldId !== undefined) updatedRecord.targetFieldId = input.targetFieldId;
    if (input.value !== undefined) updatedRecord.value = input.value;
    if (input.conditionExpr !== undefined) updatedRecord.conditionExpr = input.conditionExpr;
    if (input.validationMessage !== undefined)
      updatedRecord.validationMessage = input.validationMessage;
    if (input.isBlocking !== undefined) updatedRecord.isBlocking = input.isBlocking;
    if (input.ordem !== undefined) updatedRecord.ordem = input.ordem;

    const updated = await this.uow.transaction(async (tx) => {
      return this.itemRepo.update(updatedRecord, tx);
    });

    return {
      id: updated.id,
      itemType: updated.itemType,
      action: updated.action,
      ordem: updated.ordem,
    };
  }
}
