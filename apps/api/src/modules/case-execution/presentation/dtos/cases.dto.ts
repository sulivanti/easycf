/**
 * @contract FR-001..FR-014, INT-006, EX-OAS-001, SEC-006
 *
 * Zod schemas for all case-execution endpoints.
 * Single source of truth for request/response validation.
 *
 * PENDENTE-006 corrections applied:
 * - gateInstanceParam → gateParam (field: gateId instead of gateInstanceId)
 * - controlBody/controlResponse removed → separate cancel/hold/resume DTOs
 * - PATCH /assignments/:aid → updateAssignmentBody/Response added
 * - recordEventBody includes REOPENED + target_stage_id (FR-007)
 */

import { z } from 'zod';

// ─── Shared ──────────────────────────────────────────────────────────────────

export const caseStatusSchema = z.enum(['OPEN', 'COMPLETED', 'CANCELLED', 'ON_HOLD']);

export const gateResolutionStatusSchema = z.enum(['PENDING', 'RESOLVED', 'WAIVED', 'REJECTED']);

export const gateDecisionSchema = z.enum(['APPROVED', 'REJECTED', 'WAIVED']);

export const caseEventTypeSchema = z.enum([
  'COMMENT',
  'EXCEPTION',
  'REOPENED',
  'EVIDENCE',
  'REASSIGNED',
  'ON_HOLD',
  'RESUMED',
  'STAGE_TRANSITIONED',
]);

export const evidenceSchema = z.object({
  type: z.enum(['note', 'file']),
  content: z.string().optional(),
  url: z.string().url().optional(),
});

export const fileEvidenceSchema = z.object({
  type: z.literal('file'),
  url: z.string().url(),
  filename: z.string().min(1),
});

export const checklistItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  checked: z.boolean(),
});

export const paginationMeta = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});

// ─── Params ──────────────────────────────────────────────────────────────────

export const caseIdParam = z.object({
  id: z.string().uuid(),
});

/** PENDENTE-006 fix: :gateId instead of :gateInstanceId */
export const gateParam = z.object({
  id: z.string().uuid(),
  gateId: z.string().uuid(),
});

/** PENDENTE-006 fix: :aid param for PATCH /assignments/:aid */
export const assignmentIdParam = z.object({
  id: z.string().uuid(),
  aid: z.string().uuid(),
});

// ─── POST /cases — Open Case (FR-001) ───────────────────────────────────────

export const openCaseBody = z.object({
  cycle_id: z.string().uuid(),
  object_type: z.string().max(100).optional(),
  object_id: z.string().uuid().optional(),
  org_unit_id: z.string().uuid().optional(),
});

export const openCaseResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  cycle_id: z.string().uuid(),
  cycle_version_id: z.string().uuid(),
  current_stage_id: z.string().uuid(),
  status: caseStatusSchema,
  object_type: z.string().nullable(),
  object_id: z.string().uuid().nullable(),
  org_unit_id: z.string().uuid().nullable(),
  opened_by: z.string().uuid(),
  opened_at: z.string().datetime(),
});

// ─── POST /cases/:id/transition — Transition Stage (FR-002) ─────────────────

export const transitionBody = z.object({
  transition_id: z.string().uuid(),
  evidence: evidenceSchema.optional(),
  motivo: z.string().max(1000).optional(),
});

export const transitionResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  current_stage_id: z.string().uuid(),
  status: caseStatusSchema,
  stage_history_entry: z.object({
    id: z.string().uuid(),
    from_stage_id: z.string().uuid(),
    to_stage_id: z.string().uuid(),
  }),
  new_gate_instances: z.array(
    z.object({
      id: z.string().uuid(),
      gate_id: z.string().uuid(),
      status: z.literal('PENDING'),
    }),
  ),
});

// ─── POST /cases/:id/cancel — Cancel Case (FR-003) ──────────────────────────

export const cancelBody = z.object({
  motivo: z.string().min(1).max(1000),
});

export const cancelResponse = z.object({
  previous_status: caseStatusSchema,
  new_status: z.literal('CANCELLED'),
});

// ─── POST /cases/:id/hold — Hold Case (FR-003) ──────────────────────────────

export const holdBody = z.object({
  motivo: z.string().max(1000).optional(),
});

export const holdResponse = z.object({
  previous_status: caseStatusSchema,
  new_status: z.literal('ON_HOLD'),
});

// ─── POST /cases/:id/resume — Resume Case (FR-003) ──────────────────────────

export const resumeResponse = z.object({
  previous_status: z.literal('ON_HOLD'),
  new_status: z.literal('OPEN'),
});

// ─── POST /cases/:id/gates/:gateId/resolve — Resolve Gate (FR-004) ──────────

export const resolveGateBody = z.object({
  decision: gateDecisionSchema.optional(),
  parecer: z.string().max(2000).optional(),
  evidence: fileEvidenceSchema.optional(),
  checklist_items: z.array(checklistItemSchema).optional(),
});

export const resolveGateResponse = z.object({
  id: z.string().uuid(),
  gate_id: z.string().uuid(),
  status: gateResolutionStatusSchema,
  decision: gateDecisionSchema.nullable(),
  resolved_by: z.string().uuid(),
  resolved_at: z.string().datetime(),
});

// ─── POST /cases/:id/gates/:gateId/waive — Waive Gate (FR-005) ──────────────

export const waiveGateBody = z.object({
  motivo: z.string().min(20).max(2000),
});

export const waiveGateResponse = z.object({
  id: z.string().uuid(),
  gate_id: z.string().uuid(),
  status: z.literal('WAIVED'),
  resolved_by: z.string().uuid(),
  resolved_at: z.string().datetime(),
});

// ─── POST /cases/:id/assignments — Assign Responsible (FR-006) ──────────────

export const assignBody = z.object({
  process_role_id: z.string().uuid(),
  user_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  delegation_id: z.string().uuid().optional(),
  valid_until: z.string().datetime().optional(),
});

export const assignResponse = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  process_role_id: z.string().uuid(),
  user_id: z.string().uuid(),
  is_active: z.boolean(),
  assigned_at: z.string().datetime(),
  replaced_assignment_id: z.string().uuid().nullable(),
});

// ─── PATCH /cases/:id/assignments/:aid — Update Assignment (FR-006) ─────────

export const updateAssignmentBody = z.object({
  valid_until: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
  substitution_reason: z.string().max(500).optional(),
});

export const updateAssignmentResponse = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  process_role_id: z.string().uuid(),
  user_id: z.string().uuid(),
  is_active: z.boolean(),
  assigned_at: z.string().datetime(),
  valid_until: z.string().datetime().nullable(),
});

// ─── POST /cases/:id/events — Record Event (FR-007) ─────────────────────────

export const recordEventBody = z.object({
  event_type: z.enum(['COMMENT', 'EXCEPTION', 'EVIDENCE', 'REOPENED']),
  descricao: z.string().min(1).max(2000),
  metadata: z.record(z.unknown()).optional(),
  target_stage_id: z.string().uuid().optional(),
});

export const recordEventResponse = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  event_type: caseEventTypeSchema,
  descricao: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  stage_id: z.string().uuid(),
});

// ─── GET /cases/:id/timeline — Timeline (FR-008) ────────────────────────────

export const timelineEntryResponse = z.object({
  type: z.enum(['STAGE_CHANGE', 'GATE_RESOLVED', 'EVENT']),
  timestamp: z.string().datetime(),
  actor: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  description: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const timelineResponse = z.object({
  case_id: z.string().uuid(),
  timeline: z.array(timelineEntryResponse),
});

// ─── GET /cases — List Cases (FR-009) ────────────────────────────────────────

export const listCasesQuery = z.object({
  cycle_id: z.string().uuid().optional(),
  status: caseStatusSchema.optional(),
  stage_id: z.string().uuid().optional(),
  object_id: z.string().uuid().optional(),
  assigned_to_me: z.enum(['true', 'false']).optional(),
  opened_after: z.string().datetime().optional(),
  opened_before: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const caseListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  cycle_name: z.string(),
  current_stage_name: z.string(),
  status: caseStatusSchema,
  pending_gates_count: z.number().int(),
  my_role: z.string().nullable(),
  opened_at: z.string().datetime(),
});

export const listCasesResponse = z.object({
  items: z.array(caseListItem),
  nextCursor: z.string().nullable(),
  totalEstimate: z.number().int(),
});

// ─── GET /cases/:id — Case Details (FR-010) ─────────────────────────────────

export const caseDetailResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  cycle_id: z.string().uuid(),
  cycle_version_id: z.string().uuid(),
  current_stage_id: z.string().uuid(),
  status: caseStatusSchema,
  object_type: z.string().nullable(),
  object_id: z.string().uuid().nullable(),
  org_unit_id: z.string().uuid().nullable(),
  opened_by: z.string().uuid(),
  opened_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  cancelled_at: z.string().datetime().nullable(),
  cancellation_reason: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  current_stage_gates: z.array(
    z.object({
      gate_instance_id: z.string().uuid(),
      gate_id: z.string().uuid(),
      stage_id: z.string().uuid(),
      status: gateResolutionStatusSchema,
      decision: gateDecisionSchema.nullable(),
      parecer: z.string().nullable(),
    }),
  ),
  active_assignments: z.array(
    z.object({
      id: z.string().uuid(),
      case_id: z.string().uuid(),
      stage_id: z.string().uuid(),
      process_role_id: z.string().uuid(),
      user_id: z.string().uuid(),
      assigned_by: z.string().uuid(),
      assigned_at: z.string().datetime(),
      valid_until: z.string().datetime().nullable(),
      is_active: z.boolean(),
    }),
  ),
});

// ─── GET /cases/:id/gates — List Gates (FR-011) ─────────────────────────────

export const listGatesQuery = z.object({
  stage_id: z.string().uuid().optional(),
});

export const gateInstanceItem = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  gate_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  status: gateResolutionStatusSchema,
  resolved_by: z.string().uuid().nullable(),
  resolved_at: z.string().datetime().nullable(),
  decision: gateDecisionSchema.nullable(),
  parecer: z.string().nullable(),
});

export const listGatesResponse = z.object({
  data: z.array(gateInstanceItem),
});

// ─── GET /cases/:id/assignments — List Assignments (FR-012) ─────────────────

export const assignmentItem = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  process_role_id: z.string().uuid(),
  user_id: z.string().uuid(),
  assigned_by: z.string().uuid(),
  assigned_at: z.string().datetime(),
  valid_until: z.string().datetime().nullable(),
  is_active: z.boolean(),
  delegation_id: z.string().uuid().nullable(),
});

export const listAssignmentsResponse = z.object({
  data: z.array(assignmentItem),
});

// ─── GET /cases/:id/events — List Events (FR-013) ───────────────────────────

export const eventItem = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  event_type: caseEventTypeSchema,
  descricao: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  stage_id: z.string().uuid(),
  metadata: z.record(z.unknown()).nullable(),
});

export const listEventsResponse = z.object({
  data: z.array(eventItem),
});
