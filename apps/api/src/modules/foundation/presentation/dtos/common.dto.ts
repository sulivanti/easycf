/**
 * @contract EX-OAS-001, DOC-GNP-00, FR-013
 *
 * Shared Zod schemas for pagination, Problem Details (RFC 9457),
 * and common request headers.
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
// Pagination (cursor-based)
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
// Problem Details — RFC 9457
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
// UUID param
// ---------------------------------------------------------------------------
export const uuidParam = z.object({
  id: z.string().uuid(),
});

export const tenantIdParam = z.object({
  tenantId: z.string().uuid(),
});

export const tenantUserParams = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
});
