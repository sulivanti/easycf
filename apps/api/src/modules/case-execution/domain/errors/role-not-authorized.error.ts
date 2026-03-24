/**
 * @contract BR-008
 *
 * Thrown when a user attempts an action requiring a role they don't have.
 * Example: resolving an APPROVAL gate without can_approve=true.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class RoleNotAuthorizedError extends DomainError {
  readonly type = '/problems/role-not-authorized';
  readonly statusHint = 403;

  constructor(userId: string, requiredCapability: string) {
    super(`User ${userId} does not have the required capability: ${requiredCapability}.`);
  }
}
