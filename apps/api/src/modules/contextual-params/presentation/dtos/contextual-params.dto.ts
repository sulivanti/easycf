/**
 * @contract EX-OAS-001, DATA-007, FR-001..FR-010, INT-007
 *
 * Zod schemas for all 25 endpoints of MOD-007 (Contextual Params).
 * Reuses Foundation common DTOs for pagination and UUID params.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Framer Types (FR-001)
// ---------------------------------------------------------------------------

export const createFramerTypeBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().optional(),
});

export const framerTypeResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const framerTypeListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// Framers (FR-002)
// ---------------------------------------------------------------------------

export const createFramerBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  framer_type_id: z.string().uuid(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().optional(),
});

export const updateFramerBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().nullable().optional(),
});

export const framerResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  framer_type_id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  version: z.number().int(),
  valid_from: z.string(),
  valid_until: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const framerListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  framer_type_id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  valid_from: z.string(),
  valid_until: z.string().nullable(),
  created_at: z.string(),
});

export const framerListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  framer_type_id: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Target Objects & Fields (FR-003)
// ---------------------------------------------------------------------------

export const createTargetObjectBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  modulo_ecf: z.string().max(20).optional(),
  descricao: z.string().optional(),
});

export const targetObjectResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  modulo_ecf: z.string().nullable(),
  descricao: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const targetObjectListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  modulo_ecf: z.string().nullable(),
  created_at: z.string(),
});

export const createTargetFieldBody = z.object({
  field_key: z.string().min(1).max(100),
  field_label: z.string().max(200).optional(),
  field_type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'FILE']),
  is_system: z.boolean().default(false),
});

export const targetFieldResponse = z.object({
  id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  field_key: z.string(),
  field_label: z.string().nullable(),
  field_type: z.string(),
  is_system: z.boolean(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// Incidence Rules (FR-004, FR-010)
// ---------------------------------------------------------------------------

export const createIncidenceRuleBody = z.object({
  framer_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  condition_expr: z.string().optional(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().optional(),
});

export const updateIncidenceRuleBody = z.object({
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const incidenceRuleResponse = z.object({
  id: z.string().uuid(),
  framer_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  condition_expr: z.string().nullable(),
  valid_from: z.string(),
  valid_until: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  created_at: z.string(),
  updated_at: z.string(),
});

export const incidenceRuleListItem = z.object({
  id: z.string().uuid(),
  framer_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  valid_from: z.string(),
  valid_until: z.string().nullable(),
  created_at: z.string(),
});

export const incidenceRuleListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  framer_id: z.string().uuid().optional(),
  target_object_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const linkRoutineBody = z.object({
  routine_id: z.string().uuid(),
});

export const linkRoutineResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  incidence_rule_id: z.string().uuid(),
  created_at: z.string(),
});

export const unlinkRoutineParams = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Routines (FR-005, FR-007, FR-008)
// ---------------------------------------------------------------------------

export const createRoutineBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  routine_type: z.enum(['BEHAVIOR', 'INTEGRATION']).default('BEHAVIOR'),
});

export const updateRoutineBody = z.object({
  nome: z.string().min(1).max(200).optional(),
});

export const publishRoutineBody = z.object({
  auto_deprecate_previous: z.boolean().default(false),
});

export const forkRoutineBody = z.object({
  change_reason: z.string().min(10),
});

export const routineResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  routine_type: z.enum(['BEHAVIOR', 'INTEGRATION']),
  version: z.number().int(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'DEPRECATED']),
  parent_routine_id: z.string().uuid().nullable(),
  published_at: z.string().nullable(),
  approved_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const routineListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  routine_type: z.enum(['BEHAVIOR', 'INTEGRATION']),
  version: z.number().int(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'DEPRECATED']),
  published_at: z.string().nullable(),
  created_at: z.string(),
});

export const routineListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PUBLISHED', 'DEPRECATED']).optional(),
  routine_type: z.enum(['BEHAVIOR', 'INTEGRATION']).optional(),
});

export const routineDetailResponse = routineResponse.extend({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      item_type: z.string(),
      target_field_id: z.string().uuid().nullable(),
      action: z.string(),
      value: z.unknown().nullable(),
      validation_message: z.string().nullable(),
      is_blocking: z.boolean(),
      ordem: z.number().int(),
    }),
  ),
  incidence_links: z.array(
    z.object({
      id: z.string().uuid(),
      incidence_rule_id: z.string().uuid(),
      created_at: z.string(),
    }),
  ),
  version_history: z.array(
    z.object({
      id: z.string().uuid(),
      previous_version_id: z.string().uuid(),
      changed_by: z.string().uuid(),
      change_reason: z.string(),
      changed_at: z.string(),
    }),
  ),
});

export const forkRoutineResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  version: z.number().int(),
  status: z.literal('DRAFT'),
  parent_routine_id: z.string().uuid(),
  items_copied: z.number().int(),
  links_copied: z.number().int(),
});

export const publishRoutineResponse = z.object({
  id: z.string().uuid(),
  status: z.literal('PUBLISHED'),
  published_at: z.string(),
  deprecated_parent_id: z.string().uuid().nullable(),
});

// ---------------------------------------------------------------------------
// Routine Items (FR-006)
// ---------------------------------------------------------------------------

export const createRoutineItemBody = z.object({
  item_type: z.enum([
    'FIELD_VISIBILITY',
    'REQUIRED',
    'DEFAULT',
    'DOMAIN',
    'DERIVATION',
    'VALIDATION',
    'EVIDENCE',
  ]),
  action: z.enum([
    'SHOW',
    'HIDE',
    'SET_REQUIRED',
    'SET_OPTIONAL',
    'SET_DEFAULT',
    'RESTRICT_DOMAIN',
    'VALIDATE',
    'REQUIRE_EVIDENCE',
  ]),
  target_field_id: z.string().uuid().optional(),
  value: z.unknown().optional(),
  condition_expr: z.string().optional(),
  validation_message: z.string().max(500).optional(),
  is_blocking: z.boolean().default(false),
  ordem: z.number().int().min(0),
});

export const updateRoutineItemBody = z.object({
  item_type: z
    .enum([
      'FIELD_VISIBILITY',
      'REQUIRED',
      'DEFAULT',
      'DOMAIN',
      'DERIVATION',
      'VALIDATION',
      'EVIDENCE',
    ])
    .optional(),
  action: z
    .enum([
      'SHOW',
      'HIDE',
      'SET_REQUIRED',
      'SET_OPTIONAL',
      'SET_DEFAULT',
      'RESTRICT_DOMAIN',
      'VALIDATE',
      'REQUIRE_EVIDENCE',
    ])
    .optional(),
  target_field_id: z.string().uuid().nullable().optional(),
  value: z.unknown().optional(),
  condition_expr: z.string().nullable().optional(),
  validation_message: z.string().max(500).nullable().optional(),
  is_blocking: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});

export const routineItemResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  item_type: z.string(),
  action: z.string(),
  target_field_id: z.string().uuid().nullable(),
  value: z.unknown().nullable(),
  validation_message: z.string().nullable(),
  is_blocking: z.boolean(),
  ordem: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// Evaluate Engine (FR-009, INT-001)
// ---------------------------------------------------------------------------

export const evaluateRequestBody = z.object({
  object_type: z.string().min(1),
  object_id: z.string().uuid().optional(),
  context: z
    .array(
      z.object({
        framer_id: z.string().uuid(),
      }),
    )
    .min(1, 'context array não pode ser vazio'),
  stage_id: z.string().uuid().optional(),
  dry_run: z.boolean().default(false),
});

export const evaluateResponse = z.object({
  visible_fields: z.array(z.string()),
  hidden_fields: z.array(z.string()),
  required_fields: z.array(z.string()),
  optional_fields: z.array(z.string()),
  defaults: z.array(z.object({ field_id: z.string(), value: z.unknown() })),
  domain_restrictions: z.array(z.object({ field_id: z.string(), allowed_values: z.unknown() })),
  validations: z.array(z.object({ field_id: z.string(), message: z.string().nullable() })),
  blocking_validations: z.array(z.string()),
  applied_routines: z.array(
    z.object({
      routine_id: z.string().uuid(),
      codigo: z.string(),
      version: z.number().int(),
    }),
  ),
  dry_run: z.boolean(),
});
