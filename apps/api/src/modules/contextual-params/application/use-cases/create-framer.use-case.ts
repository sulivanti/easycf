/**
 * @contract FR-002, BR-001, BR-002, DATA-007 E-002, DATA-003 EVT-002
 *
 * Use Case: Create a context framer with validity period.
 * codigo is auto-uppercased and immutable after creation (BR-001).
 * valid_from is required (BR-002).
 */

import type { ContextFramerProps } from '../../domain/entities/context-framer.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  FramerRepository,
  FramerTypeRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface CreateFramerInput {
  readonly codigo: string;
  readonly nome: string;
  readonly framerTypeId: string;
  readonly validFrom: Date;
  readonly validUntil?: Date;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateFramerOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly status: 'ACTIVE';
}

export class CreateFramerUseCase {
  constructor(
    private readonly framerRepo: FramerRepository,
    private readonly framerTypeRepo: FramerTypeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateFramerInput): Promise<CreateFramerOutput> {
    const framerType = await this.framerTypeRepo.findById(input.tenantId, input.framerTypeId);
    if (!framerType) {
      throw new Error(`Framer type ${input.framerTypeId} não encontrado.`);
    }

    const codigo = input.codigo.toUpperCase();
    const now = new Date();
    const validUntil = input.validUntil ?? null;

    if (validUntil && validUntil <= input.validFrom) {
      throw new Error('valid_until deve ser posterior a valid_from.');
    }

    const props: ContextFramerProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      codigo,
      nome: input.nome,
      framerTypeId: input.framerTypeId,
      status: 'ACTIVE',
      version: 1,
      validFrom: input.validFrom,
      validUntil,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const created = await this.uow.transaction(async (tx) => {
      const result = await this.framerRepo.create(props, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'context_framer',
          entityId: result.id,
          eventType: PARAM_EVENT_TYPES.FRAMER_CREATED,
          payload: {
            id: result.id,
            codigo,
            nome: input.nome,
            framerTypeId: input.framerTypeId,
            status: 'ACTIVE',
            validFrom: input.validFrom.toISOString(),
            validUntil: validUntil?.toISOString() ?? null,
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
      status: 'ACTIVE',
    };
  }
}
