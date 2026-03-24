/**
 * @contract BR-009
 *
 * Thrown when attempting to open a case on a cycle that is not PUBLISHED.
 */

export class CycleNotPublishedError extends Error {
  public readonly code = 'CYCLE_NOT_PUBLISHED';
  public readonly statusCode = 422;

  constructor(cycleId: string, currentStatus: string) {
    super(
      `Cycle ${cycleId} has status ${currentStatus}. Only PUBLISHED cycles can have new cases opened.`,
    );
    this.name = 'CycleNotPublishedError';
  }
}
