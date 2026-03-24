/**
 * @contract DOC-GNP-00, EX-OAS-001
 *
 * Shared Zod schemas for the MCP Automation module (MOD-010).
 * Pagination, Problem Details, UUID params.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Headers
// ---------------------------------------------------------------------------
export const correlationIdHeader = z.object({
  'x-correlation-id': z.string().uuid().optional(),
});

export const idempotencyKeyHeader = z.object({
  'idempotency-key': z.string().min(1).max(128).optional(),
});

// ---------------------------------------------------------------------------
// Cursor-based pagination
// ---------------------------------------------------------------------------
export const paginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

export const paginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    next_cursor: z.string().nullable(),
    has_more: z.boolean(),
  });

// ---------------------------------------------------------------------------
// RFC 9457 Problem Details
// ---------------------------------------------------------------------------
export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  extensions: z
    .object({
      correlationId: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

// ---------------------------------------------------------------------------
// UUID params
// ---------------------------------------------------------------------------
export const uuidParam = z.object({
  id: z.string().uuid(),
});

export const agentActionParams = z.object({
  id: z.string().uuid(),
  actionId: z.string().uuid(),
});
