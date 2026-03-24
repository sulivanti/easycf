/**
 * Domain Service: ControlEngine
 * Evaluates if an operation requires approval control.
 * Pure function — no IO, receives data and returns result.
 */

import type { MovementControlRule } from '../entities/movement-control-rule.entity.js';
import type { OriginType } from '../value-objects/origin-type.vo.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ControlEvaluation {
  readonly controlled: boolean;
  readonly ruleId?: string;
  readonly levels?: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class ControlEngine {
  /**
   * Evaluates if an operation requires approval control.
   * Queries ACTIVE rules matching (objectType, operationType, origin),
   * ordered by priority. Returns first matching rule.
   *
   * @param rules - Pre-fetched active rules for the tenant, ordered by priority
   * @param objectType - The type of object being operated on
   * @param operationType - The type of operation
   * @param origin - The origin of the request
   * @param now - Current timestamp for validity check
   */
  evaluate(
    rules: readonly MovementControlRule[],
    objectType: string,
    operationType: string,
    origin: OriginType,
    now: Date = new Date(),
  ): ControlEvaluation {
    for (const rule of rules) {
      if (!rule.isActive()) continue;
      if (!rule.isValid(now)) continue;
      if (!rule.matchesOperation(objectType, operationType, origin)) continue;

      return {
        controlled: true,
        ruleId: rule.id,
      };
    }

    return { controlled: false };
  }
}
