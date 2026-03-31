/**
 * @contract FR-007, BR-016, DATA-002
 *
 * Use Case: Restore Department
 * - Sets status=ACTIVE + deleted_at=null (BR-016)
 * - No restrictions (flat entity, no parent dependency)
 */

import { Department } from '../../domain/entities/department.entity.js';
import { createDepartmentEvent } from '../../domain/events/department-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { DepartmentRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface RestoreDepartmentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly restoredBy: string | null;
  readonly correlationId: string;
}

export interface RestoreDepartmentOutput {
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

export class RestoreDepartmentUseCase {
  constructor(
    private readonly deptRepo: DepartmentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RestoreDepartmentInput): Promise<RestoreDepartmentOutput> {
    const existing = await this.deptRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new EntityNotFoundError('Department', input.id);
    }

    const department = Department.fromProps(existing);

    // BR-016: restore (throws if already active)
    const restored = department.restore();

    await this.uow.transaction(async (tx) => {
      await this.deptRepo.update(restored.toProps(), tx);

      await this.eventRepo.create(
        createDepartmentEvent({
          tenantId: input.tenantId,
          entityId: input.id,
          eventType: 'org.dept_restored',
          payload: {
            id: input.id,
            codigo: restored.codigo,
            tenant_id: input.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.restoredBy,
        }),
        tx,
      );
    });

    return {
      id: restored.id,
      tenantId: restored.tenantId,
      codigo: restored.codigo,
      nome: restored.nome,
      descricao: restored.descricao,
      status: restored.status,
      cor: restored.cor,
      createdBy: restored.createdBy,
      createdAt: restored.createdAt.toISOString(),
      updatedAt: restored.updatedAt.toISOString(),
    };
  }
}
