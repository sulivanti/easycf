/**
 * @contract INT-005, EX-OAS-001, DATA-005, FR-001..FR-011
 *
 * Zod schemas for Process Modeling endpoints (MOD-005).
 * 26 endpoints across cycles, macro-stages, stages, gates, roles, transitions, flow.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const cycleStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'DEPRECATED']);
export const gateTypeEnum = z.enum(['APPROVAL', 'DOCUMENT', 'CHECKLIST', 'INFORMATIVE']);

// ---------------------------------------------------------------------------
// Param schemas
// ---------------------------------------------------------------------------
export const cycleIdParam = z.object({ id: z.string().uuid() });
export const macroStageIdParam = z.object({ mid: z.string().uuid() });
export const stageIdParam = z.object({ sid: z.string().uuid() });
export const gateIdParam = z.object({ id: z.string().uuid() });
export const roleIdParam = z.object({ id: z.string().uuid() });
export const transitionIdParam = z.object({ id: z.string().uuid() });
export const stageRoleParams = z.object({
  sid: z.string().uuid(),
  rid: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// POST /admin/cycles — Create cycle (FR-001)
// ---------------------------------------------------------------------------
export const createCycleBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
});

export const cycleResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  version: z.number().int(),
  status: cycleStatusEnum,
  parent_cycle_id: z.string().uuid().nullable(),
  published_at: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/cycles/:id — Update cycle (FR-001)
// ---------------------------------------------------------------------------
export const updateCycleBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
});

// ---------------------------------------------------------------------------
// GET /admin/cycles — List cycles (FR-001, INT-005 §1.9)
// ---------------------------------------------------------------------------
export const cyclesListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: cycleStatusEnum.optional(),
});

export const cycleListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  version: z.number().int(),
  status: cycleStatusEnum,
  published_at: z.string().nullable(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// POST /admin/cycles/:cid/macro-stages — Create macro-stage (FR-005)
// ---------------------------------------------------------------------------
export const createMacroStageBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  ordem: z.number().int().min(1),
});

export const macroStageResponse = z.object({
  id: z.string().uuid(),
  cycle_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/macro-stages/:id — Update macro-stage (FR-005)
// ---------------------------------------------------------------------------
export const updateMacroStageBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  ordem: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// POST /admin/macro-stages/:mid/stages — Create stage (FR-006)
// ---------------------------------------------------------------------------
export const createStageBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
  ordem: z.number().int().min(1),
  is_initial: z.boolean().default(false),
  is_terminal: z.boolean().default(false),
  canvas_x: z.number().int().nullable().optional(),
  canvas_y: z.number().int().nullable().optional(),
});

export const stageResponse = z.object({
  id: z.string().uuid(),
  macro_stage_id: z.string().uuid(),
  cycle_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  ordem: z.number().int(),
  is_initial: z.boolean(),
  is_terminal: z.boolean(),
  canvas_x: z.number().int().nullable(),
  canvas_y: z.number().int().nullable(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/stages/:id — Update stage (FR-006)
// ---------------------------------------------------------------------------
export const updateStageBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  ordem: z.number().int().min(1).optional(),
  is_initial: z.boolean().optional(),
  is_terminal: z.boolean().optional(),
  canvas_x: z.number().int().nullable().optional(),
  canvas_y: z.number().int().nullable().optional(),
});

// ---------------------------------------------------------------------------
// GET /admin/stages/:id — Stage detail (FR-006)
// ---------------------------------------------------------------------------
export const stageDetailGate = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  gate_type: gateTypeEnum,
  required: z.boolean(),
  ordem: z.number().int(),
});

export const stageDetailRole = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  role_id: z.string().uuid(),
  required: z.boolean(),
  max_assignees: z.number().int().nullable(),
});

export const stageDetailTransition = z.object({
  id: z.string().uuid(),
  to_stage_id: z.string().uuid(),
  to_stage_codigo: z.string(),
  nome: z.string(),
  gate_required: z.boolean(),
  evidence_required: z.boolean(),
});

export const stageDetailResponse = stageResponse.extend({
  gates: z.array(stageDetailGate),
  roles: z.array(stageDetailRole),
  transitions_out: z.array(stageDetailTransition),
});

// ---------------------------------------------------------------------------
// POST /admin/stages/:sid/gates — Create gate (FR-007)
// ---------------------------------------------------------------------------
export const createGateBody = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
  gate_type: gateTypeEnum,
  required: z.boolean().default(true),
  ordem: z.number().int().min(1),
});

export const gateResponse = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  gate_type: gateTypeEnum,
  required: z.boolean(),
  ordem: z.number().int(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/gates/:id — Update gate (FR-007)
// ---------------------------------------------------------------------------
export const updateGateBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  gate_type: gateTypeEnum.optional(),
  required: z.boolean().optional(),
  ordem: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// POST /admin/stages/:sid/roles — Link role (FR-009)
// ---------------------------------------------------------------------------
export const linkStageRoleBody = z.object({
  role_id: z.string().uuid(),
  required: z.boolean().default(false),
  max_assignees: z.number().int().min(1).nullable().optional(),
});

export const stageRoleLinkResponse = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  role_id: z.string().uuid(),
  required: z.boolean(),
  max_assignees: z.number().int().nullable(),
});

// ---------------------------------------------------------------------------
// POST /admin/stage-transitions — Create transition (FR-010)
// ---------------------------------------------------------------------------
export const createTransitionBody = z.object({
  from_stage_id: z.string().uuid(),
  to_stage_id: z.string().uuid(),
  nome: z.string().min(1).max(100),
  condicao: z.string().max(2000).nullable().optional(),
  gate_required: z.boolean().default(false),
  evidence_required: z.boolean().default(false),
  allowed_roles: z.array(z.string().uuid()).nullable().optional(),
});

export const transitionResponse = z.object({
  id: z.string().uuid(),
  from_stage_id: z.string().uuid(),
  to_stage_id: z.string().uuid(),
  nome: z.string(),
  condicao: z.string().nullable(),
  gate_required: z.boolean(),
  evidence_required: z.boolean(),
  allowed_roles: z.array(z.string()).nullable(),
});

// ---------------------------------------------------------------------------
// GET/POST/PATCH/DELETE /admin/process-roles — Global catalog (FR-008)
// ---------------------------------------------------------------------------
export const processRolesListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createProcessRoleBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(100),
  descricao: z.string().max(2000).nullable().optional(),
  can_approve: z.boolean().default(false),
});

export const updateProcessRoleBody = z.object({
  nome: z.string().min(1).max(100).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  can_approve: z.boolean().optional(),
});

export const processRoleResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  can_approve: z.boolean(),
});

export const processRoleListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  can_approve: z.boolean(),
});

// ---------------------------------------------------------------------------
// GET /admin/cycles/:id/flow — Full graph (FR-011, INT-005 §3)
// ---------------------------------------------------------------------------
export const flowGateItem = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  gate_type: gateTypeEnum,
  required: z.boolean(),
  ordem: z.number().int(),
});

export const flowRoleItem = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
  role_id: z.string().uuid(),
  required: z.boolean(),
  max_assignees: z.number().int().nullable(),
});

export const flowTransitionItem = z.object({
  id: z.string().uuid(),
  to_stage_id: z.string().uuid(),
  to_stage_codigo: z.string(),
  nome: z.string(),
  gate_required: z.boolean(),
  evidence_required: z.boolean(),
  allowed_roles: z.array(z.string()).nullable(),
});

export const flowStageItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
  is_initial: z.boolean(),
  is_terminal: z.boolean(),
  canvas_x: z.number().int().nullable(),
  canvas_y: z.number().int().nullable(),
  gates: z.array(flowGateItem),
  roles: z.array(flowRoleItem),
  transitions_out: z.array(flowTransitionItem),
});

export const flowMacroStageItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
  stages: z.array(flowStageItem),
});

export const flowResponse = z.object({
  cycle: z.object({
    id: z.string().uuid(),
    codigo: z.string(),
    nome: z.string(),
    version: z.number().int(),
    status: cycleStatusEnum,
  }),
  macro_stages: z.array(flowMacroStageItem),
});
