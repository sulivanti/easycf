/**
 * @contract DATA-001, FR-001, FR-001-M01, UX-001, SEC-001, BR-001, BR-001.4, BR-001.7, BR-001.8, BR-001.9, BR-001.10
 * MOD-004 types: DTOs, view-models, permissions, copy constants, status badges, formatters.
 * Consolidates all domain logic into a single types module (Pattern A).
 */

// ── Status & Scope Types ────────────────────────────────────

export type ScopeType = 'PRIMARY' | 'SECONDARY';
export type GrantStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'EXPIRED';

// ── User summary (FR-001-M01) ───────────────────────────────

export interface UserSummaryDTO {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

// ── Org Unit summary (from MOD-003) ─────────────────────────

export interface OrgUnitSummaryDTO {
  id: string;
  codigo: string;
  nome: string;
  nivel: number;
  breadcrumb: string;
}

// ── Org Scope DTOs ──────────────────────────────────────────

export interface OrgScopeDTO {
  id: string;
  user_id: string;
  org_unit_id: string;
  scope_type: ScopeType;
  status: GrantStatus;
  valid_until: string | null;
  created_at: string;
  deleted_at: string | null;
  org_unit: OrgUnitSummaryDTO;
}

export interface CreateOrgScopeRequest {
  org_unit_id: string;
  scope_type: ScopeType;
  valid_until?: string | null;
}

// ── Org Scopes Grouped (FR-001-M01) ─────────────────────────

export interface ScopeDetailDTO {
  readonly id: string;
  readonly org_unit: {
    readonly id: string;
    readonly codigo: string;
    readonly nome: string;
    readonly nivel: number;
    readonly breadcrumb: string;
  };
  readonly status: string;
  readonly valid_until: string | null;
}

export interface OrgScopeGroupedItemDTO {
  readonly user: UserSummaryDTO;
  readonly primary_scope: ScopeDetailDTO | null;
  readonly secondary_scopes: readonly ScopeDetailDTO[];
  readonly total_scopes: number;
}

export interface PaginatedOrgScopesGroupedResponse {
  readonly data: readonly OrgScopeGroupedItemDTO[];
  readonly next_cursor: string | null;
  readonly has_more: boolean;
}

export interface OrgScopesGroupedFilters {
  readonly q?: string;
  readonly scope_type?: 'PRIMARY' | 'SECONDARY';
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  readonly cursor?: string;
  readonly limit?: number;
}

// ── Access Share DTOs ───────────────────────────────────────

export interface AccessShareDTO {
  id: string;
  grantor_id: string;
  grantee_id: string;
  readonly grantor: UserSummaryDTO;
  readonly grantee: UserSummaryDTO;
  resource_type: string;
  resource_id: string;
  allowed_actions: string[];
  reason: string;
  authorized_by: string;
  status: GrantStatus;
  valid_until: string;
  created_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
}

export interface CreateAccessShareRequest {
  grantee_id: string;
  resource_type: string;
  resource_id: string;
  allowed_actions: string[];
  reason: string;
  authorized_by: string;
  valid_until: string;
}

export interface AccessShareFilters {
  status?: GrantStatus;
  grantee_id?: string;
  q?: string;
  sort?: string;
  cursor?: string;
}

// ── Access Delegation DTOs ──────────────────────────────────

export interface AccessDelegationDTO {
  id: string;
  delegator_id: string;
  delegatee_id: string;
  readonly delegator: UserSummaryDTO;
  readonly delegatee: UserSummaryDTO;
  delegated_scopes: string[];
  reason: string;
  status: GrantStatus;
  valid_until: string;
  created_at: string;
  revoked_at: string | null;
}

export interface CreateAccessDelegationRequest {
  delegatee_id: string;
  delegated_scopes: string[];
  reason: string;
  valid_until: string;
}

export interface DelegationsResponseDTO {
  given: AccessDelegationDTO[];
  received: AccessDelegationDTO[];
}

// ── Paginated Shares ────────────────────────────────────────

export interface PaginatedSharesResponse {
  data: AccessShareDTO[];
  next_cursor: string | null;
  has_more: boolean;
}

// ── Status Badge ────────────────────────────────────────────

export interface StatusBadge {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const STATUS_BADGE_MAP: Record<GrantStatus, StatusBadge> = {
  ACTIVE: { label: 'Ativo', variant: 'default' },
  INACTIVE: { label: 'Inativo', variant: 'outline' },
  REVOKED: { label: 'Revogado', variant: 'destructive' },
  EXPIRED: { label: 'Expirado', variant: 'secondary' },
};

export function getStatusBadge(status: GrantStatus): StatusBadge {
  return STATUS_BADGE_MAP[status] ?? { label: status, variant: 'outline' };
}

// ── Scope Type Badge ────────────────────────────────────────

export interface ScopeTypeBadge {
  label: string;
  variant: 'default' | 'secondary';
}

const SCOPE_TYPE_BADGE_MAP: Record<ScopeType, ScopeTypeBadge> = {
  PRIMARY: { label: 'Principal', variant: 'default' },
  SECONDARY: { label: 'Adicional', variant: 'secondary' },
};

export function getScopeTypeBadge(scopeType: ScopeType): ScopeTypeBadge {
  return SCOPE_TYPE_BADGE_MAP[scopeType] ?? { label: scopeType, variant: 'secondary' };
}

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

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

export function formatDateFullPtBr(isoDate: string): string {
  try {
    return FULL_DATE_FORMATTER.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ── Expiration helpers ──────────────────────────────────────

export interface ExpirationInfo {
  label: string;
  ariaLabel: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  isImminent: boolean;
}

export function getExpirationInfo(
  validUntil: string | null,
  status: GrantStatus,
): ExpirationInfo | null {
  if (!validUntil) return null;

  if (status === 'EXPIRED' || status === 'REVOKED' || status === 'INACTIVE') {
    return {
      label: formatDatePtBr(validUntil),
      ariaLabel: `Expirou em ${formatDateFullPtBr(validUntil)}`,
      variant: 'outline',
      isImminent: false,
    };
  }

  const now = new Date();
  const expiresAt = new Date(validUntil);
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return {
      label: 'Expira amanhã',
      ariaLabel: `Expira em ${formatDateFullPtBr(validUntil)}`,
      variant: 'destructive',
      isImminent: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Expira em ${diffDays} dias`,
      ariaLabel: `Expira em ${formatDateFullPtBr(validUntil)}`,
      variant: 'secondary',
      isImminent: true,
    };
  }

  return {
    label: formatDatePtBr(validUntil),
    ariaLabel: `Expira em ${formatDateFullPtBr(validUntil)}`,
    variant: 'outline',
    isImminent: false,
  };
}

// ── Breadcrumb formatting ───────────────────────────────────

export function formatOrgUnitBreadcrumb(orgUnit: OrgUnitSummaryDTO): string {
  return orgUnit.breadcrumb || `${orgUnit.codigo} — ${orgUnit.nome}`;
}

// ── Prohibited delegation scopes (BR-001.4) ─────────────────

const PROHIBITED_SCOPE_SUFFIXES = [':approve', ':execute', ':sign'] as const;

export function isProhibitedDelegationScope(scope: string): boolean {
  return PROHIBITED_SCOPE_SUFFIXES.some((suffix) => scope.endsWith(suffix));
}

export function partitionDelegatableScopes(scopes: readonly string[]): {
  delegatable: string[];
  prohibited: string[];
} {
  const delegatable: string[] = [];
  const prohibited: string[] = [];
  for (const scope of scopes) {
    if (isProhibitedDelegationScope(scope)) {
      prohibited.push(scope);
    } else {
      delegatable.push(scope);
    }
  }
  return { delegatable, prohibited };
}

// ── Auto-authorization validation (BR-001.7) ────────────────

export function canSelfAuthorize(userScopes: readonly string[]): boolean {
  return userScopes.includes(SCOPES.SHARE_AUTHORIZE);
}

export function isAutoAuthBlocked(
  grantorId: string,
  authorizedById: string,
  userScopes: readonly string[],
): boolean {
  return grantorId === authorizedById && !canSelfAuthorize(userScopes);
}

// ── Date validation (BR-001.10) ─────────────────────────────

export function isValidFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date > new Date();
}

// ── Reason validation (BR-001.9) ────────────────────────────

export function isReasonValid(reason: string): boolean {
  const trimmed = reason.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}

// ── Scope constants (DOC-FND-000 §2.2) ─────────────────────

export const SCOPES = {
  ORG_SCOPE_READ: 'identity:org_scope:read',
  ORG_SCOPE_WRITE: 'identity:org_scope:write',
  SHARE_READ: 'identity:share:read',
  SHARE_WRITE: 'identity:share:write',
  SHARE_REVOKE: 'identity:share:revoke',
  SHARE_AUTHORIZE: 'identity:share:authorize',
  DELEGATION_READ: 'identity:delegation:read',
  DELEGATION_WRITE: 'identity:delegation:write',
} as const;

// ── Permission helpers (@contract SEC-001) ──────────────────

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadOrgScopes(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ORG_SCOPE_READ);
}

export function canWriteOrgScopes(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ORG_SCOPE_WRITE);
}

export function canReadShares(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.SHARE_READ);
}

export function canWriteShares(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.SHARE_WRITE);
}

export function canRevokeShares(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.SHARE_REVOKE);
}

// ── Copy catalog (UX-001 success/error messages) ────────────

export const COPY = {
  toast: {
    orgScopeCreated: 'Área organizacional vinculada com sucesso.',
    orgScopeDeleted: 'Vínculo organizacional removido.',
    shareCreated: 'Compartilhamento criado.',
    shareRevoked: 'Compartilhamento revogado.',
    delegationCreated: 'Delegação criada.',
    delegationRevoked: 'Delegação revogada.',
    noPermission: 'Sem permissão.',
    noPermissionOperation: 'Sem permissão para esta operação.',
  },
  error: {
    loadFailed: 'Erro ao carregar dados. Tente novamente.',
    loadScopesFailed: 'Erro ao carregar vínculos. Tente novamente.',
    unexpected: 'Erro inesperado. Tente novamente.',
    orgUnitNotFound: 'Nó organizacional não encontrado.',
  },
  label: {
    emptyScopes: 'Nenhuma área vinculada. Clique em Adicionar para vincular.',
    emptyShares: 'Nenhum compartilhamento ativo.',
    emptyDelegations: 'Nenhuma delegação ativa.',
    emptyReceived: 'Você não possui acessos compartilhados ou delegados no momento.',
    addScope: 'Adicionar',
    newShare: 'Novo Compartilhamento',
    newDelegation: 'Nova Delegação',
    retry: 'Tentar novamente',
    searchUsers: 'Buscar por nome ou e-mail...',
    loadMore: 'Carregar mais',
    allTypes: 'Todos os Tipos',
    allStatuses: 'Todos',
    activeOnly: 'Ativos',
    expiredOnly: 'Expirados',
  },
  validation: {
    duplicatePrimary: 'Remova a área principal atual antes de adicionar uma nova.',
    duplicatePrimaryApi: 'Usuário já possui uma área principal (PRIMARY).',
    inactiveOrgUnit: 'O nó organizacional informado não existe ou está inativo.',
    futureDate: 'A data de expiração deve ser no futuro.',
    userNotFound: 'O usuário destinatário não foi encontrado ou não pertence ao tenant.',
    prohibitedScopes: 'Delegações não podem incluir escopos de aprovação, execução ou assinatura.',
    notOwnedScope: 'Não é possível delegar um escopo que você não possui.',
    noRedelegation: 'Escopos obtidos por delegação não podem ser re-delegados.',
    autoAuthBlocked:
      "Sem scope 'identity:share:authorize', o autorizador deve ser diferente do solicitante.",
    reasonRequired: 'O motivo do compartilhamento é obrigatório.',
    validUntilRequired: 'A data de expiração é obrigatória para compartilhamentos/delegações.',
  },
  modal: {
    removePrimaryTitle: 'Remover área principal?',
    removePrimaryBody:
      'Ao remover a área principal, processos vinculados a este usuário podem perder contexto organizacional.',
    removePrimaryConfirm: 'Remover mesmo assim',
    removeSecondaryTitle: 'Remover vínculo?',
    removeSecondaryBody: 'Deseja remover este vínculo organizacional?',
    removeConfirm: 'Remover',
    revokeShareTitle: 'Revogar compartilhamento?',
    revokeShareBody: 'Confirma revogação deste compartilhamento?',
    revokeShareConfirm: 'Revogar',
    revokeDelegationTitle: 'Revogar delegação?',
    revokeDelegationBody: 'Confirma revogação desta delegação?',
    revokeDelegationConfirm: 'Revogar',
    cancel: 'Cancelar',
  },
  info: {
    temporaryAccess: 'Estes acessos são temporários e expiram automaticamente.',
    noRedelegation: 'Escopos obtidos por delegação não podem ser re-delegados.',
    selfAuthAllowed: 'Você possui permissão para auto-autorizar.',
    prohibitedScopeTooltip: 'Escopos de aprovação não podem ser delegados.',
  },
} as const;

// ── Avatar initials helper (FR-001-M01) ─────────────────────

export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

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
