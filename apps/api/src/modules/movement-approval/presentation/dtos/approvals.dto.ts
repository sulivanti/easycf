/**
 * @contract DATA-009, EX-OAS-001
 *
 * Zod schemas for approval decision endpoints.
 */

import { z } from 'zod';
import { approvalInstanceStatusSchema, movementStatusSchema } from './movements.dto.js';
import { originTypeSchema } from './rules.dto.js';

// ---------------------------------------------------------------------------
// GET /my/approvals — List My Pending Approvals
// ---------------------------------------------------------------------------
export const listMyApprovalsQuery = z.object({
  status: approvalInstanceStatusSchema.optional(),
});

export const myApprovalItem = z.object({
  id: z.string().uuid(),
  movement_id: z.string().uuid(),
  level: z.number().int(),
  status: approvalInstanceStatusSchema,
  timeout_at: z.string().nullable(),
  created_at: z.string(),
  movement: z.object({
    id: z.string().uuid(),
    codigo: z.string(),
    requester_id: z.string().uuid(),
    requester_origin: originTypeSchema,
    object_type: z.string(),
    operation_type: z.string(),
    status: movementStatusSchema,
  }),
});

export const listMyApprovalsResponse = z.object({
  data: z.array(myApprovalItem),
});

// ---------------------------------------------------------------------------
// POST /movements/:id/approve — Approve Movement
// ---------------------------------------------------------------------------
export const approveBody = z.object({
  opinion: z.string().min(10).max(2000),
});

export const approveResponse = z.object({
  id: z.string().uuid(),
  status: movementStatusSchema,
  current_level: z.number().int(),
  total_levels: z.number().int(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// POST /movements/:id/reject — Reject Movement
// ---------------------------------------------------------------------------
export const rejectBody = z.object({
  opinion: z.string().min(10).max(2000),
});

export const rejectResponse = z.object({
  id: z.string().uuid(),
  status: z.literal('REJECTED'),
  updated_at: z.string(),
});
