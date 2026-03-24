/**
 * @contract UX-006, FR-007, FR-010
 * Roles page — list + inline create/edit with scope editor.
 * States: Loading (skeleton), Empty, Error (toast RFC 9457 with correlationId).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
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
import {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '../../hooks/use-roles.js';

// -- Scope editor (tag-like input) --

function ScopeEditor({
  scopes,
  onChange,
}: {
  scopes: string[];
  onChange: (scopes: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const scopePattern = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;

  function addScope() {
    const trimmed = input.trim();
    if (trimmed && scopePattern.test(trimmed) && !scopes.includes(trimmed)) {
      onChange([...scopes, trimmed]);
      setInput('');
    }
  }

  function removeScope(scope: string) {
    onChange(scopes.filter((s) => s !== scope));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {scopes.map((scope) => (
          <Badge key={scope} variant="secondary" className="gap-1">
            {scope}
            <button
              type="button"
              className="ml-1 text-xs hover:text-destructive"
              onClick={() => removeScope(scope)}
              aria-label={`Remover ${scope}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="dominio:entidade:acao"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addScope();
            }
          }}
          className="max-w-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={addScope}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

// -- Role Form (create/edit) --

function RoleForm({ roleId, onDone }: { roleId?: string | null; onDone: () => void }) {
  const isEdit = !!roleId;
  const { role } = useRole(roleId ?? null);
  const { createRole, loading: creating, error: createErr } = useCreateRole();
  const { updateRole, loading: updating, error: updateErr } = useUpdateRole();

  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [scopes, setScopes] = useState<string[]>(role?.scopes ?? []);
  const [initialized, setInitialized] = useState(!isEdit);

  if (isEdit && role && !initialized) {
    setName(role.name);
    setDescription(role.description ?? '');
    setScopes(role.scopes);
    setInitialized(true);
  }

  const error = isEdit ? updateErr : createErr;
  const submitting = isEdit ? updating : creating;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && roleId) {
        await updateRole(roleId, { name, description: description || null, scopes });
        toast.success('Role atualizada com sucesso.');
      } else {
        await createRole({ name, description: description || undefined, scopes });
        toast.success('Role criada com sucesso.');
      }
      onDone();
    } catch {
      // error handled by hooks
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h2 className="text-xl font-semibold">{isEdit ? 'Editar Role' : 'Criar Role'}</h2>
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p>{error.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role-name">Nome</Label>
        <Input
          id="role-name"
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role-desc">Descrição</Label>
        <Input
          id="role-desc"
          type="text"
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Escopos</Label>
        <ScopeEditor scopes={scopes} onChange={setScopes} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={submitting} disabled={scopes.length === 0}>
          Salvar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// -- Roles Skeleton --

function RolesSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// -- Main RolesPage --

export function RolesPage() {
  const { roles, loading, error, hasMore, loadMore, refresh } = useRoles();
  const { deleteRole, loading: deleting } = useDeleteRole();
  const [showForm, setShowForm] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleFormDone() {
    setShowForm(false);
    setEditRoleId(null);
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id);
      toast.success('Role excluída com sucesso.');
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error('Erro ao excluir role.');
    }
  }

  if (showForm || editRoleId) {
    return <RoleForm roleId={editRoleId} onDone={handleFormDone} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Roles / Papéis</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Criar role
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

      {loading && roles.length === 0 ? (
        <RolesSkeleton />
      ) : roles.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma role encontrada. Crie a primeira.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
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
                    <Badge variant="secondary">{role.scopes_count}</Badge>
                  </TableCell>
                  <TableCell>{new Date(role.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => setEditRoleId(role.id)}>
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

          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => loadMore()}>
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
              Tem certeza que deseja excluir a role <strong>{deleteTarget?.name}</strong>?
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

export default RolesPage;
