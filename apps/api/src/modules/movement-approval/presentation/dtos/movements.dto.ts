/**
 * @contract DATA-009, EX-OAS-001
 *
 * Zod schemas for controlled movements endpoints.
 */

import { z } from 'zod';
import { originTypeSchema } from './rules.dto.js';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const movementStatusSchema = z.enum([
  'PENDING_APPROVAL',
  'APPROVED',
  'AUTO_APPROVED',
  'REJECTED',
  'CANCELLED',
  'OVERRIDDEN',
  'EXECUTED',
  'FAILED',
]);

export const approvalInstanceStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'TIMEOUT',
  'ESCALATED',
]);

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------
export const movementIdParam = z.object({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// GET /movements — List Movements
// ---------------------------------------------------------------------------
export const listMovementsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: movementStatusSchema.optional(),
  requester_id: z.string().uuid().optional(),
});

export const movementListItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  control_rule_id: z.string().uuid(),
  codigo: z.string(),
  requester_id: z.string().uuid(),
  requester_origin: originTypeSchema,
  object_type: z.string(),
  object_id: z.string().uuid().nullable(),
  operation_type: z.string(),
  case_id: z.string().uuid().nullable(),
  current_level: z.number().int(),
  total_levels: z.number().int(),
  status: movementStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const listMovementsResponse = z.object({
  data: z.array(movementListItem),
  page: z.number().int(),
  page_size: z.number().int(),
  total: z.number().int(),
  total_pages: z.number().int(),
});

// ---------------------------------------------------------------------------
// GET /movements/:id — Movement Detail
// ---------------------------------------------------------------------------
export const approvalInstanceItem = z.object({
  id: z.string().uuid(),
  level: z.number().int(),
  approver_id: z.string().uuid().nullable(),
  status: approvalInstanceStatusSchema,
  opinion: z.string().nullable(),
  decided_at: z.string().datetime().nullable(),
  timeout_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export const historyItem = z.object({
  id: z.string().uuid(),
  event_type: z.string(),
  actor_id: z.string().uuid().nullable(),
  payload: z.record(z.unknown()).nullable(),
  correlation_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

export const movementDetailResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  control_rule_id: z.string().uuid(),
  codigo: z.string(),
  requester_id: z.string().uuid(),
  requester_origin: originTypeSchema,
  object_type: z.string(),
  object_id: z.string().uuid().nullable(),
  operation_type: z.string(),
  operation_payload: z.record(z.unknown()).nullable(),
  case_id: z.string().uuid().nullable(),
  current_level: z.number().int(),
  total_levels: z.number().int(),
  status: movementStatusSchema,
  idempotency_key: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  approval_instances: z.array(approvalInstanceItem),
  history: z.array(historyItem),
});

// ---------------------------------------------------------------------------
// POST /movements/:id/cancel — Cancel Movement
// ---------------------------------------------------------------------------
export const cancelMovementResponse = z.object({
  id: z.string().uuid(),
  status: z.literal('CANCELLED'),
  updated_at: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// POST /movements/:id/override — Override Movement
// ---------------------------------------------------------------------------
export const overrideMovementBody = z.object({
  justification: z.string().min(20).max(2000),
});

export const overrideMovementResponse = z.object({
  id: z.string().uuid(),
  status: z.literal('OVERRIDDEN'),
  updated_at: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// POST /movements/:id/retry — Retry Movement
// ---------------------------------------------------------------------------
export const retryMovementResponse = z.object({
  id: z.string().uuid(),
  status: movementStatusSchema,
  updated_at: z.string().datetime(),
});
