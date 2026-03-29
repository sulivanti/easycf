/**
 * @contract UX-004, UX-000-M01, FR-006
 * User form — create and edit modes.
 * Create: Name, Email, Profile, Company + invite info.
 * Edit: Pre-filled fields + status toggle + reset password.
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, useEffect, startTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { MailIcon, InfoIcon } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { Skeleton } from '@shared/ui/skeleton';
import { PageHeader } from '@shared/ui/page-header';
import { FormField } from '@shared/ui/form-field';
import { Toggle } from '@shared/ui/toggle';
import { useUser, useCreateUser, useUpdateUser } from '../../hooks/use-users.js';
import { useRoles } from '../../hooks/use-roles.js';
import { useTenants } from '../../hooks/use-tenants.js';
import type { UserStatus } from '../../types/user.types.js';

export function UserFormPage({
  userId,
  onSuccess,
  onCancel,
}: {
  userId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = !!userId;
  const { user, loading: loadingUser } = useUser(userId ?? null);
  const { createUser, loading: creating, error: createError } = useCreateUser();
  const { updateUser, loading: updating, error: updateError } = useUpdateUser();
  const { roles, loading: rolesLoading } = useRoles();
  const { tenants, loading: tenantsLoading } = useTenants();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      startTransition(() => {
        setFullName(user.full_name);
        setEmail(user.email);
        setIsActive(user.status === 'ACTIVE');
      });
    }
  }, [user]);

  const error = isEdit ? updateError : createError;
  const submitting = isEdit ? updating : creating;

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  const tenantOptions = tenants.map((t) => ({ value: t.id, label: t.name }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && userId) {
        const status: UserStatus = isActive ? 'ACTIVE' : 'INACTIVE';
        await updateUser(userId, { full_name: fullName, status });
        toast.success('Usuário atualizado com sucesso.');
      } else {
        await createUser({ email, password: '', full_name: fullName });
        toast.success('Convite enviado com sucesso.');
      }
      onSuccess?.();
    } catch {
      // error state handled by hooks
    }
  }

  async function handleResetPassword() {
    if (!userId) return;
    toast.info('Solicitação de reset de senha enviada.');
  }

  // Loading skeleton (edit mode)
  if (isEdit && loadingUser) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Usuário"
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Usuários', href: '/usuarios' },
            { label: '...' },
          ]}
        />
        <div className="w-[680px] space-y-6 rounded-xl border border-a1-border bg-white p-9">
          <Skeleton className="h-8 w-48 bg-a1-border" />
          <Skeleton className="h-4 w-64 bg-a1-border" />
          <Skeleton className="h-12 w-full bg-a1-border" />
          <Skeleton className="h-12 w-full bg-a1-border" />
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 bg-a1-border" />
            <Skeleton className="h-12 flex-1 bg-a1-border" />
          </div>
          <Skeleton className="h-5 w-32 bg-a1-border" />
        </div>
      </div>
    );
  }

  const breadcrumbs = isEdit
    ? [
        { label: 'Início', href: '/' },
        { label: 'Usuários', href: '/usuarios' },
        { label: user?.full_name ?? '...' },
      ]
    : [{ label: 'Início', href: '/' }, { label: 'Usuários', href: '/usuarios' }, { label: 'Novo' }];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
        description={
          isEdit ? 'Atualize os dados do usuário.' : 'Preencha os dados para criar um novo usuário.'
        }
        breadcrumbs={breadcrumbs}
      />

      <form
        onSubmit={handleSubmit}
        className="w-[680px] rounded-xl border border-a1-border bg-white p-9"
      >
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{error.message}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Nome Completo */}
          <FormField label="Nome completo" name="user-name" required>
            <Input
              type="text"
              required
              maxLength={255}
              placeholder={isEdit ? undefined : 'Nome do usuário'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 rounded-[10px]"
            />
          </FormField>

          {/* E-mail Corporativo */}
          <FormField label="E-mail corporativo" name="user-email" required>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-a1-text-placeholder" />
              <Input
                type="email"
                required
                maxLength={255}
                placeholder={isEdit ? undefined : 'usuario@grupoa1.com.br'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEdit}
                autoComplete="email"
                className="h-12 rounded-[10px] pl-11"
              />
            </div>
          </FormField>

          {/* Perfil + Empresa (side by side) */}
          <div className="flex gap-4">
            <FormField label="Perfil" name="user-role" required className="flex-1">
              {rolesLoading ? (
                <Skeleton className="h-12 w-full bg-a1-border" />
              ) : (
                <Select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  options={roleOptions}
                  placeholder="Selecione o perfil"
                  className="h-12 w-full rounded-[10px]"
                />
              )}
            </FormField>

            <FormField label="Empresa" name="user-tenant" required className="flex-1">
              {tenantsLoading ? (
                <Skeleton className="h-12 w-full bg-a1-border" />
              ) : (
                <Select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  options={tenantOptions}
                  placeholder="Selecione a empresa"
                  className="h-12 w-full rounded-[10px]"
                />
              )}
            </FormField>
          </div>

          {/* Status toggle (edit only) */}
          {isEdit && (
            <FormField label="Status" name="user-status">
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                label={isActive ? 'Ativo' : 'Inativo'}
              />
            </FormField>
          )}

          {/* Info convite (create only) */}
          {!isEdit && (
            <div className="flex items-center gap-2 rounded-lg bg-[#F0F8FF] px-4 py-3">
              <InfoIcon className="size-4 shrink-0 text-primary-600" />
              <span className="text-[13px] text-primary-600">
                Um convite será enviado por e-mail para ativação da conta.
              </span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="my-6 h-px bg-a1-border" />

        {/* Reset password button (edit only) */}
        {isEdit && (
          <div className="mb-5">
            <Button type="button" variant="outline" size="sm" onClick={handleResetPassword}>
              Resetar Senha
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" isLoading={submitting}>
            {isEdit ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UserFormPage;
