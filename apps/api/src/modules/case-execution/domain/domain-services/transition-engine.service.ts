/**
 * @contract BR-002, BR-004, BR-005, BR-006, BR-012, ADR-001
 *
 * Pure domain service implementing the 5-step sequential validation
 * before any stage transition (ADR-001 — atomic in single transaction).
 *
 * Steps:
 * 1. Case is OPEN (BR-012)
 * 2. Transition exists in blueprint (stage_transitions)
 * 3. User has an allowed role (allowed_roles on transition)
 * 4. All required gates are cleared — RESOLVED or WAIVED (BR-002, BR-005)
 * 5. Evidence provided if required (evidence_required on transition)
 */

import type { CaseStatus } from '../value-objects/case-status.js';
import type { GateResolutionStatus } from '../value-objects/gate-resolution-status.js';
import { isGateCleared } from '../value-objects/gate-resolution-status.js';
import { CaseNotOpenError } from '../errors/case-not-open.error.js';
import { InvalidTransitionError } from '../errors/invalid-transition.error.js';
import { GatePendingError } from '../errors/gate-pending.error.js';
import { EvidenceRequiredError } from '../errors/evidence-required.error.js';
import { RoleRequiredUnassignedError } from '../errors/role-required-unassigned.error.js';

// ---------------------------------------------------------------------------
// Input types (ports — injected by application layer)
// ---------------------------------------------------------------------------

export interface TransitionRequest {
  caseId: string;
  currentStatus: CaseStatus;
  currentStageId: string;
  targetStageId: string;
  userId: string;
  userRoleCodigos: string[];
  evidence?: { type: 'note' | 'file'; content?: string; url?: string };
}

export interface BlueprintTransition {
  id: string;
  fromStageId: string;
  toStageId: string;
  gateRequired: boolean;
  evidenceRequired: boolean;
  allowedRoles: string[] | null;
}

export interface PendingGateInfo {
  gateId: string;
  gateName: string;
  gateType: string;
  required: boolean;
  status: GateResolutionStatus;
}

export interface RequiredRoleInfo {
  roleCodigo: string;
  roleName: string;
  hasActiveAssignment: boolean;
}

export interface TransitionContext {
  transition: BlueprintTransition;
  pendingGates: PendingGateInfo[];
  requiredRoles: RequiredRoleInfo[];
}

export interface TransitionResult {
  transitionId: string;
  isTerminal: boolean;
}

// ---------------------------------------------------------------------------
// Engine — pure validation, no side effects
// ---------------------------------------------------------------------------

/**
 * Validates all 5 steps of the transition engine.
 * Throws domain errors on failure. Returns the validated transition on success.
 */
export function validateTransition(
  request: TransitionRequest,
  context: TransitionContext,
): TransitionResult & { transition: BlueprintTransition } {
  // Step 1: Case is OPEN (BR-012)
  if (request.currentStatus !== 'OPEN') {
    throw new CaseNotOpenError(request.caseId, request.currentStatus);
  }

  const { transition } = context;

  // Step 2: Transition exists in blueprint (already resolved by caller)
  if (
    transition.fromStageId !== request.currentStageId ||
    transition.toStageId !== request.targetStageId
  ) {
    throw new InvalidTransitionError(
      request.currentStageId,
      request.targetStageId,
      'Transition does not exist in the blueprint',
    );
  }

  // Step 3: User has an allowed role
  if (
    transition.allowedRoles &&
    transition.allowedRoles.length > 0 &&
    !transition.allowedRoles.some((r) => request.userRoleCodigos.includes(r))
  ) {
    throw new InvalidTransitionError(
      request.currentStageId,
      request.targetStageId,
      `User role not in allowed roles: ${transition.allowedRoles.join(', ')}`,
    );
  }

  // Step 4: All required gates cleared (BR-002, BR-005 — skip INFORMATIVE)
  const blocking = context.pendingGates.filter(
    (g) => g.required && g.gateType !== 'INFORMATIVE' && !isGateCleared(g.status),
  );
  if (blocking.length > 0) {
    throw new GatePendingError(
      request.caseId,
      blocking.map((g) => ({ gateId: g.gateId, gateName: g.gateName })),
    );
  }

  // Step 4b: Required roles assigned (BR-006)
  const unassigned = context.requiredRoles.filter((r) => !r.hasActiveAssignment);
  if (unassigned.length > 0) {
    throw new RoleRequiredUnassignedError(
      request.caseId,
      unassigned.map((r) => r.roleName).join(', '),
    );
  }

  // Step 5: Evidence provided if required
  if (transition.evidenceRequired && !request.evidence) {
    throw new EvidenceRequiredError(transition.id);
  }

  return {
    transitionId: transition.id,
    isTerminal: false, // resolved by caller from processStages.isTerminal
    transition,
  };
}
