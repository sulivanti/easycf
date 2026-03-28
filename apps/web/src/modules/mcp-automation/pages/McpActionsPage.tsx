/**
 * @contract FR-005, UX-MCP-001
 * Page: Catálogo standalone de MCP Actions — tabela com filtros.
 * Route: /mcp/actions
 *
 * Reuses same data hooks as AgentsPage actions tab but provides
 * a dedicated route for direct access.
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { EmptyState } from '@shared/ui/empty-state';
import { StatusBadge } from '@shared/ui/status-badge';
import { PageHeader } from '@shared/ui/page-header';
import { Select } from '@shared/ui/select';
import { FilterBar } from '@shared/ui/filter-bar';
import { useActionList, useCreateAction } from '../hooks/use-actions.js';
import type {
  ExecutionPolicy,
  ActionStatus,
  CreateActionPayload,
} from '../types/mcp-automation.types.js';


const POLICIES: ExecutionPolicy[] = ['DIRECT', 'CONTROLLED', 'EVENT_ONLY'];

export function McpActionsPage() {
  const [policyFilter, setPolicyFilter] = useState<ExecutionPolicy | undefined>();
  const [statusFilter, setStatusFilter] = useState<ActionStatus | undefined>();
  const {
    data: actions,
    isLoading,
    isError,
    error,
  } = useActionList({
    execution_policy: policyFilter,
    status: statusFilter,
  });
  const createMutation = useCreateAction();
  const [showCreate, setShowCreate] = useState(false);

  const items = actions?.data ?? [];

  return (
    <div className="-m-6">
      <PageHeader
        title="Catálogo de Ações MCP"
        description="Ações disponíveis para agentes MCP executarem"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Nova ação
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar className="border-b border-border bg-white px-6 py-3">
        <Select
          value={policyFilter ?? ''}
          onChange={(e) => setPolicyFilter((e.target.value as ExecutionPolicy) || undefined)}
          placeholder="Todas as políticas"
          options={[
            { value: '', label: 'Todas as políticas' },
            ...POLICIES.map((p) => ({ value: p, label: p })),
          ]}
        />
        <Select
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter((e.target.value as ActionStatus) || undefined)}
          placeholder="Todos os status"
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
          ]}
        />
        {(policyFilter || statusFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPolicyFilter(undefined);
              setStatusFilter(undefined);
            }}
          >
            Limpar
          </Button>
        )}
      </FilterBar>

      <div className="p-6 space-y-6">
        {isError && (
          <div
            role="alert"
            className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{(error as Error)?.message ?? 'Erro ao carregar dados.'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-a1-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhuma ação MCP encontrada"
            description="Crie uma nova ação para começar."
          />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Política</TableHead>
                  <TableHead>Objeto Alvo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium font-mono text-xs">{action.codigo}</TableCell>
                    <TableCell>{action.nome}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          action.execution_policy === 'DIRECT'
                            ? 'success'
                            : action.execution_policy === 'CONTROLLED'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {action.execution_policy}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs">{action.target_object_type}</TableCell>
                    <TableCell>
                      <StatusBadge status={action.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {action.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{new Date(action.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateActionDialog
        open={showCreate}
        isPending={createMutation.isPending}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
          toast.success('Ação MCP criada com sucesso.');
          setShowCreate(false);
        }}
      />
    </div>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────────────────

function CreateActionDialog({
  open,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActionPayload) => Promise<void>;
}) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [actionTypeId, setActionTypeId] = useState('');
  const [policy, setPolicy] = useState<ExecutionPolicy>('CONTROLLED');
  const [targetObjectType, setTargetObjectType] = useState('');
  const [description, setDescription] = useState('');

  function reset() {
    setCodigo('');
    setNome('');
    setActionTypeId('');
    setPolicy('CONTROLLED');
    setTargetObjectType('');
    setDescription('');
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await onSubmit({
        codigo: codigo.trim(),
        nome: nome.trim(),
        action_type_id: actionTypeId.trim(),
        execution_policy: policy,
        target_object_type: targetObjectType.trim(),
        required_scopes: [],
        description: description.trim() || undefined,
      });
      reset();
    } catch {
      toast.error('Erro ao criar ação.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ação MCP</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="act-codigo">Código</Label>
            <Input
              id="act-codigo"
              required
              maxLength={50}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-nome">Nome</Label>
            <Input
              id="act-nome"
              required
              maxLength={255}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-type-id">Action Type ID</Label>
            <Input
              id="act-type-id"
              required
              value={actionTypeId}
              onChange={(e) => setActionTypeId(e.target.value)}
              placeholder="UUID do tipo de ação"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-policy">Política de Execução</Label>
            <Select
              id="act-policy"
              value={policy}
              onChange={(e) => setPolicy(e.target.value as ExecutionPolicy)}
              options={POLICIES.map((p) => ({ value: p, label: p }))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-target">Objeto Alvo</Label>
            <Input
              id="act-target"
              required
              value={targetObjectType}
              onChange={(e) => setTargetObjectType(e.target.value)}
              placeholder="ex: PEDIDO_VENDA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-desc">Descrição</Label>
            <Input
              id="act-desc"
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={reset}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
