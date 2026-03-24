/**
 * @contract BR-004, ADR-002, ADR-004
 *
 * Domain service for runtime conflict resolution (safety net — layer 2).
 * When multiple routines produce conflicting actions for the same field:
 *   - HIDE > SHOW (BR-004)
 *   - SET_REQUIRED > SET_OPTIONAL (BR-004)
 *   - Smaller domain wins for RESTRICT_DOMAIN (intersection)
 *   - Non-conflicting fields are merged (union)
 *
 * This is the safety net (ADR-004): config-time blocks duplicates via UNIQUE,
 * but legacy data or race conditions may still produce overlaps at runtime.
 */

import { type ItemAction, moreRestrictive } from '../value-objects/item-action.js';

export interface ResolvedFieldEffect {
  fieldId: string;
  action: ItemAction;
  value: unknown;
  isBlocking: boolean;
  sourceRoutineIds: string[];
}

export interface RoutineEffect {
  routineId: string;
  routineVersion: number;
  fieldId: string;
  action: ItemAction;
  value: unknown;
  isBlocking: boolean;
}

/**
 * Resolve a list of effects from multiple routines into a single
 * effect per field, applying the restrictiveness rules (BR-004).
 */
export function resolveConflicts(effects: RoutineEffect[]): ResolvedFieldEffect[] {
  const byField = new Map<string, RoutineEffect[]>();

  for (const effect of effects) {
    const existing = byField.get(effect.fieldId) ?? [];
    existing.push(effect);
    byField.set(effect.fieldId, existing);
  }

  const resolved: ResolvedFieldEffect[] = [];

  for (const [fieldId, fieldEffects] of byField) {
    if (fieldEffects.length === 1) {
      const e = fieldEffects[0];
      resolved.push({
        fieldId,
        action: e.action,
        value: e.value,
        isBlocking: e.isBlocking,
        sourceRoutineIds: [e.routineId],
      });
      continue;
    }

    // Multiple effects on same field — resolve by restrictiveness
    const winner = fieldEffects.reduce((a, b) => {
      const winnerAction = moreRestrictive(a.action, b.action);
      if (winnerAction === b.action) return b;
      return a;
    });

    // For RESTRICT_DOMAIN: intersect the domain arrays
    let resolvedValue = winner.value;
    if (winner.action === 'RESTRICT_DOMAIN') {
      resolvedValue = intersectDomains(fieldEffects.map((e) => e.value));
    }

    resolved.push({
      fieldId,
      action: winner.action,
      value: resolvedValue,
      isBlocking: fieldEffects.some((e) => e.isBlocking),
      sourceRoutineIds: fieldEffects.map((e) => e.routineId),
    });
  }

  return resolved;
}

/**
 * Intersect multiple domain arrays (BR-004: smaller domain wins).
 * Each domain is expected to be an array of allowed values.
 */
function intersectDomains(domains: unknown[]): unknown {
  const arrays = domains.filter(Array.isArray) as unknown[][];
  if (arrays.length === 0) return domains[0];
  if (arrays.length === 1) return arrays[0];

  let result = new Set(arrays[0].map(String));
  for (let i = 1; i < arrays.length; i++) {
    const current = new Set(arrays[i].map(String));
    result = new Set([...result].filter((v) => current.has(v)));
  }

  return [...result];
}
