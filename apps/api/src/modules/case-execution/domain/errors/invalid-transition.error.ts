/**
 * @contract BR-012
 *
 * Thrown when a stage transition does not exist in the blueprint
 * or the current user's role is not in allowed_roles.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class InvalidTransitionError extends DomainError {
  readonly type = '/problems/invalid-transition';
  readonly statusHint = 422;

  constructor(fromStageId: string, toStageId: string, reason: string) {
    super(`Transition from stage ${fromStageId} to ${toStageId} is invalid: ${reason}.`);
  }
}
