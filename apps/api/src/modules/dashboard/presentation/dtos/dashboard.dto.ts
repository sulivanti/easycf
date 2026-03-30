/**
 * @contract UX-DASH-001
 * Dashboard API response DTOs (Zod schemas).
 */

import { z } from 'zod';

export const metricsResponseSchema = z.object({
  active_cases: z.number().int(),
  pending_approvals: z.number().int(),
  active_users: z.number().int(),
  active_agents: z.number().int(),
});

export const statusDistributionItemSchema = z.object({
  label: z.string(),
  value: z.number().int(),
  color: z.string(),
});

export const statusDistributionResponseSchema = z.object({
  data: z.array(statusDistributionItemSchema),
  total: z.number().int(),
});

export const activityItemSchema = z.object({
  id: z.string().uuid(),
  dot_color: z.string(),
  actor: z.string(),
  description: z.string(),
  badge: z
    .object({
      code: z.string(),
      variant: z.string().optional(),
    })
    .optional(),
  timestamp: z.string(),
});

export const activitiesResponseSchema = z.object({
  data: z.array(activityItemSchema),
});
