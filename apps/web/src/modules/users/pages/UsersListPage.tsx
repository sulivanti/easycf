/**
 * @contract UX-USR-001, FR-001, FR-001-M01, BR-001, BR-001-M01, BR-002, BR-006, UX-001-C03
 * Users list page — paginated table with filters, search, and 4-variant dropdown actions.
 * Scope guard: users:user:read required.
 * LGPD: email in table column only, never in toasts or modals.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { SearchBar } from '@shared/ui/search-bar';
import { FilterBar } from '@shared/ui/filter-bar';
import { Select } from '@shared/ui/select';
import { UsersTable } from '../components/UsersTable.js';
import { DeactivateModal } from '../components/DeactivateModal.js';
import { ConfirmActionModal } from '../components/ConfirmActionModal.js';
import { useUsersList, useInvalidateUsersList } from '../hooks/use-users-list.js';
import { useRoleOptions } from '../hooks/use-role-options.js';
import { useDeactivateUser } from '../hooks/use-deactivate-user.js';
import { useUpdateStatus } from '../hooks/use-update-status.js';
import { useResetPassword } from '../hooks/use-reset-password.js';
import { useCancelInvite } from '../hooks/use-cancel-invite.js';
import {
  COPY,
  canCreateUser,
  toUserViewModel,
  type UserFilters,
  type UserStatus,
} from '../types/users.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PENDING', label: 'Aguardando ativação' },
  { value: 'BLOCKED', label: 'Bloqueado' },
  { value: 'INACTIVE', label: 'Inativo' },
];

interface UsersListPageProps {
  userScopes: readonly string[];
  onNavigateToCreate: () => void;
  onNavigateToInvite: (userId: string) => void;
  onNavigateToEdit?: (userId: string) => void;
}

export function UsersListPage({
  userScopes,
  onNavigateToCreate,
  onNavigateToInvite,
  onNavigateToEdit,
}: UsersListPageProps) {
  // ── Filters state ────────────────────────────────────────
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data hooks ───────────────────────────────────────────
  const { data, isLoading, isError, error } = useUsersList(filters);
  const { data: roles } = useRoleOptions();
  const invalidateList = useInvalidateUsersList();
  const deactivateMutation = useDeactivateUser();
  const updateStatusMutation = useUpdateStatus();
  const resetPasswordMutation = useResetPassword();
  const cancelInviteMutation = useCancelInvite();

  // ── Search with 400ms debounce ───────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value || undefined, cursor: undefined }));
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as UserStatus | '';
    setStatusFilter(status);
    setFilters((prev) => ({ ...prev, status: status || undefined, cursor: undefined }));
  }, []);

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRoleFilter(value);
    setFilters((prev) => ({ ...prev, roleId: value || undefined, cursor: undefined }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('');
    setRoleFilter('');
    setFilters({});
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data?.nextCursor) {
      setFilters((prev) => ({ ...prev, cursor: data.nextCursor ?? undefined }));
    }
  }, [data]);

  // ── Modal state ────────────────────────────────────────────
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [blockTarget, setBlockTarget] = useState<{ id: string; name: string } | null>(null);
  const [cancelInviteTarget, setCancelInviteTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

  // ── Action handlers ────────────────────────────────────────

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      setDeactivateTarget(null);
      toast.success(COPY.toast.userDeactivated);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      toast.error(COPY.error.deactivateUserFailed, {
        description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
      });
    }
  }, [deactivateTarget, deactivateMutation]);

  const handleBlockConfirm = useCallback(async () => {
    if (!blockTarget) return;
    try {
      await updateStatusMutation.mutateAsync({ userId: blockTarget.id, status: 'BLOCKED' });
      setBlockTarget(null);
      toast.success(COPY.toast.userBlocked);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      toast.error(COPY.error.blockUserFailed, {
        description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
      });
    }
  }, [blockTarget, updateStatusMutation]);

  const handleUnblock = useCallback(
    async (userId: string) => {
      try {
        await updateStatusMutation.mutateAsync({ userId, status: 'ACTIVE' });
        toast.success(COPY.toast.userUnblocked);
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : null;
        toast.error(COPY.error.unblockUserFailed, {
          description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
        });
      }
    },
    [updateStatusMutation],
  );

  const handleReactivate = useCallback(
    async (userId: string) => {
      try {
        await updateStatusMutation.mutateAsync({ userId, status: 'ACTIVE' });
        toast.success(COPY.toast.userReactivated);
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : null;
        toast.error(COPY.error.reactivateUserFailed, {
          description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
        });
      }
    },
    [updateStatusMutation],
  );

  const handleResetPassword = useCallback(
    async (userId: string, _userName: string) => {
      try {
        await resetPasswordMutation.mutateAsync(userId);
        toast.success(COPY.toast.passwordReset);
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : null;
        toast.error(COPY.error.resetPasswordFailed, {
          description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
        });
      }
    },
    [resetPasswordMutation],
  );

  const handleCancelInviteConfirm = useCallback(async () => {
    if (!cancelInviteTarget) return;
    try {
      await cancelInviteMutation.mutateAsync(cancelInviteTarget.id);
      setCancelInviteTarget(null);
      toast.success(COPY.toast.inviteCancelled);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      toast.error(COPY.error.cancelInviteFailed, {
        description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
      });
    }
  }, [cancelInviteTarget, cancelInviteMutation]);

  // ── Derived ──────────────────────────────────────────────
  const viewModels = (data?.data ?? []).map((u) => toUserViewModel(u, userScopes));
  const showCreate = canCreateUser(userScopes);
  const hasFilters = !!(searchInput || statusFilter || roleFilter);

  const roleOptions = [
    { value: '', label: 'Todos os perfis' },
    ...(roles ?? []).map((role) => ({ value: role.id, label: role.name })),
  ];

  return (
    <div className="-m-6">
      {/* Page Header — A1 */}
      <PageHeader
        title="Gestão de Usuários"
        description="Gerencie contas, perfis e permissões de acesso"
        className="border-b border-a1-border bg-white px-6 py-4.5"
        actions={
          showCreate ? (
            <Button
              onClick={onNavigateToCreate}
              className="bg-a1-dark font-display text-[13px] font-bold text-white hover:bg-a1-dark/90"
            >
              + Novo Usuário
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4 p-6">
        {/* Filters */}
        <FilterBar>
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Buscar por nome ou e-mail..."
            className="w-64"
          />
          <Select value={statusFilter} onChange={handleStatusChange} options={STATUS_OPTIONS} />
          <Select value={roleFilter} onChange={handleRoleChange} options={roleOptions} />
          {hasFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={handleClearFilters}
              className="font-display text-primary-600"
            >
              Limpar filtros
            </Button>
          )}
        </FilterBar>

        {/* Error state */}
        {isError && !isLoading && (
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{COPY.error.loadUsersFailed}</p>
            {error instanceof ApiError && error.correlationId && (
              <p className="mt-1 text-xs text-destructive/70">
                Correlation ID: {error.correlationId}
              </p>
            )}
            <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => invalidateList()}>
              {COPY.label.retry}
            </Button>
          </div>
        )}

        {/* Table */}
        {!isError && (
          <UsersTable
            users={viewModels}
            loading={isLoading}
            canCreate={showCreate}
            hasMore={!!data?.nextCursor}
            loadingMore={isLoading && !!filters.cursor}
            onLoadMore={handleLoadMore}
            onCreateClick={onNavigateToCreate}
            onEditClick={onNavigateToEdit ?? (() => {})}
            onDeactivateClick={(id, name) => setDeactivateTarget({ id, name })}
            onBlockClick={(id, name) => setBlockTarget({ id, name })}
            onUnblockClick={handleUnblock}
            onReactivateClick={handleReactivate}
            onResetPasswordClick={handleResetPassword}
            onInviteClick={onNavigateToInvite}
            onCancelInviteClick={(id, name) => setCancelInviteTarget({ id, name })}
          />
        )}

        {/* Deactivate Modal */}
        <DeactivateModal
          open={!!deactivateTarget}
          userName={deactivateTarget?.name ?? ''}
          loading={deactivateMutation.isPending}
          onConfirm={handleDeactivateConfirm}
          onCancel={() => setDeactivateTarget(null)}
        />

        {/* Block Modal */}
        <ConfirmActionModal
          open={!!blockTarget}
          title={COPY.modal.blockTitle}
          description={COPY.modal.blockBody(blockTarget?.name ?? '')}
          confirmLabel={COPY.modal.blockConfirm}
          cancelLabel={COPY.modal.cancel}
          loading={updateStatusMutation.isPending}
          onConfirm={handleBlockConfirm}
          onCancel={() => setBlockTarget(null)}
        />

        {/* Cancel Invite Modal */}
        <ConfirmActionModal
          open={!!cancelInviteTarget}
          title={COPY.modal.cancelInviteTitle}
          description={COPY.modal.cancelInviteBody(cancelInviteTarget?.name ?? '')}
          confirmLabel={COPY.modal.cancelInviteConfirm}
          cancelLabel={COPY.modal.cancel}
          loading={cancelInviteMutation.isPending}
          onConfirm={handleCancelInviteConfirm}
          onCancel={() => setCancelInviteTarget(null)}
        />
      </div>
    </div>
  );
}
