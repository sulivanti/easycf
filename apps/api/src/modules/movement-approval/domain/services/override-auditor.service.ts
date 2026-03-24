/**
 * Domain Service: OverrideAuditor
 * Validates override preconditions.
 * Pure function — no IO, receives data and throws on violation.
 */

import { InsufficientJustificationError } from '../errors/movement-approval-errors.js';
import { InsufficientScopeError } from '../../../foundation/domain/errors/domain-errors.js';

const OVERRIDE_SCOPE = 'approval:override';
const MIN_JUSTIFICATION_LENGTH = 20;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class OverrideAuditor {
  /**
   * Validates override preconditions.
   * @throws InsufficientScopeError if actor lacks approval:override scope
   * @throws InsufficientJustificationError if justification < 20 chars
   */
  validateOverride(_actorId: string, actorScopes: readonly string[], justification: string): void {
    if (!actorScopes.includes(OVERRIDE_SCOPE)) {
      throw new InsufficientScopeError(OVERRIDE_SCOPE);
    }

    if (justification.length < MIN_JUSTIFICATION_LENGTH) {
      throw new InsufficientJustificationError();
    }
  }
}
