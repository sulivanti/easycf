/**
 * @contract BR-009
 *
 * Thrown when attempting to open a case on a cycle that is not PUBLISHED.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class CycleNotPublishedError extends DomainError {
  readonly type = '/problems/cycle-not-published';
  readonly statusHint = 422;

  constructor(cycleId: string, currentStatus: string) {
    super(
      `Cycle ${cycleId} has status ${currentStatus}. Only PUBLISHED cycles can have new cases opened.`,
    );
  }
}
