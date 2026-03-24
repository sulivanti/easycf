/**
 * @contract FR-009, BR-004, BR-009, BR-010, BR-012, BR-013, DATA-003 EVT-012
 * @contract INT-007, ADR-001, ADR-005, ADR-006
 *
 * Use Case: Evaluation Engine — 6-step sequential evaluation.
 *
 * Steps:
 *   1. Find active incidence rules for provided framers
 *   2. Find PUBLISHED routines linked via routine_incidence_links (ignore DEPRECATED)
 *   3. Evaluate items of each routine by ordem ascending
 *   4. Resolve conflicts by restrictiveness (safety net — BR-004)
 *   5. Build response with separate arrays
 *   6. If applied_routines > 0 AND NOT dry_run, persist routine.applied event (BR-010)
 *
 * No cache at any step (BR-009, ADR-001, ADR-005).
 */

import {
  resolveConflicts,
  type RoutineEffect,
  type ResolvedFieldEffect,
} from '../../domain/domain-services/conflict-resolver.service.js';
import { PARAM_EVENT_TYPES } from '../../domain/domain-events/param-events.js';
import type {
  IncidenceRuleRepository,
  RoutineRepository,
  RoutineItemRepository,
  RoutineIncidenceLinkRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output DTOs
// ---------------------------------------------------------------------------

export interface EvaluateRulesInput {
  readonly objectType: string;
  readonly objectId?: string;
  readonly context: readonly { framerId: string }[];
  readonly stageId?: string;
  readonly dryRun?: boolean;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface EvaluateRulesOutput {
  readonly visibleFields: readonly string[];
  readonly hiddenFields: readonly string[];
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly defaults: readonly { fieldId: string; value: unknown }[];
  readonly domainRestrictions: readonly { fieldId: string; allowedValues: unknown }[];
  readonly validations: readonly { fieldId: string; message: string | null }[];
  readonly blockingValidations: readonly string[];
  readonly appliedRoutines: readonly {
    routineId: string;
    codigo: string;
    version: number;
  }[];
  readonly dryRun: boolean;
}

export class EvaluateRulesUseCase {
  constructor(
    private readonly incidenceRuleRepo: IncidenceRuleRepository,
    private readonly routineRepo: RoutineRepository,
    private readonly itemRepo: RoutineItemRepository,
    private readonly linkRepo: RoutineIncidenceLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: EvaluateRulesInput): Promise<EvaluateRulesOutput> {
    // Validate context is not empty
    if (!input.context || input.context.length === 0) {
      throw new Error('context array não pode ser vazio.');
    }

    const now = new Date();
    const isDryRun = input.dryRun === true;
    const framerIds = input.context.map((c) => c.framerId);

    // ------ Step 1: Find active incidence rules for framers ------
    const activeRules = await this.incidenceRuleRepo.findActiveByFramerIds(
      input.tenantId,
      framerIds,
      now,
    );

    if (activeRules.length === 0) {
      return emptyResult(isDryRun);
    }

    const ruleIds = activeRules.map((r) => r.id);

    // ------ Step 2: Find PUBLISHED routines linked to those rules ------
    const routineLinks = await this.linkRepo.findPublishedRoutineIdsByRuleIds(ruleIds);

    if (routineLinks.length === 0) {
      return emptyResult(isDryRun);
    }

    const uniqueRoutineIds = [...new Set(routineLinks.map((l) => l.routineId))];

    // Load routine metadata
    const routineMap = new Map<string, { id: string; codigo: string; version: number }>();
    for (const routineId of uniqueRoutineIds) {
      const r = await this.routineRepo.findById(input.tenantId, routineId);
      // BR-012: skip DEPRECATED routines
      if (r && r.status === 'PUBLISHED') {
        routineMap.set(routineId, {
          id: r.id,
          codigo: r.codigo,
          version: r.version,
        });
      }
    }

    if (routineMap.size === 0) {
      return emptyResult(isDryRun);
    }

    // ------ Step 3: Evaluate items by ordem ascending ------
    const allEffects: RoutineEffect[] = [];

    for (const [routineId, meta] of routineMap) {
      const items = await this.itemRepo.listByRoutine(routineId);

      for (const item of items) {
        if (!item.targetFieldId) continue;

        allEffects.push({
          routineId,
          routineVersion: meta.version,
          fieldId: item.targetFieldId,
          action: item.action as RoutineEffect['action'],
          value: item.value,
          isBlocking: item.isBlocking,
        });
      }
    }

    // ------ Step 4: Resolve conflicts by restrictiveness (BR-004) ------
    const resolved = resolveConflicts(allEffects);

    // ------ Step 5: Build response ------
    const result = buildResponse(resolved, routineMap, isDryRun);

    // ------ Step 6: Persist domain event if applicable ------
    if (result.appliedRoutines.length > 0 && !isDryRun) {
      await this.uow.transaction(async (tx) => {
        await this.eventRepo.create(
          {
            id: this.idGen.generate(),
            tenantId: input.tenantId,
            entityType: 'evaluation',
            entityId: input.objectId ?? input.objectType,
            eventType: PARAM_EVENT_TYPES.ROUTINE_APPLIED,
            payload: {
              objectType: input.objectType,
              objectId: input.objectId ?? null,
              stageId: input.stageId ?? null,
              appliedRoutines: result.appliedRoutines.map((r) => r.routineId),
              effectsCount: resolved.length,
              tenantId: input.tenantId,
            },
            correlationId: input.correlationId,
            causationId: null,
            createdBy: input.createdBy,
            createdAt: now,
          },
          tx,
        );
      });
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyResult(dryRun: boolean): EvaluateRulesOutput {
  return {
    visibleFields: [],
    hiddenFields: [],
    requiredFields: [],
    optionalFields: [],
    defaults: [],
    domainRestrictions: [],
    validations: [],
    blockingValidations: [],
    appliedRoutines: [],
    dryRun,
  };
}

function buildResponse(
  resolved: ResolvedFieldEffect[],
  routineMap: Map<string, { id: string; codigo: string; version: number }>,
  dryRun: boolean,
): EvaluateRulesOutput {
  const visibleFields: string[] = [];
  const hiddenFields: string[] = [];
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];
  const defaults: { fieldId: string; value: unknown }[] = [];
  const domainRestrictions: { fieldId: string; allowedValues: unknown }[] = [];
  const validations: { fieldId: string; message: string | null }[] = [];
  const blockingValidations: string[] = [];

  for (const effect of resolved) {
    switch (effect.action) {
      case 'SHOW':
        visibleFields.push(effect.fieldId);
        break;
      case 'HIDE':
        hiddenFields.push(effect.fieldId);
        break;
      case 'SET_REQUIRED':
        requiredFields.push(effect.fieldId);
        break;
      case 'SET_OPTIONAL':
        optionalFields.push(effect.fieldId);
        break;
      case 'SET_DEFAULT':
        defaults.push({ fieldId: effect.fieldId, value: effect.value });
        break;
      case 'RESTRICT_DOMAIN':
        domainRestrictions.push({
          fieldId: effect.fieldId,
          allowedValues: effect.value,
        });
        break;
      case 'VALIDATE':
        validations.push({ fieldId: effect.fieldId, message: null });
        break;
      case 'REQUIRE_EVIDENCE':
        validations.push({ fieldId: effect.fieldId, message: null });
        break;
    }

    if (effect.isBlocking) {
      blockingValidations.push(effect.fieldId);
    }
  }

  // Collect unique applied routines
  const appliedRoutineIds = new Set<string>();
  for (const effect of resolved) {
    for (const rid of effect.sourceRoutineIds) {
      appliedRoutineIds.add(rid);
    }
  }

  const appliedRoutines = [...appliedRoutineIds]
    .map((rid) => routineMap.get(rid))
    .filter(Boolean) as { id: string; codigo: string; version: number }[];

  return {
    visibleFields,
    hiddenFields,
    requiredFields,
    optionalFields,
    defaults,
    domainRestrictions,
    validations,
    blockingValidations,
    appliedRoutines: appliedRoutines.map((r) => ({
      routineId: r.id,
      codigo: r.codigo,
      version: r.version,
    })),
    dryRun,
  };
}
