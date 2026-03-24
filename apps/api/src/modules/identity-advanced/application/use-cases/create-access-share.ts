/**
 * @contract FR-001.2, BR-001.7, BR-001.8, BR-001.9, BR-001.10, BR-001.12, DATA-003, SEC-001
 *
 * Use Case: Create Access Share (controlled resource sharing).
 * - reason required (BR-001.9)
 * - valid_until required and in the future (BR-001.8, BR-001.10)
 * - auto-authorization requires identity:share:authorize scope (BR-001.7)
 * - grantee must exist in same tenant (BR-001.12)
 * - Idempotency-Key support (FR-001.2)
 * - Domain event via Outbox (DATA-003)
 */

import { AccessShare } from '../../domain/aggregates/access-share.js';
import type { CreateShareInput, ResourceType } from '../../domain/aggregates/access-share.js';
import { validateShareAuthorization } from '../../domain/value-objects/share-authorization.vo.js';
import { TargetUserNotFoundError } from '../../domain/errors/identity-errors.js';
import { createIdentityEvent } from '../../domain/domain-events/identity-events.js';
import type { AccessShareRepository } from '../ports/repositories.js';
import type { UserLookupPort } from '../ports/services.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface CreateAccessShareUseCaseInput {
  readonly tenantId: string;
  readonly grantorId: string;
  readonly granteeId: string;
  readonly resourceType: ResourceType;
  readonly resourceId: string;
  readonly allowedActions: string[];
  readonly reason: string;
  readonly authorizedBy: string;
  readonly validUntil: Date;
  readonly callerScopes: string[];
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface CreateAccessShareUseCaseOutput {
  readonly id: string;
  readonly grantorId: string;
  readonly granteeId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly status: string;
  readonly validFrom: string;
  readonly validUntil: string;
}

export class CreateAccessShareUseCase {
  constructor(
    private readonly shareRepo: AccessShareRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
    private readonly userLookup: UserLookupPort,
  ) {}

  async execute(input: CreateAccessShareUseCaseInput): Promise<CreateAccessShareUseCaseOutput> {
    // Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<CreateAccessShareUseCaseOutput>(
        input.idempotencyKey,
      );
      if (cached) return cached.value;
    }

    // BR-001.7 — auto-authorization validation
    validateShareAuthorization(input.grantorId, input.authorizedBy, input.callerScopes);

    // BR-001.12 — grantee must exist in same tenant
    const granteeExists = await this.userLookup.userExistsInTenant(input.granteeId, input.tenantId);
    if (!granteeExists) {
      throw new TargetUserNotFoundError();
    }

    const now = new Date();

    // BR-001.8, BR-001.9, BR-001.10 — domain validation
    const createInput: CreateShareInput = {
      tenantId: input.tenantId,
      grantorId: input.grantorId,
      granteeId: input.granteeId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      allowedActions: input.allowedActions,
      reason: input.reason,
      authorizedBy: input.authorizedBy,
      validUntil: input.validUntil,
    };
    AccessShare.validateCreation(createInput, now);

    const id = this.hashUtil.generateUuid();
    const validFrom = now;

    const share = new AccessShare({
      id,
      tenantId: input.tenantId,
      grantorId: input.grantorId,
      granteeId: input.granteeId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      allowedActions: input.allowedActions,
      reason: input.reason,
      authorizedBy: input.authorizedBy,
      validFrom,
      validUntil: input.validUntil,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revokedBy: null,
    });

    await this.uow.transaction(async (tx) => {
      await this.shareRepo.create(share.toProps(), tx);

      await this.eventRepo.create(
        createIdentityEvent({
          tenantId: input.tenantId,
          entityType: 'access_shares',
          entityId: id,
          eventType: 'identity.share_created',
          payload: {
            grantor_id: input.grantorId,
            grantee_id: input.granteeId,
            resource_type: input.resourceType,
            resource_id: input.resourceId,
            reason: input.reason,
            authorized_by: input.authorizedBy,
            valid_until: input.validUntil.toISOString(),
          },
          correlationId: input.correlationId,
          createdBy: input.grantorId,
        }),
        tx,
      );
    });

    const output: CreateAccessShareUseCaseOutput = {
      id,
      grantorId: input.grantorId,
      granteeId: input.granteeId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      status: 'ACTIVE',
      validFrom: validFrom.toISOString(),
      validUntil: input.validUntil.toISOString(),
    };

    // Store idempotency result
    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
