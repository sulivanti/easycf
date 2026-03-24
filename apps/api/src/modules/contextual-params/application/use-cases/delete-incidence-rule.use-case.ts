/**
 * @contract FR-004, SEC-007 §8
 *
 * Use Case: Inactivate an incidence rule (set status=INACTIVE).
 * Uses status flip instead of soft-delete (SEC-007 §8).
 */

import type { IncidenceRuleRepository, UnitOfWork } from '../ports/repositories.js';

export interface DeleteIncidenceRuleInput {
  readonly id: string;
  readonly tenantId: string;
}

export class DeleteIncidenceRuleUseCase {
  constructor(
    private readonly incidenceRuleRepo: IncidenceRuleRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteIncidenceRuleInput): Promise<void> {
    const existing = await this.incidenceRuleRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Regra de incidência ${input.id} não encontrada.`);
    }

    await this.uow.transaction(async (tx) => {
      await this.incidenceRuleRepo.update(
        { ...existing, status: 'INACTIVE', updatedAt: new Date() },
        tx,
      );
    });
  }
}
