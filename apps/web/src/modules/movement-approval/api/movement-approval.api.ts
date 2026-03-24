/**
 * @contract INT-009, FR-001..FR-010, UX-APROV-001, UX-APROV-002
 * Movement Approval API client — control rules, movements, approvals, engine.
 */

import { httpClient } from '../../foundation/api/http-client.js';
import type {
  ControlRule,
  ControlRuleListItem,
  CreateControlRuleRequest,
  UpdateControlRuleRequest,
  ApprovalRule,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  Movement,
  MovementDetail,
  MovementListParams,
  ApprovalInstance,
  ApproveRequest,
  RejectRequest,
  OverrideRequest,
  EvaluateRequest,
  EvaluateResponse,
  PaginatedResponse,
  PendingCountResponse,
} from '../types/movement-approval.types.js';

const RULES = '/control-rules';
const MOVEMENTS = '/movements';
const APPROVALS = '/approvals';

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') {
      qs.set(key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const movementApprovalApi = {
  // ── Control Rules ───────────────────────────────────────────────────────────

  /** @contract UX-APROV-002 — GET /control-rules */
  listControlRules(params?: {
    cursor?: string;
    limit?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<ControlRuleListItem>> {
    return httpClient.get<PaginatedResponse<ControlRuleListItem>>(
      `${RULES}${buildQuery(params ?? {})}`,
    );
  },

  /** @contract UX-APROV-002 — GET /control-rules/:id */
  getControlRule(id: string): Promise<ControlRule> {
    return httpClient.get<ControlRule>(`${RULES}/${id}`);
  },

  /** @contract UX-APROV-002 — POST /control-rules */
  createControlRule(data: CreateControlRuleRequest): Promise<ControlRule> {
    return httpClient.post<ControlRule>(RULES, data, {
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /** @contract UX-APROV-002 — PATCH /control-rules/:id */
  updateControlRule(id: string, data: UpdateControlRuleRequest): Promise<ControlRule> {
    return httpClient.patch<ControlRule>(`${RULES}/${id}`, data);
  },

  /** @contract UX-APROV-002 — DELETE /control-rules/:id */
  deleteControlRule(id: string): Promise<void> {
    return httpClient.delete<void>(`${RULES}/${id}`);
  },

  // ── Approval Rules (levels) ─────────────────────────────────────────────────

  /** @contract UX-APROV-002 — POST /control-rules/:id/approval-rules */
  createApprovalRule(
    controlRuleId: string,
    data: CreateApprovalRuleRequest,
  ): Promise<ApprovalRule> {
    return httpClient.post<ApprovalRule>(`${RULES}/${controlRuleId}/approval-rules`, data, {
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /** @contract UX-APROV-002 — PATCH /control-rules/:ruleId/approval-rules/:id */
  updateApprovalRule(
    controlRuleId: string,
    id: string,
    data: UpdateApprovalRuleRequest,
  ): Promise<ApprovalRule> {
    return httpClient.patch<ApprovalRule>(`${RULES}/${controlRuleId}/approval-rules/${id}`, data);
  },

  /** @contract UX-APROV-002 — DELETE /control-rules/:ruleId/approval-rules/:id */
  deleteApprovalRule(controlRuleId: string, id: string): Promise<void> {
    return httpClient.delete<void>(`${RULES}/${controlRuleId}/approval-rules/${id}`);
  },

  // ── Engine ──────────────────────────────────────────────────────────────────

  /** @contract UX-APROV-002 — POST /movements/evaluate */
  evaluate(data: EvaluateRequest): Promise<EvaluateResponse> {
    return httpClient.post<EvaluateResponse>(`${MOVEMENTS}/evaluate`, data);
  },

  // ── Movements ───────────────────────────────────────────────────────────────

  /** @contract UX-APROV-001 — GET /movements */
  listMovements(params?: MovementListParams): Promise<PaginatedResponse<Movement>> {
    return httpClient.get<PaginatedResponse<Movement>>(
      `${MOVEMENTS}${buildQuery((params ?? {}) as unknown as Record<string, string | number | boolean | undefined>)}`,
    );
  },

  /** @contract UX-APROV-001 — GET /movements/:id */
  getMovement(id: string): Promise<MovementDetail> {
    return httpClient.get<MovementDetail>(`${MOVEMENTS}/${id}`);
  },

  /** @contract UX-APROV-001 — POST /movements/:id/cancel */
  cancelMovement(id: string): Promise<Movement> {
    return httpClient.post<Movement>(`${MOVEMENTS}/${id}/cancel`);
  },

  /** @contract UX-APROV-001 — POST /movements/:id/override */
  overrideMovement(id: string, data: OverrideRequest): Promise<Movement> {
    return httpClient.post<Movement>(`${MOVEMENTS}/${id}/override`, data);
  },

  /** @contract UX-APROV-001 — POST /movements/:id/retry */
  retryMovement(id: string): Promise<Movement> {
    return httpClient.post<Movement>(`${MOVEMENTS}/${id}/retry`);
  },

  // ── Approvals (My Inbox) ──────────────────────────────────────────────────

  /** @contract UX-APROV-001 — GET /approvals/mine */
  listMyApprovals(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<ApprovalInstance>> {
    return httpClient.get<PaginatedResponse<ApprovalInstance>>(
      `${APPROVALS}/mine${buildQuery(params ?? {})}`,
    );
  },

  /** @contract UX-APROV-001 — GET /approvals/pending-count */
  getPendingCount(): Promise<PendingCountResponse> {
    return httpClient.get<PendingCountResponse>(`${APPROVALS}/pending-count`);
  },

  /** @contract UX-APROV-001 — POST /movements/:id/approve */
  approveMovement(id: string, data: ApproveRequest): Promise<Movement> {
    return httpClient.post<Movement>(`${MOVEMENTS}/${id}/approve`, data, {
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /** @contract UX-APROV-001 — POST /movements/:id/reject */
  rejectMovement(id: string, data: RejectRequest): Promise<Movement> {
    return httpClient.post<Movement>(`${MOVEMENTS}/${id}/reject`, data, {
      idempotencyKey: crypto.randomUUID(),
    });
  },
};
