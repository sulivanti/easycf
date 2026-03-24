/**
 * @contract FR-011, DATA-005 §5.1, NFR-005
 *
 * Use Case: Get complete flow graph for a cycle.
 * Used by GET /admin/cycles/:id/flow endpoint.
 * SLA target: < 200ms for up to 50 stages.
 * Delegates graph assembly to FlowGraphService (domain service).
 */

import {
  assembleFlowGraph,
  type FlowGraph,
} from '../../domain/domain-services/flow-graph.service.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { ProcessCycleRepository, FlowQueryRepository } from '../ports/repositories.js';

export interface GetCycleFlowInput {
  readonly cycleId: string;
}

export class GetCycleFlowUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly flowQueryRepo: FlowQueryRepository,
  ) {}

  async execute(input: GetCycleFlowInput): Promise<FlowGraph> {
    const cycle = await this.cycleRepo.findById(input.cycleId);
    if (!cycle) {
      throw new EntityNotFoundError('ProcessCycle', input.cycleId);
    }

    const { macroStages, stages, gates, roleLinks, transitions } =
      await this.flowQueryRepo.queryFlowData(input.cycleId);

    return assembleFlowGraph(input.cycleId, macroStages, stages, gates, roleLinks, transitions);
  }
}
