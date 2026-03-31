/**
 * @contract FR-007, BR-013, BR-014, BR-017, EX-OAS-001
 *
 * Zod schemas for departments endpoints (MOD-003 F05).
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /api/v1/departments
// ---------------------------------------------------------------------------
export const createDepartmentBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato de cor inválido. Use o formato #RRGGBB.')
    .nullable()
    .optional(),
});

export const createDepartmentResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  cor: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/departments/:id
// ---------------------------------------------------------------------------
export const updateDepartmentBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato de cor inválido. Use o formato #RRGGBB.')
    .nullable()
    .optional(),
  /** @contract BR-014 — Will be rejected by use case if present */
  codigo: z.string().optional(),
});

export const updateDepartmentResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  cor: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/departments/:id (detail)
// ---------------------------------------------------------------------------
export const departmentDetailResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  cor: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/departments (list)
// ---------------------------------------------------------------------------
export const departmentsListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).default('ACTIVE'),
  search: z.string().max(200).optional(),
});

export const departmentListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  status: z.string(),
  cor: z.string().nullable(),
  created_at: z.string(),
});
