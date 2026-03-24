/**
 * @contract FR-002, SEC-007 §8, DATA-007 E-002
 *
 * Use Case: Soft-delete a context framer (set INACTIVE + deleted_at).
 */

import type { FramerRepository, UnitOfWork } from '../ports/repositories.js';

export interface DeleteFramerInput {
  readonly id: string;
  readonly tenantId: string;
}

export class DeleteFramerUseCase {
  constructor(
    private readonly framerRepo: FramerRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteFramerInput): Promise<void> {
    const existing = await this.framerRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Enquadrador ${input.id} não encontrado.`);
    }

    await this.uow.transaction(async (tx) => {
      await this.framerRepo.softDelete(input.tenantId, input.id, tx);
    });
  }
}
