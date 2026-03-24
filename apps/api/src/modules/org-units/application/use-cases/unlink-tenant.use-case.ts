/**
 * @contract FR-003, DATA-003
 *
 * Use Case: Unlink Tenant (N5) from Organizational Unit (N4)
 * Soft unlink — sets deleted_at on the link record.
 */

import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository, OrgUnitTenantLinkRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface UnlinkTenantInput {
  readonly orgUnitId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly deletedBy: string | null;
}

export class UnlinkTenantUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly linkRepo: OrgUnitTenantLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UnlinkTenantInput): Promise<void> {
    // Validate org unit exists
    const orgUnit = await this.orgUnitRepo.findById(input.orgUnitId);
    if (!orgUnit) {
      throw new EntityNotFoundError('OrgUnit', input.orgUnitId);
    }

    // Find active link
    const link = await this.linkRepo.findByPair(input.orgUnitId, input.tenantId);
    if (!link) {
      throw new EntityNotFoundError('OrgUnitTenantLink', `${input.orgUnitId}:${input.tenantId}`);
    }

    // Already unlinked — idempotent
    if (link.deletedAt !== null) return;

    await this.uow.transaction(async (tx) => {
      await this.linkRepo.softDelete(link.id, tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit_tenant_link',
          entityId: link.id,
          eventType: 'org.tenant_unlinked',
          payload: {
            org_unit_id: input.orgUnitId,
            tenant_id: input.tenantId,
            deleted_by: input.deletedBy,
          },
          correlationId: input.correlationId,
          createdBy: input.deletedBy,
        }),
        tx,
      );
    });
  }
}
