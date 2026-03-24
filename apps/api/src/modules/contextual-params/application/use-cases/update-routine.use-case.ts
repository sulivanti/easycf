/**
 * @contract FR-005, BR-001, BR-005, DATA-007 E-006
 *
 * Use Case: Update a behavior routine (only DRAFT — BR-005).
 * BR-001: codigo is immutable.
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import { CodigoImmutableError } from '../../domain/errors/param-errors.js';
import type { RoutineRepository, UnitOfWork } from '../ports/repositories.js';

export interface UpdateRoutineInput {
  readonly id: string;
  readonly nome?: string;
  readonly codigo?: string;
  readonly tenantId: string;
}

export interface UpdateRoutineOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly status: string;
}

export class UpdateRoutineUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateRoutineInput): Promise<UpdateRoutineOutput> {
    const existing = await this.routineRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Rotina ${input.id} não encontrada.`);
    }

    const routine = new BehaviorRoutine(existing);

    // BR-005: only DRAFT can be modified
    routine.assertMutable();

    // BR-001: reject if codigo is being changed
    if (input.codigo !== undefined && input.codigo !== existing.codigo) {
      throw new CodigoImmutableError('behavior_routine', existing.id);
    }

    const updatedProps = { ...existing, updatedAt: new Date() };

    if (input.nome !== undefined) {
      updatedProps.nome = input.nome;
    }

    const updated = await this.uow.transaction(async (tx) => {
      return this.routineRepo.update(updatedProps, tx);
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nome: updated.nome,
      status: updated.status,
    };
  }
}
