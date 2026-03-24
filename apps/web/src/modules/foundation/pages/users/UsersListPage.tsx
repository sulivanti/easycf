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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { useUsers, useDeleteUser } from '../../hooks/use-users.js';

function UsersSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        {onCreateClick && (
          <Button size="sm" onClick={onCreateClick}>
            Cadastrar
          </Button>
        )}
      </div>

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
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p>{error.message}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum usuário encontrado. Cadastre o primeiro.
          </p>
        </div>
      ) : (
        <>
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deleteTarget?.name}</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" isLoading={deleting} onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsersListPage;
