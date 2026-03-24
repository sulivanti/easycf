/**
 * @contract FR-001, BR-006, DATA-003, SEC-005 §2
 *
 * Use Case: Create Process Cycle in DRAFT status.
 * - codigo is immutable after creation (BR-006)
 * - tenant_id is mandatory (SEC-005 §8)
 * - Emits process_modeling.cycle.created domain event
 */

import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import type { ProcessCycleProps } from '../../domain/aggregates/process-cycle.js';
import type { ProcessCycleRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface CreateCycleInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateCycleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly version: number;
  readonly status: 'DRAFT';
}

export class CreateCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateCycleInput): Promise<CreateCycleOutput> {
    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const cycleProps: ProcessCycleProps = {
      id,
      tenantId: input.tenantId,
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      descricao: input.descricao ?? null,
      version: 1,
      status: 'DRAFT',
      parentCycleId: null,
      publishedAt: null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.cycleRepo.create(cycleProps, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_CREATED,
          entityType: 'process_cycle',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: {
            id,
            codigo: cycleProps.codigo,
            nome: cycleProps.nome,
            version: 1,
            status: 'DRAFT',
          },
        }),
        tx,
      );
    });

    return {
      id,
      codigo: cycleProps.codigo,
      nome: cycleProps.nome,
      descricao: cycleProps.descricao,
      version: 1,
      status: 'DRAFT',
    };
  }
}
