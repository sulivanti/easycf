/**
 * @contract FR-005..FR-010, UX-005 §3
 * React Query mutations for stage configuration panel:
 * macro-stages, stages, gates, stage-role links, transitions.
 * All mutations invalidate the flow graph on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMacroStage,
  updateMacroStage,
  deleteMacroStage,
  createStage,
  updateStage,
  deleteStage,
  createGate,
  updateGate,
  deleteGate,
  linkStageRole,
  unlinkStageRole,
  createTransition,
  deleteTransition,
} from '../api/process-modeling.api.js';
import type {
  CreateMacroStageRequest,
  UpdateMacroStageRequest,
  CreateStageRequest,
  UpdateStageRequest,
  CreateGateRequest,
  UpdateGateRequest,
  LinkStageRoleRequest,
  CreateTransitionRequest,
} from '../types/process-modeling.types.js';
import { FLOW_KEY } from './use-flow.js';
import { CYCLES_KEY } from './use-cycles.js';

function useInvalidateFlow() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: FLOW_KEY });
    qc.invalidateQueries({ queryKey: CYCLES_KEY });
  };
}

// ── Macro-stage mutations (FR-005) ──────────────────────────

/** @contract FR-005 — POST /admin/cycles/:cid/macro-stages */
export function useCreateMacroStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ cycleId, data }: { cycleId: string; data: CreateMacroStageRequest }) =>
      createMacroStage(cycleId, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-005 — PATCH /admin/macro-stages/:id */
export function useUpdateMacroStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMacroStageRequest }) =>
      updateMacroStage(id, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-005 — DELETE /admin/macro-stages/:id */
export function useDeleteMacroStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: (id: string) => deleteMacroStage(id),
    onSuccess: invalidate,
  });
}

// ── Stage mutations (FR-006) ────────────────────────────────

/** @contract FR-006 — POST /admin/macro-stages/:mid/stages */
export function useCreateStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ macroStageId, data }: { macroStageId: string; data: CreateStageRequest }) =>
      createStage(macroStageId, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-006 — PATCH /admin/stages/:id */
export function useUpdateStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageRequest }) => updateStage(id, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-006 — DELETE /admin/stages/:id */
export function useDeleteStage() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: (id: string) => deleteStage(id),
    onSuccess: invalidate,
  });
}

// ── Gate mutations (FR-007) ─────────────────────────────────

/** @contract FR-007 — POST /admin/stages/:sid/gates */
export function useCreateGate() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: CreateGateRequest }) =>
      createGate(stageId, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-007 — PATCH /admin/gates/:id */
export function useUpdateGate() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGateRequest }) => updateGate(id, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-007 — DELETE /admin/gates/:id */
export function useDeleteGate() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: (id: string) => deleteGate(id),
    onSuccess: invalidate,
  });
}

// ── Stage-Role link mutations (FR-009) ──────────────────────

/** @contract FR-009 — POST /admin/stages/:sid/roles */
export function useLinkStageRole() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: LinkStageRoleRequest }) =>
      linkStageRole(stageId, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-009 — DELETE /admin/stages/:sid/roles/:rid */
export function useUnlinkStageRole() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: ({ stageId, roleId }: { stageId: string; roleId: string }) =>
      unlinkStageRole(stageId, roleId),
    onSuccess: invalidate,
  });
}

// ── Transition mutations (FR-010) ───────────────────────────

/** @contract FR-010 — POST /admin/stage-transitions */
export function useCreateTransition() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: (data: CreateTransitionRequest) => createTransition(data),
    onSuccess: invalidate,
  });
}

/** @contract FR-010 — DELETE /admin/stage-transitions/:id */
export function useDeleteTransition() {
  const invalidate = useInvalidateFlow();

  return useMutation({
    mutationFn: (id: string) => deleteTransition(id),
    onSuccess: invalidate,
  });
}
