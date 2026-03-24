/**
 * @contract BR-012
 *
 * Thrown when a stage transition does not exist in the blueprint
 * or the current user's role is not in allowed_roles.
 */

export class InvalidTransitionError extends Error {
  public readonly code = 'INVALID_TRANSITION';
  public readonly statusCode = 422;

  constructor(fromStageId: string, toStageId: string, reason: string) {
    super(`Transition from stage ${fromStageId} to ${toStageId} is invalid: ${reason}.`);
    this.name = 'InvalidTransitionError';
  }
}
