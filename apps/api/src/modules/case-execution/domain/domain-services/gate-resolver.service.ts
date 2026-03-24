/**
 * @contract BR-008, BR-013, BR-014
 *
 * Pure domain service for gate resolution logic.
 * Validates resolution by gate type (APPROVAL, DOCUMENT, CHECKLIST).
 * Validates waive requirements (scope + motivo min 20 chars).
 */

import type { GateDecision } from '../value-objects/gate-decision.js';
import { RoleNotAuthorizedError } from '../errors/role-not-authorized.error.js';

export interface GateResolveRequest {
  gateType: 'APPROVAL' | 'DOCUMENT' | 'CHECKLIST' | 'INFORMATIVE';
  decision?: GateDecision;
  parecer?: string;
  evidence?: { type: 'file'; url: string; filename: string };
  checklistItems?: Array<{ id: string; label: string; checked: boolean }>;
  userId: string;
  userCanApprove: boolean;
}

export interface GateWaiveRequest {
  motivo: string;
  userId: string;
}

/**
 * Validates a gate resolution request based on gate type.
 * Returns the resolved status and decision.
 */
export function validateGateResolution(request: GateResolveRequest): {
  status: 'RESOLVED' | 'REJECTED';
  decision: GateDecision | null;
} {
  switch (request.gateType) {
    case 'APPROVAL': {
      // BR-008: only users with can_approve=true
      if (!request.userCanApprove) {
        throw new RoleNotAuthorizedError(request.userId, 'can_approve');
      }
      if (!request.decision) {
        throw new Error('Decision (APPROVED/REJECTED) is required for APPROVAL gates.');
      }
      return {
        status: request.decision === 'REJECTED' ? 'REJECTED' : 'RESOLVED',
        decision: request.decision,
      };
    }

    case 'DOCUMENT': {
      if (!request.evidence) {
        throw new Error('Evidence (file) is required for DOCUMENT gates.');
      }
      return { status: 'RESOLVED', decision: null };
    }

    case 'CHECKLIST': {
      // BR-013: all items must be checked
      if (!request.checklistItems || request.checklistItems.length === 0) {
        throw new Error('Checklist items are required for CHECKLIST gates.');
      }
      const unchecked = request.checklistItems.filter((item) => !item.checked);
      if (unchecked.length > 0) {
        throw new Error(
          `All checklist items are required. ${unchecked.length} item(s) not checked.`,
        );
      }
      return { status: 'RESOLVED', decision: null };
    }

    case 'INFORMATIVE': {
      return { status: 'RESOLVED', decision: null };
    }
  }
}

/**
 * Validates a gate waive request (BR-014).
 * Motivo must be at least 20 characters.
 * Scope validation (process:case:gate_waive) is done at the presentation layer.
 */
export function validateGateWaive(request: GateWaiveRequest): void {
  if (!request.motivo || request.motivo.trim().length < 20) {
    throw new Error('Waive motivo must be at least 20 characters for audit compliance.');
  }
}
