/**
 * @contract UX-006, FR-007, FR-010, UX-000-M04
 * Roles page — list with navigation to dedicated form pages.
 * States: Loading (skeleton), Empty, Error (toast RFC 9457 with correlationId).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { StatusBadge } from '@shared/ui/status-badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState } from '@shared/ui/empty-state';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { useRoles, useDeleteRole } from '../../hooks/use-roles.js';

// -- Roles Skeleton --

function RolesSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-a1-border" />
      ))}
    </div>
  );
}

// -- Main RolesPage --

export function RolesPage() {
  const navigate = useNavigate();
  const { roles, loading, error, hasMore, loadMore, refresh } = useRoles();
  const { deleteRole, loading: deleting } = useDeleteRole();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id);
      toast.success('Perfil excluído com sucesso.');
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error('Erro ao excluir perfil.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis e Permissões"
        actions={
          <Button size="sm" onClick={() => navigate({ to: '/perfis/novo' })}>
            Novo Perfil
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          <p>{error.message}</p>
        </div>
      )}

      {loading && roles.length === 0 ? (
        <RolesSkeleton />
      ) : roles.length === 0 ? (
        <EmptyState
          title="Nenhum perfil"
          description="Nenhum perfil encontrado. Crie o primeiro."
        />
      ) : (
        <>
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escopos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={role.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {role.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="info">{role.scopes_count}</StatusBadge>
                    </TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            navigate({ to: '/perfis/$roleId', params: { roleId: role.id } })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDeleteTarget({ id: role.id, name: role.name })}
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
              <Button variant="outline" size="sm" onClick={() => loadMore()}>
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
        description={`Tem certeza que deseja excluir o perfil "${deleteTarget?.name}"?`}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

export default RolesPage;
