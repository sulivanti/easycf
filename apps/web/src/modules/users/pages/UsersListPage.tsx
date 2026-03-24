/**
 * @contract UX-USR-001, FR-001, BR-001, BR-002, BR-006
 * Users list page — paginated table with filters, search, deactivation.
 * Scope guard: users:user:read required.
 * LGPD: email in table column only, never in toasts or modals.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { Input } from '@shared/ui';
import { UsersTable } from '../components/UsersTable.js';
import { DeactivateModal } from '../components/DeactivateModal.js';
import { useUsersList, useInvalidateUsersList } from '../hooks/use-users-list.js';
import { useRoleOptions } from '../hooks/use-role-options.js';
import { useDeactivateUser } from '../hooks/use-deactivate-user.js';
import {
  COPY,
  canCreateUser,
  toUserViewModel,
  type UserFilters,
  type UserStatus,
} from '../types/users.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
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
}

export function UsersListPage({
  userScopes,
  onNavigateToCreate,
  onNavigateToInvite,
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

  const handleStatusChange = useCallback((value: string) => {
    const status = value as UserStatus | '';
    setStatusFilter(status);
    setFilters((prev) => ({ ...prev, status: status || undefined, cursor: undefined }));
  }, []);

  const handleRoleChange = useCallback((value: string) => {
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

  // ── Deactivation modal ───────────────────────────────────
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

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

  // ── Derived ──────────────────────────────────────────────
  const viewModels = (data?.data ?? []).map((u) => toUserViewModel(u, userScopes));
  const showCreate = canCreateUser(userScopes);
  const hasFilters = !!(searchInput || statusFilter || roleFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gestão de Usuários</h1>
        {showCreate && <Button onClick={onNavigateToCreate}>Novo Usuário</Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos os perfis</option>
          {(roles ?? []).map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <Button variant="link" size="sm" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

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
          onDeactivateClick={(id, name) => setDeactivateTarget({ id, name })}
          onInviteClick={onNavigateToInvite}
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
    </div>
  );
}
