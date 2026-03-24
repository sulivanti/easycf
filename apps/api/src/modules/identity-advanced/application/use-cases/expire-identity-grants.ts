/**
 * @contract FR-001.4, DATA-003
 *
 * Use Case: Expire Identity Grants (background job).
 * Batch-processes expired records across all 3 tables:
 *   - user_org_scopes → status=INACTIVE, deleted_at=now()
 *   - access_shares → status=EXPIRED
 *   - access_delegations → status=EXPIRED
 *
 * Emits domain events for each expired record via Outbox Pattern.
 * Idempotent: WHERE clause filters only status=ACTIVE.
 */

import { UserOrgScope } from '../../domain/aggregates/user-org-scope.js';
import { AccessShare } from '../../domain/aggregates/access-share.js';
import { AccessDelegation } from '../../domain/aggregates/access-delegation.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import type {
  OrgScopeRepository,
  AccessShareRepository,
  AccessDelegationRepository,
} from '../ports/repositories.js';
import type { RedisCachePort } from '../ports/services.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

const BATCH_SIZE = 100;
const SYSTEM_ACTOR = 'system:expire_identity_grants';

export interface ExpireIdentityGrantsOutput {
  readonly orgScopesExpired: number;
  readonly sharesExpired: number;
  readonly delegationsExpired: number;
}

export class ExpireIdentityGrantsUseCase {
  constructor(
    private readonly orgScopeRepo: OrgScopeRepository,
    private readonly shareRepo: AccessShareRepository,
    private readonly delegationRepo: AccessDelegationRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly cache: RedisCachePort,
  ) {}

  async execute(): Promise<ExpireIdentityGrantsOutput> {
    const now = new Date();
    const correlationId = crypto.randomUUID();

    const orgScopesExpired = await this.expireOrgScopes(now, correlationId);
    const sharesExpired = await this.expireShares(now, correlationId);
    const delegationsExpired = await this.expireDelegations(now, correlationId);

    return { orgScopesExpired, sharesExpired, delegationsExpired };
  }

  private async expireOrgScopes(now: Date, correlationId: string): Promise<number> {
    const expired = await this.orgScopeRepo.findExpired(now, BATCH_SIZE);
    if (expired.length === 0) return 0;

    const userIdsToInvalidate = new Set<string>();

    await this.uow.transaction(async (tx) => {
      const events: DomainEventBase[] = [];

      for (const props of expired) {
        const scope = new UserOrgScope(props);
        if (!scope.isActive()) continue;

        const expiredProps = scope.expire(now);
        await this.orgScopeRepo.update(expiredProps, tx);
        userIdsToInvalidate.add(props.userId);

        events.push(
          createIdentityEvent({
            tenantId: props.tenantId,
            entityType: 'user_org_scopes',
            entityId: props.id,
            eventType: 'identity.org_scope_expired',
            payload: {
              user_id: props.userId,
              org_unit_id: props.orgUnitId,
              scope_type: props.scopeType,
              valid_until: props.validUntil?.toISOString() ?? null,
            },
            correlationId,
            createdBy: SYSTEM_ACTOR,
          }),
        );
      }

      if (events.length > 0) {
        await this.eventRepo.createMany(events, tx);
      }
    });

    // Cache invalidation — best-effort, outside transaction
    for (const userId of userIdsToInvalidate) {
      await this.cache.invalidateOrgScopeCache(userId);
    }

    return expired.length;
  }

  private async expireShares(now: Date, correlationId: string): Promise<number> {
    const expired = await this.shareRepo.findExpired(now, BATCH_SIZE);
    if (expired.length === 0) return 0;

    await this.uow.transaction(async (tx) => {
      const events: DomainEventBase[] = [];

      for (const props of expired) {
        const share = new AccessShare(props);
        if (!share.isActive()) continue;

        const expiredProps = share.expire(now);
        await this.shareRepo.update(expiredProps, tx);

        events.push(
          createIdentityEvent({
            tenantId: props.tenantId,
            entityType: 'access_shares',
            entityId: props.id,
            eventType: 'identity.share_expired',
            payload: {
              grantor_id: props.grantorId,
              grantee_id: props.granteeId,
              resource_type: props.resourceType,
              resource_id: props.resourceId,
              valid_until: props.validUntil.toISOString(),
            },
            correlationId,
            createdBy: SYSTEM_ACTOR,
          }),
        );
      }

      if (events.length > 0) {
        await this.eventRepo.createMany(events, tx);
      }
    });

    return expired.length;
  }

  private async expireDelegations(now: Date, correlationId: string): Promise<number> {
    const expired = await this.delegationRepo.findExpired(now, BATCH_SIZE);
    if (expired.length === 0) return 0;

    await this.uow.transaction(async (tx) => {
      const events: DomainEventBase[] = [];

      for (const props of expired) {
        const delegation = new AccessDelegation(props);
        if (!delegation.isActive()) continue;

        const expiredProps = delegation.expire(now);
        await this.delegationRepo.update(expiredProps, tx);

        events.push(
          createIdentityEvent({
            tenantId: props.tenantId,
            entityType: 'access_delegations',
            entityId: props.id,
            eventType: 'identity.delegation_expired',
            payload: {
              delegator_id: props.delegatorId,
              delegatee_id: props.delegateeId,
              valid_until: props.validUntil.toISOString(),
            },
            correlationId,
            createdBy: SYSTEM_ACTOR,
          }),
        );
      }

      if (events.length > 0) {
        await this.eventRepo.createMany(events, tx);
      }
    });

    return expired.length;
  }
}
