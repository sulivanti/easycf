/**
 * @contract BR-002 (step 4)
 *
 * Thrown when a transition requires evidence (evidence_required=true)
 * but none was provided in the request.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class EvidenceRequiredError extends DomainError {
  readonly type = '/problems/evidence-required';
  readonly statusHint = 422;

  constructor(transitionId: string) {
    super(`Transition ${transitionId} requires evidence. Provide evidence in the request body.`);
  }
}
