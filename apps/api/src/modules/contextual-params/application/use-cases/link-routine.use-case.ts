/**
 * @contract FR-010, BR-007, BR-012, DATA-007 E-008, DATA-003 EVT-012B
 *
 * Use Case: Link a PUBLISHED routine to an incidence rule.
 * Only PUBLISHED routines can be linked (BR-007).
 * DEPRECATED routines are blocked (BR-012).
 */

import { BehaviorRoutine } from '../../domain/aggregates/behavior-routine.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  RoutineRepository,
  IncidenceRuleRepository,
  RoutineIncidenceLinkRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface LinkRoutineInput {
  readonly incidenceRuleId: string;
  readonly routineId: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface LinkRoutineOutput {
  readonly id: string;
  readonly routineId: string;
  readonly incidenceRuleId: string;
}

export class LinkRoutineUseCase {
  constructor(
    private readonly routineRepo: RoutineRepository,
    private readonly incidenceRuleRepo: IncidenceRuleRepository,
    private readonly linkRepo: RoutineIncidenceLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: LinkRoutineInput): Promise<LinkRoutineOutput> {
    // Validate incidence rule exists
    const rule = await this.incidenceRuleRepo.findById(input.tenantId, input.incidenceRuleId);
    if (!rule) {
      throw new Error(`Regra de incidência ${input.incidenceRuleId} não encontrada.`);
    }

    // Validate routine exists and is PUBLISHED (BR-007, BR-012)
    const routineProps = await this.routineRepo.findById(input.tenantId, input.routineId);
    if (!routineProps) {
      throw new Error(`Rotina ${input.routineId} não encontrada.`);
    }
    const routine = new BehaviorRoutine(routineProps);
    routine.assertLinkable();

    // Check for duplicate link
    const existingLink = await this.linkRepo.findByRoutineAndRule(
      input.routineId,
      input.incidenceRuleId,
    );
    if (existingLink) {
      throw new Error('Vínculo já existe entre esta rotina e regra de incidência.');
    }

    const now = new Date();
    const linkId = this.idGen.generate();

    const created = await this.uow.transaction(async (tx) => {
      const link = await this.linkRepo.create(
        {
          id: linkId,
          routineId: input.routineId,
          incidenceRuleId: input.incidenceRuleId,
          createdAt: now,
        },
        tx,
      );

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'routine_incidence_link',
          entityId: linkId,
          eventType: PARAM_EVENT_TYPES.ROUTINE_INCIDENCE_LINKED,
          payload: {
            routineId: input.routineId,
            incidenceRuleId: input.incidenceRuleId,
            tenantId: input.tenantId,
          },
          correlationId: input.correlationId,
          causationId: null,
          createdBy: input.createdBy,
          createdAt: now,
        },
        tx,
      );

      return link;
    });

    return {
      id: created.id,
      routineId: created.routineId,
      incidenceRuleId: created.incidenceRuleId,
    };
  }
}
