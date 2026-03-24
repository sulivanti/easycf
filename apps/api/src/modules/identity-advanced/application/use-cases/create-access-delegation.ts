/**
 * @contract FR-001.3, BR-001.4, BR-001.5, BR-001.6, BR-001.8, BR-001.9,
 *           BR-001.10, BR-001.12, DATA-003, SEC-001
 *
 * Use Case: Create Access Delegation (temporary scope transfer).
 * - delegated_scopes MUST NOT contain :approve/:execute/:sign (BR-001.4)
 * - delegator MUST own all delegated scopes (BR-001.5)
 * - no re-delegation (BR-001.6)
 * - valid_until required and in the future (BR-001.8, BR-001.10)
 * - reason required (BR-001.9)
 * - delegatee must exist in same tenant (BR-001.12)
 * - Idempotency-Key support (FR-001.3)
 * - Domain event via Outbox (DATA-003)
 */

import { AccessDelegation } from '../../domain/aggregates/access-delegation.js';
import type { CreateDelegationInput } from '../../domain/aggregates/access-delegation.js';
import { TargetUserNotFoundError } from '../../domain/errors/identity-errors.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import type { AccessDelegationRepository } from '../ports/repositories.js';
import type { UserLookupPort } from '../ports/services.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface CreateAccessDelegationUseCaseInput {
  readonly tenantId: string;
  readonly delegatorId: string;
  readonly delegateeId: string;
  readonly roleId?: string | null;
  readonly orgUnitId?: string | null;
  readonly delegatedScopes: string[];
  readonly reason: string;
  readonly validUntil: Date;
  /** Scopes the delegator owns natively (from JWT, excluding delegated). */
  readonly ownedScopes: string[];
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface CreateAccessDelegationUseCaseOutput {
  readonly id: string;
  readonly delegatorId: string;
  readonly delegateeId: string;
  readonly delegatedScopes: string[];
  readonly status: string;
  readonly validUntil: string;
}

export class CreateAccessDelegationUseCase {
  constructor(
    private readonly delegationRepo: AccessDelegationRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
    private readonly userLookup: UserLookupPort,
  ) {}

  async execute(
    input: CreateAccessDelegationUseCaseInput,
  ): Promise<CreateAccessDelegationUseCaseOutput> {
    // Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<CreateAccessDelegationUseCaseOutput>(
        input.idempotencyKey,
      );
      if (cached) return cached.value;
    }

    // BR-001.12 — delegatee must exist in same tenant
    const delegateeExists = await this.userLookup.userExistsInTenant(
      input.delegateeId,
      input.tenantId,
    );
    if (!delegateeExists) {
      throw new TargetUserNotFoundError();
    }

    // BR-001.6 — get scopes the delegator received via delegation (re-delegation check)
    const delegatedToUser = await this.delegationRepo.getActiveDelegatedScopes(
      input.tenantId,
      input.delegatorId,
    );

    const now = new Date();

    const createInput: CreateDelegationInput = {
      tenantId: input.tenantId,
      delegatorId: input.delegatorId,
      delegateeId: input.delegateeId,
      roleId: input.roleId,
      orgUnitId: input.orgUnitId,
      delegatedScopes: input.delegatedScopes,
      reason: input.reason,
      validUntil: input.validUntil,
    };

    // BR-001.4, BR-001.5, BR-001.6, BR-001.9, BR-001.10 — domain validation
    AccessDelegation.validateCreation(
      createInput,
      {
        ownedScopes: input.ownedScopes,
        delegatedToUser,
      },
      now,
    );

    const id = this.hashUtil.generateUuid();

    const delegation = new AccessDelegation({
      id,
      tenantId: input.tenantId,
      delegatorId: input.delegatorId,
      delegateeId: input.delegateeId,
      roleId: input.roleId ?? null,
      orgUnitId: input.orgUnitId ?? null,
      delegatedScopes: [...input.delegatedScopes],
      reason: input.reason,
      validUntil: input.validUntil,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
    });

    await this.uow.transaction(async (tx) => {
      await this.delegationRepo.create(delegation.toProps(), tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'access_delegations',
          entityId: id,
          eventType: 'identity.delegation_created',
          payload: {
            delegator_id: input.delegatorId,
            delegatee_id: input.delegateeId,
            valid_until: input.validUntil.toISOString(),
            reason: input.reason,
          },
          correlationId: input.correlationId,
          createdBy: input.delegatorId,
        }),
        tx,
      );
    });

    const output: CreateAccessDelegationUseCaseOutput = {
      id,
      delegatorId: input.delegatorId,
      delegateeId: input.delegateeId,
      delegatedScopes: input.delegatedScopes,
      status: 'ACTIVE',
      validUntil: input.validUntil.toISOString(),
    };

    // Store idempotency result
    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
