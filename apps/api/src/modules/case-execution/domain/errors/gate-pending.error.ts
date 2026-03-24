/**
 * @contract BR-002
 *
 * Thrown when attempting to transition a stage with required gates still pending.
 * The transition engine checks all required (non-INFORMATIVE) gates before advancing.
 */

export class GatePendingError extends Error {
  public readonly code = 'GATE_PENDING';
  public readonly statusCode = 422;

  constructor(
    public readonly caseId: string,
    public readonly pendingGates: Array<{ gateId: string; gateName: string }>,
  ) {
    const names = pendingGates.map((g) => `'${g.gateName}'`).join(', ');
    super(`Gate${pendingGates.length > 1 ? 's' : ''} ${names} not resolved.`);
    this.name = 'GatePendingError';
  }
}
