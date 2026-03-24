/**
 * @contract BR-012
 *
 * Thrown when attempting a stage transition on a case that is not OPEN.
 * Cases must be OPEN to accept transitions; ON_HOLD must be resumed first.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class CaseNotOpenError extends DomainError {
  readonly type = '/problems/case-not-open';
  readonly statusHint = 422;

  constructor(caseId: string, currentStatus: string) {
    super(`Case ${caseId} is ${currentStatus}. Only OPEN cases can be transitioned.`);
  }
}
