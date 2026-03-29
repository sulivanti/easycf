/**
 * @contract UX-USR-001, FR-001, BR-001, BR-002, BR-006
 * Users list page — paginated table with filters, search, deactivation.
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
    </div>
  );
}
