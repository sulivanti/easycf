/**
 * @contract FR-003, BR-006, BR-007, BR-012, DATA-003
 *
 * Use Case: Link Tenant (N5) to Organizational Unit (N4)
 * - Only N4 nodes can link tenants (BR-006)
 * - Tenant must exist in MOD-000 (BR-007)
 * - Duplicate link returns 409
 * - Idempotency-Key support (BR-012)
 */

import { OrgUnit } from '../../domain/entities/org-unit.entity.js';
import { OrgUnitTenantLink } from '../../domain/entities/org-unit-tenant-link.entity.js';
import { TenantLinkLevelError } from '../../domain/errors/org-unit-errors.js';
import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import {
  EntityNotFoundError,
  DomainValidationError,
} from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository, OrgUnitTenantLinkRepository } from '../ports/repositories.js';
import type {
  TenantRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface LinkTenantInput {
  readonly orgUnitId: string;
  readonly tenantId: string;
  readonly createdBy: string | null;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface LinkTenantOutput {
  readonly id: string;
  readonly orgUnitId: string;
  readonly tenantId: string;
  readonly tenantCodigo: string;
}

export class LinkTenantUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly linkRepo: OrgUnitTenantLinkRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(input: LinkTenantInput): Promise<LinkTenantOutput> {
    // BR-012: Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<LinkTenantOutput>(input.idempotencyKey);
      if (cached) return cached.value;
    }

    // Validate org unit exists
    const orgUnitProps = await this.orgUnitRepo.findById(input.orgUnitId);
    if (!orgUnitProps) {
      throw new EntityNotFoundError('OrgUnit', input.orgUnitId);
    }

    // BR-006: Only N4 nodes can link tenants
    const orgUnit = OrgUnit.fromPersistence(orgUnitProps);
    if (!orgUnit.canLinkTenant) {
      throw new TenantLinkLevelError();
    }

    // BR-007: Tenant must exist in MOD-000
    const tenant = await this.tenantRepo.findById(input.tenantId);
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantId);
    }

    // Check for duplicate link
    const existingLink = await this.linkRepo.findByPair(input.orgUnitId, input.tenantId);
    if (existingLink) {
      throw new DomainValidationError(
        `Vínculo entre org unit '${orgUnit.codigo}' e tenant '${tenant.codigo}' já existe.`,
      );
    }

    const linkId = this.hashUtil.generateUuid();

    const link = OrgUnitTenantLink.create({
      id: linkId,
      orgUnitId: input.orgUnitId,
      tenantId: input.tenantId,
      createdBy: input.createdBy,
    });

    await this.uow.transaction(async (tx) => {
      await this.linkRepo.create(link.toProps(), tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit_tenant_link',
          entityId: linkId,
          eventType: 'org.tenant_linked',
          payload: {
            org_unit_id: input.orgUnitId,
            tenant_id: input.tenantId,
            tenant_codigo: tenant.codigo,
            created_by: input.createdBy,
          },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    const output: LinkTenantOutput = {
      id: linkId,
      orgUnitId: input.orgUnitId,
      tenantId: input.tenantId,
      tenantCodigo: tenant.codigo,
    };

    // BR-012: Store idempotency result
    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
