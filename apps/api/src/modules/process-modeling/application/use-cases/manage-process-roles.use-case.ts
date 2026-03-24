/**
 * @contract FR-008, BR-006, BR-009, DATA-003, SEC-005
 *
 * Use Cases: Create, Update, Delete Process Roles (global catalog).
 * - Process role != RBAC role (BR-009)
 * - codigo immutable after creation (BR-006)
 * - Delete blocked if has active stage_role_links (DATA-005 §2.8)
 */

import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { ProcessRoleRepository, ProcessRoleProps } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Create ────────────────────────────────────────────────────────────

export interface CreateProcessRoleInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly canApprove?: boolean;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface ProcessRoleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly canApprove: boolean;
}

export class CreateProcessRoleUseCase {
  constructor(
    private readonly roleRepo: ProcessRoleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateProcessRoleInput): Promise<ProcessRoleOutput> {
    // Check for duplicate codigo within tenant
    const existing = await this.roleRepo.findByCodigo(
      input.tenantId,
      input.codigo.trim().toUpperCase(),
    );
    if (existing) {
      throw new Error(
        `Papel de processo com código "${input.codigo.trim().toUpperCase()}" já existe neste tenant.`,
      );
    }

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const props: ProcessRoleProps = {
      id,
      tenantId: input.tenantId,
      codigo: input.codigo.trim().toUpperCase(),
      nome: input.nome.trim(),
      descricao: input.descricao ?? null,
      canApprove: input.canApprove ?? false,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.roleRepo.create(props, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_ROLE_LINKED,
          entityType: 'process_role',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: { id, codigo: props.codigo, nome: props.nome, can_approve: props.canApprove },
        }),
        tx,
      );
    });

    return {
      id,
      codigo: props.codigo,
      nome: props.nome,
      descricao: props.descricao,
      canApprove: props.canApprove,
    };
  }
}

// ── Update ────────────────────────────────────────────────────────────

export interface UpdateProcessRoleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly canApprove?: boolean;
  readonly updatedBy: string;
  readonly correlationId: string;
}

export class UpdateProcessRoleUseCase {
  constructor(
    private readonly roleRepo: ProcessRoleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateProcessRoleInput): Promise<ProcessRoleOutput> {
    const existing = await this.roleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessRole', input.id);
    }

    const updated: ProcessRoleProps = {
      ...existing,
      nome: input.nome ?? existing.nome,
      descricao: input.descricao !== undefined ? input.descricao : existing.descricao,
      canApprove: input.canApprove !== undefined ? input.canApprove : existing.canApprove,
      updatedAt: new Date(),
    };

    await this.uow.transaction(async (tx) => {
      await this.roleRepo.update(updated, tx);
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nome: updated.nome,
      descricao: updated.descricao,
      canApprove: updated.canApprove,
    };
  }
}

// ── Delete ────────────────────────────────────────────────────────────

export interface DeleteProcessRoleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteProcessRoleUseCase {
  constructor(
    private readonly roleRepo: ProcessRoleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteProcessRoleInput): Promise<void> {
    const existing = await this.roleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessRole', input.id);
    }

    // DATA-005 §2.8: Block if has active links
    const hasLinks = await this.roleRepo.hasActiveLinks(input.id);
    if (hasLinks) {
      throw new Error(
        'Papel com vínculos ativos em estágios não pode ser removido. Desvincule primeiro.',
      );
    }

    await this.uow.transaction(async (tx) => {
      await this.roleRepo.softDelete(input.id, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_ROLE_UNLINKED,
          entityType: 'process_role',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: { id: input.id, codigo: existing.codigo, nome: existing.nome },
        }),
        tx,
      );
    });
  }
}
