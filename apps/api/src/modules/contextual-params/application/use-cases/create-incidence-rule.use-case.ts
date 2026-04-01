/**
 * @contract FR-004, BR-003, DATA-007 E-005, DATA-003 EVT-005
 *
 * Use Case: Create an incidence rule binding a framer to a target object.
 * UNIQUE constraint (tenant_id, framer_id, target_object_id) blocks duplicates (BR-003).
 * Checks configurable limit per framer (PEN-007/PENDENTE-005).
 */

import { IncidenceConflictError } from '../../domain/errors/param-errors.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type { IncidenceRuleProps } from '../../domain/entities/incidence-rule.js';
import type {
  IncidenceRuleRepository,
  FramerRepository,
  TargetObjectRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

/** Default max incidence rules per framer (configurable per tenant) */
const DEFAULT_MAX_RULES_PER_FRAMER = 10;

export interface CreateIncidenceRuleInput {
  readonly framerId: string;
  readonly targetObjectId: string;
  readonly conditionExpr?: string;
  readonly incidenceType?: 'OBR' | 'OPC' | 'AUTO';
  readonly validFrom: Date;
  readonly validUntil?: Date;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
  readonly maxRulesPerFramer?: number;
}

export interface CreateIncidenceRuleOutput {
  readonly id: string;
  readonly framerId: string;
  readonly targetObjectId: string;
  readonly status: 'ACTIVE';
}

export class CreateIncidenceRuleUseCase {
  constructor(
    private readonly incidenceRuleRepo: IncidenceRuleRepository,
    private readonly framerRepo: FramerRepository,
    private readonly targetObjectRepo: TargetObjectRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateIncidenceRuleInput): Promise<CreateIncidenceRuleOutput> {
    // Validate framer exists
    const framer = await this.framerRepo.findById(input.tenantId, input.framerId);
    if (!framer) {
      throw new Error(`Enquadrador ${input.framerId} não encontrado.`);
    }

    // Validate target object exists
    const targetObject = await this.targetObjectRepo.findById(input.tenantId, input.targetObjectId);
    if (!targetObject) {
      throw new Error(`Objeto-alvo ${input.targetObjectId} não encontrado.`);
    }

    // BR-003: check UNIQUE constraint (config-time conflict detection)
    const existing = await this.incidenceRuleRepo.findByFramerAndObject(
      input.tenantId,
      input.framerId,
      input.targetObjectId,
    );
    if (existing) {
      throw new IncidenceConflictError(input.framerId, input.targetObjectId);
    }

    // PEN-007/PENDENTE-005: check configurable limit
    const maxRules = input.maxRulesPerFramer ?? DEFAULT_MAX_RULES_PER_FRAMER;
    const currentCount = await this.incidenceRuleRepo.countByFramer(input.tenantId, input.framerId);
    if (currentCount >= maxRules) {
      const err = new Error('LIMIT_EXCEEDED') as Error & {
        code: string;
        statusCode: number;
        current: number;
        max: number;
        configurable: boolean;
      };
      err.code = 'LIMIT_EXCEEDED';
      err.statusCode = 422;
      err.current = currentCount;
      err.max = maxRules;
      err.configurable = true;
      throw err;
    }

    const validUntil = input.validUntil ?? null;
    if (validUntil && validUntil <= input.validFrom) {
      throw new Error('valid_until deve ser posterior a valid_from.');
    }

    const now = new Date();
    const props: IncidenceRuleProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      framerId: input.framerId,
      targetObjectId: input.targetObjectId,
      conditionExpr: input.conditionExpr ?? null,
      incidenceType: input.incidenceType ?? 'OBR',
      validFrom: input.validFrom,
      validUntil,
      status: 'ACTIVE',
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.uow.transaction(async (tx) => {
      const result = await this.incidenceRuleRepo.create(props, tx);

      await this.eventRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          entityType: 'incidence_rule',
          entityId: result.id,
          eventType: PARAM_EVENT_TYPES.INCIDENCE_RULE_CREATED,
          payload: {
            id: result.id,
            framerId: input.framerId,
            targetObjectId: input.targetObjectId,
            status: 'ACTIVE',
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
      framerId: created.framerId,
      targetObjectId: created.targetObjectId,
      status: 'ACTIVE',
    };
  }
}
