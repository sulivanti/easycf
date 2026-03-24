/**
 * @contract BR-005, ADR-002
 *
 * Thrown when attempting to delete a stage that has active instances in MOD-006.
 * Fail-safe: block deletion when MOD-006 is unavailable (ADR-002 → HTTP 503).
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class StageHasInstancesError extends DomainError {
  readonly type = '/problems/stage-has-active-instances';
  readonly statusHint = 422;

  constructor(stageId: string, activeCount: number) {
    super(
      `Stage ${stageId} has ${activeCount} active instance(s) in MOD-006. ` +
        `Cannot delete while instances are active.`,
    );
  }
}

export class Mod006UnavailableError extends DomainError {
  readonly type = '/problems/mod006-unavailable';
  readonly statusHint = 503;

  constructor() {
    super(
      `MOD-006 (Process Execution) is unavailable. ` +
        `Cannot verify active instances. Deletion blocked for safety (ADR-002).`,
    );
  }
}
