/**
 * @contract FR-004, DATA-007 E-005, DATA-003 EVT-006
 *
 * Use Case: Update an incidence rule (vigência, status).
 * No priority field (BR-011).
 */

import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  IncidenceRuleRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface UpdateIncidenceRuleInput {
  readonly id: string;
  readonly validFrom?: Date;
  readonly validUntil?: Date | null;
  readonly incidenceType?: 'OBR' | 'OPC' | 'AUTO';
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface UpdateIncidenceRuleOutput {
  readonly id: string;
  readonly status: string;
}

export class UpdateIncidenceRuleUseCase {
  constructor(
    private readonly incidenceRuleRepo: IncidenceRuleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: UpdateIncidenceRuleInput): Promise<UpdateIncidenceRuleOutput> {
    const existing = await this.incidenceRuleRepo.findById(input.tenantId, input.id);
    if (!existing) {
      throw new Error(`Regra de incidência ${input.id} não encontrada.`);
    }

    const updatedProps = { ...existing, updatedAt: new Date() };

    if (input.validFrom !== undefined) updatedProps.validFrom = input.validFrom;
    if (input.validUntil !== undefined) updatedProps.validUntil = input.validUntil;
    if (input.incidenceType !== undefined) updatedProps.incidenceType = input.incidenceType;
    if (input.status !== undefined) updatedProps.status = input.status;

    const updated = await this.uow.transaction(async (tx) => {
      const result = await this.incidenceRuleRepo.update(updatedProps, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'incidence_rule',
          entityId: input.id,
          eventType: PARAM_EVENT_TYPES.INCIDENCE_RULE_UPDATED,
          payload: { id: input.id, tenantId: input.tenantId },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: new Date(),
        },
        tx,
      );

      return result;
    });

    return { id: updated.id, status: updated.status };
  }
}
