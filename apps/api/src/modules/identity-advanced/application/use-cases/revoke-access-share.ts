/**
 * @contract FR-001.2, DATA-003
 *
 * Use Case: Revoke Access Share.
 * Sets status=REVOKED, revoked_at/revoked_by filled, emits domain event.
 */

import { AccessShare } from '../../domain/aggregates/access-share.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { AccessShareRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface RevokeAccessShareInput {
  readonly tenantId: string;
  readonly shareId: string;
  readonly revokedBy: string;
  readonly correlationId: string;
}

export class RevokeAccessShareUseCase {
  constructor(
    private readonly shareRepo: AccessShareRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RevokeAccessShareInput): Promise<void> {
    const existing = await this.shareRepo.findById(input.shareId);
    if (!existing) {
      throw new EntityNotFoundError('AccessShare', input.shareId);
    }

    const share = new AccessShare(existing);

    // Already not active — idempotent
    if (!share.isActive()) return;

    const now = new Date();
    const revokedProps = share.revoke(input.revokedBy, now);

    await this.uow.transaction(async (tx) => {
      await this.shareRepo.update(revokedProps, tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'access_shares',
          entityId: input.shareId,
          eventType: 'identity.share_revoked',
          payload: {
            grantor_id: existing.grantorId,
            grantee_id: existing.granteeId,
            resource_type: existing.resourceType,
            resource_id: existing.resourceId,
            revoked_by: input.revokedBy,
          },
          correlationId: input.correlationId,
          createdBy: input.revokedBy,
        }),
        tx,
      );
    });
  }
}
