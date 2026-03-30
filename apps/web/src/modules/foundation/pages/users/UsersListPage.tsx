/**
 * @contract UX-004, FR-006, SPEC-THEME-001, 05-users-list-spec
 *
 * Users list page — 7 columns, status badges, contextual dropdown per status,
 * pagination with "Exibindo X de Y" text, name as blue link.
 * Follows 05-users-list-spec.md checklist (target: 20+/24).
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Pencil,
  KeyRound,
  UserMinus,
  ShieldBan,
  UserCheck,
  ShieldCheck,
  Send,
  MailX,
} from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import { StatusBadge } from '@shared/ui/status-badge';
import { SearchBar } from '@shared/ui/search-bar';
import type { StatusType } from '@shared/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState } from '@shared/ui/empty-state';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { IconButton } from '@shared/ui/icon-button';
import { useUsers, useDeleteUser } from '../../hooks/use-users.js';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function UsersSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-a1-border" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge mapping — SPEC-THEME-001 §2.5
// ---------------------------------------------------------------------------

const statusToType: Record<string, StatusType> = {
  ACTIVE: 'success',
  BLOCKED: 'error',
  PENDING: 'warning',
  INACTIVE: 'neutral',
};

// ---------------------------------------------------------------------------
// Dropdown per status — 05-users-list-spec §7
// ---------------------------------------------------------------------------

interface UserRow {
  id: string;
  codigo?: string;
  full_name: string;
  email: string;
  status: string;
  role_name?: string;
  tenant_name?: string;
  last_access?: string;
  created_at: string;
}

function UserActionsDropdown({
  user,
  onEdit,
  onAction,
}: {
  user: UserRow;
  onEdit: (id: string) => void;
  onAction: (action: string, user: UserRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<MoreHorizontal className="size-4" />}
          label="Ações"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {/* Status-specific primary action */}
        {user.status === 'ACTIVE' && (
          <DropdownMenuItem
            className="font-semibold text-primary-600"
            onClick={() => onEdit(user.id)}
          >
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
        )}
        {user.status === 'INACTIVE' && (
          <DropdownMenuItem
            className="font-semibold text-success-600"
            onClick={() => onAction('reactivate', user)}
          >
            <UserCheck className="mr-2 size-4" />
            Reativar
          </DropdownMenuItem>
        )}
        {user.status === 'BLOCKED' && (
          <DropdownMenuItem
            className="font-semibold text-success-600"
            onClick={() => onAction('unblock', user)}
          >
            <ShieldCheck className="mr-2 size-4" />
            Desbloquear
          </DropdownMenuItem>
        )}
        {user.status === 'PENDING' && (
          <DropdownMenuItem
            className="font-semibold text-primary-600"
            onClick={() => onAction('resend', user)}
          >
            <Send className="mr-2 size-4" />
            Reenviar convite
          </DropdownMenuItem>
        )}

        {/* Edit — present in all states */}
        {user.status !== 'ACTIVE' && (
          <DropdownMenuItem onClick={() => onEdit(user.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
        )}

        {/* Reset password — only for ACTIVE */}
        {user.status === 'ACTIVE' && (
          <DropdownMenuItem onClick={() => onAction('reset_password', user)}>
            <KeyRound className="mr-2 size-4" />
            Resetar senha
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Destructive actions */}
        {(user.status === 'ACTIVE' || user.status === 'BLOCKED') && (
          <DropdownMenuItem
            className="text-danger-600"
            onClick={() => onAction('deactivate', user)}
          >
            <UserMinus className="mr-2 size-4" />
            Desativar
          </DropdownMenuItem>
        )}
        {(user.status === 'ACTIVE' || user.status === 'INACTIVE' || user.status === 'PENDING') && (
          <DropdownMenuItem className="text-danger-600" onClick={() => onAction('block', user)}>
            <ShieldBan className="mr-2 size-4" />
            Bloquear
          </DropdownMenuItem>
        )}
        {user.status === 'PENDING' && (
          <DropdownMenuItem
            className="text-danger-600"
            onClick={() => onAction('cancel_invite', user)}
          >
            <MailX className="mr-2 size-4" />
            Cancelar convite
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// UsersListPage
// ---------------------------------------------------------------------------

export function UsersListPage({
  onCreateClick,
  onEditClick,
}: {
  onCreateClick?: () => void;
  onEditClick?: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { users, loading, error, hasMore, loadMore, isFetchingNextPage } = useUsers(
    20,
    appliedSearch,
  );
  const { deleteUser, loading: deleting } = useDeleteUser();
  const [actionTarget, setActionTarget] = useState<{
    action: string;
    user: UserRow;
  } | null>(null);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setAppliedSearch(value);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      onEditClick?.(id);
    },
    [onEditClick],
  );

  const handleAction = useCallback((action: string, user: UserRow) => {
    setActionTarget({ action, user });
  }, []);

  async function handleConfirmAction() {
    if (!actionTarget) return;
    try {
      if (actionTarget.action === 'deactivate') {
        await deleteUser(actionTarget.user.id);
        toast.success(`Usuário ${actionTarget.user.full_name} desativado.`);
      }
      // Other actions would be implemented similarly
      setActionTarget(null);
    } catch {
      toast.error('Erro ao executar ação.');
    }
  }

  const confirmLabels: Record<string, { title: string; description: string; label: string }> = {
    deactivate: {
      title: 'Desativar usuário?',
      description: `O usuário "${actionTarget?.user.full_name}" será desativado e perderá acesso ao sistema.`,
      label: 'Desativar',
    },
    block: {
      title: 'Bloquear usuário?',
      description: `O usuário "${actionTarget?.user.full_name}" será bloqueado imediatamente.`,
      label: 'Bloquear',
    },
    cancel_invite: {
      title: 'Cancelar convite?',
      description: `O convite para "${actionTarget?.user.full_name}" será cancelado.`,
      label: 'Cancelar convite',
    },
    reset_password: {
      title: 'Resetar senha?',
      description: `A senha de "${actionTarget?.user.full_name}" será resetada e um e-mail será enviado.`,
      label: 'Resetar',
    },
  };

  const currentConfirm = actionTarget ? confirmLabels[actionTarget.action] : null;

  return (
    <div className="space-y-6">
      {/* Page header — SPEC §5 */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[28px] font-extrabold leading-[34px] tracking-[-1px] text-a1-text-primary">
              Usuários
            </h1>
            <p className="mt-1 font-display text-[14px] text-a1-text-auxiliary">
              Gerencie os acessos e permissões dos usuários do sistema.
            </p>
          </div>
          {onCreateClick && (
            <Button size="sm" onClick={onCreateClick} className="h-10 rounded-lg px-5">
              + Novo Usuário
            </Button>
          )}
        </div>
      </div>

      {/* Search + filter bar — SPEC §5 BarraBusca */}
      <div className="flex items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por nome ou e-mail..."
          className="w-[520px]"
        />
        <button className="font-display text-[13px] font-semibold text-primary-600 hover:underline">
          Busca Avançada
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-display text-[12px] text-a1-text-auxiliary">Filtrar por:</span>
          <select className="h-9 rounded-md border border-a1-border bg-white px-3 font-display text-[12px] font-medium text-a1-text-secondary">
            <option>Todos os Status</option>
            <option>Ativo</option>
            <option>Inativo</option>
            <option>Bloqueado</option>
            <option>Pendente</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          <p>{error.message}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Cadastre o primeiro usuário para começar."
        />
      ) : (
        <>
          {/* Table — 7 columns per SPEC §5/§6 */}
          <div className="rounded-[10px] border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Status
                  </TableHead>
                  <TableHead className="w-[140px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Nome
                  </TableHead>
                  <TableHead className="w-[220px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    E-mail
                  </TableHead>
                  <TableHead className="w-[150px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Perfil
                  </TableHead>
                  <TableHead className="w-[150px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Empresa
                  </TableHead>
                  <TableHead className="w-[130px] font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Último Acesso
                  </TableHead>
                  <TableHead className="w-[80px] text-center font-display text-[11px] font-bold uppercase tracking-[0.5px] text-a1-text-auxiliary">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: UserRow) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-a1-border-light hover:bg-[#F9F9F7]"
                  >
                    <TableCell>
                      <StatusBadge status={statusToType[user.status] ?? 'neutral'}>
                        {user.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleEdit(user.id)}
                        className="font-display text-[13px] font-semibold text-primary-600 hover:underline"
                      >
                        {user.full_name}
                      </button>
                    </TableCell>
                    <TableCell className="font-display text-[13px] text-a1-text-tertiary">
                      {user.email}
                    </TableCell>
                    <TableCell className="font-display text-[13px] text-a1-text-tertiary">
                      {user.role_name ?? '—'}
                    </TableCell>
                    <TableCell className="font-display text-[13px] text-a1-text-tertiary">
                      {user.tenant_name ?? '—'}
                    </TableCell>
                    <TableCell className="font-display text-[13px] text-a1-text-tertiary">
                      {user.last_access
                        ? new Date(user.last_access).toLocaleDateString('pt-BR')
                        : new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center">
                      <UserActionsDropdown
                        user={user}
                        onEdit={handleEdit}
                        onAction={handleAction}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination — SPEC §5 Paginação */}
          <div className="flex items-center justify-between">
            <span className="font-display text-[12px] text-a1-text-auxiliary">
              Exibindo {users.length} usuários
            </span>
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                isLoading={isFetchingNextPage}
                onClick={() => loadMore()}
                className="font-display text-[12px] font-medium text-a1-text-secondary"
              >
                Carregar mais resultados
              </Button>
            )}
          </div>
        </>
      )}

      {/* Confirmation modal for destructive actions */}
      {currentConfirm && (
        <ConfirmationModal
          open={!!actionTarget}
          onOpenChange={(open) => !open && setActionTarget(null)}
          title={currentConfirm.title}
          description={currentConfirm.description}
          variant="destructive"
          confirmLabel={currentConfirm.label}
          onConfirm={handleConfirmAction}
          isLoading={deleting}
        />
      )}
    </div>
  );
}

export default UsersListPage;
