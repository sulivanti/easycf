/**
 * @contract DATA-009, EX-OAS-001
 *
 * Zod schemas for the movement engine evaluate endpoint.
 */

import { z } from 'zod';
import { originTypeSchema } from './rules.dto.js';

// ---------------------------------------------------------------------------
// POST /movement-engine/evaluate — Evaluate Movement
// ---------------------------------------------------------------------------
export const evaluateBody = z.object({
  object_type: z.string().min(1).max(100),
  operation_type: z.string().min(1).max(100),
  origin: originTypeSchema,
  value: z.string().optional(),
  operation_payload: z.record(z.unknown()).optional(),
  case_id: z.string().uuid().optional(),
  dry_run: z.boolean().optional().default(false),
});

export const evaluateNotControlledResponse = z.object({
  controlled: z.literal(false),
});

export const evaluateControlledResponse = z.object({
  controlled: z.literal(true),
  movement_id: z.string().uuid(),
  status: z.string(),
  levels: z.array(
    z.object({
      level: z.number().int(),
      approver_type: z.string(),
      approver_value: z.string(),
      status: z.string(),
    }),
  ),
});

export const evaluateResponse = z.discriminatedUnion('controlled', [
  evaluateNotControlledResponse,
  evaluateControlledResponse,
]);
