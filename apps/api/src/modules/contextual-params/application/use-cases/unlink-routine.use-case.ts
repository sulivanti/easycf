/**
 * @contract FR-010, DATA-007 E-008, DATA-003 EVT-012C
 *
 * Use Case: Unlink a routine from an incidence rule.
 */

import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  RoutineIncidenceLinkRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface UnlinkRoutineInput {
  readonly incidenceRuleId: string;
  readonly routineId: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export class UnlinkRoutineUseCase {
  constructor(
    private readonly linkRepo: RoutineIncidenceLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: UnlinkRoutineInput): Promise<void> {
    const existing = await this.linkRepo.findByRoutineAndRule(
      input.routineId,
      input.incidenceRuleId,
    );
    if (!existing) {
      throw new Error('Vínculo não encontrado entre esta rotina e regra de incidência.');
    }

    await this.uow.transaction(async (tx) => {
      await this.linkRepo.deleteByRoutineAndRule(input.routineId, input.incidenceRuleId, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'routine_incidence_link',
          entityId: existing.id,
          eventType: PARAM_EVENT_TYPES.ROUTINE_INCIDENCE_UNLINKED,
          payload: {
            routineId: input.routineId,
            incidenceRuleId: input.incidenceRuleId,
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: new Date(),
        },
        tx,
      );
    });
  }
}
