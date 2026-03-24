/**
 * @contract BR-002 (step 4)
 *
 * Thrown when a transition requires evidence (evidence_required=true)
 * but none was provided in the request.
 */

export class EvidenceRequiredError extends Error {
  public readonly code = 'EVIDENCE_REQUIRED';
  public readonly statusCode = 422;

  constructor(transitionId: string) {
    super(`Transition ${transitionId} requires evidence. Provide evidence in the request body.`);
    this.name = 'EvidenceRequiredError';
  }
}
