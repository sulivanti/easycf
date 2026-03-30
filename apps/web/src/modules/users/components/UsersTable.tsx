/**
 * @contract FR-001, FR-001-M01, UX-001, UX-001-C03, BR-001, BR-001-M01, BR-002
 * Users table with 4-variant dropdown per status, skeleton loading, empty state.
 * LGPD: email shown in table column only — never in toasts or modals.
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui';
import { Button } from '@shared/ui';
import { Skeleton } from '@shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import {
  Pencil,
  KeyRound,
  UserMinus,
  ShieldBan,
  UserCheck,
  ShieldCheck,
  Send,
  MailX,
} from 'lucide-react';
import type { UserViewModel } from '../types/users.types.js';
import { COPY } from '../types/users.types.js';

// ── Skeleton Rows ────────────────────────────────────────────

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <TableRow key={`skel-${i}`}>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Row Actions Dropdown ─────────────────────────────────────

interface RowActionsProps {
  user: UserViewModel;
  onEdit: (userId: string) => void;
  onResetPassword: (userId: string, userName: string) => void;
  onDeactivate: (userId: string, userName: string) => void;
  onBlock: (userId: string, userName: string) => void;
  onUnblock: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onResendInvite: (userId: string) => void;
  onCancelInvite: (userId: string, userName: string) => void;
}

function RowActions({
  user,
  onEdit,
  onResetPassword,
  onDeactivate,
  onBlock,
  onUnblock,
  onReactivate,
  onResendInvite,
  onCancelInvite,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Ações">
          ···
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {/* ── ATIVO ── */}
        {user.status === 'ACTIVE' && (
          <>
            {user.canEdit && (
              <DropdownMenuItem
                className="font-semibold text-a1-dark bg-a1-light"
                onClick={() => onEdit(user.id)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {user.canResetPassword && (
              <DropdownMenuItem onClick={() => onResetPassword(user.id, user.displayName)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Resetar senha
              </DropdownMenuItem>
            )}
            {(user.canDeactivate || user.canBlock) && <DropdownMenuSeparator />}
            {user.canDeactivate && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeactivate(user.id, user.displayName)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            )}
            {user.canBlock && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onBlock(user.id, user.displayName)}
              >
                <ShieldBan className="mr-2 h-4 w-4" />
                Bloquear
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* ── INATIVO ── */}
        {user.status === 'INACTIVE' && (
          <>
            {user.canReactivate && (
              <DropdownMenuItem
                className="font-semibold text-emerald-700 bg-emerald-50"
                onClick={() => onReactivate(user.id)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Reativar
              </DropdownMenuItem>
            )}
            {user.canEdit && (
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {user.canBlock && <DropdownMenuSeparator />}
            {user.canBlock && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onBlock(user.id, user.displayName)}
              >
                <ShieldBan className="mr-2 h-4 w-4" />
                Bloquear
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* ── BLOQUEADO ── */}
        {user.status === 'BLOCKED' && (
          <>
            {user.canUnblock && (
              <DropdownMenuItem
                className="font-semibold text-emerald-700 bg-emerald-50"
                onClick={() => onUnblock(user.id)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Desbloquear
              </DropdownMenuItem>
            )}
            {user.canEdit && (
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {user.canDeactivate && <DropdownMenuSeparator />}
            {user.canDeactivate && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeactivate(user.id, user.displayName)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* ── PENDENTE ── */}
        {user.status === 'PENDING' && (
          <>
            {user.canResendInvite && (
              <DropdownMenuItem
                className="font-semibold text-a1-dark bg-a1-light"
                onClick={() => onResendInvite(user.id)}
              >
                <Send className="mr-2 h-4 w-4" />
                Reenviar convite
              </DropdownMenuItem>
            )}
            {user.canEdit && (
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {(user.canCancelInvite || user.canBlock) && <DropdownMenuSeparator />}
            {user.canCancelInvite && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onCancelInvite(user.id, user.displayName)}
              >
                <MailX className="mr-2 h-4 w-4" />
                Cancelar convite
              </DropdownMenuItem>
            )}
            {user.canBlock && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onBlock(user.id, user.displayName)}
              >
                <ShieldBan className="mr-2 h-4 w-4" />
                Bloquear
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Table ────────────────────────────────────────────────────

interface UsersTableProps {
  users: UserViewModel[];
  loading: boolean;
  canCreate: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onCreateClick?: () => void;
  onEditClick: (userId: string) => void;
  onDeactivateClick: (userId: string, userName: string) => void;
  onBlockClick: (userId: string, userName: string) => void;
  onUnblockClick: (userId: string) => void;
  onReactivateClick: (userId: string) => void;
  onResetPasswordClick: (userId: string, userName: string) => void;
  onInviteClick: (userId: string) => void;
  onCancelInviteClick: (userId: string, userName: string) => void;
}

export function UsersTable({
  users,
  loading,
  canCreate,
  hasMore,
  loadingMore,
  onLoadMore,
  onCreateClick,
  onEditClick,
  onDeactivateClick,
  onBlockClick,
  onUnblockClick,
  onReactivateClick,
  onResetPasswordClick,
  onInviteClick,
  onCancelInviteClick,
}: UsersTableProps) {
  if (!loading && users.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Cadastre o primeiro usuário ou ajuste os filtros."
        action={
          canCreate && onCreateClick ? (
            <Button variant="default" size="sm" onClick={onCreateClick}>
              Criar primeiro usuário
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && users.length === 0 ? (
            <SkeletonRows />
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <StatusBadge status={user.statusBadge.status}>
                    {user.statusBadge.label}
                  </StatusBadge>
                </TableCell>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.roleName}</TableCell>
                <TableCell className="text-muted-foreground">{user.createdAtFormatted}</TableCell>
                <TableCell>
                  <RowActions
                    user={user}
                    onEdit={onEditClick}
                    onResetPassword={onResetPasswordClick}
                    onDeactivate={onDeactivateClick}
                    onBlock={onBlockClick}
                    onUnblock={onUnblockClick}
                    onReactivate={onReactivateClick}
                    onResendInvite={onInviteClick}
                    onCancelInvite={onCancelInviteClick}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Carregando...' : COPY.label.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
