/**
 * @contract FR-002, BR-001, DATA-007 E-002, DATA-003 EVT-003
 *
 * Use Case: Update a context framer.
 * BR-001: codigo is immutable — rejected if present and different.
 */

import { ContextFramer } from '../../domain/entities/context-framer.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type { FramerRepository, DomainEventRepository, UnitOfWork } from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface UpdateFramerInput {
  readonly id: string;
  readonly nome?: string;
  readonly codigo?: string;
  readonly validFrom?: Date;
  readonly validUntil?: Date | null;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface UpdateFramerOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly status: string;
}

export class UpdateFramerUseCase {
  constructor(
    private readonly framerRepo: FramerRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: UpdateFramerInput): Promise<UpdateFramerOutput> {
    const existing = await this.framerRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Enquadrador ${input.id} não encontrado.`);
    }

    const framer = new ContextFramer(existing);

    // BR-001: reject if codigo is being changed
    if (input.codigo !== undefined) {
      framer.assertCodigoUnchanged(input.codigo);
    }

    const changedFields: string[] = [];
    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    const updatedProps = { ...existing, updatedAt: new Date() };

    if (input.nome !== undefined && input.nome !== existing.nome) {
      changedFields.push('nome');
      previousValues.nome = existing.nome;
      newValues.nome = input.nome;
      updatedProps.nome = input.nome;
    }

    if (input.validFrom !== undefined) {
      changedFields.push('validFrom');
      previousValues.validFrom = existing.validFrom.toISOString();
      newValues.validFrom = input.validFrom.toISOString();
      updatedProps.validFrom = input.validFrom;
    }

    if (input.validUntil !== undefined) {
      changedFields.push('validUntil');
      previousValues.validUntil = existing.validUntil?.toISOString() ?? null;
      newValues.validUntil = input.validUntil?.toISOString() ?? null;
      updatedProps.validUntil = input.validUntil;
    }

    if (changedFields.length === 0) {
      return {
        id: existing.id,
        codigo: existing.codigo,
        nome: existing.nome,
        status: existing.status,
      };
    }

    const updated = await this.uow.transaction(async (tx) => {
      const result = await this.framerRepo.update(updatedProps, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'context_framer',
          entityId: input.id,
          eventType: PARAM_EVENT_TYPES.FRAMER_UPDATED,
          payload: {
            id: input.id,
            changedFields,
            previousValues,
            newValues,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: new Date(),
        },
        tx,
      );

      return result;
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nome: updated.nome,
      status: updated.status,
    };
  }
}
