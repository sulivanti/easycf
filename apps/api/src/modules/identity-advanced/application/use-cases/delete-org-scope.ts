/**
 * @contract FR-001.1, DATA-003
 *
 * Use Case: Delete (soft) Organizational Scope.
 * Sets status=INACTIVE, deleted_at=now(), invalidates cache, emits domain event.
 */

import { UserOrgScope } from '../../domain/aggregates/user-org-scope.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgScopeRepository } from '../ports/repositories.js';
import type { RedisCachePort } from '../ports/services.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface DeleteOrgScopeInput {
  readonly tenantId: string;
  readonly scopeId: string;
  readonly correlationId: string;
  readonly deletedBy: string | null;
}

export class DeleteOrgScopeUseCase {
  constructor(
    private readonly orgScopeRepo: OrgScopeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly cache: RedisCachePort,
  ) {}

  async execute(input: DeleteOrgScopeInput): Promise<void> {
    const existing = await this.orgScopeRepo.findById(input.scopeId);
    if (!existing) {
      throw new EntityNotFoundError('UserOrgScope', input.scopeId);
    }

    const scope = new UserOrgScope(existing);

    // Already inactive — idempotent
    if (!scope.isActive()) return;

    const now = new Date();
    const revokedProps = scope.revoke(now);

    await this.uow.transaction(async (tx) => {
      await this.orgScopeRepo.update(revokedProps, tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'user_org_scopes',
          entityId: input.scopeId,
          eventType: 'identity.org_scope_revoked',
          payload: {
            user_id: existing.userId,
            org_unit_id: existing.orgUnitId,
            scope_type: existing.scopeType,
            revoked_by: input.deletedBy,
          },
          correlationId: input.correlationId,
          createdBy: input.deletedBy,
        }),
        tx,
      );
    });

    // Cache invalidation — outside transaction (best-effort)
    await this.cache.invalidateOrgScopeCache(existing.userId);
  }
}
