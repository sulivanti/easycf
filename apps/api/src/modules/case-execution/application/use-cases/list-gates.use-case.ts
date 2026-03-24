/**
 * @contract FR-011, SEC-006
 *
 * Lists gate instances for a case, optionally filtered by stage.
 */

import type { GateInstanceRepository, GateInstanceRow } from "../ports/gate-instance.repository.js";

export interface ListGatesInput {
  caseId: string;
  stageId?: string;
}

export interface ListGatesOutput {
  gates: GateInstanceRow[];
}

export class ListGatesUseCase {
  constructor(private readonly gateInstanceRepo: GateInstanceRepository) {}

  async execute(input: ListGatesInput): Promise<ListGatesOutput> {
    const gates = input.stageId
      ? await this.gateInstanceRepo.findByCaseAndStage(input.caseId, input.stageId)
      : await this.gateInstanceRepo.findByCaseId(input.caseId);

    return { gates };
  }
}
