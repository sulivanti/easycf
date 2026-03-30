/**
 * @contract DATA-001, FR-001, FR-001-M01, FR-002, FR-003, BR-001, BR-001-M01, BR-002, BR-003, BR-006, ADR-002, UX-001-C03
 * MOD-002 types: DTOs, view-models, permissions, copy constants, status badges.
 * Consolidates all domain logic previously spread across data/types, domain/view-model,
 * domain/permissions, and domain/copy into a single types module.
 */

import type { UserStatus } from '../../foundation/types/user.types.js';

// ── Re-export for convenience ────────────────────────────────
export type { UserStatus } from '../../foundation/types/user.types.js';

// ── Request types (MOD-002 specific) ─────────────────────────

export interface CreateUserByInviteRequest {
  fullName: string;
  email: string;
  roleId: string;
  mode: 'invite';
}

export interface CreateUserByPasswordRequest {
  fullName: string;
  email: string;
  roleId: string;
  password: string;
  forcePasswordReset: true;
}

export type CreateUserRequest = CreateUserByInviteRequest | CreateUserByPasswordRequest;

// ── Response DTOs (aligned with DATA-001) ────────────────────

export interface UserListItemDTO {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  roleId: string;
  roleName: string;
  createdAt: string;
}

export interface UserDetailDTO {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  status: UserStatus;
  inviteTokenExpired: boolean;
  createdAt: string;
}

export interface RoleOptionDTO {
  id: string;
  name: string;
  description: string;
}

export interface PaginationMeta {
  nextCursor: string | null;
  total: number;
}

export interface UserListResponse {
  data: UserListItemDTO[];
  meta: PaginationMeta;
}

// ── Filters ──────────────────────────────────────────────────

export interface UserFilters {
  status?: UserStatus;
  roleId?: string;
  search?: string;
  cursor?: string;
}

// ── Inline errors (BR-006, RFC 9457) ─────────────────────────

export interface FieldError {
  field: string;
  message: string;
}

// ── Status Badge (DATA-001 view-model) ───────────────────────

import type { StatusType } from '@shared/ui/status-badge';

export interface StatusBadge {
  label: string;
  status: StatusType;
}

const STATUS_BADGE_MAP: Record<UserStatus, StatusBadge> = {
  ACTIVE: { label: 'Ativo', status: 'success' },
  PENDING: { label: 'Aguardando ativação', status: 'warning' },
  BLOCKED: { label: 'Bloqueado', status: 'error' },
  INACTIVE: { label: 'Inativo', status: 'neutral' },
};

export function getStatusBadge(status: UserStatus): StatusBadge {
  return STATUS_BADGE_MAP[status] ?? { label: status, status: 'neutral' };
}

// ── Date formatting (pt-BR) ─────────────────────────────────

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatDatePtBr(isoDate: string): string {
  try {
    return DATE_FORMATTER.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ── UserViewModel ────────────────────────────────────────────

export interface UserViewModel {
  id: string;
  displayName: string;
  email: string;
  statusBadge: StatusBadge;
  status: UserStatus;
  roleName: string;
  createdAtFormatted: string;
  canEdit: boolean;
  canDeactivate: boolean;
  canBlock: boolean;
  canUnblock: boolean;
  canReactivate: boolean;
  canResetPassword: boolean;
  canResendInvite: boolean;
  canCancelInvite: boolean;
}

export interface UserInviteViewModel {
  id: string;
  displayName: string;
  statusBadge: StatusBadge;
  status: UserStatus;
  isInviteExpired: boolean;
  canResendInvite: boolean;
  showResendSection: boolean;
}

// ── Scope constants (DOC-FND-000 §2.2) ──────────────────────

export const SCOPES = {
  USER_READ: 'users:user:read',
  USER_WRITE: 'users:user:write',
  USER_DELETE: 'users:user:delete',
} as const;

// ── Permission helpers (@contract BR-001) ────────────────────

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadUsers(scopes: readonly string[]): boolean {
  return hasScope(scopes, SCOPES.USER_READ);
}

export function canCreateUser(scopes: readonly string[]): boolean {
  return hasScope(scopes, SCOPES.USER_WRITE);
}

export function canDeactivateUser(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_DELETE) && status !== 'INACTIVE';
}

export function canResendInvite(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_WRITE) && status === 'PENDING';
}

/** @contract BR-001-M01 — Editar visível para todos os status com scope read */
export function canEditUser(scopes: readonly string[]): boolean {
  return hasScope(scopes, SCOPES.USER_READ);
}

/** @contract BR-001-M01 — Bloquear: scope write + status ACTIVE/INACTIVE/PENDING */
export function canBlockUser(scopes: readonly string[], status: UserStatus): boolean {
  return (
    hasScope(scopes, SCOPES.USER_WRITE) &&
    (status === 'ACTIVE' || status === 'INACTIVE' || status === 'PENDING')
  );
}

/** @contract BR-001-M01 — Desbloquear: scope write + status BLOCKED */
export function canUnblockUser(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_WRITE) && status === 'BLOCKED';
}

/** @contract BR-001-M01 — Reativar: scope write + status INACTIVE */
export function canReactivateUser(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_WRITE) && status === 'INACTIVE';
}

/** @contract BR-001-M01 — Resetar senha: scope write + status ACTIVE */
export function canResetPassword(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_WRITE) && status === 'ACTIVE';
}

/** @contract BR-001-M01 — Cancelar convite: scope delete + status PENDING */
export function canCancelInvite(scopes: readonly string[], status: UserStatus): boolean {
  return hasScope(scopes, SCOPES.USER_DELETE) && status === 'PENDING';
}

// ── Copy constants (@contract ADR-002 — PII-Safe) ───────────

export const COPY = {
  toast: {
    userCreated: 'Usuário criado com sucesso.',
    userCreatedInvite: 'Usuário criado com sucesso. Convite enviado.',
    userDeactivated: 'Usuário desativado com sucesso.',
    userBlocked: 'Usuário bloqueado com sucesso.',
    userUnblocked: 'Usuário desbloqueado com sucesso.',
    userReactivated: 'Usuário reativado com sucesso.',
    passwordReset: 'Senha resetada com sucesso.',
    inviteCancelled: 'Convite cancelado com sucesso.',
    inviteResent: 'Convite reenviado com sucesso.',
    userUpdated: 'Usuário atualizado com sucesso.',
  },
  error: {
    createUserFailed: 'Não foi possível criar o usuário.',
    deactivateUserFailed: 'Não foi possível desativar o usuário.',
    blockUserFailed: 'Não foi possível bloquear o usuário.',
    unblockUserFailed: 'Não foi possível desbloquear o usuário.',
    reactivateUserFailed: 'Não foi possível reativar o usuário.',
    resetPasswordFailed: 'Não foi possível resetar a senha.',
    cancelInviteFailed: 'Não foi possível cancelar o convite.',
    loadUsersFailed: 'Não foi possível carregar a lista de usuários.',
    loadUserFailed: 'Não foi possível carregar os dados do usuário.',
    loadRolesFailed: 'Não foi possível carregar os perfis de acesso.',
    resendInviteFailed: 'Não foi possível reenviar o convite.',
    updateUserFailed: 'Não foi possível atualizar o usuário.',
    userStatusChanged: 'Status do usuário foi alterado. Recarregando...',
    noPermission: 'Sem permissão para acessar esta seção.',
    noPermissionCreate: 'Sem permissão para criar usuários.',
  },
  modal: {
    deactivateTitle: 'Desativar usuário?',
    deactivateBody: (fullName: string) => `O usuário ${fullName} perderá acesso imediatamente.`,
    deactivateConfirm: 'Desativar',
    deactivateCancel: 'Cancelar',
    blockTitle: 'Bloquear usuário?',
    blockBody: (fullName: string) => `O usuário ${fullName} perderá acesso imediatamente.`,
    blockConfirm: 'Bloquear',
    cancelInviteTitle: 'Cancelar convite?',
    cancelInviteBody: (fullName: string) => `O convite pendente de ${fullName} será invalidado.`,
    cancelInviteConfirm: 'Cancelar convite',
    cancel: 'Cancelar',
  },
  validation: {
    emailRequired: 'E-mail é obrigatório.',
    emailInvalid: 'Informe um e-mail válido.',
    emailDuplicate: 'Este e-mail já está cadastrado no sistema.',
    nameRequired: 'Nome completo é obrigatório.',
    profileRequired: 'Selecione um perfil de acesso.',
    passwordRequired: 'Senha é obrigatória.',
    passwordMismatch: 'As senhas não coincidem.',
  },
  label: {
    cooldownTimer: (seconds: number) => `Aguarde ${seconds}s`,
    noResults: 'Nenhum usuário encontrado',
    loadMore: 'Carregar mais',
    retry: 'Tentar novamente',
    userNotFound: 'Usuário não encontrado.',
    invitePending: 'Convite enviado. O usuário ainda não ativou a conta.',
    inviteExpired: 'O link de ativação expirou. Reenvie o convite.',
    userActive: 'O usuário ativou a conta com sucesso.',
    userBlocked: 'Desbloqueie o usuário antes de reenviar o convite.',
    userInactive: 'Usuário inativo.',
    editUser: 'Editar Usuário',
    saveChanges: 'Salvar Alterações',
    emailReadonly: 'O e-mail não pode ser alterado.',
  },
  strength: {
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte',
  },
} as const;

// ── Mappers ──────────────────────────────────────────────────

export function toUserViewModel(
  dto: UserListItemDTO,
  userScopes: readonly string[],
): UserViewModel {
  return {
    id: dto.id,
    displayName: dto.fullName,
    email: dto.email,
    statusBadge: getStatusBadge(dto.status),
    status: dto.status,
    roleName: dto.roleName,
    createdAtFormatted: formatDatePtBr(dto.createdAt),
    canEdit: canEditUser(userScopes),
    canDeactivate: canDeactivateUser(userScopes, dto.status),
    canBlock: canBlockUser(userScopes, dto.status),
    canUnblock: canUnblockUser(userScopes, dto.status),
    canReactivate: canReactivateUser(userScopes, dto.status),
    canResetPassword: canResetPassword(userScopes, dto.status),
    canResendInvite: canResendInvite(userScopes, dto.status),
    canCancelInvite: canCancelInvite(userScopes, dto.status),
  };
}

export function toUserInviteViewModel(
  dto: UserDetailDTO,
  userScopes: readonly string[],
): UserInviteViewModel {
  return {
    id: dto.id,
    displayName: dto.fullName,
    statusBadge: getStatusBadge(dto.status),
    status: dto.status,
    isInviteExpired: dto.inviteTokenExpired,
    canResendInvite: canResendInvite(userScopes, dto.status),
    showResendSection: dto.status === 'PENDING',
  };
}

export function toRoleOption(role: {
  id: string;
  name: string;
  description: string | null;
}): RoleOptionDTO {
  return { id: role.id, name: role.name, description: role.description ?? '' };
}

/**
 * Extracts inline field errors from RFC 9457 ProblemDetails extensions.
 * @contract BR-006 — 422 errors mapped inline per field
 */
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

// ── Password strength ────────────────────────────────────────

export type StrengthLevel = 'none' | 'weak' | 'medium' | 'strong';

export function evaluatePasswordStrength(password: string): StrengthLevel {
  if (!password) return 'none';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
