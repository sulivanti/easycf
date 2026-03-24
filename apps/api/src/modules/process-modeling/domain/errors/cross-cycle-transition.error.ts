/**
 * @contract BR-008
 *
 * Thrown when attempting to create a transition between stages of different cycles.
 * Also covers self-transitions (from_stage_id = to_stage_id).
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class CrossCycleTransitionError extends DomainError {
  readonly type = '/problems/cross-cycle-transition';
  readonly statusHint = 422;

  constructor(fromStageId: string, toStageId: string) {
    super(
      `Transition from stage ${fromStageId} to stage ${toStageId} is invalid. ` +
        `Both stages must belong to the same cycle and cannot be the same stage.`,
    );
  }
}
