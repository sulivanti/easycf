/**
 * @contract DATA-002, FR-007, UX-002, SEC-001-M01
 * MOD-003 F05 types: DTOs, view-models, permissions, copy constants.
 * Consolidates all domain logic into a single types module (Pattern A).
 */

// ── Status ──────────────────────────────────────────────────

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

// ── List item (GET /departments) ────────────────────────────

export interface DepartmentListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  status: DepartmentStatus;
  cor: string | null;
  created_at: string;
}

// ── Detail (GET /departments/:id) ───────────────────────────

export interface DepartmentDetailDTO {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  status: DepartmentStatus;
  cor: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Create request (POST /departments) ──────────────────────

export interface CreateDepartmentRequest {
  codigo: string;
  nome: string;
  descricao?: string | null;
  cor?: string | null;
}

// ── Update request (PATCH /departments/:id) ─────────────────

export interface UpdateDepartmentRequest {
  nome?: string;
  descricao?: string | null;
  cor?: string | null;
}

// ── Filters (GET /departments?...) ──────────────────────────

export interface DepartmentFilters {
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  search?: string;
  cursor?: string;
  limit?: number;
}

// ── Permissions ─────────────────────────────────────────────

export function canReadDepartments(scopes: readonly string[]): boolean {
  return scopes.includes('org:dept:read');
}

export function canWriteDepartments(scopes: readonly string[]): boolean {
  return scopes.includes('org:dept:write');
}

export function canDeleteDepartments(scopes: readonly string[]): boolean {
  return scopes.includes('org:dept:delete');
}

// ── Copy catalog (UX-002) ───────────────────────────────────

export const DEPT_COPY = {
  create_success: 'Departamento criado com sucesso.',
  update_success: 'Departamento atualizado com sucesso.',
  delete_success: 'Departamento desativado com sucesso.',
  restore_success: 'Departamento restaurado com sucesso.',
  conflict_codigo: "Já existe um departamento com o código '{codigo}' neste tenant.",
  immutable_codigo: "O campo 'código' não pode ser alterado.",
  cor_invalida: 'Formato de cor inválido. Use o formato #RRGGBB.',
  empty_state: 'Nenhum departamento cadastrado.',
  empty_search: "Nenhum resultado para '{search}'.",
  error_generic: 'Erro interno. Tente novamente.',
  error_network: 'Erro de conexão. Verifique sua internet.',
  error_forbidden: 'Você não tem permissão para esta ação.',
  confirm_deactivate: 'Deseja desativar o departamento **{nome}**? Ele poderá ser restaurado posteriormente.',
} as const;

// ── Color helpers ───────────────────────────────────────────

export const DEFAULT_SWATCHES = [
  '#2E86C1',
  '#27AE60',
  '#E74C3C',
  '#F39C12',
  '#8E44AD',
  '#1ABC9C',
  '#E67E22',
  '#34495E',
] as const;

export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(value: string | null | undefined): boolean {
  if (!value) return true; // null/undefined is valid (optional)
  return HEX_COLOR_REGEX.test(value);
}

// ── Status badge ────────────────────────────────────────────

export function getStatusBadge(status: DepartmentStatus) {
  return status === 'ACTIVE'
    ? { label: 'ATIVO', color: 'text-[#1E7A42]', bg: 'bg-[#E8F8EF]', border: 'border-[#B5E8C9]' }
    : { label: 'INATIVO', color: 'text-[#888888]', bg: 'bg-[#F5F5F3]', border: 'border-[#E8E8E6]' };
}
