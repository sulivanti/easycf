/**
 * @contract FR-007, BR-005, BR-009, DATA-003
 *
 * Use Case: Create Role
 * Creates a role with validated scopes (BR-005 format).
 */

import { Role } from '../../../domain/entities/role.entity.js';
import { Scope } from '../../../domain/value-objects/scope.vo.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  RoleRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { HashUtilService } from '../../ports/services.js';

export interface CreateRoleInput {
  readonly name: string;
  readonly description?: string;
  readonly scopes: readonly string[];
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateRoleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly name: string;
  readonly scopes: readonly string[];
}

export class CreateRoleUseCase {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateRoleInput): Promise<CreateRoleOutput> {
    // Validate scopes via VO (BR-005)
    const scopeVOs = input.scopes.map((s) => Scope.create(s));

    const id = this.hashUtil.generateUuid();
    const codigo = input.name.toLowerCase().replace(/\s+/g, '-');

    const role = Role.create({
      id,
      codigo,
      name: input.name,
      description: input.description ?? null,
      status: 'ACTIVE',
      scopes: scopeVOs,
    });

    await this.uow.transaction(async (tx) => {
      await this.roleRepo.create(role.toProps(), tx);
      await this.roleRepo.replaceScopes(id, role.scopeValues, tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'role',
          entityId: id,
          eventType: 'role.created',
          payload: { codigo, scopes_count: scopeVOs.length },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    return {
      id,
      codigo,
      name: input.name,
      scopes: role.scopeValues,
    };
  }
}
