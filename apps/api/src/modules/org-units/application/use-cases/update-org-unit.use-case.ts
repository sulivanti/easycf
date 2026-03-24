/**
 * @contract FR-001, BR-003, BR-010, DATA-003
 *
 * Use Case: Update Organizational Unit
 * Mutable fields: nome, descricao.
 * Immutable fields: codigo (BR-003), parent_id (BR-010).
 */

import { OrgUnit } from '../../domain/entities/org-unit.entity.js';
import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface UpdateOrgUnitInput {
  readonly id: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly codigo?: string;
  readonly parentId?: string;
  readonly correlationId: string;
  readonly updatedBy: string | null;
}

export interface UpdateOrgUnitOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly nivel: number;
  readonly status: string;
}

export class UpdateOrgUnitUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateOrgUnitInput): Promise<UpdateOrgUnitOutput> {
    const existing = await this.orgUnitRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('OrgUnit', input.id);
    }

    const entity = OrgUnit.fromPersistence(existing);

    // BR-003, BR-010: entity.update() will throw ImmutableFieldError if codigo/parentId changed
    const updated = entity.update({
      nome: input.nome,
      descricao: input.descricao,
      codigo: input.codigo,
      parentId: input.parentId,
    });

    await this.uow.transaction(async (tx) => {
      await this.orgUnitRepo.update(updated.toProps(), tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit',
          entityId: input.id,
          eventType: 'org.unit_updated',
          payload: {
            id: input.id,
            codigo: updated.codigo,
            ...(input.nome !== undefined ? { nome: updated.nome } : {}),
            ...(input.descricao !== undefined ? { descricao: updated.descricao } : {}),
          },
          correlationId: input.correlationId,
          createdBy: input.updatedBy,
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nome: updated.nome,
      descricao: updated.descricao,
      nivel: updated.nivel,
      status: updated.status,
    };
  }
}
