/**
 * @contract BR-001
 *
 * Thrown when attempting to modify a PUBLISHED cycle.
 * PUBLISHED cycles are immutable — changes require fork (BR-001, BR-004).
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class CycleImmutableError extends DomainError {
  readonly type = '/problems/cycle-immutable';
  readonly statusHint = 422;

  constructor(cycleId: string) {
    super(`Cycle ${cycleId} is PUBLISHED and immutable. Fork it to create a new DRAFT version.`);
  }
}
