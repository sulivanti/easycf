/**
 * @contract BR-012
 *
 * Thrown when attempting a stage transition on a case that is not OPEN.
 * Cases must be OPEN to accept transitions; ON_HOLD must be resumed first.
 */

export class CaseNotOpenError extends Error {
  public readonly code = 'CASE_NOT_OPEN';
  public readonly statusCode = 422;

  constructor(caseId: string, currentStatus: string) {
    super(`Case ${caseId} is ${currentStatus}. Only OPEN cases can be transitioned.`);
    this.name = 'CaseNotOpenError';
  }
}
