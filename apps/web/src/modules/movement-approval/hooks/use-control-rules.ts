/**
 * @contract UX-APROV-002, FR-001, FR-002
 *
 * React Query hooks for control rule CRUD and approval rule CRUD.
 * queryKey: ['movement-approval', 'control-rules', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movementApprovalApi } from '../api/movement-approval.api.js';
import type {
  CreateControlRuleRequest,
  UpdateControlRuleRequest,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
} from '../types/movement-approval.types.js';

export const CONTROL_RULES_KEY = ['movement-approval', 'control-rules'] as const;
export const CONTROL_RULE_DETAIL_KEY = ['movement-approval', 'control-rule-detail'] as const;

/** @contract FR-001 — GET /admin/control-rules */
export function useControlRules(params?: { is_active?: boolean }) {
  return useQuery({
    queryKey: [...CONTROL_RULES_KEY, params],
    queryFn: () => movementApprovalApi.listControlRules(params),
  });
}

/** @contract FR-001 — GET /admin/control-rules/:id */
export function useControlRule(id: string | null) {
  return useQuery({
    queryKey: [...CONTROL_RULE_DETAIL_KEY, id],
    queryFn: () => movementApprovalApi.getControlRule(id!),
    enabled: !!id,
  });
}

/** @contract FR-001 — POST /admin/control-rules */
export function useCreateControlRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateControlRuleRequest) => movementApprovalApi.createControlRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY }),
  });
}

/** @contract FR-001 — PATCH /admin/control-rules/:id */
export function useUpdateControlRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateControlRuleRequest }) =>
      movementApprovalApi.updateControlRule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY });
      qc.invalidateQueries({ queryKey: CONTROL_RULE_DETAIL_KEY });
    },
  });
}

/** @contract FR-001 — DELETE /admin/control-rules/:id */
export function useDeleteControlRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => movementApprovalApi.deleteControlRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY });
      qc.invalidateQueries({ queryKey: CONTROL_RULE_DETAIL_KEY });
    },
  });
}

/** @contract FR-002 — POST /admin/control-rules/:id/approval-rules */
export function useCreateApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      controlRuleId,
      data,
    }: {
      controlRuleId: string;
      data: CreateApprovalRuleRequest;
    }) => movementApprovalApi.createApprovalRule(controlRuleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY });
      qc.invalidateQueries({ queryKey: CONTROL_RULE_DETAIL_KEY });
    },
  });
}

/** @contract FR-002 — PATCH /admin/control-rules/:ruleId/approval-rules/:id */
export function useUpdateApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      controlRuleId,
      id,
      data,
    }: {
      controlRuleId: string;
      id: string;
      data: UpdateApprovalRuleRequest;
    }) => movementApprovalApi.updateApprovalRule(controlRuleId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY });
      qc.invalidateQueries({ queryKey: CONTROL_RULE_DETAIL_KEY });
    },
  });
}

/** @contract FR-002 — DELETE /admin/control-rules/:ruleId/approval-rules/:id */
export function useDeleteApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ controlRuleId, id }: { controlRuleId: string; id: string }) =>
      movementApprovalApi.deleteApprovalRule(controlRuleId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTROL_RULES_KEY });
      qc.invalidateQueries({ queryKey: CONTROL_RULE_DETAIL_KEY });
    },
  });
}
