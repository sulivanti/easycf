/**
 * @contract INT-005 §4.1, ADR-002
 *
 * Stub implementation of InstanceCheckerPort.
 * Fail-safe strategy (ADR-002): returns 0 active instances by default
 * until MOD-006 (Case Execution) is implemented.
 *
 * When MOD-006 is available, replace this stub with a real implementation
 * that queries the case_instances table for active instances on the given stage.
 */

import type { InstanceCheckerPort } from '../../application/ports/repositories.js';

export class Mod006InstanceChecker implements InstanceCheckerPort {
  async countActiveByStageId(_stageId: string): Promise<number> {
    // ADR-002: fail-safe — allow deletion when MOD-006 is not yet available.
    // TODO: Replace with real query when MOD-006 case_instances table is available:
    //   SELECT COUNT(*) FROM case_instances
    //   WHERE current_stage_id = :stageId AND status IN ('ACTIVE', 'PENDING')
    return 0;
  }
}
