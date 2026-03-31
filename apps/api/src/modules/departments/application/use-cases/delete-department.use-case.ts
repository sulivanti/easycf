/**
 * @contract FR-007, BR-015, DATA-002
 *
 * Use Case: Soft Delete Department
 * - Sets status=INACTIVE + deleted_at (BR-015)
 * - No child dependencies (flat entity)
 */

import { Department } from '../../domain/entities/department.entity.js';
import { createDepartmentEvent } from '../../domain/events/department-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { DepartmentRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface DeleteDepartmentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string | null;
  readonly correlationId: string;
}

export class DeleteDepartmentUseCase {
  constructor(
    private readonly deptRepo: DepartmentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteDepartmentInput): Promise<void> {
    const existing = await this.deptRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new EntityNotFoundError('Department', input.id);
    }

    const department = Department.fromProps(existing);

    // BR-015: soft delete (throws if already inactive)
    const deleted = department.softDelete();

    await this.uow.transaction(async (tx) => {
      await this.deptRepo.update(deleted.toProps(), tx);

      await this.eventRepo.create(
        createDepartmentEvent({
          tenantId: input.tenantId,
          entityId: input.id,
          eventType: 'org.dept_deleted',
          payload: {
            id: input.id,
            codigo: deleted.codigo,
            tenant_id: input.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.deletedBy,
        }),
        tx,
      );
    });
  }
}
