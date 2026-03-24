/**
 * @contract DATA-001, FR-001, FR-002, FR-003, FR-004, FR-005, UX-001, UX-002, SEC-001, BR-001..012
 * MOD-003 types: DTOs, view-models, permissions, copy constants, status badges, formatters.
 * Consolidates all domain logic into a single types module (Pattern A).
 */

// ── Status & Nivel ──────────────────────────────────────────

export type OrgUnitStatus = 'ACTIVE' | 'INACTIVE';
export type OrgUnitNivel = 1 | 2 | 3 | 4;

// ── Tenant summary (N5 link) ────────────────────────────────

export interface TenantSummaryDTO {
  tenant_id: string;
  codigo: string;
  name: string;
}

// ── Ancestor (breadcrumb) ───────────────────────────────────

export interface AncestorDTO {
  id: string;
  codigo: string;
  nome: string;
  nivel: OrgUnitNivel;
}

// ── List item (GET /org-units flat) ─────────────────────────

export interface OrgUnitListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  nivel: OrgUnitNivel;
  status: OrgUnitStatus;
  parent_id: string | null;
  created_at: string;
}

// ── Detail (GET /org-units/:id) ─────────────────────────────

export interface OrgUnitDetailDTO {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: OrgUnitNivel;
  parent_id: string | null;
  status: OrgUnitStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ancestors: AncestorDTO[];
  tenants: TenantSummaryDTO[];
}

// ── Tree node (GET /org-units/tree) — recursive ─────────────

export interface OrgUnitTreeNodeDTO {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: OrgUnitNivel;
  status: OrgUnitStatus;
  children: OrgUnitTreeNodeDTO[];
  tenants: TenantSummaryDTO[];
}

export interface OrgUnitTreeResponseDTO {
  tree: OrgUnitTreeNodeDTO[];
}

// ── Create request (POST /org-units) ────────────────────────

export interface CreateOrgUnitRequest {
  codigo: string;
  nome: string;
  descricao?: string | null;
  parent_id?: string | null;
}

// ── Create/Update response ──────────────────────────────────

export interface OrgUnitResponseDTO {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: OrgUnitNivel;
  parent_id: string | null;
  status: OrgUnitStatus;
}

// ── Update request (PATCH /org-units/:id) ───────────────────

export interface UpdateOrgUnitRequest {
  nome?: string;
  descricao?: string | null;
}

// ── Link tenant (POST /org-units/:id/tenants) ───────────────

export interface LinkTenantRequest {
  tenant_id: string;
}

export interface LinkTenantResponseDTO {
  id: string;
  org_unit_id: string;
  tenant_id: string;
  tenant_codigo: string;
}

// ── Filters (GET /org-units?...) ────────────────────────────

export interface OrgUnitFilters {
  nivel?: OrgUnitNivel;
  status?: OrgUnitStatus;
  parent_id?: string;
  search?: string;
  cursor?: string;
}

// ── Status Badge ────────────────────────────────────────────

export interface StatusBadge {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const STATUS_BADGE_MAP: Record<OrgUnitStatus, StatusBadge> = {
  ACTIVE: { label: 'Ativo', variant: 'default' },
  INACTIVE: { label: 'Inativo', variant: 'outline' },
};

export function getStatusBadge(status: OrgUnitStatus): StatusBadge {
  return STATUS_BADGE_MAP[status] ?? { label: status, variant: 'outline' };
}

// ── Level Info (UX-ORG-001) ─────────────────────────────────

export interface LevelInfo {
  label: string;
  shortLabel: string;
  icon: string;
}

const LEVEL_MAP: Record<OrgUnitNivel, LevelInfo> = {
  1: { label: 'Grupo Corporativo', shortLabel: 'N1', icon: 'building' },
  2: { label: 'Unidade', shortLabel: 'N2', icon: 'briefcase' },
  3: { label: 'Macroárea', shortLabel: 'N3', icon: 'layers' },
  4: { label: 'Subunidade Organizacional', shortLabel: 'N4', icon: 'folder' },
};

export function getLevelInfo(nivel: OrgUnitNivel): LevelInfo {
  return LEVEL_MAP[nivel] ?? { label: `Nível ${nivel}`, shortLabel: `N${nivel}`, icon: 'circle' };
}

export const TENANT_LEVEL_INFO: LevelInfo = {
  label: 'Entidade Jurídica/Estabelecimento',
  shortLabel: 'N5',
  icon: 'map-pin',
};

// ── Date formatting (pt-BR) ────────────────────────────────

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDatePtBr(isoDate: string): string {
  try {
    return DATE_FORMATTER.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatDateTimePtBr(isoDate: string): string {
  try {
    return DATETIME_FORMATTER.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ── Tree Node ViewModel (UX-ORG-001) ───────────────────────

export interface OrgUnitTreeNodeVM {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: OrgUnitNivel;
  status: OrgUnitStatus;
  statusBadge: StatusBadge;
  levelInfo: LevelInfo;
  children: OrgUnitTreeNodeVM[];
  tenants: { tenantId: string; codigo: string; name: string }[];
  childCount: number;
  isInactive: boolean;
  canExpand: boolean;
}

// ── Form ViewModel (UX-ORG-002) ────────────────────────────

export interface OrgUnitFormVM {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: OrgUnitNivel;
  parentId: string | null;
  status: OrgUnitStatus;
  statusBadge: StatusBadge;
  levelInfo: LevelInfo;
  createdAtFormatted: string;
  updatedAtFormatted: string;
  breadcrumb: { id: string; codigo: string; nome: string; nivel: OrgUnitNivel }[];
}

// ── Mappers: DTO → ViewModel ───────────────────────────────

export function toTreeNodeVM(dto: OrgUnitTreeNodeDTO): OrgUnitTreeNodeVM {
  const children = dto.children.map(toTreeNodeVM);
  return {
    id: dto.id,
    codigo: dto.codigo,
    nome: dto.nome,
    descricao: dto.descricao,
    nivel: dto.nivel,
    status: dto.status,
    statusBadge: getStatusBadge(dto.status),
    levelInfo: getLevelInfo(dto.nivel),
    children,
    tenants: dto.tenants.map((t) => ({
      tenantId: t.tenant_id,
      codigo: t.codigo,
      name: t.name,
    })),
    childCount: children.length,
    isInactive: dto.status === 'INACTIVE',
    canExpand: children.length > 0 || dto.tenants.length > 0,
  };
}

export function toFormVM(dto: OrgUnitDetailDTO): OrgUnitFormVM {
  return {
    id: dto.id,
    codigo: dto.codigo,
    nome: dto.nome,
    descricao: dto.descricao,
    nivel: dto.nivel,
    parentId: dto.parent_id,
    status: dto.status,
    statusBadge: getStatusBadge(dto.status),
    levelInfo: getLevelInfo(dto.nivel),
    createdAtFormatted: formatDatePtBr(dto.created_at),
    updatedAtFormatted: formatDatePtBr(dto.updated_at),
    breadcrumb: dto.ancestors.map((a) => ({
      id: a.id,
      codigo: a.codigo,
      nome: a.nome,
      nivel: a.nivel,
    })),
  };
}

// ── Client-side tree search (UX-ORG-001) ───────────────────

export function filterTree(
  nodes: readonly OrgUnitTreeNodeVM[],
  searchTerm: string,
): OrgUnitTreeNodeVM[] {
  if (!searchTerm.trim()) return [...nodes];

  const lower = searchTerm.toLowerCase();

  function matches(node: OrgUnitTreeNodeVM): boolean {
    return node.nome.toLowerCase().includes(lower) || node.codigo.toLowerCase().includes(lower);
  }

  function filterNode(node: OrgUnitTreeNodeVM): OrgUnitTreeNodeVM | null {
    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is OrgUnitTreeNodeVM => n !== null);

    if (matches(node) || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
        childCount: filteredChildren.length,
        canExpand: filteredChildren.length > 0 || node.tenants.length > 0,
      };
    }

    return null;
  }

  return nodes.map(filterNode).filter((n): n is OrgUnitTreeNodeVM => n !== null);
}

// ── Scope constants (DOC-FND-000 §2.2) ─────────────────────

export const SCOPES = {
  ORG_UNIT_READ: 'org:unit:read',
  ORG_UNIT_WRITE: 'org:unit:write',
  ORG_UNIT_DELETE: 'org:unit:delete',
} as const;

// ── Permission helpers (@contract SEC-001) ──────────────────

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadOrgUnits(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_READ);
}

export function canWriteOrgUnit(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_WRITE);
}

/** @contract BR-005 — Delete visible only with org:unit:delete AND status !== INACTIVE */
export function canDeleteOrgUnit(userScopes: readonly string[], status: OrgUnitStatus): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_DELETE) && status !== 'INACTIVE';
}

/** @contract BR-009 — Restore visible only with org:unit:write AND status === INACTIVE */
export function canRestoreOrgUnit(
  userScopes: readonly string[],
  deletedAt: string | null,
): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_WRITE) && deletedAt !== null;
}

/** @contract BR-006 — Link tenant visible only on N4 nodes with org:unit:write */
export function canLinkTenant(userScopes: readonly string[], nivel: number): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_WRITE) && nivel === 4;
}

export function canUnlinkTenant(userScopes: readonly string[], nivel: number): boolean {
  return hasScope(userScopes, SCOPES.ORG_UNIT_DELETE) && nivel === 4;
}

// ── Copy catalog (UX-001 success/error messages) ────────────

export const COPY = {
  toast: {
    createSuccess: (codigo: string, nome: string) =>
      `Unidade '${codigo} — ${nome}' criada com sucesso.`,
    updateSuccess: (codigo: string, nome: string) => `Unidade '${codigo} — ${nome}' atualizada.`,
    deleteSuccess: (codigo: string, nome: string) => `Unidade '${codigo} — ${nome}' desativada.`,
    restoreSuccess: (codigo: string, nome: string) => `Unidade '${codigo} — ${nome}' restaurada.`,
    linkTenantSuccess: (tenantCodigo: string, orgUnitNome: string) =>
      `Tenant '${tenantCodigo}' vinculado a '${orgUnitNome}'.`,
    unlinkTenantSuccess: (tenantCodigo: string, orgUnitNome: string) =>
      `Tenant '${tenantCodigo}' desvinculado de '${orgUnitNome}'.`,
  },
  error: {
    loadFailed: 'Erro ao carregar estrutura. Tente novamente.',
    noPermission: 'Sem permissão para acessar esta seção.',
    unexpected: 'Erro inesperado. Tente novamente.',
  },
  label: {
    emptyState: 'Nenhuma estrutura organizacional cadastrada.',
    emptySearch: 'Nenhuma unidade encontrada para o termo buscado.',
    createFirst: 'Criar primeiro nível',
    retry: 'Tentar novamente',
  },
  validation: {
    codigoDuplicate: 'Este código já está em uso.',
    nivelMax: 'Nível máximo (N4) atingido. Use vinculação de tenant para N5.',
    parentInactive: 'Não é possível restaurar: o nó pai está inativo.',
    childrenActive: 'Não é possível desativar um nó com subunidades ativas.',
    linkWrongLevel: 'Vinculação de tenant só é permitida em nós de nível N4.',
    linkDuplicate: 'Este vínculo já existe.',
    codigoImmutable: "O campo 'código' é imutável após criação.",
    parentImmutable: "O campo 'nó pai' é imutável após criação.",
  },
  modal: {
    deleteTitle: 'Desativar unidade?',
    deleteBody: (codigo: string, nome: string) => `Desativar unidade '${codigo} — ${nome}'?`,
    deleteConfirm: 'Desativar',
    restoreTitle: 'Restaurar unidade?',
    restoreBody: (codigo: string, nome: string) => `Restaurar unidade '${codigo} — ${nome}'?`,
    restoreConfirm: 'Restaurar',
    unlinkTitle: 'Desvincular tenant?',
    unlinkBody: (tenantCodigo: string, orgUnitNome: string) =>
      `Desvincular tenant '${tenantCodigo}' de '${orgUnitNome}'?`,
    unlinkConfirm: 'Desvincular',
    cancel: 'Cancelar',
  },
} as const;

// ── Field error extraction (RFC 9457) ──────────────────────

export function extractFieldErrors(extensions?: Record<string, unknown>): Map<string, string> {
  const errors = new Map<string, string>();
  if (!extensions) return errors;
  const invalidFields = extensions['invalid_fields'];
  if (Array.isArray(invalidFields)) {
    for (const entry of invalidFields) {
      if (entry && typeof entry === 'object' && 'field' in entry && 'message' in entry) {
        errors.set(String(entry.field), String(entry.message));
      }
    }
  }
  return errors;
}
