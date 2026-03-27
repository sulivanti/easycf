/**
 * @contract UX-004, FR-006
 * Users list — paginated (cursor-based), searchable, with skeleton loading.
 * States: Loading (skeleton table), Empty, Error (toast RFC 9457 with correlationId).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Badge } from '@shared/ui/badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState } from '@shared/ui/empty-state';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { useUsers, useDeleteUser } from '../../hooks/use-users.js';

function UsersSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-a1-border" />
      ))}
    </div>
  );
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  BLOCKED: 'destructive',
  PENDING: 'outline',
  INACTIVE: 'secondary',
};

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchTerm);
  }, [searchTerm]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success('Usuário excluído com sucesso.');
      setDeleteTarget(null);
    } catch {
      toast.error('Erro ao excluir usuário.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        actions={
          onCreateClick && (
            <Button size="sm" onClick={onCreateClick}>
              Cadastrar
            </Button>
          )
        }
      />

      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Pesquisar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" size="sm" onClick={handleSearch}>
          Pesquisar
        </Button>
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
          title="Nenhum item"
          description="Nenhum usuário encontrado. Cadastre o primeiro."
        />
      ) : (
        <>
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.codigo}</TableCell>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[user.status] ?? 'outline'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {onEditClick && (
                          <Button variant="ghost" size="xs" onClick={() => onEditClick(user.id)}>
                            Editar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDeleteTarget({ id: user.id, name: user.full_name })}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                isLoading={isFetchingNextPage}
                onClick={() => loadMore()}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir ${deleteTarget?.name}?`}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

export default UsersListPage;
