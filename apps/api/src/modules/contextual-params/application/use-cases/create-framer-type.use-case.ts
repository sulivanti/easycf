/**
 * @contract FR-001, BR-001, DATA-007 E-001, DATA-003 EVT-001
 *
 * Use Case: Create a framer type (catálogo base).
 * Emits framer_type.created domain event.
 */

import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  FramerTypeRepository,
  DomainEventRepository,
  UnitOfWork,
  ContextFramerTypeRecord,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface CreateFramerTypeInput {
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateFramerTypeOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
}

export class CreateFramerTypeUseCase {
  constructor(
    private readonly framerTypeRepo: FramerTypeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateFramerTypeInput): Promise<CreateFramerTypeOutput> {
    const codigo = input.codigo.toUpperCase();

    const record: ContextFramerTypeRecord = {
      id: this.idGen.generate(),
      codigo,
      nome: input.nome,
      descricao: input.descricao ?? null,
      tenantId: input.tenantId,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.uow.transaction(async (tx) => {
      const result = await this.framerTypeRepo.create(record, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'context_framer_type',
          entityId: result.id,
          eventType: PARAM_EVENT_TYPES.FRAMER_TYPE_CREATED,
          payload: { id: result.id, codigo, nome: input.nome, tenantId: input.tenantId },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: new Date(),
        },
        tx,
      );

      return result;
    });

    return { id: created.id, codigo: created.codigo, nome: created.nome };
  }
}
