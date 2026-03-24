/**
 * @contract FR-010, SEC-006
 *
 * Returns full case details: instance + current stage gates + active assignments.
 */

import type { CaseInstanceRepository, CaseInstanceRow } from '../ports/case-instance.repository.js';
import type { GateInstanceRepository, GateInstanceRow } from '../ports/gate-instance.repository.js';
import type {
  CaseAssignmentRepository,
  CaseAssignmentRow,
} from '../ports/case-assignment.repository.js';

export interface GetCaseDetailsInput {
  caseId: string;
  tenantId: string;
}

export interface GetCaseDetailsOutput {
  caseInstance: CaseInstanceRow;
  currentStageGates: GateInstanceRow[];
  activeAssignments: CaseAssignmentRow[];
}

export class GetCaseDetailsUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly assignmentRepo: CaseAssignmentRepository,
  ) {}

  async execute(input: GetCaseDetailsInput): Promise<GetCaseDetailsOutput> {
    const caseInstance = await this.caseRepo.findById(input.caseId, input.tenantId);
    if (!caseInstance) {
      throw new Error(`Case ${input.caseId} not found.`);
    }

    const [currentStageGates, activeAssignments] = await Promise.all([
      this.gateInstanceRepo.findByCaseAndStage(input.caseId, caseInstance.currentStageId),
      this.assignmentRepo.findActiveByCaseId(input.caseId),
    ]);

    return { caseInstance, currentStageGates, activeAssignments };
  }
}
