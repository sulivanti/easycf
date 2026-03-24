/**
 * @contract FR-006, BR-005, DATA-007 E-007
 *
 * Use Case: Delete a routine item (only if parent routine is DRAFT).
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import type {
  RoutineRepository,
  RoutineItemRepository,
  UnitOfWork,
} from '../ports/repositories.js';

export interface DeleteRoutineItemInput {
  readonly id: string;
  readonly tenantId: string;
}

export class DeleteRoutineItemUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteRoutineItemInput): Promise<void> {
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

    await this.uow.transaction(async (tx) => {
      await this.itemRepo.delete(input.id, tx);
    });
  }
}
