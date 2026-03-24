/**
 * @contract FR-009, BR-007, DATA-003
 *
 * Use Case: Add Tenant User (link user to tenant with role)
 */

import { TenantUser } from '../../../domain/entities/tenant-user.entity.js';
import {
  DomainValidationError,
  EntityNotFoundError,
} from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  TenantRepository,
  RoleRepository,
  TenantUserRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';

export interface AddTenantUserInput {
  readonly userId: string;
  readonly tenantId: string;
  readonly roleId: string;
  readonly addedBy: string;
  readonly correlationId: string;
}

export class AddTenantUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly roleRepo: RoleRepository,
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: AddTenantUserInput): Promise<void> {
    // Validate references exist
    const [user, tenant, role] = await Promise.all([
      this.userRepo.findById(input.userId),
      this.tenantRepo.findById(input.tenantId),
      this.roleRepo.findById(input.roleId),
    ]);

    if (!user) throw new EntityNotFoundError('User', input.userId);
    if (!tenant) throw new EntityNotFoundError('Tenant', input.tenantId);
    if (!role) throw new EntityNotFoundError('Role', input.roleId);

    // Check for existing binding
    const existing = await this.tenantUserRepo.findByKey(input.userId, input.tenantId);
    if (existing) {
      throw new DomainValidationError('Usuário já vinculado a este tenant.');
    }

    const tenantUser = TenantUser.create(input.userId, input.tenantId, input.roleId);

    await this.uow.transaction(async (tx) => {
      await this.tenantUserRepo.create(tenantUser.toProps(), tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: input.tenantId,
          entityType: 'tenant_user',
          entityId: `${input.userId}:${input.tenantId}`,
          eventType: 'tenant_user.added',
          payload: {
            user_id: input.userId,
            tenant_id: input.tenantId,
            role_id: input.roleId,
          },
          correlationId: input.correlationId,
          createdBy: input.addedBy,
        }),
        tx,
      );
    });
  }
}
