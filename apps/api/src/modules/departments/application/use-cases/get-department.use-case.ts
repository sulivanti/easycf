/**
 * @contract FR-007
 *
 * Use Case: Get Department Detail
 */

import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { DepartmentRepository } from '../ports/repositories.js';

export interface GetDepartmentInput {
  readonly id: string;
  readonly tenantId: string;
}

export interface GetDepartmentOutput {
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

export class GetDepartmentUseCase {
  constructor(private readonly deptRepo: DepartmentRepository) {}

  async execute(input: GetDepartmentInput): Promise<GetDepartmentOutput> {
    const dept = await this.deptRepo.findById(input.id, input.tenantId);
    if (!dept) {
      throw new EntityNotFoundError('Department', input.id);
    }

    return {
      id: dept.id,
      tenantId: dept.tenantId,
      codigo: dept.codigo,
      nome: dept.nome,
      descricao: dept.descricao,
      status: dept.status,
      cor: dept.cor,
      createdBy: dept.createdBy,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    };
  }
}
