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
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PageHeader,
  ConfirmationModal,
  FormField,
  StatusBadge,
  Select,
  EmptyState,
} from '../../../shared/ui/index.js';
import type { StatusType } from '../../../shared/ui/status-badge.js';
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

/** Map legacy Badge variant → StatusBadge status */
const VARIANT_TO_STATUS: Record<string, StatusType> = {
  default: 'success',
  secondary: 'info',
  outline: 'neutral',
  destructive: 'error',
};

const CYCLE_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'DEPRECATED', label: 'Depreciado' },
];

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
        <Skeleton className="h-8 w-48 mb-4 bg-a1-border" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-a1-border" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div
          role="alert"
          className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          Erro ao carregar ciclos. {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Ciclos de Processo"
        actions={
          <div className="flex gap-2">
            <Select
              options={CYCLE_STATUS_OPTIONS}
              value={filters.status ?? ''}
              onChange={(e) => handleFilterChange(e.target.value as CycleStatus | '')}
            />
            {canWriteCycle(userScopes) && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Novo ciclo
              </Button>
            )}
          </div>
        }
      />

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState title={COPY.empty_cycles} />
      ) : (
        <div className="rounded-lg border border-a1-border bg-white">
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
                      <StatusBadge status={VARIANT_TO_STATUS[statusInfo.variant] ?? 'neutral'}>
                        {statusInfo.label}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-a1-text-auxiliary">
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
                            className="text-danger-600 hover:text-danger-600 h-auto p-0"
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
        </div>
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
            <FormField label="Código" name="cycle-codigo">
              <Input
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                placeholder="COM"
              />
            </FormField>
            <FormField label="Nome" name="cycle-nome">
              <Input
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                placeholder="Comercial"
              />
            </FormField>
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
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Confirmar exclusão"
        description={deleteTarget ? COPY.confirm_delete_cycle(deleteTarget.nome) : ''}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
