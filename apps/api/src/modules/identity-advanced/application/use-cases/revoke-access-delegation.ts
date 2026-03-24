/**
 * @contract FR-001.3, DATA-003
 *
 * Use Case: Revoke Access Delegation.
 * Only the delegator can revoke. Sets status=REVOKED, emits domain event.
 */

import { AccessDelegation } from '../../domain/aggregates/access-delegation.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import { InsufficientScopeError } from '../../../foundation/domain/errors/domain-errors.js';
import type { AccessDelegationRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface RevokeAccessDelegationInput {
  readonly tenantId: string;
  readonly delegationId: string;
  /** The caller (must be the delegator) */
  readonly callerId: string;
  readonly correlationId: string;
}

export class RevokeAccessDelegationUseCase {
  constructor(
    private readonly delegationRepo: AccessDelegationRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RevokeAccessDelegationInput): Promise<void> {
    const existing = await this.delegationRepo.findById(input.delegationId);
    if (!existing) {
      throw new EntityNotFoundError('AccessDelegation', input.delegationId);
    }

    // Only the delegator can revoke
    if (existing.delegatorId !== input.callerId) {
      throw new InsufficientScopeError('Apenas o delegador pode revogar a delegação.');
    }

    const delegation = new AccessDelegation(existing);

    // Already not active — idempotent
    if (!delegation.isActive()) return;

    const now = new Date();
    const revokedProps = delegation.revoke(now);

    await this.uow.transaction(async (tx) => {
      await this.delegationRepo.update(revokedProps, tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'access_delegations',
          entityId: input.delegationId,
          eventType: 'identity.delegation_revoked',
          payload: {
            delegator_id: existing.delegatorId,
            delegatee_id: existing.delegateeId,
          },
          correlationId: input.correlationId,
          createdBy: input.callerId,
        }),
        tx,
      );
    });
  }
}
