/**
 * @contract BR-002
 *
 * Thrown when attempting to transition a stage with required gates still pending.
 * The transition engine checks all required (non-INFORMATIVE) gates before advancing.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class GatePendingError extends DomainError {
  readonly type = '/problems/gate-pending';
  readonly statusHint = 422;

  constructor(
    public readonly caseId: string,
    public readonly pendingGates: Array<{ gateId: string; gateName: string }>,
  ) {
    const names = pendingGates.map((g) => `'${g.gateName}'`).join(', ');
    super(`Gate${pendingGates.length > 1 ? 's' : ''} ${names} not resolved.`);
  }
}
