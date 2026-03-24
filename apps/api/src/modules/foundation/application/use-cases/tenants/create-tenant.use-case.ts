/**
 * @contract FR-008, BR-009, DATA-003
 *
 * Use Case: Create Tenant (filial)
 */

import { Tenant } from '../../../domain/entities/tenant.entity.js';
import { DomainValidationError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  TenantRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { HashUtilService } from '../../ports/services.js';

export interface CreateTenantInput {
  readonly codigo: string;
  readonly name: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateTenantOutput {
  readonly id: string;
  readonly codigo: string;
  readonly name: string;
  readonly status: string;
}

export class CreateTenantUseCase {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateTenantInput): Promise<CreateTenantOutput> {
    // Check uniqueness
    const existing = await this.tenantRepo.findByCodigo(input.codigo.toUpperCase());
    if (existing) {
      throw new DomainValidationError('Código de tenant já existe.');
    }

    const id = this.hashUtil.generateUuid();

    const tenant = Tenant.create({
      id,
      codigo: input.codigo,
      name: input.name,
      status: 'ACTIVE',
    });

    await this.uow.transaction(async (tx) => {
      await this.tenantRepo.create(tenant.toProps(), tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: id,
          entityType: 'tenant',
          entityId: id,
          eventType: 'tenant.created',
          payload: { codigo: tenant.codigo, name: tenant.name },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    return {
      id,
      codigo: tenant.codigo,
      name: tenant.name,
      status: tenant.status,
    };
  }
}
