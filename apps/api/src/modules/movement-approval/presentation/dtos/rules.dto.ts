/**
 * @contract DATA-009, EX-OAS-001
 *
 * Zod schemas for movement-approval control rules and approval rules endpoints.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const controlRuleStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const criteriaTypeSchema = z.enum(['VALUE', 'HIERARCHY', 'ORIGIN', 'OBJECT']);

export const originTypeSchema = z.enum(['HUMAN', 'API', 'MCP', 'AGENT']);

export const approverTypeSchema = z.enum(['ROLE', 'USER', 'SCOPE']);

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------
export const controlRuleIdParam = z.object({
  id: z.string().uuid(),
});

export const approvalRuleIdParam = z.object({
  id: z.string().uuid(),
});

export const controlRuleApprovalRuleParams = z.object({
  controlRuleId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// GET /control-rules — List Control Rules
// ---------------------------------------------------------------------------
export const listControlRulesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: controlRuleStatusSchema.optional(),
  object_type: z.string().max(100).optional(),
});

export const controlRuleItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  object_type: z.string(),
  operation_type: z.string(),
  origin_types: z.array(originTypeSchema),
  criteria_type: criteriaTypeSchema,
  value_threshold: z.string().nullable(),
  priority: z.number().int(),
  status: controlRuleStatusSchema,
  valid_from: z.string().datetime().nullable(),
  valid_until: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const listControlRulesResponse = z.object({
  data: z.array(controlRuleItem),
  page: z.number().int(),
  page_size: z.number().int(),
  total: z.number().int(),
  total_pages: z.number().int(),
});

// ---------------------------------------------------------------------------
// POST /control-rules — Create Control Rule
// ---------------------------------------------------------------------------
export const createControlRuleBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).optional(),
  object_type: z.string().min(1).max(100),
  operation_type: z.string().min(1).max(100),
  origin_types: z.array(originTypeSchema).min(1),
  criteria_type: criteriaTypeSchema,
  value_threshold: z.string().optional(),
  priority: z.number().int().min(0).default(0),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
});

export const createControlRuleResponse = controlRuleItem;

// ---------------------------------------------------------------------------
// PATCH /control-rules/:id — Update Control Rule
// ---------------------------------------------------------------------------
export const updateControlRuleBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  origin_types: z.array(originTypeSchema).min(1).optional(),
  criteria_type: criteriaTypeSchema.optional(),
  value_threshold: z.string().nullable().optional(),
  priority: z.number().int().min(0).optional(),
  status: controlRuleStatusSchema.optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
});

export const updateControlRuleResponse = controlRuleItem;

// ---------------------------------------------------------------------------
// POST /control-rules/:controlRuleId/approval-rules — Create Approval Rule
// ---------------------------------------------------------------------------
export const createApprovalRuleBody = z.object({
  level: z.number().int().min(1),
  approver_type: approverTypeSchema,
  approver_value: z.string().min(1).max(200),
  required_scope: z.string().max(200).optional(),
  allow_self_approve: z.boolean().optional().default(false),
  timeout_minutes: z.number().int().min(1).optional().default(1440),
  escalation_rule_id: z.string().uuid().optional(),
});

export const approvalRuleItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  control_rule_id: z.string().uuid(),
  level: z.number().int(),
  approver_type: approverTypeSchema,
  approver_value: z.string(),
  required_scope: z.string().nullable(),
  allow_self_approve: z.boolean(),
  timeout_minutes: z.number().int(),
  escalation_rule_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createApprovalRuleResponse = approvalRuleItem;

// ---------------------------------------------------------------------------
// PATCH /approval-rules/:id — Update Approval Rule
// ---------------------------------------------------------------------------
export const updateApprovalRuleBody = z.object({
  level: z.number().int().min(1).optional(),
  approver_type: approverTypeSchema.optional(),
  approver_value: z.string().min(1).max(200).optional(),
  required_scope: z.string().max(200).nullable().optional(),
  allow_self_approve: z.boolean().optional(),
  timeout_minutes: z.number().int().min(1).optional(),
  escalation_rule_id: z.string().uuid().nullable().optional(),
});

export const updateApprovalRuleResponse = approvalRuleItem;
