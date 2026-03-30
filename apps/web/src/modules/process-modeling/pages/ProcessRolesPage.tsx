/**
 * @contract FR-008, FR-008-C01, UX-005 §3.3
 * Page: Catálogo de Papéis de Processo — tabela CRUD com edição.
 * Route: /processos/papeis
 *
 * Reuses exact pattern from RolesPage (MOD-000).
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
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge } from '@shared/ui/status-badge';
import {
  useProcessRoles,
  useCreateProcessRole,
  useUpdateProcessRole,
} from '../hooks/use-process-roles.js';
import type { ProcessRoleListItemDTO } from '../types/process-modeling.types.js';

export function ProcessRolesPage() {
  const { data: roles, isLoading, isError, error } = useProcessRoles();
  const createMutation = useCreateProcessRole();
  const updateMutation = useUpdateProcessRole();
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<ProcessRoleListItemDTO | null>(null);
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [canApprove, setCanApprove] = useState(false);

  const items = roles ?? [];

  function resetForm() {
    setCodigo('');
    setNome('');
    setDescricao('');
    setCanApprove(false);
    setShowCreate(false);
    setEditingRole(null);
  }

  function openEdit(role: ProcessRoleListItemDTO) {
    setEditingRole(role);
    setNome(role.nome);
    setDescricao('');
    setCanApprove(role.can_approve);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        codigo: codigo.trim(),
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        can_approve: canApprove,
      });
      toast.success('Papel de processo criado com sucesso.');
      resetForm();
    } catch {
      toast.error('Erro ao criar papel de processo.');
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await updateMutation.mutateAsync({
        id: editingRole.id,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        can_approve: canApprove,
      });
      toast.success('Papel de processo atualizado com sucesso.');
      resetForm();
    } catch {
      toast.error('Erro ao atualizar papel de processo.');
    }
  }

  return (
    <div className="-m-6">
      <PageHeader
        title="Papéis de Processo"
        description="Catálogo de papéis atribuíveis a etapas e gates de processos"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Criar papel
          </Button>
        }
      />

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
            title="Nenhum papel cadastrado"
            description="Nenhum papel de processo cadastrado. Crie o primeiro."
          />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Pode Aprovar</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium font-mono text-xs">{role.codigo}</TableCell>
                    <TableCell>{role.nome}</TableCell>
                    <TableCell>
                      <StatusBadge status={role.can_approve ? 'success' : 'neutral'}>
                        {role.can_approve ? 'Sim' : 'Não'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="xs" onClick={() => openEdit(role)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Papel de Processo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pr-codigo">Código</Label>
              <Input
                id="pr-codigo"
                required
                maxLength={50}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="ex: APROVADOR, REVISOR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-nome">Nome</Label>
              <Input
                id="pr-nome"
                required
                maxLength={255}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-desc">Descrição</Label>
              <Input
                id="pr-desc"
                maxLength={1000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="pr-approve"
                type="checkbox"
                checked={canApprove}
                onChange={(e) => setCanApprove(e.target.checked)}
              />
              <Label htmlFor="pr-approve">Pode aprovar movimentos</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Papel de Processo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={editingRole?.codigo ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-edit-nome">Nome</Label>
              <Input
                id="pr-edit-nome"
                required
                maxLength={255}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-edit-desc">Descrição</Label>
              <Input
                id="pr-edit-desc"
                maxLength={1000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="pr-edit-approve"
                type="checkbox"
                checked={canApprove}
                onChange={(e) => setCanApprove(e.target.checked)}
              />
              <Label htmlFor="pr-edit-approve">Pode aprovar movimentos</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
