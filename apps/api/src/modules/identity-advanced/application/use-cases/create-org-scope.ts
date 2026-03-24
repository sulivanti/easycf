/**
 * @contract FR-001.1, BR-001.1, BR-001.2, BR-001.3, BR-001.10, BR-001.11, DATA-003, SEC-001
 *
 * Use Case: Create Organizational Scope (user ↔ org unit binding).
 * - Maximum 1 PRIMARY per user (BR-001.2)
 * - Only N1–N4 nodes allowed (BR-001.3)
 * - valid_until must be in the future (BR-001.10)
 * - org_unit must exist and be ACTIVE (BR-001.11)
 * - Idempotency-Key support (FR-001.1)
 * - Redis cache invalidation (INT-001.1)
 * - Domain event via Outbox (DATA-003)
 */

import { UserOrgScope } from '../../domain/aggregates/user-org-scope.js';
import type { CreateOrgScopeInput } from '../../domain/aggregates/user-org-scope.js';
import type { ScopeType } from '../../domain/value-objects/scope-type.vo.js';
import {
  OrgUnitNotN1N4Error,
  OrgUnitNotActiveError,
  DuplicateOrgScopeError,
} from '../../domain/errors/identity-errors.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import type { OrgScopeRepository } from '../ports/repositories.js';
import type { RedisCachePort, UserLookupPort } from '../ports/services.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface CreateOrgScopeUseCaseInput {
  readonly tenantId: string;
  readonly userId: string;
  readonly orgUnitId: string;
  readonly scopeType: ScopeType;
  readonly grantedBy: string | null;
  readonly validUntil: Date | null;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface CreateOrgScopeUseCaseOutput {
  readonly id: string;
  readonly userId: string;
  readonly orgUnitId: string;
  readonly scopeType: ScopeType;
  readonly status: string;
  readonly validFrom: string;
  readonly validUntil: string | null;
}

export class CreateOrgScopeUseCase {
  constructor(
    private readonly orgScopeRepo: OrgScopeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
    private readonly cache: RedisCachePort,
    private readonly userLookup: UserLookupPort,
  ) {}

  async execute(input: CreateOrgScopeUseCaseInput): Promise<CreateOrgScopeUseCaseOutput> {
    // Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<CreateOrgScopeUseCaseOutput>(
        input.idempotencyKey,
      );
      if (cached) return cached.value;
    }

    // BR-001.11 — org_unit must exist and be ACTIVE
    const orgUnit = await this.userLookup.getOrgUnitInfo(input.orgUnitId);
    if (!orgUnit || orgUnit.status !== 'ACTIVE') {
      throw new OrgUnitNotActiveError(input.orgUnitId);
    }

    // BR-001.3 — only N1–N4 nodes allowed
    if (orgUnit.nivel < 1 || orgUnit.nivel > 4) {
      throw new OrgUnitNotN1N4Error(input.orgUnitId);
    }

    // BR-001.12 — user must exist in same tenant
    const userExists = await this.userLookup.userExistsInTenant(input.userId, input.tenantId);
    if (!userExists) {
      const { TargetUserNotFoundError } = await import('../../domain/errors/identity-errors.js');
      throw new TargetUserNotFoundError();
    }

    // Check duplicate user+orgUnit
    const existing = await this.orgScopeRepo.findByUserAndOrgUnit(input.userId, input.orgUnitId);
    if (existing && existing.status === 'ACTIVE') {
      throw new DuplicateOrgScopeError(input.userId, input.orgUnitId);
    }

    // BR-001.10 — valid_until must be in the future
    const now = new Date();
    UserOrgScope.validateValidUntil(input.validUntil, now);

    // BR-001.2 — max 1 PRIMARY
    const primaryCount = await this.orgScopeRepo.countActivePrimary(input.userId);
    UserOrgScope.validatePrimaryUniqueness(primaryCount, input.scopeType, input.userId);

    const id = this.hashUtil.generateUuid();
    const validFrom = now;

    const createInput: CreateOrgScopeInput = {
      tenantId: input.tenantId,
      userId: input.userId,
      orgUnitId: input.orgUnitId,
      scopeType: input.scopeType,
      grantedBy: input.grantedBy,
      validUntil: input.validUntil,
    };

    const scope = new UserOrgScope({
      id,
      ...createInput,
      validFrom,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    await this.uow.transaction(async (tx) => {
      await this.orgScopeRepo.create(scope.toProps(), tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'user_org_scopes',
          entityId: id,
          eventType: 'identity.org_scope_granted',
          payload: {
            user_id: input.userId,
            org_unit_id: input.orgUnitId,
            scope_type: input.scopeType,
            status: 'ACTIVE',
            granted_by: input.grantedBy,
          },
          correlationId: input.correlationId,
          createdBy: input.grantedBy,
        }),
        tx,
      );
    });

    // Cache invalidation (INT-001.1) — outside transaction (best-effort)
    await this.cache.invalidateOrgScopeCache(input.userId);

    const output: CreateOrgScopeUseCaseOutput = {
      id,
      userId: input.userId,
      orgUnitId: input.orgUnitId,
      scopeType: input.scopeType,
      status: 'ACTIVE',
      validFrom: validFrom.toISOString(),
      validUntil: input.validUntil?.toISOString() ?? null,
    };

    // Store idempotency result
    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
