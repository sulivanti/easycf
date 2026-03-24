/**
 * @contract FR-005, BR-001, DATA-007 E-006, DATA-003 EVT-007
 *
 * Use Case: Create a behavior routine in DRAFT status.
 * codigo is auto-uppercased and immutable after creation (BR-001).
 */

import type { BehaviorRoutineProps } from '../../domain/aggregates/behavior-routine.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  RoutineRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface CreateRoutineInput {
  readonly codigo: string;
  readonly nome: string;
  readonly routineType?: 'BEHAVIOR' | 'INTEGRATION';
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateRoutineOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly status: 'DRAFT';
  readonly version: number;
}

export class CreateRoutineUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateRoutineInput): Promise<CreateRoutineOutput> {
    const codigo = input.codigo.toUpperCase();
    const now = new Date();

    const props: BehaviorRoutineProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      codigo,
      nome: input.nome,
      routineType: input.routineType ?? 'BEHAVIOR',
      version: 1,
      status: 'DRAFT',
      parentRoutineId: null,
      publishedAt: null,
      approvedBy: null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const created = await this.uow.transaction(async (tx) => {
      const result = await this.routineRepo.create(props, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'behavior_routine',
          entityId: result.id,
          eventType: PARAM_EVENT_TYPES.ROUTINE_CREATED,
          payload: {
            id: result.id,
            codigo,
            nome: input.nome,
            routineType: props.routineType,
            status: 'DRAFT',
            version: 1,
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: now,
        },
        tx,
      );

      return result;
    });

    return {
      id: created.id,
      codigo: created.codigo,
      nome: created.nome,
      status: 'DRAFT',
      version: 1,
    };
  }
}
