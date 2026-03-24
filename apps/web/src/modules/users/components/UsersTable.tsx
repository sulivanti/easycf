/**
 * @contract FR-001, UX-001, BR-001, BR-002
 * Users table with shared UI components, skeleton loading, empty state, row actions.
 * LGPD: email shown in table column only — never in toasts or modals.
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui';
import { Badge } from '@shared/ui';
import { Button } from '@shared/ui';
import { Skeleton } from '@shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui';
import type { UserViewModel } from '../types/users.types.js';
import { COPY } from '../types/users.types.js';

// ── Skeleton Rows ────────────────────────────────────────────

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <TableRow key={`skel-${i}`}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Empty State ──────────────────────────────────────────────

function EmptyState({
  canCreate,
  onCreateClick,
}: {
  canCreate: boolean;
  onCreateClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <p className="text-sm text-muted-foreground">{COPY.label.noResults}</p>
      {canCreate && onCreateClick && (
        <Button variant="default" size="sm" className="mt-4" onClick={onCreateClick}>
          Criar primeiro usuário
        </Button>
      )}
    </div>
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
  onDeactivateClick: (userId: string, userName: string) => void;
  onInviteClick: (userId: string) => void;
}

export function UsersTable({
  users,
  loading,
  canCreate,
  hasMore,
  loadingMore,
  onLoadMore,
  onCreateClick,
  onDeactivateClick,
  onInviteClick,
}: UsersTableProps) {
  if (!loading && users.length === 0) {
    return <EmptyState canCreate={canCreate} onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
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
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.roleName}</TableCell>
                <TableCell>
                  <Badge variant={user.statusBadge.variant}>{user.statusBadge.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.createdAtFormatted}</TableCell>
                <TableCell>
                  {(user.canResendInvite || user.canDeactivate) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Ações">
                          ···
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.canResendInvite && (
                          <DropdownMenuItem onClick={() => onInviteClick(user.id)}>
                            Ver convite
                          </DropdownMenuItem>
                        )}
                        {user.canDeactivate && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDeactivateClick(user.id, user.displayName)}
                          >
                            Desativar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
