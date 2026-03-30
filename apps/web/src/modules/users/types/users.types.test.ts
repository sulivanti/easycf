/**
 * @contract BR-001, BR-001-M01, BR-002, DATA-001, UX-001-C03
 * Unit tests for MOD-002 types: permission helpers, mappers, status badges, copy.
 */

import {
  hasScope,
  canReadUsers,
  canCreateUser,
  canDeactivateUser,
  canResendInvite,
  canEditUser,
  canBlockUser,
  canUnblockUser,
  canReactivateUser,
  canResetPassword,
  canCancelInvite,
  getStatusBadge,
  formatDatePtBr,
  toUserViewModel,
  extractFieldErrors,
  evaluatePasswordStrength,
  SCOPES,
  COPY,
  type UserListItemDTO,
} from './users.types';

// ── Permission Helpers ────────────────────────────────────────

describe('Permission helpers', () => {
  const READ_ONLY = [SCOPES.USER_READ];
  const READ_WRITE = [SCOPES.USER_READ, SCOPES.USER_WRITE];
  const ALL_SCOPES = [SCOPES.USER_READ, SCOPES.USER_WRITE, SCOPES.USER_DELETE];
  const NO_SCOPES: string[] = [];

  describe('hasScope', () => {
    it('returns true when scope is present', () => {
      expect(hasScope(READ_ONLY, SCOPES.USER_READ)).toBe(true);
    });
    it('returns false when scope is absent', () => {
      expect(hasScope(READ_ONLY, SCOPES.USER_WRITE)).toBe(false);
    });
  });

  describe('canReadUsers', () => {
    it('true with read scope', () => expect(canReadUsers(READ_ONLY)).toBe(true));
    it('false without read scope', () => expect(canReadUsers(NO_SCOPES)).toBe(false));
  });

  describe('canCreateUser', () => {
    it('true with write scope', () => expect(canCreateUser(READ_WRITE)).toBe(true));
    it('false without write scope', () => expect(canCreateUser(READ_ONLY)).toBe(false));
  });

  describe('canEditUser', () => {
    it('true with read scope (editar requires only read)', () => {
      expect(canEditUser(READ_ONLY)).toBe(true);
    });
    it('false without read scope', () => {
      expect(canEditUser(NO_SCOPES)).toBe(false);
    });
  });

  describe('canDeactivateUser', () => {
    it('true with delete scope + non-INACTIVE status', () => {
      expect(canDeactivateUser(ALL_SCOPES, 'ACTIVE')).toBe(true);
      expect(canDeactivateUser(ALL_SCOPES, 'BLOCKED')).toBe(true);
    });
    it('false for INACTIVE status even with delete scope', () => {
      expect(canDeactivateUser(ALL_SCOPES, 'INACTIVE')).toBe(false);
    });
    it('false without delete scope', () => {
      expect(canDeactivateUser(READ_WRITE, 'ACTIVE')).toBe(false);
    });
  });

  describe('canBlockUser (BR-001-M01)', () => {
    it('true with write scope + ACTIVE/INACTIVE/PENDING', () => {
      expect(canBlockUser(READ_WRITE, 'ACTIVE')).toBe(true);
      expect(canBlockUser(READ_WRITE, 'INACTIVE')).toBe(true);
      expect(canBlockUser(READ_WRITE, 'PENDING')).toBe(true);
    });
    it('false for BLOCKED status', () => {
      expect(canBlockUser(READ_WRITE, 'BLOCKED')).toBe(false);
    });
    it('false without write scope', () => {
      expect(canBlockUser(READ_ONLY, 'ACTIVE')).toBe(false);
    });
  });

  describe('canUnblockUser (BR-001-M01)', () => {
    it('true with write scope + BLOCKED', () => {
      expect(canUnblockUser(READ_WRITE, 'BLOCKED')).toBe(true);
    });
    it('false for non-BLOCKED status', () => {
      expect(canUnblockUser(READ_WRITE, 'ACTIVE')).toBe(false);
      expect(canUnblockUser(READ_WRITE, 'INACTIVE')).toBe(false);
    });
  });

  describe('canReactivateUser (BR-001-M01)', () => {
    it('true with write scope + INACTIVE', () => {
      expect(canReactivateUser(READ_WRITE, 'INACTIVE')).toBe(true);
    });
    it('false for non-INACTIVE status', () => {
      expect(canReactivateUser(READ_WRITE, 'ACTIVE')).toBe(false);
      expect(canReactivateUser(READ_WRITE, 'BLOCKED')).toBe(false);
    });
  });

  describe('canResetPassword (BR-001-M01)', () => {
    it('true with write scope + ACTIVE', () => {
      expect(canResetPassword(READ_WRITE, 'ACTIVE')).toBe(true);
    });
    it('false for non-ACTIVE status', () => {
      expect(canResetPassword(READ_WRITE, 'BLOCKED')).toBe(false);
      expect(canResetPassword(READ_WRITE, 'PENDING')).toBe(false);
    });
  });

  describe('canCancelInvite (BR-001-M01)', () => {
    it('true with delete scope + PENDING', () => {
      expect(canCancelInvite(ALL_SCOPES, 'PENDING')).toBe(true);
    });
    it('false for non-PENDING status', () => {
      expect(canCancelInvite(ALL_SCOPES, 'ACTIVE')).toBe(false);
    });
    it('false without delete scope', () => {
      expect(canCancelInvite(READ_WRITE, 'PENDING')).toBe(false);
    });
  });

  describe('canResendInvite', () => {
    it('true with write scope + PENDING', () => {
      expect(canResendInvite(READ_WRITE, 'PENDING')).toBe(true);
    });
    it('false for non-PENDING', () => {
      expect(canResendInvite(READ_WRITE, 'ACTIVE')).toBe(false);
    });
  });
});

// ── BR-001-M01 Matrix: status × scope ────────────────────────

describe('Visibility matrix (BR-001-M01)', () => {
  const READ_ONLY = [SCOPES.USER_READ];
  const READ_WRITE = [SCOPES.USER_READ, SCOPES.USER_WRITE];
  const ALL = [SCOPES.USER_READ, SCOPES.USER_WRITE, SCOPES.USER_DELETE];

  it('ATIVO + read only → only Edit', () => {
    expect(canEditUser(READ_ONLY)).toBe(true);
    expect(canResetPassword(READ_ONLY, 'ACTIVE')).toBe(false);
    expect(canDeactivateUser(READ_ONLY, 'ACTIVE')).toBe(false);
    expect(canBlockUser(READ_ONLY, 'ACTIVE')).toBe(false);
  });

  it('ATIVO + read+write → Edit, Resetar senha, Bloquear', () => {
    expect(canEditUser(READ_WRITE)).toBe(true);
    expect(canResetPassword(READ_WRITE, 'ACTIVE')).toBe(true);
    expect(canBlockUser(READ_WRITE, 'ACTIVE')).toBe(true);
    expect(canDeactivateUser(READ_WRITE, 'ACTIVE')).toBe(false);
  });

  it('ATIVO + all scopes → Edit, Resetar senha, Desativar, Bloquear', () => {
    expect(canEditUser(ALL)).toBe(true);
    expect(canResetPassword(ALL, 'ACTIVE')).toBe(true);
    expect(canDeactivateUser(ALL, 'ACTIVE')).toBe(true);
    expect(canBlockUser(ALL, 'ACTIVE')).toBe(true);
  });

  it('INATIVO + read+write → Edit, Reativar, Bloquear', () => {
    expect(canEditUser(READ_WRITE)).toBe(true);
    expect(canReactivateUser(READ_WRITE, 'INACTIVE')).toBe(true);
    expect(canBlockUser(READ_WRITE, 'INACTIVE')).toBe(true);
  });

  it('BLOQUEADO + read+write → Edit, Desbloquear (no Desativar)', () => {
    expect(canEditUser(READ_WRITE)).toBe(true);
    expect(canUnblockUser(READ_WRITE, 'BLOCKED')).toBe(true);
    expect(canDeactivateUser(READ_WRITE, 'BLOCKED')).toBe(false);
  });

  it('PENDENTE + all scopes → Edit, Cancelar convite, Bloquear', () => {
    expect(canEditUser(ALL)).toBe(true);
    expect(canCancelInvite(ALL, 'PENDING')).toBe(true);
    expect(canBlockUser(ALL, 'PENDING')).toBe(true);
    expect(canResendInvite(ALL, 'PENDING')).toBe(true);
  });
});

// ── Status Badges ────────────────────────────────────────────

describe('getStatusBadge', () => {
  it('maps ACTIVE to success', () => {
    const badge = getStatusBadge('ACTIVE');
    expect(badge.label).toBe('Ativo');
    expect(badge.status).toBe('success');
  });

  it('maps BLOCKED to error', () => {
    const badge = getStatusBadge('BLOCKED');
    expect(badge.label).toBe('Bloqueado');
    expect(badge.status).toBe('error');
  });

  it('maps PENDING to warning', () => {
    const badge = getStatusBadge('PENDING');
    expect(badge.label).toBe('Aguardando ativação');
    expect(badge.status).toBe('warning');
  });

  it('maps INACTIVE to neutral', () => {
    const badge = getStatusBadge('INACTIVE');
    expect(badge.label).toBe('Inativo');
    expect(badge.status).toBe('neutral');
  });
});

// ── Date Formatting ──────────────────────────────────────────

describe('formatDatePtBr', () => {
  it('formats ISO date to pt-BR', () => {
    expect(formatDatePtBr('2026-03-30T10:00:00Z')).toBe('30/03/2026');
  });

  it('returns raw string on invalid date', () => {
    expect(formatDatePtBr('not-a-date')).toBe('not-a-date');
  });
});

// ── toUserViewModel Mapper ───────────────────────────────────

describe('toUserViewModel', () => {
  const dto: UserListItemDTO = {
    id: 'u1',
    fullName: 'João Silva',
    email: 'joao@a1.com.br',
    status: 'ACTIVE',
    roleId: 'r1',
    roleName: 'Administrador',
    createdAt: '2026-03-15T12:00:00Z',
  };

  it('maps all fields correctly', () => {
    const vm = toUserViewModel(dto, [SCOPES.USER_READ, SCOPES.USER_WRITE, SCOPES.USER_DELETE]);
    expect(vm.id).toBe('u1');
    expect(vm.displayName).toBe('João Silva');
    expect(vm.email).toBe('joao@a1.com.br');
    expect(vm.status).toBe('ACTIVE');
    expect(vm.roleName).toBe('Administrador');
    expect(vm.statusBadge.status).toBe('success');
    expect(vm.createdAtFormatted).toBe('15/03/2026');
  });

  it('computes canEdit, canDeactivate, canBlock for ACTIVE user with all scopes', () => {
    const vm = toUserViewModel(dto, [SCOPES.USER_READ, SCOPES.USER_WRITE, SCOPES.USER_DELETE]);
    expect(vm.canEdit).toBe(true);
    expect(vm.canDeactivate).toBe(true);
    expect(vm.canBlock).toBe(true);
    expect(vm.canResetPassword).toBe(true);
    expect(vm.canUnblock).toBe(false);
    expect(vm.canReactivate).toBe(false);
    expect(vm.canCancelInvite).toBe(false);
  });

  it('computes minimal permissions with read-only scope', () => {
    const vm = toUserViewModel(dto, [SCOPES.USER_READ]);
    expect(vm.canEdit).toBe(true);
    expect(vm.canDeactivate).toBe(false);
    expect(vm.canBlock).toBe(false);
    expect(vm.canResetPassword).toBe(false);
  });
});

// ── extractFieldErrors (RFC 9457) ────────────────────────────

describe('extractFieldErrors', () => {
  it('extracts field errors from RFC 9457 extensions', () => {
    const errors = extractFieldErrors({
      invalid_fields: [
        { field: 'email', message: 'E-mail inválido.' },
        { field: 'fullName', message: 'Nome obrigatório.' },
      ],
    });
    expect(errors.size).toBe(2);
    expect(errors.get('email')).toBe('E-mail inválido.');
    expect(errors.get('fullName')).toBe('Nome obrigatório.');
  });

  it('returns empty map when no extensions', () => {
    expect(extractFieldErrors(undefined).size).toBe(0);
  });

  it('returns empty map when invalid_fields is not array', () => {
    expect(extractFieldErrors({ invalid_fields: 'bad' }).size).toBe(0);
  });
});

// ── Password Strength ────────────────────────────────────────

describe('evaluatePasswordStrength', () => {
  it('returns none for empty password', () => {
    expect(evaluatePasswordStrength('')).toBe('none');
  });
  it('returns weak for short simple password', () => {
    expect(evaluatePasswordStrength('abc')).toBe('weak');
  });
  it('returns medium for decent password', () => {
    expect(evaluatePasswordStrength('Abcdef12')).toBe('medium');
  });
  it('returns strong for complex password', () => {
    expect(evaluatePasswordStrength('Abcdef12!@#xyz')).toBe('strong');
  });
});

// ── COPY Constants (LGPD — BR-002) ──────────────────────────

describe('COPY constants (PII-Safe)', () => {
  it('toast messages never contain email placeholders', () => {
    const allToasts = Object.values(COPY.toast);
    for (const msg of allToasts) {
      expect(msg).not.toContain('email');
      expect(msg).not.toContain('@');
    }
  });

  it('modal body functions use name, not email', () => {
    const body = COPY.modal.deactivateBody('João');
    expect(body).toContain('João');
    expect(body).not.toContain('email');

    const blockBody = COPY.modal.blockBody('Maria');
    expect(blockBody).toContain('Maria');
    expect(blockBody).not.toContain('email');

    const cancelBody = COPY.modal.cancelInviteBody('Pedro');
    expect(cancelBody).toContain('Pedro');
    expect(cancelBody).not.toContain('email');
  });

  it('has all required toast messages for new actions (UX-001-C03)', () => {
    expect(COPY.toast.userBlocked).toBeDefined();
    expect(COPY.toast.userUnblocked).toBeDefined();
    expect(COPY.toast.userReactivated).toBeDefined();
    expect(COPY.toast.passwordReset).toBeDefined();
    expect(COPY.toast.inviteCancelled).toBeDefined();
  });

  it('has all required error messages for new actions', () => {
    expect(COPY.error.blockUserFailed).toBeDefined();
    expect(COPY.error.unblockUserFailed).toBeDefined();
    expect(COPY.error.reactivateUserFailed).toBeDefined();
    expect(COPY.error.resetPasswordFailed).toBeDefined();
    expect(COPY.error.cancelInviteFailed).toBeDefined();
  });

  it('has all required modal messages for new actions', () => {
    expect(COPY.modal.blockTitle).toBeDefined();
    expect(COPY.modal.blockConfirm).toBeDefined();
    expect(COPY.modal.cancelInviteTitle).toBeDefined();
    expect(COPY.modal.cancelInviteConfirm).toBeDefined();
  });
});
