/**
 * @contract UX-007, UX-008, FR-008, FR-009
 * Tenants page — list + CRUD + tenant-user bindings (UX-TENANT-002).
 * States: Loading (skeleton), Empty, Error (toast RFC 9457 with correlationId).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, type FormEvent, Fragment } from 'react';
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
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useTenantUsers,
} from '../../hooks/use-tenants.js';
import type { TenantStatus } from '../../types/tenant.types.js';

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary'> = {
  ACTIVE: 'default',
  BLOCKED: 'destructive',
  INACTIVE: 'secondary',
};

// -- Tenant Form (Dialog) --

function TenantFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { createTenant, loading, error } = useCreateTenant();
  const [codigo, setCodigo] = useState('');
  const [name, setName] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createTenant({ codigo, name });
      toast.success('Filial criada com sucesso.');
      setCodigo('');
      setName('');
      onOpenChange(false);
      onSuccess();
    } catch {
      // handled by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Filial</DialogTitle>
          </DialogHeader>

          {error && (
            <div
              role="alert"
              className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <p>{error.message}</p>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-codigo">Código</Label>
              <Input
                id="tenant-codigo"
                type="text"
                required
                maxLength={100}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-name">Nome</Label>
              <Input
                id="tenant-name"
                type="text"
                required
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -- Tenant Users Panel --

function TenantUsersPanel({ tenantId }: { tenantId: string }) {
  const { users, loading, addUser, removeUser, mutating } = useTenantUsers(tenantId);
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    try {
      await addUser({ user_id: userId, role_id: roleId });
      toast.success('Usuário vinculado.');
      setUserId('');
      setRoleId('');
    } catch {
      toast.error('Erro ao vincular usuário.');
    }
  }

  async function handleRemove(uid: string) {
    try {
      await removeUser(uid);
      toast.success('Usuário desvinculado.');
    } catch {
      toast.error('Erro ao desvincular usuário.');
    }
  }

  return (
    <div className="space-y-3 rounded-md bg-muted/50 p-4">
      <h3 className="text-sm font-semibold">Membros da filial</h3>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="max-w-[200px]"
        />
        <Input
          type="text"
          placeholder="Role ID"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
          className="max-w-[200px]"
        />
        <Button type="submit" size="sm" isLoading={mutating}>
          Vincular
        </Button>
      </form>

      {loading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum usuário vinculado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.role_name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    isLoading={mutating}
                    onClick={() => handleRemove(u.user_id)}
                  >
                    Desvincular
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// -- Tenants Skeleton --

function TenantsSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// -- Main TenantsPage --

export function TenantsPage() {
  const { tenants, loading, error, hasMore, loadMore, refresh } = useTenants();
  const { updateTenant } = useUpdateTenant();
  const { deleteTenant, loading: deleting } = useDeleteTenant();
  const [showForm, setShowForm] = useState(false);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  async function handleStatusChange(id: string, status: TenantStatus) {
    try {
      await updateTenant(id, { status });
      toast.success(`Filial ${status === 'BLOCKED' ? 'bloqueada' : 'desbloqueada'}.`);
      refresh();
    } catch {
      toast.error('Erro ao alterar status.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTenant(deleteTarget.id);
      toast.success('Filial excluída com sucesso.');
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error('Erro ao excluir filial.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Filiais</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Criar filial
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

      {loading && tenants.length === 0 ? (
        <TenantsSkeleton />
      ) : tenants.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma filial encontrada. Crie a primeira.
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <Fragment key={tenant.id}>
                  <TableRow>
                    <TableCell className="font-mono text-xs">{tenant.codigo}</TableCell>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[tenant.status] ?? 'secondary'}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setExpandedTenantId(expandedTenantId === tenant.id ? null : tenant.id)
                          }
                        >
                          {expandedTenantId === tenant.id ? 'Fechar' : 'Membros'}
                        </Button>

                        {tenant.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleStatusChange(tenant.id, 'BLOCKED')}
                          >
                            Bloquear
                          </Button>
                        )}
                        {tenant.status === 'BLOCKED' && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleStatusChange(tenant.id, 'ACTIVE')}
                          >
                            Desbloquear
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDeleteTarget({ id: tenant.id, name: tenant.name })}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedTenantId === tenant.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <TenantUsersPanel tenantId={tenant.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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

      {/* Create tenant dialog */}
      <TenantFormDialog open={showForm} onOpenChange={setShowForm} onSuccess={() => refresh()} />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a filial <strong>{deleteTarget?.name}</strong>?
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

export default TenantsPage;
