/**
 * @contract FR-004, FR-010, INT-007, UX-007
 *
 * React Query hooks for incidence rules + link/unlink routine.
 * queryKey: ['contextual-params', 'incidence-rules', filters]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listIncidenceRules,
  createIncidenceRule,
  updateIncidenceRule,
  linkRoutineToRule,
  unlinkRoutineFromRule,
} from '../api/contextual-params.api.js';
import type {
  IncidenceRuleListFilters,
  CreateIncidenceRuleRequest,
  UpdateIncidenceRuleRequest,
} from '../types/contextual-params.types.js';

export const INCIDENCE_RULES_KEY = ['contextual-params', 'incidence-rules'] as const;

/** @contract FR-004 — GET /admin/incidence-rules */
export function useIncidenceRules(filters: IncidenceRuleListFilters) {
  return useQuery({
    queryKey: [...INCIDENCE_RULES_KEY, filters],
    queryFn: ({ signal }) => listIncidenceRules(filters, signal),
  });
}

/** @contract FR-004 — POST /admin/incidence-rules */
export function useCreateIncidenceRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncidenceRuleRequest) => createIncidenceRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INCIDENCE_RULES_KEY }),
  });
}

/** @contract FR-004 — PATCH /admin/incidence-rules/:id */
export function useUpdateIncidenceRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidenceRuleRequest }) =>
      updateIncidenceRule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INCIDENCE_RULES_KEY }),
  });
}

/** @contract INT-007 — POST /admin/incidence-rules/:id/link-routine */
export function useLinkRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, routineId }: { ruleId: string; routineId: string }) =>
      linkRoutineToRule(ruleId, { routine_id: routineId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: INCIDENCE_RULES_KEY }),
  });
}

/** @contract INT-007 — DELETE /admin/incidence-rules/:id/unlink-routine/:routineId */
export function useUnlinkRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, routineId }: { ruleId: string; routineId: string }) =>
      unlinkRoutineFromRule(ruleId, routineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: INCIDENCE_RULES_KEY }),
  });
}
