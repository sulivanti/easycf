/**
 * @contract FR-001, UX-005, SEC-005
 *
 * Cycles list page — paginated table of process cycles.
 * Route: /processos/ciclos
 *
 * States: loading, loaded, empty, error.
 * Actions: create, navigate to editor, filter by status, delete.
 *
 * Tailwind CSS v4 + shared UI components + Dialog for confirmations.
 */

import { useState, useCallback } from 'react';
import {
  Button,
  Badge,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/index.js';
import { useCycles, useCreateCycle, useDeleteCycle } from '../hooks/use-cycles.js';
import type {
  CycleStatus,
  CycleListFilters,
  CreateCycleRequest,
} from '../types/process-modeling.types.js';
import {
  COPY,
  STATUS_META,
  canWriteCycle,
  canShowDelete,
} from '../types/process-modeling.types.js';

interface CyclesListPageProps {
  userScopes: readonly string[];
}

export function CyclesListPage({ userScopes }: CyclesListPageProps) {
  const [filters, setFilters] = useState<CycleListFilters>({});
  const { data, isLoading, error } = useCycles(filters);
  const createMutation = useCreateCycle();
  const deleteMutation = useDeleteCycle();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newCodigo, setNewCodigo] = useState('');
  const [newNome, setNewNome] = useState('');

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null);

  const items = data?.data ?? [];
  const hasMore = data?.has_more ?? false;
  const nextCursor = data?.next_cursor ?? undefined;

  const handleFilterChange = useCallback((status: CycleStatus | '') => {
    setFilters(status ? { status } : {});
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newCodigo || !newNome) return;
    const payload: CreateCycleRequest = { codigo: newCodigo, nome: newNome };
    const result = await createMutation.mutateAsync(payload);
    setCreateOpen(false);
    setNewCodigo('');
    setNewNome('');
    window.location.href = `/processos/ciclos/${result.id}/editor`;
  }, [newCodigo, newNome, createMutation]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor) setFilters((prev) => ({ ...prev, cursor: nextCursor }));
  }, [nextCursor]);

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="p-6 text-red-600">Erro ao carregar ciclos. {error.message}</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Ciclos de Processo</h1>
        <div className="flex gap-2">
          <select
            value={filters.status ?? ''}
            onChange={(e) => handleFilterChange(e.target.value as CycleStatus | '')}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
          >
            <option value="">Todos</option>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="DEPRECATED">Depreciado</option>
          </select>
          {canWriteCycle(userScopes) && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Novo ciclo
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <p className="text-gray-400">{COPY.empty_cycles}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((cycle) => {
              const statusInfo = STATUS_META[cycle.status];
              return (
                <TableRow key={cycle.id}>
                  <TableCell className="font-mono text-sm">{cycle.codigo}</TableCell>
                  <TableCell>{cycle.nome}</TableCell>
                  <TableCell>v{cycle.version}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(cycle.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <a
                        href={`/processos/ciclos/${cycle.id}/editor`}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Editar
                      </a>
                      {canShowDelete(userScopes, cycle.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 h-auto p-0"
                          onClick={() => setDeleteTarget({ id: cycle.id, nome: cycle.nome })}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}

      {/* Create cycle dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Ciclo</DialogTitle>
            <DialogDescription>Crie um novo ciclo de processo em rascunho.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label htmlFor="cycle-codigo">Código</Label>
              <Input
                id="cycle-codigo"
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                placeholder="COM"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cycle-nome">Nome</Label>
              <Input
                id="cycle-nome"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                placeholder="Comercial"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newCodigo || !newNome || createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              {deleteTarget ? COPY.confirm_delete_cycle(deleteTarget.nome) : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
