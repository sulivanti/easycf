/**
 * @contract FR-007, BR-014, BR-017, DATA-002
 *
 * Use Case: Update Department (nome, descricao, cor)
 * - Codigo is immutable (BR-014)
 * - Cor must be valid hex (BR-017)
 */

import { Department } from '../../domain/entities/department.entity.js';
import { createDepartmentEvent } from '../../domain/events/department-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { DepartmentRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface UpdateDepartmentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly cor?: string | null;
  readonly codigo?: string; // Must be rejected (BR-014)
  readonly createdBy: string | null;
  readonly correlationId: string;
}

export interface UpdateDepartmentOutput {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly status: string;
  readonly cor: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class UpdateDepartmentUseCase {
  constructor(
    private readonly deptRepo: DepartmentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateDepartmentInput): Promise<UpdateDepartmentOutput> {
    const existing = await this.deptRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new EntityNotFoundError('Department', input.id);
    }

    const department = Department.fromProps(existing);

    // BR-014: codigo immutable (validated inside entity.update)
    const updated = department.update({
      nome: input.nome,
      descricao: input.descricao,
      cor: input.cor,
      codigo: input.codigo,
    });

    await this.uow.transaction(async (tx) => {
      await this.deptRepo.update(updated.toProps(), tx);

      await this.eventRepo.create(
        createDepartmentEvent({
          tenantId: input.tenantId,
          entityId: input.id,
          eventType: 'org.dept_updated',
          payload: {
            id: input.id,
            codigo: updated.codigo,
            ...(input.nome !== undefined ? { nome: input.nome } : {}),
            ...(input.descricao !== undefined ? { descricao: input.descricao } : {}),
            ...(input.cor !== undefined ? { cor: input.cor } : {}),
          },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      codigo: updated.codigo,
      nome: updated.nome,
      descricao: updated.descricao,
      status: updated.status,
      cor: updated.cor,
      createdBy: updated.createdBy,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
