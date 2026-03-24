/**
 * @contract FR-009, BR-001, DATA-003
 *
 * Use Cases: Link/Unlink Process Roles to/from Stages.
 * - Only DRAFT cycles allow mutations (BR-001)
 * - Duplicate (stage_id, role_id) pair returns 409
 * - Hard delete on unlink (no soft delete — DATA-005 §2.8)
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { StageRoleLinkData } from '../../domain/domain-services/cycle-fork.service.js';
import type {
  ProcessCycleRepository,
  ProcessStageRepository,
  ProcessRoleRepository,
  StageRoleLinkRepository,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Link ──────────────────────────────────────────────────────────────

export interface LinkStageRoleInput {
  readonly stageId: string;
  readonly roleId: string;
  readonly tenantId: string;
  readonly required: boolean;
  readonly maxAssignees?: number | null;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface StageRoleLinkOutput {
  readonly id: string;
  readonly stageId: string;
  readonly roleId: string;
  readonly required: boolean;
  readonly maxAssignees: number | null;
}

export class LinkStageRoleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly roleRepo: ProcessRoleRepository,
    private readonly linkRepo: StageRoleLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: LinkStageRoleInput): Promise<StageRoleLinkOutput> {
    const stage = await this.stageRepo.findById(input.stageId);
    if (!stage) {
      throw new EntityNotFoundError('ProcessStage', input.stageId);
    }

    const cycleProps = await this.cycleRepo.findById(stage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', stage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    // Validate role exists
    const role = await this.roleRepo.findById(input.roleId);
    if (!role) {
      throw new EntityNotFoundError('ProcessRole', input.roleId);
    }

    // Check duplicate
    const existing = await this.linkRepo.findByPair(input.stageId, input.roleId);
    if (existing) {
      throw new Error('Este papel já está vinculado ao estágio.');
    }

    const id = this.hashUtil.generateUuid();

    const linkData: StageRoleLinkData = {
      id,
      stageId: input.stageId,
      roleId: input.roleId,
      required: input.required,
      maxAssignees: input.maxAssignees ?? null,
      createdBy: input.createdBy,
    };

    await this.uow.transaction(async (tx) => {
      await this.linkRepo.create(linkData, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_ROLE_LINKED,
          entityType: 'stage_role_link',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: { id, stage_id: input.stageId, role_id: input.roleId, required: input.required },
        }),
        tx,
      );
    });

    return {
      id,
      stageId: input.stageId,
      roleId: input.roleId,
      required: input.required,
      maxAssignees: linkData.maxAssignees,
    };
  }
}

// ── Unlink ────────────────────────────────────────────────────────────

export interface UnlinkStageRoleInput {
  readonly stageId: string;
  readonly roleId: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class UnlinkStageRoleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly linkRepo: StageRoleLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UnlinkStageRoleInput): Promise<void> {
    const stage = await this.stageRepo.findById(input.stageId);
    if (!stage) {
      throw new EntityNotFoundError('ProcessStage', input.stageId);
    }

    const cycleProps = await this.cycleRepo.findById(stage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', stage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    const link = await this.linkRepo.findByPair(input.stageId, input.roleId);
    if (!link) {
      throw new EntityNotFoundError('StageRoleLink', `${input.stageId}:${input.roleId}`);
    }

    await this.uow.transaction(async (tx) => {
      await this.linkRepo.delete(link.id, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_ROLE_UNLINKED,
          entityType: 'stage_role_link',
          entityId: link.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: { id: link.id, stage_id: input.stageId, role_id: input.roleId },
        }),
        tx,
      );
    });
  }
}
