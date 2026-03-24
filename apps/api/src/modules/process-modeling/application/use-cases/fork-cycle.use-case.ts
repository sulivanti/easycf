/**
 * @contract FR-003, BR-004, ADR-003, DATA-003
 *
 * Use Case: Fork Published Cycle into new DRAFT version.
 * - Only PUBLISHED cycles can be forked
 * - Atomic copy of all 7 tables with UUID remapping (ADR-003)
 * - Idempotency-Key support for deduplication
 * - Emits process_modeling.cycle.forked domain event
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import { forkCycle } from '../../domain/domain-services/cycle-fork.service.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type {
  ProcessCycleRepository,
  ProcessMacroStageRepository,
  ProcessStageRepository,
  ProcessGateRepository,
  StageRoleLinkRepository,
  StageTransitionRepository,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  HashUtilService,
  IdempotencyService,
} from '../../../foundation/application/ports/services.js';

export interface ForkCycleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly forkedBy: string;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface ForkCycleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly version: number;
  readonly status: 'DRAFT';
  readonly parentCycleId: string;
}

export class ForkCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly macroStageRepo: ProcessMacroStageRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly gateRepo: ProcessGateRepository,
    private readonly roleLinkRepo: StageRoleLinkRepository,
    private readonly transitionRepo: StageTransitionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(input: ForkCycleInput): Promise<ForkCycleOutput> {
    // Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<ForkCycleOutput>(input.idempotencyKey);
      if (cached) return cached.value;
    }

    const existing = await this.cycleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessCycle', input.id);
    }

    const cycle = new ProcessCycle(existing);
    if (!cycle.isPublished()) {
      throw new Error('Somente ciclos publicados podem ser forkados.');
    }

    // Load full structure for fork
    const [macroStages, stages, gates, roleLinks, transitions] = await Promise.all([
      this.macroStageRepo.listByCycle(input.id),
      this.stageRepo.listByCycle(input.id),
      this.gateRepo.listByCycle(input.id),
      this.roleLinkRepo.listByCycle(input.id),
      this.transitionRepo.listByCycle(input.id),
    ]);

    // ADR-003: In-memory fork with UUID remapping
    const forked = forkCycle(
      {
        cycle: existing,
        macroStages: [...macroStages],
        stages: [...stages],
        gates: [...gates],
        roleLinks: [...roleLinks],
        transitions: [...transitions],
      },
      () => this.hashUtil.generateUuid(),
      input.forkedBy,
    );

    await this.uow.transaction(async (tx) => {
      // Insert in FK order: cycle → macro_stages → stages → gates → role_links → transitions
      await this.cycleRepo.create(forked.cycle, tx);

      for (const ms of forked.macroStages) {
        await this.macroStageRepo.create(ms, tx);
      }
      for (const s of forked.stages) {
        await this.stageRepo.create(s, tx);
      }
      for (const g of forked.gates) {
        await this.gateRepo.create(g, tx);
      }
      for (const rl of forked.roleLinks) {
        await this.roleLinkRepo.create(rl, tx);
      }
      for (const t of forked.transitions) {
        await this.transitionRepo.create(t, tx);
      }

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_FORKED,
          entityType: 'process_cycle',
          entityId: forked.cycle.id,
          tenantId: input.tenantId,
          createdBy: input.forkedBy,
          correlationId: input.correlationId,
          payload: {
            new_id: forked.cycle.id,
            parent_cycle_id: input.id,
            new_version: forked.cycle.version,
          },
        }),
        tx,
      );
    });

    const output: ForkCycleOutput = {
      id: forked.cycle.id,
      codigo: forked.cycle.codigo,
      nome: forked.cycle.nome,
      version: forked.cycle.version,
      status: 'DRAFT',
      parentCycleId: input.id,
    };

    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
